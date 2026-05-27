# RMS — Rental Management System
## Technical Implementation Plan

**Stack:** Next.js 14 (App Router) · Tailwind CSS · shadcn/ui · MongoDB · Mongoose · NextAuth.js  
**Tenancy:** Single DB, `orgId` on every document  
**Auth:** NextAuth.js (credentials + JWT)  
**Payments:** Internal record tracking only

---

## Phase 1 — Frontend (Static / Mock Data)

### Step 1.1 — Project Setup ✅
- `create-next-app` with TypeScript + Tailwind + App Router
- Install shadcn/ui, recharts, react-big-calendar, date-fns, lucide-react
- Establish folder structure
- Mock data layer: typed JSON fixtures in `/lib/mock/`

### Step 1.2 — Shell & Layout
- Root layout: sidebar + header + main content area
- Collapsible sidebar with nav links (Dashboard, Inventory, Bookings, Customers, Invoices)
- Header: org name, user avatar dropdown, notifications bell
- Mobile-responsive drawer nav

### Step 1.3 — Dashboard Module
- KPI cards: Total Assets · Active Bookings · Monthly Revenue · Overdue Invoices
- Line chart: revenue last 6 months (recharts)
- Doughnut chart: assets by category
- Recent bookings table with status badges

### Step 1.4 — Inventory Module
- Assets list: search, filter by category & availability status
- Add/Edit asset modal: name, category, daily rate, deposit, status, description, image URL
- Asset detail page with booking history tab
- Category management (CRUD in settings)

### Step 1.5 — Bookings Module
- Bookings list: filter by status (Draft/Confirmed/Active/Returned/Cancelled), date range, customer
- Booking form: asset selector, customer selector, start/end dates, notes
- Calendar view showing booked vs available slots
- Status workflow stepper on booking detail page

### Step 1.6 — Customers Module
- Customer list with search + pagination
- Add/Edit customer form: name, email, phone, address, ID type/number
- Customer detail: profile + full booking history

### Step 1.7 — Invoices Module
- Invoice list: filter by status (Unpaid/Partial/Paid/Overdue)
- Invoice detail/preview with line items (rental days × daily rate, deposit, tax, discount)
- Payment entry form (record payment manually)
- Print/PDF preview layout

---

## Phase 2 — Backend + Mongoose + Auth

### Step 2.1 — MongoDB Atlas + Mongoose
- Atlas cluster, connection string in `.env.local`
- `/lib/db.ts`: singleton Mongoose connection
- Seed script for dev data

### Step 2.2 — Mongoose Models

| Model | Key Fields |
|---|---|
| `Organization` | name, plan, createdAt |
| `User` | orgId, name, email, passwordHash, role (owner/admin/staff) |
| `Category` | orgId, name, description |
| `Asset` | orgId, categoryId, name, dailyRate, depositAmount, status, description |
| `Customer` | orgId, name, email, phone, address, idType, idNumber |
| `Booking` | orgId, assetId, customerId, startDate, endDate, status, totalAmount, notes |
| `Invoice` | orgId, bookingId, customerId, lineItems[], subtotal, tax, discount, total, status |
| `Payment` | orgId, invoiceId, amount, method, paidAt, notes |

### Step 2.3 — NextAuth.js
- Credentials provider with bcrypt password compare
- JWT strategy — token carries: `userId`, `orgId`, `role`
- `middleware.ts` protects all `/dashboard/**` routes
- Session type augmentation for orgId + role

### Step 2.4 — API Route Handlers (`/app/api/`)

| Route | Methods | Notes |
|---|---|---|
| `/api/assets` | GET, POST | orgId from session |
| `/api/assets/[id]` | GET, PUT, DELETE | ownership check |
| `/api/categories` | GET, POST, PUT, DELETE | |
| `/api/bookings` | GET, POST | availability conflict check |
| `/api/bookings/[id]` | GET, PUT, DELETE | status transitions |
| `/api/customers` | GET, POST, PUT, DELETE | |
| `/api/invoices` | GET, POST | auto-generate from booking |
| `/api/invoices/[id]` | GET, PUT | |
| `/api/payments` | GET, POST | updates invoice status |
| `/api/dashboard` | GET | aggregated stats |
| `/api/reports` | GET | revenue, utilization, outstanding |

### Step 2.5 — Business Logic
- Availability check: query bookings where `assetId` overlaps date range
- Invoice auto-generation: on booking `Confirmed` → create invoice with line items
- Payment status auto-update: sum payments → set Paid/Partial/Unpaid
- Overdue detection: `dueDate < now && status !== Paid`

### Step 2.6 — Connect Frontend to API
- Replace mock fixtures with `@tanstack/react-query`
- Loading skeletons on all list/detail pages
- Optimistic updates for status changes
- Toast notifications for mutations

### Step 2.7 — Financial Reporting
- Revenue by month (MongoDB aggregation)
- Asset utilization rate (booked days / total days in period)
- Top customers by revenue
- Outstanding receivables aging (30/60/90 day buckets)

---

## Folder Structure

```
/app
  /(auth)/login
  /(auth)/register
  /(dashboard)/layout.tsx
  /(dashboard)/page.tsx
  /(dashboard)/inventory/
  /(dashboard)/bookings/
  /(dashboard)/customers/
  /(dashboard)/invoices/
  /api/...
/components
  /ui/                    ← shadcn primitives
  /layout/                ← sidebar, header
  /dashboard/
  /inventory/
  /bookings/
  /customers/
  /invoices/
  /shared/                ← data-table, stat-card, status-badge
/lib
  /db.ts
  /auth.ts
  /mock/                  ← Phase 1 fixtures
/models/                  ← Mongoose schemas
/hooks/                   ← useAssets, useBookings, etc.
/types/                   ← shared TypeScript types
/utils/                   ← date helpers, formatters
```

---

## Progress Tracker

### Phase 1
- [x] 1.1 Project setup & folder structure
- [x] 1.2 Shell & Layout (sidebar, header)
- [x] 1.3 Dashboard module
- [x] 1.4 Inventory module
- [x] 1.5 Bookings module
- [x] 1.6 Customers module
- [x] 1.7 Invoices module

### Phase 2
- [ ] 2.1 MongoDB Atlas + Mongoose connection
- [ ] 2.2 Mongoose models
- [ ] 2.3 NextAuth.js setup
- [ ] 2.4 API route handlers
- [ ] 2.5 Business logic
- [ ] 2.6 Connect frontend to API
- [ ] 2.7 Financial reporting
