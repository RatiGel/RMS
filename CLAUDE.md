# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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

`utils/format.ts`: `formatCurrency(n)`, `formatDate(str)`, `daysBetween(start, end)`  
`lib/utils.ts`: `cn(...)` — Tailwind class merging via `clsx` + `tailwind-merge`

## Phase 2 checklist (not started)

1. MongoDB Atlas connection singleton (`lib/db.ts`)
2. Mongoose models with `orgId` on every document (multi-tenant)
3. NextAuth.js — credentials provider, JWT with `userId/orgId/role`, middleware protecting `/dashboard/**`
4. API route handlers (Next.js App Router `route.ts` files)
5. Business logic: availability checking, auto-invoice generation, overdue detection
6. Replace mock imports with react-query hooks
7. Financial reporting via MongoDB aggregation pipelines
