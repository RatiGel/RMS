import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Announcement } from "@/models/Announcement";
import { verifySuperAdmin, logAudit } from "@/app/lib/super-admin-dal";

type RouteCtx = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, ctx: RouteCtx) {
  const session = await verifySuperAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  await connectDB();

  const body = await req.json();
  const { title, body: text, target, planTarget, tenantId, startsAt, endsAt } = body;

  const announcement = await Announcement.findByIdAndUpdate(
    id,
    {
      ...(title && { title }),
      ...(text && { body: text }),
      ...(target && { target }),
      ...(planTarget !== undefined && { planTarget }),
      ...(tenantId !== undefined && { tenantId }),
      ...(startsAt && { startsAt: new Date(startsAt) }),
      ...(endsAt && { endsAt: new Date(endsAt) }),
    },
    { new: true }
  );

  if (!announcement) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await logAudit(session, "update_announcement", "announcement", id, announcement.title);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, ctx: RouteCtx) {
  const session = await verifySuperAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  await connectDB();

  const announcement = await Announcement.findByIdAndDelete(id);
  if (!announcement) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await logAudit(session, "delete_announcement", "announcement", id, announcement.title);
  return NextResponse.json({ ok: true });
}
