-- 用户表
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  nickname TEXT,
  avatar TEXT,
  role TEXT DEFAULT 'user',
  is_vip INTEGER DEFAULT 0,
  vip_expire_at INTEGER,
  daily_export_count INTEGER DEFAULT 0,
  daily_export_reset_at INTEGER,
  daily_ai_count INTEGER DEFAULT 0,
  daily_ai_reset_at INTEGER,
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch())
);

-- 简历表
CREATE TABLE IF NOT EXISTS resumes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  template_id INTEGER NOT NULL,
  title TEXT DEFAULT '未命名简历',
  content TEXT NOT NULL,
  is_public INTEGER DEFAULT 0,
  public_slug TEXT UNIQUE,
  view_count INTEGER DEFAULT 0,
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch()),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (template_id) REFERENCES templates(id)
);

-- 模板表
CREATE TABLE IF NOT EXISTS templates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  thumbnail TEXT NOT NULL,
  preview_images TEXT,
  category_id INTEGER,
  tags TEXT,
  config TEXT NOT NULL,
  is_premium INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  sort_order INTEGER DEFAULT 0,
  use_count INTEGER DEFAULT 0,
  created_at INTEGER DEFAULT (unixepoch())
);

-- 模板分类表
CREATE TABLE IF NOT EXISTS template_categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  icon TEXT,
  sort_order INTEGER DEFAULT 0
);

-- 订单表
CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  order_no TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL,
  amount INTEGER NOT NULL,
  status TEXT DEFAULT 'pending',
  pay_method TEXT,
  pay_time INTEGER,
  created_at INTEGER DEFAULT (unixepoch()),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 兑换码表
CREATE TABLE IF NOT EXISTS redeem_codes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL,
  is_used INTEGER DEFAULT 0,
  used_by INTEGER,
  used_at INTEGER,
  expire_at INTEGER,
  created_at INTEGER DEFAULT (unixepoch())
);

-- 导出记录表
CREATE TABLE IF NOT EXISTS export_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  resume_id INTEGER NOT NULL,
  format TEXT NOT NULL,
  is_premium_template INTEGER DEFAULT 0,
  created_at INTEGER DEFAULT (unixepoch())
);

-- Seed categories
INSERT OR IGNORE INTO template_categories (id, name, slug, icon, sort_order) VALUES
(1, '极简', 'minimal', 'minus', 1),
(2, '商务', 'business', 'briefcase', 2),
(3, '现代', 'modern', 'layout', 3),
(4, '清新', 'fresh', 'leaf', 4),
(5, '互联网', 'internet', 'globe', 5),
(6, '学术', 'academic', 'graduation-cap', 6),
(7, '创意', 'creative', 'palette', 7),
(8, '时间轴', 'timeline', 'clock', 8);

-- Seed templates
INSERT OR IGNORE INTO templates (id, name, slug, description, thumbnail, category_id, tags, config, is_premium, sort_order) VALUES
(1, '极简经典', 'minimal-classic', '最基础、最通用的简历模板。去除一切多余装饰，以内容为核心。', '/templates/minimal-classic.png', 1, '["极简","商务","通用"]', '{"layout":"single-column","supportsPhoto":true,"supportsMultiPage":true,"defaultSections":["personal","intention","education","workExperience","projects","skills","summary"],"themes":[{"id":"black","name":"经典黑","colors":{"primary":"#1F2937","secondary":"#4B5563","accent":"#374151","background":"#FFFFFF","surface":"#F9FAFB","text":"#111827","textMuted":"#9CA3AF","border":"#E5E7EB"}},{"id":"blue","name":"商务蓝","colors":{"primary":"#2563EB","secondary":"#3B82F6","accent":"#1D4ED8","background":"#FFFFFF","surface":"#EFF6FF","text":"#1E3A8A","textMuted":"#6B7280","border":"#BFDBFE"}},{"id":"teal","name":"稳重藏青","colors":{"primary":"#0F766E","secondary":"#14B8A6","accent":"#115E59","background":"#FFFFFF","surface":"#F0FDFA","text":"#134E4A","textMuted":"#6B7280","border":"#99F6E4"}}]}', 0, 1),
(2, '商务蓝调', 'business-blue', '传统商务简历，以蓝色为主调，稳重专业。', '/templates/business-blue.png', 2, '["商务","应届生","行政"]', '{"layout":"single-column","supportsPhoto":true,"supportsMultiPage":true,"defaultSections":["personal","intention","education","workExperience","skills","summary"],"themes":[{"id":"blue","name":"商务蓝","colors":{"primary":"#1E40AF","secondary":"#3B82F6","accent":"#EFF6FF","background":"#FFFFFF","surface":"#EFF6FF","text":"#1E3A8A","textMuted":"#6B7280","border":"#BFDBFE"}},{"id":"red","name":"经典红","colors":{"primary":"#991B1B","secondary":"#DC2626","accent":"#FEE2E2","background":"#FFFFFF","surface":"#FEF2F2","text":"#7F1D1D","textMuted":"#6B7280","border":"#FECACA"}},{"id":"gray","name":"深灰","colors":{"primary":"#374151","secondary":"#6B7280","accent":"#F3F4F6","background":"#FFFFFF","surface":"#F9FAFB","text":"#111827","textMuted":"#6B7280","border":"#E5E7EB"}}]}', 0, 2),
(3, '现代双栏', 'modern-split', '左右分栏布局，左侧放个人信息和技能，右侧放工作、项目经历。', '/templates/modern-split.png', 3, '["现代","技术","产品经理"]', '{"layout":"two-column","supportsPhoto":true,"supportsMultiPage":true,"defaultSections":["personal","skills","education","workExperience","projects","summary"],"themes":[{"id":"navy","name":"蓝灰分割","colors":{"primary":"#1E3A5F","secondary":"#2563EB","accent":"#1E3A5F","background":"#FFFFFF","surface":"#F1F5F9","text":"#F8FAFC","textMuted":"#94A3B8","border":"#334155"}},{"id":"green","name":"绿灰分割","colors":{"primary":"#064E3B","secondary":"#059669","accent":"#064E3B","background":"#FFFFFF","surface":"#F0FDF4","text":"#F0FDF4","textMuted":"#6B7280","border":"#065F46"}},{"id":"purple","name":"紫灰分割","colors":{"primary":"#581C87","secondary":"#7C3AED","accent":"#581C87","background":"#FFFFFF","surface":"#FAF5FF","text":"#FAF5FF","textMuted":"#A78BFA","border":"#7C3AED"}}]}', 0, 3),
(4, '清新绿', 'fresh-green', '简洁明快的绿色调模板，给人清新脱俗的感觉。', '/templates/fresh-green.png', 4, '["清新","创意","教育"]', '{"layout":"single-column","supportsPhoto":true,"supportsMultiPage":true,"defaultSections":["personal","education","workExperience","projects","skills"],"themes":[{"id":"green","name":"清新绿","colors":{"primary":"#059669","secondary":"#10B981","accent":"#D1FAE5","background":"#FFFFFF","surface":"#F0FDF4","text":"#064E3B","textMuted":"#6B7280","border":"#A7F3D0"}},{"id":"cyan","name":"天蓝","colors":{"primary":"#0891B2","secondary":"#22D3EE","accent":"#CFFAFE","background":"#FFFFFF","surface":"#ECFEFF","text":"#164E63","textMuted":"#6B7280","border":"#67E8F9"}},{"id":"orange","name":"橙红","colors":{"primary":"#C2410C","secondary":"#F97316","accent":"#FFEDD5","background":"#FFFFFF","surface":"#FFF7ED","text":"#7C2D12","textMuted":"#6B7280","border":"#FDBA74"}}]}', 0, 4),
(5, '互联网风格', 'internet-style', '偏向互联网行业的现代感模板，采用卡片式和时尚布局。', '/templates/internet-style.png', 5, '["互联网","程序员","现代"]', '{"layout":"single-column","supportsPhoto":true,"supportsMultiPage":true,"defaultSections":["personal","skills","workExperience","projects","education"],"themes":[{"id":"dark","name":"极客黑","colors":{"primary":"#18181B","secondary":"#3F3F46","accent":"#F4F4F5","background":"#FFFFFF","surface":"#FAFAFA","text":"#18181B","textMuted":"#71717A","border":"#E4E4E7"}},{"id":"purple","name":"极客紫","colors":{"primary":"#581C87","secondary":"#7C3AED","accent":"#F3E8FF","background":"#FFFFFF","surface":"#FAF5FF","text":"#3B0764","textMuted":"#8B5CF6","border":"#DDD6FE"}},{"id":"cyan","name":"极客青","colors":{"primary":"#0C4A6E","secondary":"#0284C7","accent":"#E0F2FE","background":"#FFFFFF","surface":"#F0F9FF","text":"#082F49","textMuted":"#38BDF8","border":"#BAE6FD"}}]}', 0, 5),
(6, '学术风', 'academic', '干净、正式的学术简历风格，适合考研、申博、留学申请。', '/templates/academic.png', 6, '["学术","考研","留学"]', '{"layout":"single-column","supportsPhoto":false,"supportsMultiPage":true,"defaultSections":["personal","education","workExperience","projects","skills","summary"],"themes":[{"id":"red","name":"深红学院","colors":{"primary":"#7F1D1D","secondary":"#991B1B","accent":"#FEF2F2","background":"#FFFFFF","surface":"#FEF2F2","text":"#450A0A","textMuted":"#78716C","border":"#E7E5E4"}},{"id":"navy","name":"海军蓝","colors":{"primary":"#1E3A5F","secondary":"#1E40AF","accent":"#EFF6FF","background":"#FFFFFF","surface":"#EFF6FF","text":"#172554","textMuted":"#64748B","border":"#CBD5E1"}},{"id":"green","name":"墨绿","colors":{"primary":"#064E3B","secondary":"#065F46","accent":"#ECFDF5","background":"#FFFFFF","surface":"#ECFDF5","text":"#022C22","textMuted":"#059669","border":"#A7F3D0"}}]}', 1, 6),
(7, '创意设计师', 'creative-designer', '大留白、强设计感的模板。空间感极强，适合设计、艺术、文创行业。', '/templates/creative-designer.png', 7, '["创意","设计","艺术"]', '{"layout":"single-column","supportsPhoto":true,"supportsMultiPage":true,"defaultSections":["personal","intention","workExperience","projects","education","skills"],"themes":[{"id":"bw","name":"极简黑白","colors":{"primary":"#000000","secondary":"#333333","accent":"#F5F5F5","background":"#FFFFFF","surface":"#FAFAFA","text":"#1A1A1A","textMuted":"#999999","border":"#E5E5E5"}},{"id":"mint","name":"薄荷绿","colors":{"primary":"#2D5A4C","secondary":"#4A7C6F","accent":"#E8F5E9","background":"#FFFFFF","surface":"#F1F8E9","text":"#1B4332","textMuted":"#95D5B2","border":"#D8F3DC"}},{"id":"pink","name":"烟粉红","colors":{"primary":"#9B2335","secondary":"#BC243C","accent":"#FDEDEC","background":"#FFFFFF","surface":"#FDEDEC","text":"#641E16","textMuted":"#D98880","border":"#F5B7B1"}}]}', 1, 7),
(8, '时间轴', 'timeline', '采用时间轴形式展示经历，视觉冲击力强。适合工作年限较长的求职者。', '/templates/timeline.png', 8, '["时间轴","管理","高级"]', '{"layout":"single-column","supportsPhoto":true,"supportsMultiPage":true,"defaultSections":["personal","intention","workExperience","skills","education","certificates"],"themes":[{"id":"navy","name":"深蓝时间轴","colors":{"primary":"#1E3A5F","secondary":"#3B82F6","accent":"#EFF6FF","background":"#FFFFFF","surface":"#EFF6FF","text":"#1E293B","textMuted":"#64748B","border":"#BFDBFE"}},{"id":"purple","name":"紫金时间轴","colors":{"primary":"#4C1D95","secondary":"#7C3AED","accent":"#EDE9FE","background":"#FFFFFF","surface":"#EDE9FE","text":"#2E1065","textMuted":"#8B5CF6","border":"#C4B5FD"}},{"id":"cyan","name":"青蓝时间轴","colors":{"primary":"#0C4A6E","secondary":"#0EA5E9","accent":"#E0F2FE","background":"#FFFFFF","surface":"#E0F2FE","text":"#082F49","textMuted":"#0284C7","border":"#7DD3FC"}}]}', 1, 8);


-- IP 注册限制表
CREATE TABLE IF NOT EXISTS ip_registration_limits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ip TEXT NOT NULL,
  registration_date TEXT NOT NULL,
  count INTEGER DEFAULT 0,
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch()),
  UNIQUE(ip, registration_date)
);

-- Production migration helpers (safe to run manually if table already exists)
-- ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user';
-- ALTER TABLE users ADD COLUMN daily_ai_count INTEGER DEFAULT 0;
-- ALTER TABLE users ADD COLUMN daily_ai_reset_at INTEGER;
