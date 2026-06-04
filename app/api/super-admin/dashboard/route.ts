import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Organization } from "@/models/Organization";
import { Booking } from "@/models/Booking";
import { Invoice } from "@/models/Invoice";
import { verifySuperAdmin } from "@/app/lib/super-admin-dal";

export async function GET() {
  const session = await verifySuperAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const [
    totalTenants,
    activeTenants,
    totalBookingsToday,
    mrrAgg,
    recentSignups,
  ] = await Promise.all([
    Organization.countDocuments(),
    Organization.countDocuments({ status: "active" }),
    Booking.countDocuments({ createdAt: { $gte: todayStart } }),
    Invoice.aggregate([
      {
        $match: {
          status: "paid",
          createdAt: { $gte: monthStart },
        },
      },
      { $group: { _id: null, total: { $sum: "$paidAmount" } } },
    ]),
    Organization.find({ createdAt: { $gte: sevenDaysAgo } })
      .sort({ createdAt: -1 })
      .select("name plan createdAt")
      .lean(),
  ]);

  // Top 10 most active tenants this month
  const bookingsByOrg = await Booking.aggregate([
    { $match: { createdAt: { $gte: monthStart } } },
    { $group: { _id: "$orgId", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 },
  ]);

  const topOrgIds = bookingsByOrg.map((b) => b._id);
  const topOrgs = await Organization.find({ _id: { $in: topOrgIds } })
    .select("name plan status")
    .lean();

  const topTenants = bookingsByOrg.map((b) => {
    const org = topOrgs.find((o) => String(o._id) === String(b._id));
    return {
      id: String(b._id),
      name: org?.name ?? "Unknown",
      plan: org?.plan ?? "trial",
      status: org?.status ?? "active",
      bookingsThisMonth: b.count,
    };
  });

  // New signups per month (last 6 months)
  const signupsByMonth = await Organization.aggregate([
    { $match: { createdAt: { $gte: sixMonthsAgo } } },
    {
      $group: {
        _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  // Churn risk: no login in 14+ days (among active tenants with plan)
  const churnRiskOrgs = await Organization.find({
    status: "active",
    $or: [
      { lastLoginAt: { $lt: fourteenDaysAgo } },
      { lastLoginAt: null },
    ],
    plan: { $in: ["starter", "pro"] },
  })
    .select("name plan lastLoginAt createdAt")
    .limit(10)
    .lean();

  return NextResponse.json({
    totalTenants,
    activeTenants,
    totalBookingsToday,
    platformMRR: mrrAgg[0]?.total ?? 0,
    topTenants,
    signupsByMonth: signupsByMonth.map((s) => ({
      month: monthNames[(s._id.month - 1) % 12],
      count: s.count,
    })),
    recentSignups: recentSignups.map((o) => ({
      id: String(o._id),
      name: o.name,
      plan: o.plan,
      createdAt: o.createdAt,
    })),
    churnRisk: churnRiskOrgs.map((o) => ({
      id: String(o._id),
      name: o.name,
      plan: o.plan,
      lastLoginAt: o.lastLoginAt ?? null,
      reason: !o.lastLoginAt ? "Never logged in" : "No login in 14+ days",
    })),
  });
}
