import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Organization } from "@/models/Organization";
import { User } from "@/models/User";
import { Asset } from "@/models/Asset";
import { Booking } from "@/models/Booking";
import { Invoice } from "@/models/Invoice";
import { Payment } from "@/models/Payment";
import { Customer } from "@/models/Customer";
import { Category } from "@/models/Category";
import { verifySuperAdmin, logAudit } from "@/app/lib/super-admin-dal";

type RouteCtx = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, ctx: RouteCtx) {
  const session = await verifySuperAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  await connectDB();

  const org = await Organization.findById(id).lean();
  if (!org) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const [users, assets, bookings, invoices] = await Promise.all([
    User.find({ orgId: id, role: { $ne: "super_admin" } }).select("name email role lastLoginAt createdAt blacklisted").lean(),
    Asset.find({ orgId: id }).limit(50).lean(),
    Booking.find({ orgId: id }).sort({ createdAt: -1 }).limit(20).lean(),
    Invoice.find({ orgId: id }).sort({ createdAt: -1 }).limit(20).lean(),
  ]);

  const totalRevenue = await Invoice.aggregate([
    { $match: { orgId: org._id, status: "paid" } },
    { $group: { _id: null, total: { $sum: "$paidAmount" } } },
  ]);

  return NextResponse.json({
    id: String(org._id),
    name: org.name,
    plan: org.plan,
    status: org.status,
    country: org.country ?? null,
    billingExempt: org.billingExempt,
    trialStartDate: org.trialStartDate,
    trialExtendedTo: org.trialExtendedTo ?? null,
    planStartDate: org.planStartDate ?? null,
    lastLoginAt: org.lastLoginAt ?? null,
    suspendedAt: org.suspendedAt ?? null,
    createdAt: org.createdAt,
    totalRevenue: totalRevenue[0]?.total ?? 0,
    users: users.map((u) => ({
      id: String(u._id),
      name: u.name,
      email: u.email,
      role: u.role,
      blacklisted: u.blacklisted ?? false,
      lastLoginAt: u.lastLoginAt ?? null,
      createdAt: u.createdAt,
    })),
    assets: assets.map((a) => ({
      id: String(a._id),
      name: a.name,
      status: a.status,
      dailyRate: a.dailyRate,
    })),
    recentBookings: bookings.map((b) => ({
      id: String(b._id),
      status: b.status,
      totalAmount: b.totalAmount,
      startDate: b.startDate,
      endDate: b.endDate,
      createdAt: b.createdAt,
    })),
    recentInvoices: invoices.map((i) => ({
      id: String(i._id),
      invoiceNumber: i.invoiceNumber,
      status: i.status,
      total: i.total,
      paidAmount: i.paidAmount,
      createdAt: i.createdAt,
    })),
  });
}

export async function PATCH(req: NextRequest, ctx: RouteCtx) {
  const session = await verifySuperAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  await connectDB();

  const body = await req.json();
  const { action, plan, trialExtendDays, billingExempt, country } = body;

  const org = await Organization.findById(id);
  if (!org) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (action === "suspend") {
    org.status = "suspended";
    org.suspendedAt = new Date();
    await org.save();
    await logAudit(session, "suspend_tenant", "tenant", id, org.name);
  } else if (action === "reactivate") {
    org.status = "active";
    org.suspendedAt = undefined;
    await org.save();
    await logAudit(session, "reactivate_tenant", "tenant", id, org.name);
  } else if (action === "change_plan" && plan) {
    const oldPlan = org.plan;
    org.plan = plan;
    org.planStartDate = new Date();
    await org.save();
    await logAudit(session, "change_plan", "tenant", id, org.name, { from: oldPlan, to: plan });
  } else if (action === "extend_trial" && trialExtendDays) {
    const base = org.trialExtendedTo ?? org.trialStartDate;
    org.trialExtendedTo = new Date(base.getTime() + trialExtendDays * 24 * 60 * 60 * 1000);
    await org.save();
    await logAudit(session, "extend_trial", "tenant", id, org.name, { days: trialExtendDays });
  } else if (action === "billing_exempt") {
    org.billingExempt = billingExempt ?? true;
    await org.save();
    await logAudit(session, "toggle_billing_exempt", "tenant", id, org.name, { billingExempt: org.billingExempt });
  } else if (action === "update_country" && country !== undefined) {
    org.country = country;
    await org.save();
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, ctx: RouteCtx) {
  const session = await verifySuperAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Support role cannot delete tenants
  const adminUser = await (await import("@/models/User")).User.findById(session.userId).lean();
  if ((adminUser as { superAdminRole?: string })?.superAdminRole === "support") {
    return NextResponse.json({ error: "Support role cannot delete tenants" }, { status: 403 });
  }

  const { id } = await ctx.params;
  await connectDB();

  const org = await Organization.findById(id);
  if (!org) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const orgName = org.name;

  // Cascade delete all org data
  await Promise.all([
    User.deleteMany({ orgId: id }),
    Asset.deleteMany({ orgId: id }),
    Booking.deleteMany({ orgId: id }),
    Invoice.deleteMany({ orgId: id }),
    Payment.deleteMany({ orgId: id }),
    Customer.deleteMany({ orgId: id }),
    Category.deleteMany({ orgId: id }),
    Organization.findByIdAndDelete(id),
  ]);

  await logAudit(session, "delete_tenant", "tenant", id, orgName);

  return NextResponse.json({ ok: true });
}
