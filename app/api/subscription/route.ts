import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/app/lib/session";
import { connectDB } from "@/lib/db";
import { Organization } from "@/models/Organization";

const TRIAL_DAYS = 30;
const ASSET_LIMITS: Record<string, number | null> = {
  trial: null,
  starter: 20,
  pro: null,
};
const PLAN_FEATURES: Record<string, { canAccessTeam: boolean; canAccessInvoices: boolean }> = {
  trial:   { canAccessTeam: false, canAccessInvoices: false },
  starter: { canAccessTeam: false, canAccessInvoices: false },
  pro:     { canAccessTeam: true,  canAccessInvoices: true },
};

function buildResponse(org: {
  plan: string;
  trialStartDate: Date;
  planStartDate?: Date | null;
}) {
  const plan = org.plan ?? "trial";
  const trialStartDate = org.trialStartDate ?? new Date();
  const daysSinceTrial = Math.floor(
    (Date.now() - new Date(trialStartDate).getTime()) / (1000 * 60 * 60 * 24)
  );
  const trialDaysLeft = Math.max(0, TRIAL_DAYS - daysSinceTrial);
  const trialExpired = plan === "trial" && trialDaysLeft === 0;
  const assetLimit = ASSET_LIMITS[plan] ?? null;
  const features = PLAN_FEATURES[plan] ?? PLAN_FEATURES.pro;

  return {
    plan,
    trialStartDate: new Date(trialStartDate).toISOString(),
    planStartDate: org.planStartDate ? new Date(org.planStartDate).toISOString() : null,
    trialDaysLeft,
    trialExpired,
    assetLimit,
    canAccessTeam: features.canAccessTeam,
    canAccessInvoices: features.canAccessInvoices,
  };
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const org = await Organization.findById(session.orgId).lean() as {
    plan: string;
    trialStartDate: Date;
    planStartDate?: Date | null;
  } | null;

  if (!org) return NextResponse.json({ error: "Organization not found" }, { status: 404 });

  return NextResponse.json(buildResponse(org));
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { plan } = body;
  if (!plan || !["starter", "pro"].includes(plan)) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  await connectDB();
  const org = await Organization.findByIdAndUpdate(
    session.orgId,
    { plan, planStartDate: new Date() },
    { new: true }
  ).lean() as {
    plan: string;
    trialStartDate: Date;
    planStartDate?: Date | null;
  } | null;

  if (!org) return NextResponse.json({ error: "Organization not found" }, { status: 404 });

  return NextResponse.json(buildResponse(org));
}
