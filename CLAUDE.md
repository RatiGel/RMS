# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Critical: Next.js version

This project runs **Next.js 16.2.6** (not 14). APIs and file conventions may differ from training data. Read `node_modules/next/dist/docs/` before writing any Next.js-specific code.

## Critical: shadcn v4 / @base-ui/react

This project uses **shadcn v4** built on `@base-ui/react`, NOT `@radix-ui/react`. Key differences:
- `DropdownMenuTrigger`, `DialogTrigger`, etc. have **no `asChild` prop** — apply className directly to the trigger component
- `Select onValueChange` returns `string | null` — use nullish coalescing: `(v) => setFoo(v ?? "default")`
- Adding new shadcn components: `npx shadcn add <component>` (not `@shadcn/ui`)

## Commands

```bash
npm run dev      # dev server (Turbopack, default port 3000)
npm run build    # production build — verifies TypeScript
npm run lint     # ESLint
```

No test suite.

## Environment variables

Required in `.env.local`:

```
MONGODB_URI=              # MongoDB Atlas connection string
SESSION_SECRET=           # 32-byte hex string for jose JWT signing
NEXT_PUBLIC_APP_URL=      # e.g. http://localhost:3000
GOOGLE_CLIENT_ID=         # Google OAuth app client ID
GOOGLE_CLIENT_SECRET=     # Google OAuth app client secret
ADMIN_PASSWORD=           # Admin panel password (site owner only — /admin route)
CLOUDINARY_CLOUD_NAME=    # Cloudinary cloud name
CLOUDINARY_API_KEY=       # Cloudinary API key
CLOUDINARY_API_SECRET=    # Cloudinary API secret
```

## Architecture

**Stack:** Next.js 16 App Router · Tailwind CSS v4 · shadcn v4 (@base-ui/react) · MongoDB/Mongoose · @tanstack/react-query v5 · jose JWT

### Route structure

```
app/
  (auth)/
    layout.tsx
    login/page.tsx
    register/page.tsx
    join/page.tsx         # invite-code registration
  actions/auth.ts         # Server Actions: signup, login, logout
  lib/
    session.ts            # jose JWT: createSession, getSession, deleteSession, decrypt
    dal.ts                # verifyAuth() (redirects) + getCurrentUser() (returns null)
    definitions.ts        # Zod schemas for auth forms
  api/
    assets/[id]/route.ts
    bookings/[id]/route.ts
    categories/[id]/route.ts
    customers/[id]/route.ts
    invoices/[id]/route.ts
    payments/route.ts
    dashboard/route.ts
  dashboard/
    layout.tsx            # Server component — calls getCurrentUser(), passes session to Header
    page.tsx              # KPI cards + charts ("use client", useQuery → /api/dashboard)
    inventory/page.tsx
    bookings/page.tsx
    customers/page.tsx
    invoices/page.tsx
    profile/page.tsx
    settings/page.tsx    # theme, language, currency, billing/plan
    team/page.tsx
```

### Auth stack

- Session: `app/lib/session.ts` — `jose` JWT in httpOnly cookie `rms_session` (7-day expiry). `SessionPayload` carries `userId`, `orgId`, `role`, `name`, `orgName`.
- DAL: `app/lib/dal.ts` — `verifyAuth()` redirects to `/login` if no session; `getCurrentUser()` returns session or null without redirecting.
- Server Actions: `app/actions/auth.ts` — `signup` (creates Org + User), `login`, `logout`.
- Route middleware: `proxy.ts` (named `proxy.ts`, not `middleware.ts`) — redirects authenticated users away from `/login`/`/register`. **`protectedRoutes` array is currently empty**, so the middleware does NOT redirect unauthenticated users away from `/dashboard`. Dashboard protection relies on `verifyAuth()` being called inside individual server components.
- Dashboard layout (`app/dashboard/layout.tsx`) calls `getCurrentUser()` (not `verifyAuth()`), so it does **not** redirect unauthenticated users — add `verifyAuth()` calls in individual pages if auth enforcement is needed.
- Auth pages: `/login`, `/register` — `useActionState` + Server Actions, shadcn Card layout.
- Google OAuth: `/api/auth/google` initiates flow (PKCE state in `oauth_state` cookie), `/api/auth/google/callback` handles exchange. Requires `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET`.
- First registrant creates an Organization (owner role). Invite flow: owner/admin generates a code via `GET/POST /api/invite`; new user registers at `/join` via `joinOrg` Server Action (validates code, creates User with `staff` role).

### API routes (`app/api/`)

All routes call `getSession()`. GET routes return `[]` / empty data when unauthenticated (no 401); mutation routes (POST/PUT/DELETE) return 401. Dynamic params use `await ctx.params` (Next.js 16 pattern).

| Route | Methods |
|---|---|
| `/api/assets`, `/api/assets/[id]` | GET, POST, PUT, DELETE |
| `/api/categories`, `/api/categories/[id]` | GET, POST, PUT, DELETE |
| `/api/bookings`, `/api/bookings/[id]` | GET, POST (conflict check), PUT, DELETE |
| `/api/customers`, `/api/customers/[id]` | GET, POST, PUT, DELETE |
| `/api/invoices`, `/api/invoices/[id]` | GET, POST (auto invoice number), PUT |
| `/api/payments` | GET, POST (auto-updates invoice status) |
| `/api/dashboard` | GET (aggregated KPIs + chart data) |
| `/api/me` | GET (current user from session) |
| `/api/org` | PATCH (update org name; owner/admin only) |
| `/api/upload` | POST (multipart form; max 2 MB; uploads to Cloudinary `rms/assets/` folder; returns `{ url }`) |
| `/api/admin/orgs` | GET (all orgs + members + counts; admin cookie required) |
| `/api/admin/orgs/[id]` | DELETE (cascade-deletes org + all its data; admin only) |
| `/api/admin/users/[id]` | DELETE (remove user); PATCH `{ blacklisted: bool }` (toggle blacklist) |
| `/api/subscription` | GET (plan + trial status), POST (upgrade to starter/pro) |
| `/api/invite` | GET (fetch invite code), POST (regenerate; owner/admin only) |
| `/api/team`, `/api/team/[id]` | GET (org members), PUT/DELETE (update/remove member) |

### MongoDB / Mongoose

- Singleton: `lib/db.ts` — cached connection in `global.mongoose`.
- Models: `models/` — Organization, User, Category, Asset, Customer, Booking, Invoice, Payment.
- Every model has `orgId` for multi-tenant isolation. Always scope queries to `session.orgId`.

### Contexts

Root layout provider order: `ThemeProvider > QueryClientProvider > LanguageProvider > CurrencyProvider` (see `app/providers.tsx` + `app/layout.tsx`).

Dashboard layout adds: `SessionProvider > SubscriptionProvider` (see `app/dashboard/layout.tsx`).

- `useLanguage()` — locale + translations. Context in `contexts/language-context.tsx`.
- `useCurrency()` — active currency (`USD`/`GEL`), `formatCurrency(n)`, `currencySymbol`. Context in `contexts/currency-context.tsx`. **Use this for all money display**, not `utils/format.ts:formatCurrency`.
- `useSession()` — returns `ClientSession | null` (`userId`, `orgId`, `role`, `name`, `orgName`, `avatarUrl`). `useIsStaff()` checks `role === "staff"`. Context in `contexts/session-context.tsx`; populated from server `getCurrentUser()` in dashboard layout.
- `useSubscription()` — subscription state from `contexts/subscription-context.tsx`. Fields: `plan` (`"trial" | "starter" | "pro"`), `trialDaysLeft`, `trialExpired`, `assetLimit` (null=unlimited, 20 for starter), `canAccessTeam`, `canAccessInvoices`, `upgrade(plan)`. Pro plan unlocks team + invoices features. Use to gate UI elements.

### i18n

Custom React Context, no next-intl. Three locales: `en`, `ka` (Georgian), `ru` (Russian).

- Translations: `lib/i18n/translations.ts` — add keys to **both** `en` and `ka` blocks.
- Hook: `const { t, locale, setLocale } = useLanguage()`.
- String interpolation is manual: `t.foo.bar.replace("{n}", value)`.
- All components using `useLanguage()` must be `"use client"`.

### Frontend data fetching

All dashboard pages are `"use client"` and use `@tanstack/react-query` v5:
- `useQuery` for reads, `useMutation` for writes.
- `queryClient.invalidateQueries` on mutation success.
- `toast.success` / `toast.error` from `sonner` on all mutations.
- `app/providers.tsx` wraps root layout in `QueryClientProvider`.

### Component conventions

- `components/ui/` — shadcn primitives, do not edit manually.
- `components/layout/` — Sidebar, Header (both `"use client"`).
- `components/shared/` — StatusBadge components (use `useLanguage()` for labels).
- `components/dashboard/`, `components/inventory/`, etc. — feature components.

### Utilities

- `lib/utils.ts` — `cn(...)` Tailwind class merging via `clsx` + `tailwind-merge`.
- `utils/format.ts` — `formatDate(str)`, `daysBetween(start, end)`. `formatCurrency` here is locale-unaware — avoid in UI.
- `sonner` toast: `import { toast } from "sonner"`.

### Admin panel (`app/admin/`)

Separate top-level route, dark theme, no sidebar. Completely independent from the user dashboard.

- **Auth:** `ADMIN_PASSWORD` env var. Login at `/admin/login` sets `admin_session` httpOnly cookie (12h JWT signed with `SESSION_SECRET`). `proxy.ts` middleware validates this cookie for all `/admin/*` paths.
- **Admin session:** `app/lib/admin-session.ts` — `createAdminSession`, `getAdminSession`, `deleteAdminSession`.
- **Server actions:** `app/actions/admin-auth.ts` — `adminLogin`, `adminLogout`.
- **API routes:** all under `/api/admin/` — verify `admin_session` cookie independently (no shared helper, inline `jwtVerify`).
- **Blacklist:** `User.blacklisted` boolean field. Login action (`app/actions/auth.ts`) blocks blacklisted users with an error message.

### Mock data layer (`lib/mock/`)

Typed fixtures still exist: `assets.ts`, `bookings.ts`, `customers.ts`, `categories.ts`, `invoices.ts`, `dashboard.ts`. Phase 2 replaced these with API calls — mock files are no longer consumed by pages.

### Shared types (`types/index.ts`)

Single source of truth for: `Asset`, `Booking`, `Customer`, `Invoice`, `InvoiceLineItem`, `Payment`, `DashboardStats`, and all status union types. Mongoose schemas in `models/` mirror these interfaces.
