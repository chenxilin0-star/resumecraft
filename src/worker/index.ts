import { Hono, type Context } from 'hono';
import { buildResumeAiPrompt, normalizeAiAction } from '../utils/ai';

interface Env {
  DB: D1Database;
  JWT_SECRET: string;
  DEEPSEEK_API_KEY: string;
  DEEPSEEK_BASE_URL?: string;
  DEEPSEEK_MODEL?: string;
}

const app = new Hono<{ Bindings: Env }>();

app.use('*', async (c, next) => {
  c.header('Access-Control-Allow-Origin', '*');
  c.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (c.req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }
  await next();
});

function json<T>(data: T, status = 200) {
  return new Response(JSON.stringify({ success: true, data }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function error(message: string, status = 400) {
  return new Response(JSON.stringify({ success: false, message }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

// Health
app.get('/health', (c) => c.json({ success: true, data: { status: 'ok', time: Date.now() } }));

// Templates
async function listTemplates(c: Context<{ Bindings: Env }>) {
  const fromQuery = c.req.method === 'GET';
  const body = fromQuery ? {} : await c.req.json().catch(() => ({}));
  const category = fromQuery ? c.req.query('category') : body.category;
  const search = fromQuery ? c.req.query('search') : body.search;
  const isPremiumRaw = fromQuery ? c.req.query('isPremium') : body.isPremium;
  const page = Number(fromQuery ? c.req.query('page') || 1 : body.page || 1);
  const limit = Number(fromQuery ? c.req.query('limit') || 20 : body.limit || 20);
  const isPremium = isPremiumRaw === undefined || isPremiumRaw === null || isPremiumRaw === ''
    ? undefined
    : isPremiumRaw === true || isPremiumRaw === 'true' || isPremiumRaw === '1';

  let sql = 'SELECT * FROM templates WHERE is_active = 1';
  const params: (string | number)[] = [];

  if (category) {
    sql += ' AND category_id = (SELECT id FROM template_categories WHERE slug = ?)';
    params.push(category);
  }
  if (isPremium !== undefined && isPremium !== null) {
    sql += ' AND is_premium = ?';
    params.push(isPremium ? 1 : 0);
  }
  if (search) {
    sql += ' AND (name LIKE ? OR description LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  const countResult = await c.env.DB.prepare(`SELECT COUNT(*) as total FROM (${sql})`).bind(...params).first<{ total: number }>();
  const total = countResult?.total || 0;

  sql += ' ORDER BY sort_order ASC, id ASC LIMIT ? OFFSET ?';
  params.push(limit, (page - 1) * limit);

  const { results } = await c.env.DB.prepare(sql).bind(...params).all();

  return json({
    list: results.map((r: Record<string, unknown>) => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      thumbnail: r.thumbnail,
      tags: JSON.parse((r.tags as string) || '[]'),
      isPremium: r.is_premium === 1,
      themeCount: JSON.parse((r.config as string) || '{}').themes?.length || 1,
      useCount: r.use_count,
    })),
    total,
    page,
    limit,
  });
}

app.get('/api/templates', listTemplates);
app.post('/api/templates', listTemplates);

app.get('/api/templates/categories', async (c) => {
  const { results } = await c.env.DB.prepare('SELECT * FROM template_categories ORDER BY sort_order ASC').all();
  return json(results);
});

app.get('/api/templates/:id', async (c) => {
  const id = c.req.param('id');
  const row = await c.env.DB.prepare('SELECT * FROM templates WHERE slug = ? OR id = ?').bind(id, Number(id) || 0).first();
  if (!row) return error('Template not found', 404);
  return json(row);
});

// Auth
app.post('/api/auth/register', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const { email, password, nickname } = body;
  if (!email || !password) return error('Email and password required');

  const exists = await c.env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(email).first();
  if (exists) return error('Email already registered', 409);

  // Placeholder: hash password in production
  const result = await c.env.DB.prepare(
    'INSERT INTO users (email, password_hash, nickname) VALUES (?, ?, ?)'
  ).bind(email, password, nickname || null).run();

  return json({ id: result.meta.last_row_id, email });
});

app.post('/api/auth/login', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const { email, password } = body;
  if (!email || !password) return error('Email and password required');

  const user = await c.env.DB.prepare('SELECT * FROM users WHERE email = ?').bind(email).first<Record<string, unknown>>();
  if (!user || user.password_hash !== password) return error('Invalid credentials', 401);

  // Placeholder: generate real JWT in production
  const token = 'placeholder-token-' + user.id;
  return json({ token, user: { id: user.id, email: user.email, nickname: user.nickname, isVip: user.is_vip === 1 } });
});

app.get('/api/auth/me', async (c) => {
  const auth = c.req.header('Authorization');
  if (!auth?.startsWith('Bearer ')) return error('Unauthorized', 401);
  // Placeholder
  return json({ id: 1, email: 'demo@example.com', isVip: false });
});

// Resumes CRUD
app.get('/api/resumes', async (c) => {
  const auth = c.req.header('Authorization');
  if (!auth?.startsWith('Bearer ')) return error('Unauthorized', 401);
  const { results } = await c.env.DB.prepare('SELECT * FROM resumes ORDER BY updated_at DESC').all();
  return json(results);
});

app.get('/api/resumes/:id', async (c) => {
  const auth = c.req.header('Authorization');
  if (!auth?.startsWith('Bearer ')) return error('Unauthorized', 401);
  const id = c.req.param('id');
  const row = await c.env.DB.prepare('SELECT * FROM resumes WHERE id = ?').bind(Number(id)).first();
  if (!row) return error('Resume not found', 404);
  return json(row);
});

app.post('/api/resumes', async (c) => {
  const auth = c.req.header('Authorization');
  if (!auth?.startsWith('Bearer ')) return error('Unauthorized', 401);
  const body = await c.req.json().catch(() => ({}));
  const { templateId, title, content } = body;
  const result = await c.env.DB.prepare(
    'INSERT INTO resumes (user_id, template_id, title, content) VALUES (?, ?, ?, ?)'
  ).bind(1, templateId, title || '未命名简历', JSON.stringify(content)).run();
  return json({ id: result.meta.last_row_id });
});

app.put('/api/resumes/:id', async (c) => {
  const auth = c.req.header('Authorization');
  if (!auth?.startsWith('Bearer ')) return error('Unauthorized', 401);
  const id = c.req.param('id');
  const body = await c.req.json().catch(() => ({}));
  const { title, content } = body;
  await c.env.DB.prepare(
    'UPDATE resumes SET title = COALESCE(?, title), content = COALESCE(?, content), updated_at = unixepoch() WHERE id = ?'
  ).bind(title, content ? JSON.stringify(content) : null, Number(id)).run();
  return json({ id: Number(id) });
});

app.delete('/api/resumes/:id', async (c) => {
  const auth = c.req.header('Authorization');
  if (!auth?.startsWith('Bearer ')) return error('Unauthorized', 401);
  const id = c.req.param('id');
  await c.env.DB.prepare('DELETE FROM resumes WHERE id = ?').bind(Number(id)).run();
  return json({ deleted: true });
});

// AI resume optimization
app.post('/api/ai/optimize', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const text = String(body.text || '').trim();
  const section = String(body.section || 'summary');
  const action = normalizeAiAction(String(body.action || 'polish'));
  const targetRole = body.targetRole ? String(body.targetRole) : undefined;

  if (!text) return error('Text required');
  if (text.length > 3000) return error('Text too long, max 3000 characters');
  if (!c.env.DEEPSEEK_API_KEY) return error('DeepSeek API key is not configured', 500);

  const model = c.env.DEEPSEEK_MODEL || 'deepseek-chat';
  const baseUrl = c.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com';
  const prompt = buildResumeAiPrompt({ action, section, text, targetRole });

  const resp = await fetch(`${baseUrl.replace(/\/$/, '')}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${c.env.DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.35,
      max_tokens: 900,
      messages: [
        { role: 'system', content: '你是专业中文简历优化助手。必须只输出可直接放进简历的正文。' },
        { role: 'user', content: prompt },
      ],
    }),
  });

  const data = await resp.json().catch(() => ({})) as Record<string, unknown>;
  if (!resp.ok) {
    const message = typeof data.error === 'object' && data.error && 'message' in data.error
      ? String((data.error as { message?: unknown }).message)
      : 'DeepSeek request failed';
    return error(message, resp.status);
  }

  const choices = data.choices as Array<{ message?: { content?: string } }> | undefined;
  const resultText = choices?.[0]?.message?.content?.trim();
  if (!resultText) return error('DeepSeek returned empty content', 502);

  return json({ text: resultText, model });
});

// Redeem placeholder
app.post('/api/redeem', async (c) => {
  const auth = c.req.header('Authorization');
  if (!auth?.startsWith('Bearer ')) return error('Unauthorized', 401);
  const body = await c.req.json().catch(() => ({}));
  const { code } = body;
  if (!code) return error('Code required');

  const row = await c.env.DB.prepare('SELECT * FROM redeem_codes WHERE code = ?').bind(code).first<Record<string, unknown>>();
  if (!row) return error('Invalid code', 400);
  if (row.is_used === 1) return error('Code already used', 400);
  if (row.expire_at && (row.expire_at as number) < Date.now() / 1000) return error('Code expired', 400);

  return json({ success: true, message: 'Redeemed', vipType: row.type, expireAt: row.expire_at });
});

export default app;
