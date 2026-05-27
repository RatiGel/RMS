import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Booking } from "@/models/Booking";
import { Asset } from "@/models/Asset";
import { Customer } from "@/models/Customer";
import { getSession } from "@/app/lib/session";

type Ctx = { params: Promise<{ id: string }> };

function serializeBooking(
  b: InstanceType<typeof Booking>,
  assetName: string,
  customerName: string
) {
  return {
    id: String(b._id),
    assetId: String(b.assetId),
    assetName,
    customerId: String(b.customerId),
    customerName,
    startDate: b.startDate.toISOString().slice(0, 10),
    endDate: b.endDate.toISOString().slice(0, 10),
    status: b.status,
    totalAmount: b.totalAmount,
    depositAmount: b.depositAmount,
    notes: b.notes,
    createdAt: b.createdAt.toISOString(),
  };
}

export async function GET(req: NextRequest, ctx: Ctx) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  await connectDB();

  const b = await Booking.findOne({ _id: id, orgId: session.orgId });
  if (!b) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const [asset, customer] = await Promise.all([
    Asset.findById(b.assetId),
    Customer.findById(b.customerId),
  ]);

  return NextResponse.json(serializeBooking(b, asset?.name ?? "Unknown", customer?.name ?? "Unknown"));
}

export async function PUT(req: NextRequest, ctx: Ctx) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  await connectDB();

  const body = await req.json();
  const b = await Booking.findOneAndUpdate(
    { _id: id, orgId: session.orgId },
    body,
    { new: true }
  );
  if (!b) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const [asset, customer] = await Promise.all([
    Asset.findById(b.assetId),
    Customer.findById(b.customerId),
  ]);

  return NextResponse.json(serializeBooking(b, asset?.name ?? "Unknown", customer?.name ?? "Unknown"));
}

export async function DELETE(req: NextRequest, ctx: Ctx) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  await connectDB();

  const b = await Booking.findOneAndDelete({ _id: id, orgId: session.orgId });
  if (!b) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ success: true });
}
