import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { PlatformSettings } from "@/models/PlatformSettings";
import { verifySuperAdmin, logAudit } from "@/app/lib/super-admin-dal";

async function getOrCreateSettings() {
  let settings = await PlatformSettings.findOne();
  if (!settings) {
    settings = await PlatformSettings.create({});
  }
  return settings;
}

export async function GET() {
  const session = await verifySuperAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const settings = await getOrCreateSettings();

  return NextResponse.json({
    languages: settings.languages,
    currencies: settings.currencies,
    maintenanceMode: settings.maintenanceMode,
    maintenanceMessage: settings.maintenanceMessage,
    maintenanceScheduledAt: settings.maintenanceScheduledAt ?? null,
    platformName: settings.platformName,
    logoUrl: settings.logoUrl ?? null,
  });
}

export async function PATCH(req: NextRequest) {
  const session = await verifySuperAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Support role cannot change settings
  const adminUser = await (await import("@/models/User")).User.findById(session.userId).lean();
  if ((adminUser as { superAdminRole?: string })?.superAdminRole === "support") {
    return NextResponse.json({ error: "Support role cannot modify settings" }, { status: 403 });
  }

  await connectDB();
  const body = await req.json();

  const settings = await getOrCreateSettings();
  const updatable = [
    "languages", "currencies", "maintenanceMode", "maintenanceMessage",
    "maintenanceScheduledAt", "platformName", "logoUrl",
  ];
  for (const key of updatable) {
    if (body[key] !== undefined) {
      (settings as Record<string, unknown>)[key] = body[key];
    }
  }
  await settings.save();

  await logAudit(session, "update_settings", "settings");
  return NextResponse.json({ ok: true });
}
