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
MONGODB_URI=          # MongoDB Atlas connection string
SESSION_SECRET=       # 32-byte hex string for jose JWT signing
NEXT_PUBLIC_APP_URL=  # e.g. http://localhost:3000
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
```

### Auth stack

- Session: `app/lib/session.ts` — `jose` JWT in httpOnly cookie `rms_session` (7-day expiry). `SessionPayload` carries `userId`, `orgId`, `role`, `name`, `orgName`.
- DAL: `app/lib/dal.ts` — `verifyAuth()` redirects to `/login` if no session; `getCurrentUser()` returns session or null without redirecting.
- Server Actions: `app/actions/auth.ts` — `signup` (creates Org + User), `login`, `logout`.
- Route middleware: `proxy.ts` (named `proxy.ts`, not `middleware.ts`) — redirects authenticated users away from `/login`/`/register`. **`protectedRoutes` array is currently empty**, so the middleware does NOT redirect unauthenticated users away from `/dashboard`. Dashboard protection relies on `verifyAuth()` being called inside individual server components.
- Dashboard layout (`app/dashboard/layout.tsx`) calls `getCurrentUser()` (not `verifyAuth()`), so it does **not** redirect unauthenticated users — add `verifyAuth()` calls in individual pages if auth enforcement is needed.
- Auth pages: `/login`, `/register` — `useActionState` + Server Actions, shadcn Card layout.
- First registrant creates an Organization (owner role). No invite flow yet.

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

### MongoDB / Mongoose

- Singleton: `lib/db.ts` — cached connection in `global.mongoose`.
- Models: `models/` — Organization, User, Category, Asset, Customer, Booking, Invoice, Payment.
- Every model has `orgId` for multi-tenant isolation. Always scope queries to `session.orgId`.

### Contexts

Two React Contexts wrap the root layout (`LanguageProvider > CurrencyProvider > children`):

- `useLanguage()` — locale + translations. Context in `contexts/language-context.tsx`.
- `useCurrency()` — active currency (`USD`/`GEL`), `formatCurrency(n)`, `currencySymbol`. Context in `contexts/currency-context.tsx`. **Use this for all money display**, not `utils/format.ts:formatCurrency`.

### i18n

Custom React Context, no next-intl. Two locales: `en`, `ka` (Georgian).

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

### Mock data layer (`lib/mock/`)

Typed fixtures still exist: `assets.ts`, `bookings.ts`, `customers.ts`, `categories.ts`, `invoices.ts`, `dashboard.ts`. Phase 2 replaced these with API calls — mock files are no longer consumed by pages.

### Shared types (`types/index.ts`)

Single source of truth for: `Asset`, `Booking`, `Customer`, `Invoice`, `InvoiceLineItem`, `Payment`, `DashboardStats`, and all status union types. Mongoose schemas in `models/` mirror these interfaces.
