import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getSession } from "@/app/lib/session";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const user = await User.findById(session.userId).select("name email avatarUrl role orgId").lean();
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const u = user as any;
  return NextResponse.json({
    id: String(u._id),
    name: u.name,
    email: u.email,
    avatarUrl: u.avatarUrl ?? null,
    role: u.role,
    orgId: String(u.orgId),
    orgName: session.orgName,
  });
}

export async function PATCH(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  await connectDB();

  if (body.type === "profile") {
    const { name, avatarUrl } = body;
    if (!name?.trim()) return NextResponse.json({ error: "Name required" }, { status: 400 });
    await User.findByIdAndUpdate(session.userId, {
      name: name.trim(),
      ...(avatarUrl ? { avatarUrl: avatarUrl.trim() } : { $unset: { avatarUrl: 1 } }),
    });
    return NextResponse.json({ ok: true });
  }

  if (body.type === "password") {
    const { currentPassword, newPassword } = body;
    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Both passwords required" }, { status: 400 });
    }
    if (newPassword.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }
    const user = await User.findById(session.userId).select("passwordHash");
    if (!user?.passwordHash) {
      return NextResponse.json({ error: "No password set on this account" }, { status: 400 });
    }
    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
    }
    const hash = await bcrypt.hash(newPassword, 12);
    await User.findByIdAndUpdate(session.userId, { passwordHash: hash });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Invalid type" }, { status: 400 });
}
