import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Invoice } from "@/models/Invoice";
import { Booking } from "@/models/Booking";
import { Asset } from "@/models/Asset";
import { Customer } from "@/models/Customer";
import { getSession } from "@/app/lib/session";

type Ctx = { params: Promise<{ id: string }> };

async function serializeInvoice(inv: InstanceType<typeof Invoice>) {
  const [booking, customer] = await Promise.all([
    Booking.findById(inv.bookingId),
    Customer.findById(inv.customerId),
  ]);
  const asset = booking ? await Asset.findById(booking.assetId) : null;

  return {
    id: String(inv._id),
    invoiceNumber: inv.invoiceNumber,
    bookingId: String(inv.bookingId),
    customerId: String(inv.customerId),
    customerName: customer?.name ?? "Unknown",
    assetName: asset?.name ?? "Unknown",
    lineItems: inv.lineItems,
    subtotal: inv.subtotal,
    tax: inv.tax,
    discount: inv.discount,
    total: inv.total,
    status: inv.status,
    dueDate: inv.dueDate.toISOString().slice(0, 10),
    paidAmount: inv.paidAmount,
    createdAt: inv.createdAt.toISOString(),
  };
}

export async function GET(req: NextRequest, ctx: Ctx) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  await connectDB();

  const inv = await Invoice.findOne({ _id: id, orgId: session.orgId });
  if (!inv) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(await serializeInvoice(inv));
}

export async function PUT(req: NextRequest, ctx: Ctx) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  await connectDB();

  const body = await req.json();
  const inv = await Invoice.findOneAndUpdate(
    { _id: id, orgId: session.orgId },
    body,
    { new: true }
  );
  if (!inv) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(await serializeInvoice(inv));
}
