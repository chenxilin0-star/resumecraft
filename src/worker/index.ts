import { Hono, type Context } from 'hono';
import { buildResumeAiPrompt, normalizeAiAction } from '../utils/ai';
import { canUseTemplate, DAILY_IP_REGISTRATION_LIMIT, FREE_AI_DAILY_LIMIT } from '../utils/accessPolicy';
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
const ADMIN_EMAILS = ['18328667563@163.com'];
const FREE_EXPORT_DAILY_LIMIT = 3;

const VIP_TEMPLATE_MESSAGE = '该模板为 VIP 专属，请先开通会员';


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

type AuthUser = { id: number; email: string; isVip: boolean; role: 'user' | 'admin'; isAdmin: boolean };

function isAdminEmail(email: string): boolean {
  return ADMIN_EMAILS.includes(email.trim().toLowerCase());
}

function isVipActive(row: Record<string, unknown>): boolean {
  if (String(row.role || 'user') === 'admin') return true;
  if (Number(row.is_vip || 0) !== 1) return false;
  const expireAt = Number(row.vip_expire_at || 0);
  return !expireAt || expireAt > Math.floor(Date.now() / 1000);
}

function userPayload(row: Record<string, unknown>): {
  id: number;
  email: string;
  nickname: unknown;
  isVip: boolean;
  role: 'user' | 'admin';
  isAdmin: boolean;
  vipExpireAt: unknown;
  limits: { aiDailyLimit: number | null; aiUsedToday: number; aiRemainingToday: number | null; exportDailyLimit: number | null };
} {
  const email = String(row.email || '');
  const role = (String(row.role || (isAdminEmail(email) ? 'admin' : 'user')) === 'admin' ? 'admin' : 'user') as 'user' | 'admin';
  const isAdmin = role === 'admin' || isAdminEmail(email);
  const isVip = isAdmin || isVipActive({ ...row, role });
  const aiUsedToday = Number(row.daily_ai_count || 0);
  return {
    id: Number(row.id),
    email,
    nickname: row.nickname ?? null,
    isVip,
    role: isAdmin ? 'admin' : role,
    isAdmin,
    vipExpireAt: row.vip_expire_at ?? null,
    limits: {
      aiDailyLimit: isVip ? null : FREE_AI_DAILY_LIMIT,
      aiUsedToday: isVip ? 0 : aiUsedToday,
      aiRemainingToday: isVip ? null : Math.max(0, FREE_AI_DAILY_LIMIT - aiUsedToday),
      exportDailyLimit: isVip ? null : FREE_EXPORT_DAILY_LIMIT,
    },
  };
}

async function getAuthUser(c: Context<{ Bindings: Env }>): Promise<AuthUser | null> {
  const auth = c.req.header('Authorization');
  if (!auth?.startsWith('Bearer ')) return null;
  const token = auth.slice(7);
  try {
    const payload = await jwtVerify(token, c.env.JWT_SECRET);
    const row = await c.env.DB.prepare(
      'SELECT id, email, nickname, role, is_vip, vip_expire_at, daily_ai_count, daily_ai_reset_at FROM users WHERE id = ?'
    ).bind(Number(payload.sub)).first<Record<string, unknown>>();
    if (!row) return null;
    const payloadUser = userPayload(row);
    return { id: payloadUser.id, email: payloadUser.email, isVip: payloadUser.isVip, role: payloadUser.role, isAdmin: payloadUser.isAdmin };
  } catch {
    return null;
  }
}

async function resetDailyAiIfNeeded(c: Context<{ Bindings: Env }>, userId: number) {
  const today = new Date().toISOString().slice(0, 10);
  const row = await c.env.DB.prepare('SELECT daily_ai_count, daily_ai_reset_at FROM users WHERE id = ?').bind(userId).first<Record<string, unknown>>();
  const resetAt = row?.daily_ai_reset_at ? new Date(Number(row.daily_ai_reset_at) * 1000).toISOString().slice(0, 10) : '';
  if (resetAt !== today) {
    await c.env.DB.prepare('UPDATE users SET daily_ai_count = 0, daily_ai_reset_at = unixepoch() WHERE id = ?').bind(userId).run();
    return 0;
  }
  return Number(row?.daily_ai_count || 0);
}

async function assertCanUseAi(c: Context<{ Bindings: Env }>, user: AuthUser, _action: string) {
  if (user.isVip || user.isAdmin) return;
  const count = await resetDailyAiIfNeeded(c, user.id);
  if (count >= FREE_AI_DAILY_LIMIT) {
    throw new Response(JSON.stringify({
      success: false,
      message: `今日免费 AI 优化次数已用完（${FREE_AI_DAILY_LIMIT}/${FREE_AI_DAILY_LIMIT}），开通会员后可不限次数使用 AI 优化。`,
      data: { code: 'FREE_AI_LIMIT_EXCEEDED', limit: FREE_AI_DAILY_LIMIT, used: count, remaining: 0 },
    }), { status: 403, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
  }
}

async function consumeAiQuota(c: Context<{ Bindings: Env }>, user: AuthUser, _action: string) {
  if (user.isVip || user.isAdmin) return;
  await c.env.DB.prepare('UPDATE users SET daily_ai_count = daily_ai_count + 1, daily_ai_reset_at = unixepoch() WHERE id = ?').bind(user.id).run();
}

function parseContentTemplateId(content: unknown): string {
  if (!content) return '';
  try {
    const parsed = typeof content === 'string' ? JSON.parse(content) : content;
    const templateId = (parsed as { templateId?: unknown })?.templateId;
    return typeof templateId === 'string' ? templateId : '';
  } catch {
    return '';
  }
}

function templateAccessDeniedResponse(templateId: string, user: AuthUser): Response | null {
  const isVipOrAdmin = user.isVip || user.isAdmin;
  if (!canUseTemplate(templateId, isVipOrAdmin)) {
    return new Response(JSON.stringify({ success: false, message: VIP_TEMPLATE_MESSAGE }), {
      status: 403,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
  return null;
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

  const normalizedEmail = String(email).trim().toLowerCase();

  const exists = await c.env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(normalizedEmail).first();
  if (exists) return error('Email already registered', 409);

  // IP registration rate limit
  const ip = c.req.header('CF-Connecting-IP') || c.req.header('X-Forwarded-For') || 'unknown';
  const today = new Date().toISOString().slice(0, 10);
  const ipLimitRow = await c.env.DB.prepare(
    'SELECT count FROM ip_registration_limits WHERE ip = ? AND registration_date = ?'
  ).bind(ip, today).first<{ count: number }>();
  const ipCount = ipLimitRow?.count || 0;
  if (ipCount >= DAILY_IP_REGISTRATION_LIMIT) {
    return error('同 IP 每日最多成功注册 2 个邮箱，请明日再试', 429);
  }

  const role = isAdminEmail(normalizedEmail) ? 'admin' : 'user';
  const passwordHash = await hashPassword(password);
  const result = await c.env.DB.prepare(
    'INSERT INTO users (email, password_hash, nickname, role, is_vip, vip_expire_at) VALUES (?, ?, ?, ?, ?, ?)'
  ).bind(normalizedEmail, passwordHash, nickname || null, role, role === 'admin' ? 1 : 0, role === 'admin' ? 4102444800 : null).run();

  // Increment IP registration count
  await c.env.DB.prepare(
    'INSERT INTO ip_registration_limits (ip, registration_date, count) VALUES (?, ?, 1) ON CONFLICT(ip, registration_date) DO UPDATE SET count = count + 1, updated_at = unixepoch()'
  ).bind(ip, today).run();

  const userId = result.meta.last_row_id;
  const token = await jwtSign({ sub: userId, email: normalizedEmail, isVip: role === 'admin', role }, c.env.JWT_SECRET);

  return json({ token, user: { id: userId, email: normalizedEmail, nickname: nickname || null, isVip: role === 'admin', role, isAdmin: role === 'admin' } });
});

app.post('/api/auth/login', rateLimitMiddleware(10), async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const { email, password } = body;
  if (!email || !password) return error('Email and password required');

  const normalizedEmail = String(email).trim().toLowerCase();
  const user = await c.env.DB.prepare('SELECT * FROM users WHERE email = ?').bind(normalizedEmail).first<Record<string, unknown>>();
  if (!user) return error('Invalid credentials', 401);

  if (isAdminEmail(normalizedEmail) && String(user.role || 'user') !== 'admin') {
    await c.env.DB.prepare("UPDATE users SET role = 'admin', is_vip = 1, vip_expire_at = 4102444800 WHERE id = ?").bind(Number(user.id)).run();
    user.role = 'admin';
    user.is_vip = 1;
    user.vip_expire_at = 4102444800;
  }

  const valid = await verifyPassword(password, String(user.password_hash));
  if (!valid) return error('Invalid credentials', 401);

  const payloadUser = userPayload(user);
  const token = await jwtSign(
    { sub: payloadUser.id, email: payloadUser.email, isVip: payloadUser.isVip, role: payloadUser.role },
    c.env.JWT_SECRET
  );

  return json({ token, user: payloadUser });
});

app.get('/api/auth/me', async (c) => {
  const user = await getAuthUser(c);
  if (!user) return error('Unauthorized', 401);
  await resetDailyAiIfNeeded(c, user.id);
  const row = await c.env.DB.prepare('SELECT id, email, nickname, role, is_vip, vip_expire_at, daily_ai_count, daily_ai_reset_at FROM users WHERE id = ?').bind(user.id).first<Record<string, unknown>>();
  if (!row) return error('User not found', 404);
  return json(userPayload(row));
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

  const accessDenied = templateAccessDeniedResponse(String(templateId || ''), user);
  if (accessDenied) return accessDenied;

  // Look up template by slug to get numeric id. Access is enforced by the
  // allowlist policy above so stale/missing D1 template rows cannot bypass VIP.
  const templateRow = await c.env.DB.prepare(
    'SELECT id FROM templates WHERE slug = ?'
  ).bind(templateId).first<Record<string, unknown>>();
  const dbTemplateId = templateRow?.id ?? 0;

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

  const existing = await c.env.DB.prepare('SELECT id, template_id FROM resumes WHERE id = ? AND user_id = ?').bind(Number(id), user.id).first<Record<string, unknown>>();
  if (!existing) return error('Resume not found', 404);

  // If content changes and includes templateId, enforce the same server-side
  // allowlist policy as creation. Never trust frontend-only VIP badges.
  if (content && content.templateId) {
    const accessDenied = templateAccessDeniedResponse(String(content.templateId), user);
    if (accessDenied) return accessDenied;
  }

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

  const row = await c.env.DB.prepare(
    'SELECT r.*, t.slug as template_slug FROM resumes r LEFT JOIN templates t ON r.template_id = t.id WHERE r.id = ? AND r.user_id = ?'
  ).bind(Number(id), user.id).first<Record<string, unknown>>();
  if (!row) return error('Resume not found', 404);

  // Re-derive template from DB slug or stored content; never trust client state.
  const resumeTemplateId = String(row.template_slug || parseContentTemplateId(row.content));
  const accessDenied = templateAccessDeniedResponse(resumeTemplateId, user);
  if (accessDenied) return accessDenied;

  const result = await c.env.DB.prepare(
    'INSERT INTO resumes (user_id, template_id, title, content) VALUES (?, ?, ?, ?)'
  ).bind(user.id, row.template_id, `${row.title} (副本)`, row.content).run();

  return json({ id: result.meta.last_row_id });
});

// ─── AI Resume Optimization ─────────────────────────────────────────────────

function normalizeComparableText(value: string): string {
  return value.replace(/[\s\n\r\t，。！？、；：,.!?;:（）()【】\[\]"'“”‘’`~\-—_/\\|]+/g, '').toLowerCase();
}

function isEffectivelySameAiText(original: string, result: string): boolean {
  const a = normalizeComparableText(original);
  const b = normalizeComparableText(result);
  if (!a || !b) return false;
  return a === b;
}

function isSparseInput(value: string): boolean {
  const text = value.trim();
  const charCount = Array.from(text.replace(/\s+/g, '')).length;
  const hasSentenceBoundary = /[，。！？、；：,.!?;:\n]/.test(text);
  return charCount > 0 && charCount <= 12 && !hasSentenceBoundary;
}

function fallbackRewriteText(original: string, action: string, section: string): string {
  const rawText = original.trim().replace(/[。；;\s]+$/g, '');
  const subject = rawText.replace(/^(负责|参与|协助|主导|推动|完成|进行|从事)/, '');
  const text = subject || rawText;
  const isCapability = /^[\u4e00-\u9fa5A-Za-z0-9+#.\s]{1,12}$/.test(text) && !/(开发|搭建|设计|运营|管理|分析|撰写|维护|测试|销售|交付|优化)/.test(text);
  if (isCapability) {
    if (action === 'shorten') return `${text}能力突出，推动协作落地`;
    if (action === 'expand') return `具备良好的${text}能力，能够围绕任务目标完成信息对齐、协作推进、问题跟进与结果沉淀。`;
    if (action === 'professional') return `具备良好的${text}能力，能够高效推进协作对齐、问题沟通与任务落地。`;
    return `具备良好的${text}能力，注重协作效率、信息同步与结果落地。`;
  }
  if (action === 'shorten') return `聚焦${text}，保障关键任务落地`;
  if (action === 'expand') {
    if (section === 'projects') return `围绕${text}，负责需求拆解、方案执行与结果复盘，推动项目按计划落地并提升交付质量。`;
    if (section === 'summary') return `具备${text}相关能力，能够结合目标岗位要求推进任务落地，注重执行质量、协作效率与结果沉淀。`;
    return `围绕${text}，负责需求理解、方案执行、协作推进与问题跟进，保障相关工作按计划落地并持续优化交付质量。`;
  }
  if (action === 'professional') return `聚焦${text}，推动相关工作规范化落地，持续提升执行质量与协作效率。`;
  return `负责${text}相关工作，围绕任务目标推进执行、优化流程并保障交付质量。`;
}

app.post('/api/ai/optimize', async (c) => {
  const user = await getAuthUser(c);
  if (!user) return error('请先登录后再使用 AI 优化功能', 401);
  const body = await c.req.json().catch(() => ({}));
  const text = String(body.text || '').trim();
  const section = String(body.section || 'summary');
  const action = normalizeAiAction(String(body.action || 'polish'));
  try {
    await assertCanUseAi(c, user, action);
  } catch (resp) {
    if (resp instanceof Response) return resp;
    throw resp;
  }

  const targetRole = String(body.targetRole || '');
  const jdText = body.jdText ? String(body.jdText) : undefined;

  if (!text) return error('Text required');
  if (text.length > 3000) return error('Text too long, max 3000 characters');

  if (isSparseInput(text) && ['polish', 'expand', 'professional', 'shorten'].includes(action)) {
    await consumeAiQuota(c, user, action);
    return json({ text: fallbackRewriteText(text, action, section), model: 'rule-based-short-input', rewritten: true });
  }

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

  const finalText = isEffectivelySameAiText(text, resultText)
    ? fallbackRewriteText(text, action, section)
    : resultText;

  await consumeAiQuota(c, user, action);
  return json({ text: finalText, model, rewritten: finalText !== resultText });
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
  const { format = 'pdf' } = body;

  const row = await c.env.DB.prepare(
    'SELECT r.id, r.content, t.slug as template_slug FROM resumes r LEFT JOIN templates t ON r.template_id = t.id WHERE r.id = ? AND r.user_id = ?'
  ).bind(Number(id), user.id).first<Record<string, unknown>>();
  if (!row) return error('Resume not found', 404);

  const resumeTemplateId = String(row.template_slug || parseContentTemplateId(row.content));
  const accessDenied = templateAccessDeniedResponse(resumeTemplateId, user);
  if (accessDenied) return accessDenied;
  const isPremiumTemplate = !canUseTemplate(resumeTemplateId, false);

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

    if (count >= FREE_EXPORT_DAILY_LIMIT) {
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
