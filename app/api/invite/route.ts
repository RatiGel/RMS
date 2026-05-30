import { NextResponse } from "next/server";
import crypto from "crypto";
import { connectDB } from "@/lib/db";
import { Organization } from "@/models/Organization";
import { getSession } from "@/app/lib/session";

function canManageTeam(role: string) {
  return role === "owner" || role === "admin";
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!canManageTeam(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await connectDB();

  const org = await Organization.findById(session.orgId);
  if (!org) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ inviteCode: org.inviteCode });
}

export async function POST() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!canManageTeam(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await connectDB();

  const newCode = crypto.randomBytes(5).toString("hex");
  const org = await Organization.findByIdAndUpdate(
    session.orgId,
    { inviteCode: newCode },
    { new: true }
  );

  if (!org) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ inviteCode: org.inviteCode });
}
