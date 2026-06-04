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
CLOUDINARY_CLOUD_NAME=    # Cloudinary cloud name
CLOUDINARY_API_KEY=       # Cloudinary API key
CLOUDINARY_API_SECRET=    # Cloudinary API secret

# Super Admin MFA (optional dev shortcuts — never set in production)
SUPER_ADMIN_BYPASS_MFA=   # Set to "true" to skip TOTP check in development
SUPER_ADMIN_MFA_PIN=      # Static 6-digit code accepted as valid TOTP (dev only)
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
    join/page.tsx               # invite-code registration
  actions/
    auth.ts                     # Server Actions: signup, login, logout, joinOrg
    super-admin-auth.ts         # superAdminLogout, verifyMfa, exitImpersonation, setupMfa
  lib/
    session.ts                  # jose JWT: createSession, getSession, deleteSession, decrypt
    dal.ts                      # verifyAuth() (redirects) + getCurrentUser() (returns null)
    super-admin-dal.ts          # verifySuperAdmin(), logAudit()
    totp.ts                     # TOTP: verifyTotp(), generateMfaSecret(), getTotpUri()
    definitions.ts              # Zod schemas for auth forms
  api/
    assets/[id]/route.ts
    bookings/[id]/route.ts
    ...                         # tenant API routes
    super-admin/
      dashboard/route.ts
      tenants/route.ts
      tenants/[id]/route.ts
      tenants/[id]/impersonate/route.ts
      plans/route.ts
      features/route.ts
      analytics/route.ts
      announcements/route.ts
      announcements/[id]/route.ts
      settings/route.ts
      audit-logs/route.ts
      admins/route.ts
      admins/[id]/route.ts
  dashboard/
    layout.tsx                  # Server component — reads sa_impersonating cookie → ImpersonationBanner
    page.tsx
    inventory/page.tsx
    bookings/page.tsx
    customers/page.tsx
    invoices/page.tsx
    profile/page.tsx
    settings/page.tsx
    team/page.tsx
  super-admin/
    layout.tsx                  # SuperAdminSidebar + SuperAdminHeader (no QueryClient, no lang/currency)
    login/page.tsx              # Two-step: password form → ?step=mfa TOTP form
    page.tsx                    # Overview: KPIs, signup chart, top tenants, churn risk
    tenants/page.tsx            # Paginated table + detail drawer + action dialogs
    plans/page.tsx              # Plan cards + assign/extend-trial dialogs
    features/page.tsx           # Feature flag toggles (global + per-tenant overrides)
    analytics/page.tsx          # MRR/bookings/growth charts + per-tenant revenue table
    announcements/page.tsx      # CRUD banners with target (all/plan/tenant)
    settings/page.tsx           # Platform name, maintenance mode, languages, currencies
    audit-logs/page.tsx         # Paginated log table + CSV export
    admins/page.tsx             # SA accounts list, invite, revoke with name-confirm
```

### Auth stack

- Session: `app/lib/session.ts` — `jose` JWT in httpOnly cookie `rms_session` (7-day expiry). `SessionPayload` carries `userId`, `orgId`, `role`, `name`, `orgName`.
- DAL: `app/lib/dal.ts` — `verifyAuth()` redirects to `/login` if no session; `getCurrentUser()` returns session or null without redirecting.
- Server Actions: `app/actions/auth.ts` — `signup` (creates Org + User), `login`, `logout`.
- Route middleware: `proxy.ts` (named `proxy.ts`, not `middleware.ts`) — only contains `publicRoutes = ["/login", "/register"]` to redirect already-authenticated users away from those pages. **`/dashboard` is NOT in any protected route list**, so middleware does NOT guard it. Dashboard protection relies on `verifyAuth()` being called inside individual server components.
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
| `/api/subscription` | GET (plan + trial status), POST (upgrade to starter/pro) |
| `/api/invite` | GET (fetch invite code), POST (regenerate; owner/admin only) |
| `/api/team`, `/api/team/[id]` | GET (org members), PUT/DELETE (update/remove member) |
| `/api/super-admin/dashboard` | GET (platform KPIs, top tenants, churn risk, signup chart) |
| `/api/super-admin/tenants` | GET (paginated+filtered list), POST (create tenant) |
| `/api/super-admin/tenants/[id]` | GET (detail + users/assets/bookings), PATCH (suspend/reactivate/change_plan/extend_trial/billing_exempt), DELETE (cascade) |
| `/api/super-admin/tenants/[id]/impersonate` | POST (swap rms_session to org owner, store SA session) |
| `/api/super-admin/plans` | GET (plan defs + tenant counts), PATCH (assign plan to tenant) |
| `/api/super-admin/features` | GET (all flags), PATCH (global toggle or tenant override) |
| `/api/super-admin/analytics` | GET (MRR/bookings/growth history + per-tenant breakdown) |
| `/api/super-admin/announcements` | GET, POST |
| `/api/super-admin/announcements/[id]` | PATCH, DELETE |
| `/api/super-admin/settings` | GET, PATCH (platform name, maintenance mode, languages, currencies) |
| `/api/super-admin/audit-logs` | GET (paginated, filterable); `?export=true` returns CSV |
| `/api/super-admin/admins` | GET, POST (create SA account) |
| `/api/super-admin/admins/[id]` | DELETE (revoke), PATCH (change superAdminRole / disable MFA) |

### MongoDB / Mongoose

- Singleton: `lib/db.ts` — cached connection in `global.mongoose`.
- Models: `models/` — Organization, User, Category, Asset, Customer, Booking, Invoice, Payment, AuditLog, FeatureFlag, Announcement, PlatformSettings.
- Every tenant model has `orgId` for multi-tenant isolation. Always scope queries to `session.orgId`.
- `User.orgId` is optional — super_admin users have no org. `User.role` now includes `"super_admin"`. `User.mfaSecret` stores TOTP secret for super admins.
- `Organization.status` (`"active" | "suspended"`), `billingExempt`, `trialExtendedTo`, `lastLoginAt` fields added.

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

### Super Admin panel (`app/super-admin/`)

Separate protected area for platform owner. Independent from tenant dashboards — no language/currency/subscription contexts.

**Creating first super admin:** directly insert into MongoDB:
```js
db.users.insertOne({ name: "Admin", email: "admin@example.com", passwordHash: "<bcrypt>", role: "super_admin", superAdminRole: "owner", blacklisted: false })
```
No `orgId` field. Use bcrypt round 12. Then set up MFA via `setupMfa` server action or set `SUPER_ADMIN_BYPASS_MFA=true` in `.env.local` for dev.

**Auth flow:**
1. Submit email + password at `/super-admin/login` → `login` Server Action checks credentials
2. If `role === "super_admin"` → sets `sa_mfa_pending` httpOnly cookie (5-min JWT with `userId`), redirects to `?step=mfa`
3. Enter TOTP code → `verifyMfa` action validates against `user.mfaSecret` → creates `rms_session` with `orgId: ""`
4. Middleware (`proxy.ts`) guards all `/super-admin/*` except `/super-admin/login`

**TOTP:** `app/lib/totp.ts` — custom TOTP using Node.js `crypto` (no npm package). Base32 encode/decode + HMAC-SHA1. Secret stored in `user.mfaSecret`. `generateMfaSecret()` produces 20 random bytes base32-encoded. `getTotpUri()` returns `otpauth://` URL for authenticator app manual entry. Accepts ±1 time-step window (30s).

**Admin roles:** `user.superAdminRole: "owner" | "support"`. Enforced server-side in API routes (not middleware). Support role restrictions: cannot DELETE tenant, POST admins, PATCH settings, or change plans.

**Impersonation flow:**
1. POST `/api/super-admin/tenants/[id]/impersonate` → finds org's owner user
2. Creates new `rms_session` token for that owner, saves real SA token in `sa_real_session` cookie (2h, httpOnly)
3. Sets `sa_impersonating` cookie (`{orgId, orgName}`, **non-httpOnly** so client JS can read it if needed, 2h)
4. `app/dashboard/layout.tsx` reads `sa_impersonating` server-side → renders `<ImpersonationBanner>`
5. Banner's "Exit" button calls `exitImpersonation` server action → restores `rms_session` from `sa_real_session`, clears both cookies, logs exit, redirects to `/super-admin/tenants`
6. Both start and end events written to `AuditLog`

**DAL:** `app/lib/super-admin-dal.ts`:
- `verifySuperAdmin()` — calls `getSession()`, returns session if `role === "super_admin"`, else null. Use in every SA API route.
- `logAudit(session, action, targetType, targetId?, targetName?, metadata?)` — fire-and-forget write to `AuditLog`.

**Components:** `components/super-admin/sidebar.tsx`, `header.tsx`, `impersonation-banner.tsx`. Sidebar has no subscription/language context — plain client component.

### `plan.md`

Outdated Phase 1/2 planning document (references Next.js 14 + NextAuth.js). Ignore — the actual implementation diverges significantly.

### Mock data layer (`lib/mock/`)

Typed fixtures still exist: `assets.ts`, `bookings.ts`, `customers.ts`, `categories.ts`, `invoices.ts`, `dashboard.ts`. Phase 2 replaced these with API calls — mock files are no longer consumed by pages.

### Shared types (`types/index.ts`)

Single source of truth for: `Asset`, `Booking`, `Customer`, `Invoice`, `InvoiceLineItem`, `Payment`, `DashboardStats`, and all status union types. Mongoose schemas in `models/` mirror these interfaces.
