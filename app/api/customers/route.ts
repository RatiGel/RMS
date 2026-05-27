import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Customer } from "@/models/Customer";
import { Booking } from "@/models/Booking";
import { Invoice } from "@/models/Invoice";
import { getSession } from "@/app/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json([]);

  await connectDB();

  const customers = await Customer.find({ orgId: session.orgId }).sort({ createdAt: -1 });

  const bookingCounts = await Booking.aggregate([
    { $match: { orgId: customers[0]?.orgId } },
    { $group: { _id: "$customerId", count: { $sum: 1 } } },
  ]);
  const invoiceTotals = await Invoice.aggregate([
    { $match: { orgId: customers[0]?.orgId, status: "paid" } },
    { $group: { _id: "$customerId", total: { $sum: "$paidAmount" } } },
  ]);

  const bookingMap = Object.fromEntries(bookingCounts.map((b) => [String(b._id), b.count]));
  const spentMap = Object.fromEntries(invoiceTotals.map((i) => [String(i._id), i.total]));

  return NextResponse.json(
    customers.map((c) => ({
      id: String(c._id),
      name: c.name,
      email: c.email,
      phone: c.phone,
      address: c.address,
      idType: c.idType,
      idNumber: c.idNumber,
      totalBookings: bookingMap[String(c._id)] ?? 0,
      totalSpent: spentMap[String(c._id)] ?? 0,
      createdAt: c.createdAt.toISOString(),
    }))
  );
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();

  const body = await req.json();
  const customer = await Customer.create({ ...body, orgId: session.orgId });

  return NextResponse.json(
    {
      id: String(customer._id),
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      idType: customer.idType,
      idNumber: customer.idNumber,
      totalBookings: 0,
      totalSpent: 0,
      createdAt: customer.createdAt.toISOString(),
    },
    { status: 201 }
  );
}
