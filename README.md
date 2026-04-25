# ResumeCraft

高颜值在线简历制作与模板下载平台。

## 技术栈

- React 18 + Vite + TypeScript
- Tailwind CSS + Framer Motion
- React Router + Zustand + React Query
- Cloudflare Workers + Hono + D1 + R2

## 快速开始

```bash
npm install
npm run dev
```

## 脚本

- `npm run dev` — 启动开发服务器
- `npm run build` — 构建生产版本
- `npm run typecheck` — TypeScript 类型检查
- `npm run test` — 运行测试
- `npm run preview` — 预览生产构建

## 部署

- 前端：Cloudflare Pages（构建产物 `dist`）
- Worker：`wrangler deploy src/worker/index.ts`

## 许可证

MIT
