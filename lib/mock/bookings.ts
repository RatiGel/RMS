import { Booking } from "@/types";

export const mockBookings: Booking[] = [
  { id: "bkg-1", assetId: "ast-1", assetName: "CAT 320 Excavator", customerId: "cus-1", customerName: "BuildCorp Ltd", startDate: "2025-05-20", endDate: "2025-06-10", status: "active", totalAmount: 17850, depositAmount: 5000, notes: "Site: Downtown Project Phase 2", createdAt: "2025-05-15" },
  { id: "bkg-2", assetId: "ast-4", assetName: "Toyota Forklift 3T", customerId: "cus-2", customerName: "Metro Construction", startDate: "2025-05-22", endDate: "2025-05-31", status: "active", totalAmount: 1800, depositAmount: 2000, createdAt: "2025-05-20" },
  { id: "bkg-3", assetId: "ast-7", assetName: "Layher Scaffolding Set", customerId: "cus-4", customerName: "Summit Scaffolding Inc", startDate: "2025-05-15", endDate: "2025-06-15", status: "active", totalAmount: 2850, depositAmount: 800, notes: "Monthly rate agreed", createdAt: "2025-05-10" },
  { id: "bkg-4", assetId: "ast-3", assetName: "Ford Transit Van", customerId: "cus-3", customerName: "John Harrison", startDate: "2025-06-01", endDate: "2025-06-07", status: "confirmed", totalAmount: 840, depositAmount: 1000, createdAt: "2025-05-25" },
  { id: "bkg-5", assetId: "ast-8", assetName: "Manitou Telehandler 17m", customerId: "cus-5", customerName: "Rapid Earthworks", startDate: "2025-06-10", endDate: "2025-06-20", status: "confirmed", totalAmount: 4800, depositAmount: 3500, createdAt: "2025-05-26" },
  { id: "bkg-6", assetId: "ast-2", assetName: "Komatsu D65 Bulldozer", customerId: "cus-1", customerName: "BuildCorp Ltd", startDate: "2025-04-01", endDate: "2025-04-30", status: "returned", totalAmount: 22500, depositAmount: 4500, createdAt: "2025-03-25" },
  { id: "bkg-7", assetId: "ast-5", assetName: "Hilti TE 60 Rotary Hammer", customerId: "cus-2", customerName: "Metro Construction", startDate: "2025-05-01", endDate: "2025-05-05", status: "returned", totalAmount: 225, depositAmount: 300, createdAt: "2025-04-28" },
  { id: "bkg-8", assetId: "ast-6", assetName: "Atlas Copco Generator 50kVA", customerId: "cus-4", customerName: "Summit Scaffolding Inc", startDate: "2025-06-15", endDate: "2025-06-30", status: "draft", totalAmount: 3300, depositAmount: 2500, createdAt: "2025-05-26" },
];
