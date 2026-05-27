import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Payment } from "@/models/Payment";
import { Invoice } from "@/models/Invoice";
import { getSession } from "@/app/lib/session";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json([]);

  await connectDB();

  const { searchParams } = req.nextUrl;
  const invoiceId = searchParams.get("invoiceId");

  const filter: Record<string, unknown> = { orgId: session.orgId };
  if (invoiceId) filter.invoiceId = invoiceId;

  const payments = await Payment.find(filter).sort({ paidAt: -1 });
  return NextResponse.json(
    payments.map((p) => ({
      id: String(p._id),
      invoiceId: String(p.invoiceId),
      amount: p.amount,
      method: p.method,
      paidAt: p.paidAt.toISOString(),
      notes: p.notes,
    }))
  );
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();

  const body = await req.json();
  const payment = await Payment.create({ ...body, orgId: session.orgId });

  // Update invoice paidAmount and status
  const invoice = await Invoice.findById(payment.invoiceId);
  if (invoice) {
    const allPayments = await Payment.find({ invoiceId: invoice._id });
    const paidAmount = allPayments.reduce((sum, p) => sum + p.amount, 0);
    const status =
      paidAmount >= invoice.total
        ? "paid"
        : paidAmount > 0
        ? "partial"
        : "unpaid";
    await Invoice.findByIdAndUpdate(invoice._id, { paidAmount, status });
  }

  return NextResponse.json(
    {
      id: String(payment._id),
      invoiceId: String(payment.invoiceId),
      amount: payment.amount,
      method: payment.method,
      paidAt: payment.paidAt.toISOString(),
      notes: payment.notes,
    },
    { status: 201 }
  );
}
