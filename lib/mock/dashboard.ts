import { DashboardStats } from "@/types";
import { mockBookings } from "./bookings";

export const mockDashboardStats: DashboardStats = {
  totalAssets: 91,
  activeBookings: 3,
  monthlyRevenue: 54200,
  overdueInvoices: 1,
  assetsByCategory: [
    { name: "Heavy Equipment", count: 8 },
    { name: "Vehicles", count: 12 },
    { name: "Power Tools", count: 25 },
    { name: "Scaffolding", count: 40 },
    { name: "Compressors", count: 6 },
  ],
  revenueByMonth: [
    { month: "Dec", revenue: 38400 },
    { month: "Jan", revenue: 42100 },
    { month: "Feb", revenue: 47800 },
    { month: "Mar", revenue: 39200 },
    { month: "Apr", revenue: 58600 },
    { month: "May", revenue: 54200 },
  ],
  recentBookings: mockBookings.slice(0, 5),
};
