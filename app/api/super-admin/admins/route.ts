import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { verifySuperAdmin, logAudit } from "@/app/lib/super-admin-dal";

export async function GET() {
  const session = await verifySuperAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();

  const admins = await User.find({ role: "super_admin" }).select("name email superAdminRole mfaSecret createdAt lastLoginAt").lean();

  return NextResponse.json(
    admins.map((a) => ({
      id: String(a._id),
      name: a.name,
      email: a.email,
      superAdminRole: a.superAdminRole ?? "owner",
      mfaEnabled: !!a.mfaSecret,
      lastLoginAt: a.lastLoginAt ?? null,
      createdAt: a.createdAt,
    }))
  );
}

export async function POST(req: NextRequest) {
  const session = await verifySuperAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Support role cannot invite admins
  const adminUser = await User.findById(session.userId).lean();
  if ((adminUser as { superAdminRole?: string })?.superAdminRole === "support") {
    return NextResponse.json({ error: "Support role cannot invite admins" }, { status: 403 });
  }

  await connectDB();
  const body = await req.json();
  const { name, email, password, superAdminRole = "support" } = body;

  if (!name || !email || !password) {
    return NextResponse.json({ error: "name, email, and password are required" }, { status: 400 });
  }

  const existing = await User.findOne({ email });
  if (existing) {
    return NextResponse.json({ error: "Email already in use" }, { status: 409 });
  }

  const bcrypt = await import("bcryptjs");
  const passwordHash = await bcrypt.hash(password, 12);

  const newAdmin = await User.create({
    name,
    email,
    passwordHash,
    role: "super_admin",
    superAdminRole,
  });

  await logAudit(session, "invite_admin", "admin", String(newAdmin._id), name, { email, superAdminRole });

  return NextResponse.json({ id: String(newAdmin._id), name, email }, { status: 201 });
}
