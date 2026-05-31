import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { Organization } from "@/models/Organization";
import { getSession } from "@/app/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();

  const org = await Organization.findById(session.orgId).select("plan").lean() as { plan?: string } | null;
  if (!["pro"].includes(org?.plan ?? "trial")) {
    return NextResponse.json({ error: "Team management requires Pro plan", code: "PLAN_GATE" }, { status: 403 });
  }

  const users = await User.find({ orgId: session.orgId }).sort({ createdAt: 1 });

  return NextResponse.json(
    users.map((u) => ({
      id: String(u._id),
      name: u.name,
      email: u.email,
      role: u.role,
      createdAt: u.createdAt.toISOString(),
    }))
  );
}
