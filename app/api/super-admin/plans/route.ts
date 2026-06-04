import { NextRequest, NextResponse } from "next/server";
import { verifySuperAdmin, logAudit } from "@/app/lib/super-admin-dal";
import { connectDB } from "@/lib/db";
import { Organization } from "@/models/Organization";
import { PlatformSettings } from "@/models/PlatformSettings";
import type { PlanConfig } from "@/models/PlatformSettings";

export const DEFAULT_PLANS: PlanConfig[] = [
  {
    id: "trial",
    name: "Trial",
    price: 0,
    maxAssets: 10,
    maxBookingsPerMonth: 30,
    userSeats: 2,
    trialDays: 14,
    features: ["inventory", "bookings", "customers"],
  },
  {
    id: "starter",
    name: "Starter",
    price: 29,
    maxAssets: 20,
    maxBookingsPerMonth: 100,
    userSeats: 5,
    features: ["inventory", "bookings", "customers", "invoices"],
  },
  {
    id: "pro",
    name: "Pro",
    price: 79,
    maxAssets: null,
    maxBookingsPerMonth: null,
    userSeats: null,
    features: ["inventory", "bookings", "customers", "invoices", "team", "analytics"],
  },
];

async function getPlans(): Promise<PlanConfig[]> {
  const settings = await PlatformSettings.findOne().lean();
  if (settings?.planConfigs && settings.planConfigs.length > 0) {
    return settings.planConfigs as PlanConfig[];
  }
  return DEFAULT_PLANS;
}

export async function GET() {
  const session = await verifySuperAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();

  const plans = await getPlans();
  const counts = await Organization.aggregate([
    { $group: { _id: "$plan", count: { $sum: 1 } } },
  ]);
  const countMap = Object.fromEntries(counts.map((c: { _id: string; count: number }) => [c._id, c.count]));

  return NextResponse.json(
    plans.map((p) => ({ ...p, tenantCount: countMap[p.id] ?? 0 }))
  );
}

export async function PATCH(req: NextRequest) {
  const session = await verifySuperAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const body = await req.json();

  // Assign plan to tenant
  if (body.tenantId && body.plan) {
    await Organization.findByIdAndUpdate(body.tenantId, { plan: body.plan, planStartDate: new Date() });
    await logAudit(session, "change_plan", "tenant", body.tenantId, undefined, { plan: body.plan });
    return NextResponse.json({ ok: true });
  }

  // Update a plan config
  if (body.planId && body.updates) {
    let settings = await PlatformSettings.findOne();
    if (!settings) settings = await PlatformSettings.create({});

    const currentPlans = (settings.planConfigs && settings.planConfigs.length > 0)
      ? settings.planConfigs as PlanConfig[]
      : DEFAULT_PLANS;

    const updated = currentPlans.map((p) =>
      p.id === body.planId ? { ...p, ...body.updates } : p
    );

    settings.planConfigs = updated;
    await settings.save();
    await logAudit(session, "update_plan_config", "plan", body.planId, body.planId, body.updates);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Invalid request" }, { status: 400 });
}
