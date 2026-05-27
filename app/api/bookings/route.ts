import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import { connectDB } from "@/lib/db";
import { Booking } from "@/models/Booking";
import { Asset } from "@/models/Asset";
import { Customer } from "@/models/Customer";
import { getSession } from "@/app/lib/session";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();

  const { searchParams } = req.nextUrl;
  const status = searchParams.get("status");

  const filter: Record<string, unknown> = { orgId: session.orgId };
  if (status) filter.status = status;

  const bookings = await Booking.find(filter).sort({ createdAt: -1 });

  const assetIds = [...new Set(bookings.map((b) => String(b.assetId)))];
  const customerIds = [...new Set(bookings.map((b) => String(b.customerId)))];

  const assets = await Asset.find({ _id: { $in: assetIds } });
  const customers = await Customer.find({ _id: { $in: customerIds } });

  const assetMap = Object.fromEntries(assets.map((a) => [String(a._id), a.name]));
  const customerMap = Object.fromEntries(customers.map((c) => [String(c._id), c.name]));

  return NextResponse.json(
    bookings.map((b) => ({
      id: String(b._id),
      assetId: String(b.assetId),
      assetName: assetMap[String(b.assetId)] ?? "Unknown",
      customerId: String(b.customerId),
      customerName: customerMap[String(b.customerId)] ?? "Unknown",
      startDate: b.startDate.toISOString().slice(0, 10),
      endDate: b.endDate.toISOString().slice(0, 10),
      status: b.status,
      totalAmount: b.totalAmount,
      depositAmount: b.depositAmount,
      notes: b.notes,
      createdAt: b.createdAt.toISOString(),
    }))
  );
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();

  const body = await req.json();

  // Availability conflict check
  const conflict = await Booking.findOne({
    orgId: session.orgId,
    assetId: new Types.ObjectId(body.assetId),
    status: { $in: ["confirmed", "active"] },
    startDate: { $lte: new Date(body.endDate) },
    endDate: { $gte: new Date(body.startDate) },
  });
  if (conflict) {
    return NextResponse.json(
      { error: "Asset is already booked for this period." },
      { status: 409 }
    );
  }

  const booking = await Booking.create({ ...body, orgId: session.orgId });
  const asset = await Asset.findById(booking.assetId);
  const customer = await Customer.findById(booking.customerId);

  return NextResponse.json(
    {
      id: String(booking._id),
      assetId: String(booking.assetId),
      assetName: asset?.name ?? "Unknown",
      customerId: String(booking.customerId),
      customerName: customer?.name ?? "Unknown",
      startDate: booking.startDate.toISOString().slice(0, 10),
      endDate: booking.endDate.toISOString().slice(0, 10),
      status: booking.status,
      totalAmount: booking.totalAmount,
      depositAmount: booking.depositAmount,
      notes: booking.notes,
      createdAt: booking.createdAt.toISOString(),
    },
    { status: 201 }
  );
}
