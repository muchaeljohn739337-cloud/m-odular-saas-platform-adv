## Advancia Pay Ledger — AI agent working guide

Purpose: give AI coding agents the minimum, specific context to be productive in this repo without guesswork.

### Architecture and boundaries
- Backend: Node.js + Express + TypeScript, Prisma ORM, Socket.IO. Entry: `backend/src/index.ts`.
- Frontend: Next.js 14 (App Router) in `frontend/` consuming `/api/**` from backend.
- Database: PostgreSQL via Prisma with many models (see `backend/prisma/schema.prisma`). Use `backend/src/prismaClient.ts` to import a singleton PrismaClient.
- Realtime: Socket.IO on the same HTTP server. Clients join per-user rooms: `join-room` → room `user-${userId}`. Server emits domain-specific events (transactions, notifications).
- Notifications: web push + email + socket broadcast in `backend/src/services/notificationService.ts`. Socket instance is injected via `setSocketIO(io)` from `index.ts`.
- Config/CORS: `backend/src/config/index.ts` computes `allowedOrigins` and other runtime config. CORS uses this list; add new origins there.

### Key runtime behaviors and cross-cutting concerns
- Rate limiting applies to all `/api/**` (see `rateLimit` middleware in `backend/src/index.ts`).
- Stripe webhook requires raw body on `/api/payments/webhook` before `express.json()`. Don't move middleware order.
- AuthN/AuthZ: JWT with `authenticateToken` and role gates via `allowRoles/requireAdmin` (see `backend/src/middleware/auth.ts` and usages in routes like `users.ts`, `support.ts`). Some routes also check an `x-api-key` header in development-friendly way (see `routes/auth.ts`).
- Decimals: Prisma Decimal fields should be serialized as strings in JSON responses. Use `backend/src/utils/decimal.ts` helpers: `serializeDecimal()`, `serializeDecimalFields()`, `serializeDecimalArray()`.
- Background jobs: `node-cron` schedules notification fallback emails in `index.ts`.

### Route conventions and wiring
- Routers live in `backend/src/routes/*.ts`. Each exports an Express router:
  - Example: `tokens.ts`, `rewards.ts`, `auth.ts`, `system.ts`, `users.ts`, `support.ts`.
- Register routers in `backend/src/index.ts` under `/api/<name>` in the "Registering routes" section. Keep the Stripe webhook raw-body line before `express.json()`.
- Input validation and security headers live in `backend/src/middleware/security.ts`; reuse `validateInput`, `securityHeaders` if adding endpoints.

### Data model hot spots (Prisma)
- Core models: `User`, `Transaction`, `TokenWallet`, `TokenTransaction`, `Reward`, `UserTier`, `AuditLog`, crypto orders/withdrawals, notifications, support, and Ethereum activity.
- When you add or change schema:
  - Update `backend/prisma/schema.prisma` → run `npx prisma migrate dev` in `backend`.
  - Regenerate client if needed: `npm run prisma:generate`.
  - Verify with `npx prisma studio`.

### Realtime and notifications
- To emit to a specific user: join room `user-${userId}` then `io.to(`user-${userId}`).emit(''event'', payload)`.
- Notification service sends socket, push (web-push), and email (nodemailer). Environment keys: `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `EMAIL_USER`, `EMAIL_PASSWORD`, `SMTP_HOST`, `SMTP_PORT`.

### External integrations
- **Authentication (Email-Only OTP)**: Twilio SMS removed for cost savings ($18-27/year saved). Authentication now uses:
  - Email OTP via Gmail SMTP (free) - see `routes/auth.ts`
  - Password login with bcrypt hashing
  - TOTP 2FA (Time-based One-Time Password)
  - Required env vars: `EMAIL_USER`, `EMAIL_PASSWORD`, `SMTP_HOST` (smtp.gmail.com), `SMTP_PORT` (587)
- Stripe payments webhook in `routes/payments.ts`: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`.
- Ethereum gateway endpoints in `routes/ethereum.ts` (ethers v5 on backend; ethers v6 in frontend).

### Production domains and URLs
- **Primary production domain**: `https://www.advanciapayledger.com` (redirects to `https://advanciapayledger.com`)
- **Frontend production**: `https://advanciapayledger.com` (deployed on Vercel)
- **API production**: `https://api.advanciapayledger.com` (deployed on Render)
- **Admin subdomain**: `https://admin.advanciapayledger.com` (if configured)

### Deployment instructions
- **Full deployment guide**: See `.github/copilot-deployment-instructions.md` for comprehensive auto-deployment instructions
- **Quick deploy**: Run `.\scripts\ADVANCIA-FULL-DEPLOY.ps1` for full stack deployment
- **Backend only**: `cd backend && render deploy` or git push to trigger auto-deploy
- **Frontend only**: `cd frontend && vercel --prod` or git push to trigger auto-deploy
- **Pre-deployment checks**: Always verify tests pass, TypeScript compiles, builds succeed locally
- **Post-deployment**: Check health endpoints, verify logs, test critical user flows
- **Support email**: `support@advanciapayledger.com`
- When adding new features or routes, ensure CORS allows these production domains in `backend/src/config/index.ts`.
- Always test production URLs after deployment: `https://api.advanciapayledger.com/api/health`

### Local dev workflows (Windows PowerShell)
- Backend: `cd backend && npm install && npm run dev` (uses ts-node-dev on `src/index.ts`, server at http://localhost:4000).
- Frontend: `cd frontend && npm install && npm run dev` (Next.js at http://localhost:3000, expects API at http://localhost:4000).
- Database: run Postgres locally or Docker; set `DATABASE_URL` in `backend/.env`. First time: `npx prisma migrate dev`.
- Prisma Studio: `cd backend && npx prisma studio`.

### Debugging patterns
- Node inspector examples (PowerShell):
  - Backend: `node --inspect=9229 -r ts-node/register backend/src/index.ts` or launch via VS Code.
  - Next.js: `node --inspect=9230 node_modules/next/dist/bin/next dev`.
- Sample VS Code launch config (place in `.vscode/launch.json`):
  - Backend attach: `{ "name": "Attach to Backend (9229)", "type": "node", "request": "attach", "port": 9229 }`.
  - Alternatively run backend with tsx register: runtimeArgs `["--inspect=9229", "-r", "tsx/register", "backend/src/index.ts"]`.
- Use `debugger` inside route handlers to break, e.g. in `router.post(...)`.

### Implementation tips specific to this repo
- Always import Prisma via `backend/src/prismaClient.ts` to avoid multiple clients.
- Convert Prisma Decimal to string in responses using `backend/src/utils/decimal.ts` helpers.
- When adding a new route that emits events, inject `io` via helper (see `setSocketIO` in notification service or `setTokenSocketIO` in `routes/tokens.ts`).
- Respect CORS policy: add new dev origins in `backend/src/config/index.ts` so the middleware allows them.
- Keep `/api/payments/webhook` raw-body middleware before any JSON parser.

### Files to read first for context
- `backend/src/index.ts` (server, middleware order, route wiring, Socket.IO, cron)
- `backend/src/config/index.ts` (origins, ports, env derivation)
- `backend/src/services/notificationService.ts` (push/email/socket pattern)
- `backend/src/utils/decimal.ts` (Decimal serialization helpers)
- `backend/prisma/schema.prisma` (entities & relations)
- `frontend/README.md` and `backend/README.md` (commands and structure)

If anything here is unclear or you need deeper conventions (tests, logging fields, error formats), ask and we'll refine this guide.
