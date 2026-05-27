import { Invoice } from "@/types";

export const mockInvoices: Invoice[] = [
  {
    id: "inv-1", invoiceNumber: "INV-2025-001", bookingId: "bkg-1", customerId: "cus-1", customerName: "BuildCorp Ltd", assetName: "CAT 320 Excavator",
    lineItems: [
      { description: "Rental: CAT 320 Excavator (21 days × $850/day)", quantity: 21, unitPrice: 850, total: 17850 },
      { description: "Security Deposit", quantity: 1, unitPrice: 5000, total: 5000 },
    ],
    subtotal: 22850, tax: 0, discount: 0, total: 22850, status: "partial", dueDate: "2025-06-15", paidAmount: 5000, createdAt: "2025-05-15"
  },
  {
    id: "inv-2", invoiceNumber: "INV-2025-002", bookingId: "bkg-2", customerId: "cus-2", customerName: "Metro Construction", assetName: "Toyota Forklift 3T",
    lineItems: [
      { description: "Rental: Toyota Forklift 3T (10 days × $180/day)", quantity: 10, unitPrice: 180, total: 1800 },
      { description: "Security Deposit", quantity: 1, unitPrice: 2000, total: 2000 },
    ],
    subtotal: 3800, tax: 0, discount: 0, total: 3800, status: "unpaid", dueDate: "2025-06-05", paidAmount: 0, createdAt: "2025-05-22"
  },
  {
    id: "inv-3", invoiceNumber: "INV-2025-003", bookingId: "bkg-6", customerId: "cus-1", customerName: "BuildCorp Ltd", assetName: "Komatsu D65 Bulldozer",
    lineItems: [
      { description: "Rental: Komatsu D65 Bulldozer (30 days × $750/day)", quantity: 30, unitPrice: 750, total: 22500 },
      { description: "Security Deposit", quantity: 1, unitPrice: 4500, total: 4500 },
    ],
    subtotal: 27000, tax: 0, discount: 500, total: 26500, status: "paid", dueDate: "2025-05-05", paidAmount: 26500, createdAt: "2025-03-25"
  },
  {
    id: "inv-4", invoiceNumber: "INV-2025-004", bookingId: "bkg-3", customerId: "cus-4", customerName: "Summit Scaffolding Inc", assetName: "Layher Scaffolding Set",
    lineItems: [
      { description: "Rental: Layher Scaffolding Set (30 days × $95/day)", quantity: 30, unitPrice: 95, total: 2850 },
      { description: "Security Deposit", quantity: 1, unitPrice: 800, total: 800 },
    ],
    subtotal: 3650, tax: 0, discount: 0, total: 3650, status: "overdue", dueDate: "2025-05-20", paidAmount: 0, createdAt: "2025-05-10"
  },
  {
    id: "inv-5", invoiceNumber: "INV-2025-005", bookingId: "bkg-7", customerId: "cus-2", customerName: "Metro Construction", assetName: "Hilti TE 60 Rotary Hammer",
    lineItems: [
      { description: "Rental: Hilti TE 60 (5 days × $45/day)", quantity: 5, unitPrice: 45, total: 225 },
      { description: "Security Deposit", quantity: 1, unitPrice: 300, total: 300 },
    ],
    subtotal: 525, tax: 0, discount: 0, total: 525, status: "paid", dueDate: "2025-05-10", paidAmount: 525, createdAt: "2025-04-28"
  },
];
