import { NextRequest, NextResponse } from "next/server";
import { SignJWT } from "jose";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { Organization } from "@/models/Organization";
import { verifySuperAdmin } from "@/app/lib/super-admin-dal";
import { cookies } from "next/headers";

const SESSION_SECRET = new TextEncoder().encode(process.env.SESSION_SECRET!);

export async function POST(req: NextRequest) {
  const session = await verifySuperAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();

  const user = await User.findById(session.userId).lean();
  if (!user || !user.orgId) {
    return NextResponse.json({ error: "No tenant org linked to this super admin account" }, { status: 404 });
  }

  const org = await Organization.findById(user.orgId).lean();
  if (!org) {
    return NextResponse.json({ error: "Linked org not found" }, { status: 404 });
  }

  const tenantToken = await new SignJWT({
    userId: String(user._id),
    orgId: String(org._id),
    role: "owner",
    name: (user as { name: string }).name,
    orgName: org.name,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("2h")
    .sign(SESSION_SECRET);

  const cookieStore = await cookies();
  const currentToken = cookieStore.get("rms_session")?.value ?? "";

  const response = NextResponse.json({ ok: true, redirect: "/dashboard" });

  response.cookies.set("sa_real_session", currentToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7200,
    path: "/",
  });
  response.cookies.set("rms_session", tenantToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7200,
    path: "/",
  });
  response.cookies.set(
    "sa_impersonating",
    JSON.stringify({ orgId: String(org._id), orgName: org.name, isSelf: true }),
    {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7200,
      path: "/",
    }
  );

  return response;
}
