import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Announcement } from "@/models/Announcement";
import { verifySuperAdmin, logAudit } from "@/app/lib/super-admin-dal";
import { Types } from "mongoose";

export async function GET() {
  const session = await verifySuperAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();

  const announcements = await Announcement.find().sort({ createdAt: -1 }).lean();
  const now = new Date();

  return NextResponse.json(
    announcements.map((a) => ({
      id: String(a._id),
      title: a.title,
      body: a.body,
      target: a.target,
      planTarget: a.planTarget ?? null,
      tenantId: a.tenantId ? String(a.tenantId) : null,
      startsAt: a.startsAt,
      endsAt: a.endsAt,
      active: a.startsAt <= now && a.endsAt >= now,
      createdAt: a.createdAt,
    }))
  );
}

export async function POST(req: NextRequest) {
  const session = await verifySuperAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();

  const body = await req.json();
  const { title, body: text, target, planTarget, tenantId, startsAt, endsAt } = body;

  if (!title || !text || !target || !startsAt || !endsAt) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const announcement = await Announcement.create({
    title,
    body: text,
    target,
    planTarget: planTarget ?? undefined,
    tenantId: tenantId ? new Types.ObjectId(tenantId) : undefined,
    startsAt: new Date(startsAt),
    endsAt: new Date(endsAt),
    createdBy: new Types.ObjectId(session.userId),
  });

  await logAudit(session, "create_announcement", "announcement", String(announcement._id), title);

  return NextResponse.json({ id: String(announcement._id) }, { status: 201 });
}
