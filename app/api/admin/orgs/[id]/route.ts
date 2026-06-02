import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { connectDB } from "@/lib/db";
import { Organization } from "@/models/Organization";
import { User } from "@/models/User";
import { Asset } from "@/models/Asset";
import { Booking } from "@/models/Booking";
import { Customer } from "@/models/Customer";
import { Invoice } from "@/models/Invoice";
import { Payment } from "@/models/Payment";
import { Category } from "@/models/Category";

const secret = () => new TextEncoder().encode(process.env.SESSION_SECRET!);

async function verifyAdmin(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get("admin_session")?.value;
  if (!token) return false;
  try {
    await jwtVerify(token, secret());
    return true;
  } catch {
    return false;
  }
}

export async function DELETE(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  if (!(await verifyAdmin(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;
  await connectDB();

  const org = await Organization.findById(id);
  if (!org) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Cascade delete all org data
  await Promise.all([
    User.deleteMany({ orgId: id }),
    Asset.deleteMany({ orgId: id }),
    Booking.deleteMany({ orgId: id }),
    Customer.deleteMany({ orgId: id }),
    Invoice.deleteMany({ orgId: id }),
    Payment.deleteMany({ orgId: id }),
    Category.deleteMany({ orgId: id }),
  ]);
  await Organization.findByIdAndDelete(id);

  return NextResponse.json({ ok: true });
}
