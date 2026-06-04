import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { FeatureFlag, FeatureName } from "@/models/FeatureFlag";
import { verifySuperAdmin, logAudit } from "@/app/lib/super-admin-dal";

const ALL_FEATURES: FeatureName[] = ["telegram_bot", "ai_assistant", "dynamic_pricing", "damage_detection"];

async function ensureFlags() {
  for (const featureName of ALL_FEATURES) {
    await FeatureFlag.findOneAndUpdate(
      { featureName },
      { $setOnInsert: { featureName, enabledGlobally: false, tenantOverrides: {} } },
      { upsert: true, new: true }
    );
  }
}

export async function GET() {
  const session = await verifySuperAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  await ensureFlags();

  const flags = await FeatureFlag.find().lean();
  return NextResponse.json(
    flags.map((f) => ({
      featureName: f.featureName,
      enabledGlobally: f.enabledGlobally,
      tenantOverrides: Object.fromEntries(
        (f.tenantOverrides as unknown as Map<string, boolean>)?.entries?.() ?? []
      ),
    }))
  );
}

export async function PATCH(req: NextRequest) {
  const session = await verifySuperAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();

  const body = await req.json();
  const { featureName, enabledGlobally, tenantId, tenantEnabled } = body;

  if (!featureName) return NextResponse.json({ error: "featureName required" }, { status: 400 });

  const flag = await FeatureFlag.findOne({ featureName });
  if (!flag) return NextResponse.json({ error: "Feature not found" }, { status: 404 });

  if (tenantId !== undefined) {
    if (tenantEnabled === null) {
      flag.tenantOverrides.delete(tenantId);
    } else {
      flag.tenantOverrides.set(tenantId, tenantEnabled);
    }
    await logAudit(session, "feature_tenant_override", "feature", featureName, featureName, {
      tenantId,
      tenantEnabled,
    });
  } else if (enabledGlobally !== undefined) {
    flag.enabledGlobally = enabledGlobally;
    await logAudit(session, "feature_global_toggle", "feature", featureName, featureName, {
      enabledGlobally,
    });
  }

  await flag.save();
  return NextResponse.json({ ok: true });
}
