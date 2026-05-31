import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Invoice } from "@/models/Invoice";
import { Booking } from "@/models/Booking";
import { Asset } from "@/models/Asset";
import { Customer } from "@/models/Customer";
import { Organization } from "@/models/Organization";
import { getSession } from "@/app/lib/session";

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

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json([]);

  await connectDB();

  const invoices = await Invoice.find({ orgId: session.orgId }).sort({ createdAt: -1 });
  const data = await Promise.all(invoices.map(serializeInvoice));

  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();

  const org = await Organization.findById(session.orgId).select("plan").lean() as { plan?: string } | null;
  if (!["pro"].includes(org?.plan ?? "trial")) {
    return NextResponse.json({ error: "Invoices require Pro plan", code: "PLAN_GATE" }, { status: 403 });
  }

  const body = await req.json();

  // Auto-generate invoice number
  const count = await Invoice.countDocuments({ orgId: session.orgId });
  const invoiceNumber = `INV-${String(count + 1).padStart(4, "0")}`;

  const invoice = await Invoice.create({ ...body, orgId: session.orgId, invoiceNumber });
  const data = await serializeInvoice(invoice);

  return NextResponse.json(data, { status: 201 });
}
