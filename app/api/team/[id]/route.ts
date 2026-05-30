import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { getSession } from "@/app/lib/session";

type Ctx = { params: Promise<{ id: string }> };

function canManageTeam(role: string) {
  return role === "owner" || role === "admin";
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!canManageTeam(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await ctx.params;
  const { role } = await req.json();

  if (!["owner", "admin", "staff"].includes(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  await connectDB();

  const user = await User.findOneAndUpdate(
    { _id: id, orgId: session.orgId },
    { role },
    { new: true }
  );

  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({
    id: String(user._id),
    name: user.name,
    email: user.email,
    role: user.role,
  });
}

export async function DELETE(req: NextRequest, ctx: Ctx) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!canManageTeam(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await ctx.params;

  if (id === session.userId) {
    return NextResponse.json({ error: "Cannot remove yourself" }, { status: 400 });
  }

  await connectDB();

  const user = await User.findOneAndDelete({ _id: id, orgId: session.orgId });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ success: true });
}
