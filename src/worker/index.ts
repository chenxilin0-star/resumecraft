import { Hono, type Context } from 'hono';
import { buildResumeAiPrompt, normalizeAiAction } from '../utils/ai';
import { jwtSign, jwtVerify } from './utils/jwt';
import { hashPassword, verifyPassword } from './utils/hash';

interface Env {
  DB: D1Database;
  JWT_SECRET: string;
  DEEPSEEK_API_KEY: string;
  DEEPSEEK_BASE_URL?: string;
  DEEPSEEK_MODEL?: string;
  APP_URL?: string;
}

const app = new Hono<{ Bindings: Env }>();

// In-memory rate limiter (per-Worker-instance)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

function checkRateLimit(key: string, maxRequests: number): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(key);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true };
  }
  if (entry.count >= maxRequests) {
    return { allowed: false, retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
  }
  entry.count += 1;
  return { allowed: true };
}

function rateLimitMiddleware(maxRequests: number) {
  return async (c: Context<{ Bindings: Env }>, next: () => Promise<void>) => {
    const ip = c.req.header('CF-Connecting-IP') || c.req.header('X-Forwarded-For') || 'unknown';
    const key = `${c.req.method}:${c.req.path}:${ip}`;
    const result = checkRateLimit(key, maxRequests);
    if (!result.allowed) {
      return new Response(JSON.stringify({ success: false, message: '请求过于频繁，请稍后重试' }), {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(result.retryAfter || 60),
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
    await next();
  };
}

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
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

function error(message: string, status = 400) {
  return new Response(JSON.stringify({ success: false, message }), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

// ─── Auth Helpers ───────────────────────────────────────────────────────────

async function getAuthUser(c: Context<{ Bindings: Env }>): Promise<{ id: number; email: string; isVip: boolean } | null> {
  const auth = c.req.header('Authorization');
  if (!auth?.startsWith('Bearer ')) return null;
  const token = auth.slice(7);
  try {
    const payload = await jwtVerify(token, c.env.JWT_SECRET);
    return {
      id: Number(payload.sub),
      email: String(payload.email),
      isVip: Boolean(payload.isVip),
    };
  } catch {
    return null;
  }
}

// Health
app.get('/health', (c) => c.json({ success: true, data: { status: 'ok', time: Date.now() } }));

// ─── Templates ──────────────────────────────────────────────────────────────

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

// ─── Auth ───────────────────────────────────────────────────────────────────

app.post('/api/auth/register', rateLimitMiddleware(5), async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const { email, password, nickname } = body;
  if (!email || !password) return error('Email and password required');
  if (password.length < 8) return error('Password must be at least 8 characters');
  if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) return error('Password must contain letters and numbers');

  const exists = await c.env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(email).first();
  if (exists) return error('Email already registered', 409);

  const passwordHash = await hashPassword(password);
  const result = await c.env.DB.prepare(
    'INSERT INTO users (email, password_hash, nickname) VALUES (?, ?, ?)'
  ).bind(email, passwordHash, nickname || null).run();

  const userId = result.meta.last_row_id;
  const token = await jwtSign({ sub: userId, email, isVip: false }, c.env.JWT_SECRET);

  return json({ token, user: { id: userId, email, nickname: nickname || null, isVip: false } });
});

app.post('/api/auth/login', rateLimitMiddleware(10), async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const { email, password } = body;
  if (!email || !password) return error('Email and password required');

  const user = await c.env.DB.prepare('SELECT * FROM users WHERE email = ?').bind(email).first<Record<string, unknown>>();
  if (!user) return error('Invalid credentials', 401);

  const valid = await verifyPassword(password, String(user.password_hash));
  if (!valid) return error('Invalid credentials', 401);

  const token = await jwtSign(
    { sub: Number(user.id), email: String(user.email), isVip: user.is_vip === 1 },
    c.env.JWT_SECRET
  );

  return json({
    token,
    user: {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      isVip: user.is_vip === 1,
      vipExpireAt: user.vip_expire_at,
    },
  });
});

app.get('/api/auth/me', async (c) => {
  const user = await getAuthUser(c);
  if (!user) return error('Unauthorized', 401);
  const row = await c.env.DB.prepare('SELECT id, email, nickname, is_vip, vip_expire_at FROM users WHERE id = ?').bind(user.id).first();
  if (!row) return error('User not found', 404);
  return json({
    ...row,
    isVip: (row as Record<string, unknown>).is_vip === 1,
    vipExpireAt: (row as Record<string, unknown>).vip_expire_at,
  });
});

// ─── Resumes CRUD ───────────────────────────────────────────────────────────

app.get('/api/resumes', async (c) => {
  const user = await getAuthUser(c);
  if (!user) return error('Unauthorized', 401);

  const { results } = await c.env.DB.prepare(
    'SELECT id, template_id, title, is_public, public_slug, view_count, created_at, updated_at FROM resumes WHERE user_id = ? ORDER BY updated_at DESC'
  ).bind(user.id).all();

  return json(results.map((r: Record<string, unknown>) => ({
    id: r.id,
    templateId: r.template_id,
    title: r.title,
    isPublic: r.is_public === 1,
    publicSlug: r.public_slug,
    viewCount: r.view_count,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  })));
});

// IMPORTANT: specific routes before /api/resumes/:id
app.get('/api/resumes/public/:slug', async (c) => {
  const slug = c.req.param('slug');
  const row = await c.env.DB.prepare(
    'SELECT r.*, u.nickname as user_nickname FROM resumes r JOIN users u ON r.user_id = u.id WHERE r.public_slug = ? AND r.is_public = 1'
  ).bind(slug).first<Record<string, unknown>>();
  if (!row) return error('Resume not found', 404);

  // Increment view count
  await c.env.DB.prepare('UPDATE resumes SET view_count = view_count + 1 WHERE id = ?').bind(row.id).run();

  return json({
    resume: {
      ...row,
      content: JSON.parse((row.content as string) || '{}'),
      isPublic: row.is_public === 1,
      publicSlug: row.public_slug,
      viewCount: (row.view_count as number) + 1,
    },
    user: { nickname: row.user_nickname },
  });
});

app.post('/api/resumes/:id/share', async (c) => {
  const user = await getAuthUser(c);
  if (!user) return error('Unauthorized', 401);
  const id = c.req.param('id');
  const body = await c.req.json().catch(() => ({}));
  const { isPublic, regenerateSlug } = body;

  const existing = await c.env.DB.prepare('SELECT public_slug FROM resumes WHERE id = ? AND user_id = ?').bind(Number(id), user.id).first<Record<string, unknown>>();
  if (!existing) return error('Resume not found', 404);

  let publicSlug = existing.public_slug as string | null;
  if (isPublic && (!publicSlug || regenerateSlug)) {
    publicSlug = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  }

  await c.env.DB.prepare(
    'UPDATE resumes SET is_public = ?, public_slug = COALESCE(?, public_slug), updated_at = unixepoch() WHERE id = ?'
  ).bind(isPublic ? 1 : 0, publicSlug, Number(id)).run();

  const frontendUrl = c.env.APP_URL || c.req.url.split('/api')[0];
  const shareUrl = isPublic && publicSlug ? `${frontendUrl.replace(/\/$/, '')}/r/${publicSlug}` : '';
  return json({ publicSlug: publicSlug || '', shareUrl });
});

app.get('/api/resumes/:id', async (c) => {
  const user = await getAuthUser(c);
  if (!user) return error('Unauthorized', 401);
  const id = c.req.param('id');

  const row = await c.env.DB.prepare('SELECT * FROM resumes WHERE id = ? AND user_id = ?').bind(Number(id), user.id).first();
  if (!row) return error('Resume not found', 404);

  return json({
    ...row,
    content: JSON.parse((row as Record<string, unknown>).content as string || '{}'),
  });
});

app.post('/api/resumes', async (c) => {
  const user = await getAuthUser(c);
  if (!user) return error('Unauthorized', 401);
  const body = await c.req.json().catch(() => ({}));
  const { templateId, title, content } = body;

  // Look up template by slug to get numeric id and check premium
  const templateRow = await c.env.DB.prepare(
    'SELECT id, is_premium FROM templates WHERE slug = ?'
  ).bind(templateId).first<Record<string, unknown>>();
  const dbTemplateId = templateRow?.id ?? 0;
  const isPremiumTemplate = templateRow?.is_premium === 1;

  if (isPremiumTemplate && !user.isVip) {
    return error('该模板为 VIP 专属，请先开通会员', 403);
  }

  const result = await c.env.DB.prepare(
    'INSERT INTO resumes (user_id, template_id, title, content) VALUES (?, ?, ?, ?)'
  ).bind(user.id, dbTemplateId, title || '未命名简历', JSON.stringify(content || {})).run();

  return json({ id: result.meta.last_row_id });
});

app.put('/api/resumes/:id', async (c) => {
  const user = await getAuthUser(c);
  if (!user) return error('Unauthorized', 401);
  const id = c.req.param('id');
  const body = await c.req.json().catch(() => ({}));
  const { title, content, isPublic, publicSlug } = body;

  const existing = await c.env.DB.prepare('SELECT id FROM resumes WHERE id = ? AND user_id = ?').bind(Number(id), user.id).first();
  if (!existing) return error('Resume not found', 404);

  await c.env.DB.prepare(
    'UPDATE resumes SET title = COALESCE(?, title), content = COALESCE(?, content), is_public = COALESCE(?, is_public), public_slug = COALESCE(?, public_slug), updated_at = unixepoch() WHERE id = ?'
  ).bind(title, content ? JSON.stringify(content) : null, isPublic !== undefined ? (isPublic ? 1 : 0) : null, publicSlug, Number(id)).run();

  return json({ id: Number(id) });
});

app.delete('/api/resumes/:id', async (c) => {
  const user = await getAuthUser(c);
  if (!user) return error('Unauthorized', 401);
  const id = c.req.param('id');

  const existing = await c.env.DB.prepare('SELECT id FROM resumes WHERE id = ? AND user_id = ?').bind(Number(id), user.id).first();
  if (!existing) return error('Resume not found', 404);

  await c.env.DB.prepare('DELETE FROM resumes WHERE id = ?').bind(Number(id)).run();
  return json({ deleted: true });
});

app.post('/api/resumes/:id/duplicate', async (c) => {
  const user = await getAuthUser(c);
  if (!user) return error('Unauthorized', 401);
  const id = c.req.param('id');

  const row = await c.env.DB.prepare('SELECT * FROM resumes WHERE id = ? AND user_id = ?').bind(Number(id), user.id).first<Record<string, unknown>>();
  if (!row) return error('Resume not found', 404);

  const result = await c.env.DB.prepare(
    'INSERT INTO resumes (user_id, template_id, title, content) VALUES (?, ?, ?, ?)'
  ).bind(user.id, row.template_id, `${row.title} (副本)`, row.content).run();

  return json({ id: result.meta.last_row_id });
});

// ─── AI Resume Optimization ─────────────────────────────────────────────────

app.post('/api/ai/optimize', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const text = String(body.text || '').trim();
  const section = String(body.section || 'summary');
  const action = normalizeAiAction(String(body.action || 'polish'));
  const targetRole = body.targetRole ? String(body.targetRole) : undefined;
  const jdText = body.jdText ? String(body.jdText) : undefined;

  if (!text) return error('Text required');
  if (text.length > 3000) return error('Text too long, max 3000 characters');
  if (!c.env.DEEPSEEK_API_KEY) return error('DeepSeek API key is not configured', 500);

  const model = c.env.DEEPSEEK_MODEL || 'deepseek-chat';
  const baseUrl = c.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com';
  const prompt = buildResumeAiPrompt({ action, section, text, targetRole, jdText });

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
        { role: 'system', content: '你是一名拥有 10 年经验的中文简历优化专家。输出时严格遵循：1. 只返回正文，无解释、无标题、无前后缀。2. 不编造事实。3. 用强动词开头、4. 量化成果为主。5. 不说“我”，不出现 AI 腐蚀式语言。' },
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

// ─── AI Resume Import (parse uploaded resume text) ───────────────────────────

app.post('/api/ai/parse-resume', async (c) => {
  const user = await getAuthUser(c);
  if (!user) return error('Unauthorized', 401);
  if (!user.isVip) return error('请先开通会员以使用导入功能', 403);

  const body = await c.req.json().catch(() => ({}));
  const text = String(body.text || '').trim();
  if (!text) return error('Text required');
  if (text.length > 12000) return error('Text too long, max 12000 characters');
  if (!c.env.DEEPSEEK_API_KEY) return error('DeepSeek API key is not configured', 500);

  const model = c.env.DEEPSEEK_MODEL || 'deepseek-chat';
  const baseUrl = c.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com';

  const systemPrompt = `你是一名简历解析专家。请将用户提供的简历文本解析为结构化的 JSON 数据。

输出格式（严格按照以下 JSON schema，不要添加额外字段）：
{
  "personal": { "name": "", "phone": "", "email": "", "wechat": "", "website": "", "city": "", "status": "", "photo": "" },
  "intention": { "position": "", "city": "", "salary": "", "availableTime": "" },
  "education": [{ "school": "", "degree": "", "major": "", "period": "", "description": "" }],
  "workExperience": [{ "company": "", "position": "", "period": "", "description": "" }],
  "projects": [{ "name": "", "role": "", "period": "", "description": "", "techStack": "", "link": "" }],
  "skills": [{ "name": "", "level": 1 }],
  "certificates": [{ "name": "", "date": "", "description": "" }],
  "summary": "",
  "languages": [{ "language": "", "level": "" }]
}

规则：
1. 如果某个字段无法从文本中推断，使用空字符串或空数组，不要编造。
2. skills 中的 level 是 1-5 的整数，1=入门，3=熟练，5=精通。如果文本未明确，默认 3。
3. 输出必须是纯 JSON，不要 markdown 代码块，不要任何解释。
4. 将所有时间格式统一为“YYYY.MM - YYYY.MM”或“YYYY.MM - 至今”。
5. 尽量保留原文的信息，仅做格式调整。`;

  const userPrompt = `请解析以下简历内容，输出结构化 JSON：\n\n${text}`;

  const resp = await fetch(`${baseUrl.replace(/\/$/, '')}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${c.env.DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      max_tokens: 4096,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    }),
  });

  const data2 = await resp.json().catch(() => ({})) as Record<string, unknown>;
  if (!resp.ok) {
    const message = typeof data2.error === 'object' && data2.error && 'message' in data2.error
      ? String((data2.error as { message?: unknown }).message)
      : 'DeepSeek request failed';
    return error(message, resp.status);
  }

  const choices2 = data2.choices as Array<{ message?: { content?: string } }> | undefined;
  const resultJson = choices2?.[0]?.message?.content?.trim();
  if (!resultJson) return error('DeepSeek returned empty content', 502);

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(resultJson);
  } catch {
    return error('AI 返回的数据格式无效', 502);
  }

  // Normalize to ensure required arrays exist
  const resumeData = {
    personal: parsed.personal || { name: '', phone: '', email: '' },
    intention: parsed.intention || undefined,
    education: Array.isArray(parsed.education) ? parsed.education : [],
    workExperience: Array.isArray(parsed.workExperience) ? parsed.workExperience : [],
    projects: Array.isArray(parsed.projects) ? parsed.projects : [],
    skills: Array.isArray(parsed.skills) ? parsed.skills : [],
    certificates: Array.isArray(parsed.certificates) ? parsed.certificates : undefined,
    summary: typeof parsed.summary === 'string' ? parsed.summary : undefined,
    languages: Array.isArray(parsed.languages) ? parsed.languages : undefined,
  };

  return json({ data: resumeData, model });
});

// ─── Export Logging ──────────────────────────────────────────────────────────

app.post('/api/resumes/:id/export', async (c) => {
  const user = await getAuthUser(c);
  if (!user) return error('Unauthorized', 401);
  const id = c.req.param('id');
  const body = await c.req.json().catch(() => ({}));
  const { format = 'pdf', isPremiumTemplate = false } = body;

  // Check daily export limit for non-VIP users
  if (!user.isVip) {
    const today = new Date().toISOString().split('T')[0];
    const u = await c.env.DB.prepare(
      'SELECT daily_export_count, daily_export_reset_at FROM users WHERE id = ?'
    ).bind(user.id).first<Record<string, unknown>>();

    const resetAt = u?.daily_export_reset_at ? new Date((u.daily_export_reset_at as number) * 1000).toISOString().split('T')[0] : '';
    let count = Number(u?.daily_export_count || 0);

    if (resetAt !== today) {
      count = 0;
      await c.env.DB.prepare(
        'UPDATE users SET daily_export_count = 0, daily_export_reset_at = unixepoch() WHERE id = ?'
      ).bind(user.id).run();
    }

    if (count >= 3) {
      return error('今日免费导出次数已用完，请升级会员', 403);
    }

    await c.env.DB.prepare('UPDATE users SET daily_export_count = daily_export_count + 1 WHERE id = ?').bind(user.id).run();
  }

  await c.env.DB.prepare(
    'INSERT INTO export_logs (user_id, resume_id, format, is_premium_template) VALUES (?, ?, ?, ?)'
  ).bind(user.id, Number(id), format, isPremiumTemplate ? 1 : 0).run();

  return json({ success: true });
});

// ─── Orders ─────────────────────────────────────────────────────────────────

app.get('/api/orders', async (c) => {
  const user = await getAuthUser(c);
  if (!user) return error('Unauthorized', 401);

  const { results } = await c.env.DB.prepare(
    'SELECT id, order_no, type, amount, status, pay_method, pay_time, created_at FROM orders WHERE user_id = ? ORDER BY created_at DESC'
  ).bind(user.id).all();

  return json(results.map((r: Record<string, unknown>) => ({
    id: r.id,
    orderNo: r.order_no,
    type: r.type,
    amount: r.amount,
    status: r.status,
    payMethod: r.pay_method,
    payTime: r.pay_time,
    createdAt: r.created_at,
  })));
});

app.post('/api/orders', async (c) => {
  const user = await getAuthUser(c);
  if (!user) return error('Unauthorized', 401);
  const body = await c.req.json().catch(() => ({}));
  const { type, amount } = body;
  if (!type || !amount) return error('Type and amount required');

  const orderNo = `RC${Date.now()}${Math.floor(Math.random() * 1000)}`;
  const result = await c.env.DB.prepare(
    'INSERT INTO orders (user_id, order_no, type, amount, status) VALUES (?, ?, ?, ?, ?)'
  ).bind(user.id, orderNo, type, amount, 'pending').run();

  return json({
    id: result.meta.last_row_id,
    orderNo,
    type,
    amount,
    status: 'pending',
    message: '订单已创建，请联系客服完成支付后激活会员',
  });
});

// ─── Redeem Codes ───────────────────────────────────────────────────────────

app.post('/api/redeem', async (c) => {
  const user = await getAuthUser(c);
  if (!user) return error('Unauthorized', 401);
  const body = await c.req.json().catch(() => ({}));
  const { code } = body;
  if (!code) return error('Code required');

  const row = await c.env.DB.prepare('SELECT * FROM redeem_codes WHERE code = ?').bind(code).first<Record<string, unknown>>();
  if (!row) return error('Invalid code', 400);
  if (row.is_used === 1) return error('Code already used', 400);
  if (row.expire_at && (row.expire_at as number) < Date.now() / 1000) return error('Code expired', 400);

  // Update redeem code
  await c.env.DB.prepare('UPDATE redeem_codes SET is_used = 1, used_by = ?, used_at = unixepoch() WHERE code = ?').bind(user.id, code).run();

  // Update user VIP status based on code type
  const codeType = String(row.type || 'monthly');
  let vipExpireAt = Date.now() / 1000;
  const nowSec = Math.floor(Date.now() / 1000);

  const userRow = await c.env.DB.prepare('SELECT vip_expire_at FROM users WHERE id = ?').bind(user.id).first<Record<string, unknown>>();
  const currentExpire = Math.max(Number(userRow?.vip_expire_at || 0), nowSec);

  if (codeType === 'yearly') {
    vipExpireAt = currentExpire + 365 * 24 * 60 * 60;
  } else if (codeType === 'quarterly') {
    vipExpireAt = currentExpire + 90 * 24 * 60 * 60;
  } else {
    vipExpireAt = currentExpire + 30 * 24 * 60 * 60;
  }

  await c.env.DB.prepare(
    'UPDATE users SET is_vip = 1, vip_expire_at = ? WHERE id = ?'
  ).bind(Math.floor(vipExpireAt), user.id).run();

  return json({ success: true, message: '兑换成功，会员已激活', vipType: row.type, expireAt: Math.floor(vipExpireAt) });
});

export default app;
