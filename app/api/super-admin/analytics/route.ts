import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Organization } from "@/models/Organization";
import { Booking } from "@/models/Booking";
import { Invoice } from "@/models/Invoice";
import { verifySuperAdmin } from "@/app/lib/super-admin-dal";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export async function GET() {
  const session = await verifySuperAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();

  const now = new Date();
  const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);

  const [mrrHistory, bookingsHistory, tenantGrowth, perTenant] = await Promise.all([
    Invoice.aggregate([
      { $match: { status: "paid", createdAt: { $gte: twelveMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
          revenue: { $sum: "$paidAmount" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]),
    Booking.aggregate([
      { $match: { createdAt: { $gte: twelveMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]),
    Organization.aggregate([
      { $match: { createdAt: { $gte: twelveMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]),
    Invoice.aggregate([
      { $match: { status: "paid" } },
      { $group: { _id: "$orgId", revenue: { $sum: "$paidAmount" }, invoiceCount: { $sum: 1 } } },
      { $sort: { revenue: -1 } },
      { $limit: 20 },
    ]),
  ]);

  const orgIds = perTenant.map((p: { _id: unknown }) => p._id as string);
  const orgs = await Organization.find({ _id: { $in: orgIds as string[] } }).select("name plan").lean();
  const orgMap = Object.fromEntries(orgs.map((o) => [String(o._id), o]));

  const bookingCounts = await Booking.aggregate([
    { $match: { orgId: { $in: orgIds } } },
    { $group: { _id: "$orgId", count: { $sum: 1 } } },
  ]);
  const bookingMap = Object.fromEntries(bookingCounts.map((b: { _id: unknown; count: number }) => [String(b._id), b.count]));

  // Compute cumulative tenant growth
  let cumulative = 0;
  const totalBefore = await Organization.countDocuments({ createdAt: { $lt: twelveMonthsAgo } });
  cumulative = totalBefore;

  const growthData = tenantGrowth.map((t: { _id: { month: number }; count: number }) => {
    cumulative += t.count;
    return { month: MONTHS[(t._id.month - 1) % 12], count: t.count, cumulative };
  });

  return NextResponse.json({
    mrrHistory: mrrHistory.map((m: { _id: { month: number }; revenue: number }) => ({
      month: MONTHS[(m._id.month - 1) % 12],
      revenue: m.revenue,
    })),
    bookingsHistory: bookingsHistory.map((b: { _id: { month: number }; count: number }) => ({
      month: MONTHS[(b._id.month - 1) % 12],
      count: b.count,
    })),
    tenantGrowth: growthData,
    perTenant: perTenant.map((p: { _id: unknown; revenue: number; invoiceCount: number }) => {
      const org = orgMap[String(p._id)];
      return {
        id: String(p._id),
        name: org?.name ?? "Unknown",
        plan: org?.plan ?? "trial",
        revenue: p.revenue,
        invoiceCount: p.invoiceCount,
        bookingCount: bookingMap[String(p._id)] ?? 0,
      };
    }),
  });
}
