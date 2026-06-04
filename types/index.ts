export type AssetStatus = "available" | "rented" | "maintenance" | "retired";
export type BookingStatus = "draft" | "confirmed" | "active" | "returned" | "cancelled";
export type InvoiceStatus = "unpaid" | "partial" | "paid" | "overdue";
export type PaymentMethod = "cash" | "bank_transfer" | "card" | "other";
export type UserRole = "owner" | "admin" | "staff" | "super_admin";

export interface Category {
  id: string;
  name: string;
  description: string;
  assetCount: number;
}

export interface Asset {
  id: string;
  name: string;
  categoryId: string;
  categoryName: string;
  dailyRate: number;
  depositAmount: number;
  status: AssetStatus;
  description: string;
  imageUrl?: string;
  serialNumber?: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  idType: "passport" | "national_id" | "drivers_license";
  idNumber: string;
  totalBookings: number;
  totalSpent: number;
  createdAt: string;
}

export interface Booking {
  id: string;
  assetId: string;
  assetName: string;
  customerId: string;
  customerName: string;
  startDate: string;
  endDate: string;
  status: BookingStatus;
  totalAmount: number;
  depositAmount: number;
  notes?: string;
  createdAt: string;
}

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  bookingId: string;
  customerId: string;
  customerName: string;
  assetName: string;
  lineItems: InvoiceLineItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  status: InvoiceStatus;
  dueDate: string;
  paidAmount: number;
  createdAt: string;
}

export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  method: PaymentMethod;
  paidAt: string;
  notes?: string;
}

export interface DashboardStats {
  totalAssets: number;
  activeBookings: number;
  monthlyRevenue: number;
  overdueInvoices: number;
  assetsByCategory: { name: string; count: number }[];
  revenueByMonth: { month: string; revenue: number }[];
  recentBookings: Booking[];
}
