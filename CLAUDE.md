# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Critical: Next.js version

This project runs **Next.js 16.2.6** (not 14). APIs and file conventions may differ from training data. Read `node_modules/next/dist/docs/` before writing any Next.js-specific code.

## Critical: shadcn v4 / @base-ui/react

This project uses **shadcn v4** which is built on `@base-ui/react`, NOT `@radix-ui/react`. Key differences:
- `DropdownMenuTrigger`, `DialogTrigger`, etc. have **no `asChild` prop** — apply className directly to the trigger component
- `Select onValueChange` returns `string | null` — use nullish coalescing: `(v) => setFoo(v ?? "default")`
- When adding new shadcn components: `npx shadcn add <component>` (not `@shadcn/ui`)

## Commands

```bash
npm run dev      # dev server (Turbopack, default port 3000 or next available)
npm run build    # production build — run this to verify TypeScript before shipping
npm run lint     # ESLint
```

No test suite yet (Phase 2 task).

## Architecture

**Phase 1 (current):** Frontend-only with mock data. No backend, no auth, no DB.  
**Phase 2 (planned):** MongoDB/Mongoose, NextAuth.js credentials+JWT, API routes, react-query.

### Route structure

```
app/
  layout.tsx              # root layout — wraps in LanguageProvider
  page.tsx                # redirects to /dashboard
  dashboard/
    layout.tsx            # Sidebar + Header shell
    page.tsx              # KPI cards + charts
    inventory/page.tsx
    bookings/page.tsx
    customers/page.tsx
    invoices/page.tsx
```

All dashboard pages are `"use client"` — they consume the LanguageContext and manage local state.

### Contexts

Two custom React Contexts wrap the root layout (`LanguageProvider > CurrencyProvider > children`):

- `useLanguage()` — locale + translations (see i18n section)
- `useCurrency()` — active currency (`USD`/`GEL`), `formatCurrency(n)`, `currencySymbol`. Lives in `contexts/currency-context.tsx`. Any component displaying money must use this instead of `utils/format.ts:formatCurrency`.

### i18n

Custom React Context, no next-intl. Two locales: `en`, `ka` (Georgian/Mkhedruli).

- Translations: `lib/i18n/translations.ts` — add keys to **both** `en` and `ka` blocks
- Context/hook: `contexts/language-context.tsx` — `const { t, locale, setLocale } = useLanguage()`
- Language toggle: rendered in `components/layout/header.tsx`
- `Translations` type uses `DeepString<T>` mapped type so both locale objects satisfy the same type despite different literal strings

String interpolation is manual: `t.foo.bar.replace("{n}", value)`.

### Mock data layer (`lib/mock/`)

Typed fixtures consumed directly by page components. Phase 2 will replace these with API calls + react-query. Mock files: `assets.ts`, `bookings.ts`, `customers.ts`, `categories.ts`, `invoices.ts`, `dashboard.ts`.

### Shared types (`types/index.ts`)

Single source of truth for: `Asset`, `Booking`, `Customer`, `Invoice`, `InvoiceLineItem`, `Payment`, `DashboardStats`, and all status union types. Phase 2 Mongoose schemas must mirror these interfaces.

### Component conventions

- `components/ui/` — shadcn primitives, do not edit manually
- `components/layout/` — Sidebar, Header (both `"use client"`)
- `components/shared/` — `StatusBadge` components (use `useLanguage()` for translated labels)
- `components/dashboard/`, `components/inventory/`, etc. — feature components
- All components that use `useLanguage()` must be `"use client"`

### Utilities

`utils/format.ts`: `formatCurrency(n)` (locale-unaware, avoid in UI — use `useCurrency()` instead), `formatDate(str)`, `daysBetween(start, end)`  
`lib/utils.ts`: `cn(...)` — Tailwind class merging via `clsx` + `tailwind-merge`  
`sonner` (`components/ui/sonner.tsx`): toast notifications — use `import { toast } from "sonner"` for mutation feedback

## Phase 2 — implemented

### Auth stack (no next-auth — native Next.js 16 pattern)

- Session: `app/lib/session.ts` — `jose` JWT in httpOnly cookie `rms_session` (7-day expiry)
- DAL: `app/lib/dal.ts` — `verifyAuth()` (redirects) + `getCurrentUser()` (returns session or null)
- Server Actions: `app/actions/auth.ts` — `signup`, `login`, `logout`
- Route protection: `proxy.ts` (not `middleware.ts`) — optimistic cookie check, redirects unauthenticated → `/login`
- Zod schemas: `app/lib/definitions.ts`

### MongoDB / Mongoose

- Singleton: `lib/db.ts` — cached connection in `global.mongoose`
- Models: `models/` — Organization, User, Category, Asset, Customer, Booking, Invoice, Payment
- Every model has `orgId` (multi-tenant isolation)
- `orgId` scoped on every API query — never leak cross-org data

### API routes (`app/api/`)

All routes check `getSession()` → 401 if missing. Dynamic params use `await ctx.params` (Next.js 16 pattern).

| Route | Methods |
|---|---|
| `/api/assets`, `/api/assets/[id]` | GET, POST, PUT, DELETE |
| `/api/categories`, `/api/categories/[id]` | GET, POST, PUT, DELETE |
| `/api/bookings`, `/api/bookings/[id]` | GET, POST (with conflict check), PUT, DELETE |
| `/api/customers`, `/api/customers/[id]` | GET, POST, PUT, DELETE |
| `/api/invoices`, `/api/invoices/[id]` | GET, POST (auto invoice number), PUT |
| `/api/payments` | GET, POST (auto-updates invoice status) |
| `/api/dashboard` | GET (aggregated KPIs + charts data) |

### Frontend

- `app/providers.tsx` — `QueryClientProvider` wrapping root layout
- All dashboard pages use `useQuery` / `useMutation` from `@tanstack/react-query` v5
- Toasts via `sonner` on all mutations (`toast.success` / `toast.error`)
- Dashboard layout is a server component — calls `verifyAuth()`, passes `userName`/`orgName` props to `<Header>`
- Auth pages: `/login`, `/register` — `useActionState` + Server Actions, shadcn Card layout

### Auth registration flow

First user to register creates an Organization (owner role). Subsequent users must be invited (not yet built).
