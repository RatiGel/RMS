import { NextResponse } from "next/server";
import { getSession } from "@/app/lib/session";
import { connectDB } from "@/lib/db";
import { Organization } from "@/models/Organization";

export async function PATCH(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role === "staff") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { name } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: "Name required" }, { status: 400 });

  await connectDB();
  await Organization.findByIdAndUpdate(session.orgId, { name: name.trim() });
  return NextResponse.json({ ok: true });
}
