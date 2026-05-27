import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Customer } from "@/models/Customer";
import { getSession } from "@/app/lib/session";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, ctx: Ctx) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  await connectDB();

  const c = await Customer.findOne({ _id: id, orgId: session.orgId });
  if (!c) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({
    id: String(c._id),
    name: c.name,
    email: c.email,
    phone: c.phone,
    address: c.address,
    idType: c.idType,
    idNumber: c.idNumber,
    totalBookings: 0,
    totalSpent: 0,
    createdAt: c.createdAt.toISOString(),
  });
}

export async function PUT(req: NextRequest, ctx: Ctx) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  await connectDB();

  const body = await req.json();
  const c = await Customer.findOneAndUpdate(
    { _id: id, orgId: session.orgId },
    body,
    { new: true }
  );
  if (!c) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({
    id: String(c._id),
    name: c.name,
    email: c.email,
    phone: c.phone,
    address: c.address,
    idType: c.idType,
    idNumber: c.idNumber,
    totalBookings: 0,
    totalSpent: 0,
    createdAt: c.createdAt.toISOString(),
  });
}

export async function DELETE(req: NextRequest, ctx: Ctx) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  await connectDB();

  const c = await Customer.findOneAndDelete({ _id: id, orgId: session.orgId });
  if (!c) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ success: true });
}
