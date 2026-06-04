import { NextRequest, NextResponse } from "next/server";
import { SignJWT } from "jose";
import { connectDB } from "@/lib/db";
import { Organization } from "@/models/Organization";
import { User } from "@/models/User";
import { verifySuperAdmin, logAudit } from "@/app/lib/super-admin-dal";
import { cookies } from "next/headers";

type RouteCtx = { params: Promise<{ id: string }> };

const SESSION_SECRET = new TextEncoder().encode(process.env.SESSION_SECRET!);

export async function POST(req: NextRequest, ctx: RouteCtx) {
  const session = await verifySuperAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  await connectDB();

  const org = await Organization.findById(id).lean();
  if (!org) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const owner = await User.findOne({ orgId: id, role: "owner" }).lean();
  if (!owner) return NextResponse.json({ error: "No owner found for this tenant" }, { status: 404 });

  // Create impersonated session token
  const impersonatedToken = await new SignJWT({
    userId: String(owner._id),
    orgId: String(org._id),
    role: owner.role,
    name: owner.name,
    orgName: org.name,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("2h")
    .sign(SESSION_SECRET);

  // Get current SA session token to save
  const cookieStore = await cookies();
  const currentToken = cookieStore.get("rms_session")?.value ?? "";

  await logAudit(session, "impersonation_start", "impersonation", String(org._id), org.name, {
    ownerEmail: (owner as { email: string }).email,
  });

  const response = NextResponse.json({ ok: true, redirect: "/dashboard" });

  response.cookies.set("sa_real_session", currentToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7200,
    path: "/",
  });
  response.cookies.set("rms_session", impersonatedToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7200,
    path: "/",
  });
  response.cookies.set(
    "sa_impersonating",
    JSON.stringify({ orgId: String(org._id), orgName: org.name }),
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
