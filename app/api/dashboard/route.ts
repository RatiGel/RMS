import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Asset } from "@/models/Asset";
import { Booking } from "@/models/Booking";
import { Invoice } from "@/models/Invoice";
import { Category } from "@/models/Category";
import { getSession } from "@/app/lib/session";
import { Types } from "mongoose";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();

  const orgId = new Types.ObjectId(session.orgId);

  const [
    totalAssets,
    activeBookings,
    overdueInvoices,
    assetsByCategory,
    revenueByMonth,
    recentBookingsRaw,
  ] = await Promise.all([
    Asset.countDocuments({ orgId }),
    Booking.countDocuments({ orgId, status: "active" }),
    Invoice.countDocuments({
      orgId,
      status: "overdue",
    }),
    Category.aggregate([
      { $match: { orgId } },
      {
        $lookup: {
          from: "assets",
          localField: "_id",
          foreignField: "categoryId",
          as: "assets",
        },
      },
      {
        $project: {
          name: 1,
          count: { $size: "$assets" },
        },
      },
    ]),
    Invoice.aggregate([
      { $match: { orgId, status: "paid" } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          revenue: { $sum: "$paidAmount" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      { $limit: 6 },
    ]),
    Booking.find({ orgId }).sort({ createdAt: -1 }).limit(5).lean(),
  ]);

  // Calculate monthly revenue (current month)
  const now = new Date();
  const monthlyRevenue = await Invoice.aggregate([
    {
      $match: {
        orgId,
        status: "paid",
        createdAt: {
          $gte: new Date(now.getFullYear(), now.getMonth(), 1),
          $lt: new Date(now.getFullYear(), now.getMonth() + 1, 1),
        },
      },
    },
    { $group: { _id: null, total: { $sum: "$paidAmount" } } },
  ]);

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  // Enrich recent bookings with asset/customer names
  const { Asset: AssetModel } = await import("@/models/Asset");
  const { Customer } = await import("@/models/Customer");

  const assetIds = recentBookingsRaw.map((b) => b.assetId);
  const customerIds = recentBookingsRaw.map((b) => b.customerId);
  const [assetsForBookings, customersForBookings] = await Promise.all([
    AssetModel.find({ _id: { $in: assetIds } }).lean(),
    Customer.find({ _id: { $in: customerIds } }).lean(),
  ]);
  const assetNameMap = Object.fromEntries(assetsForBookings.map((a) => [String(a._id), a.name]));
  const customerNameMap = Object.fromEntries(customersForBookings.map((c) => [String(c._id), c.name]));

  return NextResponse.json({
    totalAssets,
    activeBookings,
    monthlyRevenue: monthlyRevenue[0]?.total ?? 0,
    overdueInvoices,
    assetsByCategory: assetsByCategory.map((c: { _id: unknown; name: string; count: number }) => ({
      name: c.name,
      count: c.count,
    })),
    revenueByMonth: revenueByMonth.map((r: { _id: { month: number }; revenue: number }) => ({
      month: monthNames[(r._id.month - 1) % 12],
      revenue: r.revenue,
    })),
    recentBookings: recentBookingsRaw.map((b) => ({
      id: String(b._id),
      assetId: String(b.assetId),
      assetName: assetNameMap[String(b.assetId)] ?? "Unknown",
      customerId: String(b.customerId),
      customerName: customerNameMap[String(b.customerId)] ?? "Unknown",
      startDate: new Date(b.startDate).toISOString().slice(0, 10),
      endDate: new Date(b.endDate).toISOString().slice(0, 10),
      status: b.status,
      totalAmount: b.totalAmount,
      depositAmount: b.depositAmount,
      createdAt: new Date(b.createdAt).toISOString(),
    })),
  });
}
