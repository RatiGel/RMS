"use client";

import { Badge } from "@/components/ui/badge";
import { AssetStatus, BookingStatus, InvoiceStatus } from "@/types";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/language-context";

const assetStatusClass: Record<AssetStatus, string> = {
  available: "bg-green-100 text-green-800 border-green-200",
  rented: "bg-blue-100 text-blue-800 border-blue-200",
  maintenance: "bg-yellow-100 text-yellow-800 border-yellow-200",
  retired: "bg-gray-100 text-gray-800 border-gray-200",
};

const bookingStatusClass: Record<BookingStatus, string> = {
  draft: "bg-gray-100 text-gray-800 border-gray-200",
  confirmed: "bg-purple-100 text-purple-800 border-purple-200",
  active: "bg-blue-100 text-blue-800 border-blue-200",
  returned: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
};

const invoiceStatusClass: Record<InvoiceStatus, string> = {
  unpaid: "bg-yellow-100 text-yellow-800 border-yellow-200",
  partial: "bg-orange-100 text-orange-800 border-orange-200",
  paid: "bg-green-100 text-green-800 border-green-200",
  overdue: "bg-red-100 text-red-800 border-red-200",
};

export function AssetStatusBadge({ status }: { status: AssetStatus }) {
  const { t } = useLanguage();
  return <Badge variant="outline" className={cn("font-normal", assetStatusClass[status])}>{t.status.asset[status]}</Badge>;
}

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  const { t } = useLanguage();
  return <Badge variant="outline" className={cn("font-normal", bookingStatusClass[status])}>{t.status.booking[status]}</Badge>;
}

export function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  const { t } = useLanguage();
  return <Badge variant="outline" className={cn("font-normal", invoiceStatusClass[status])}>{t.status.invoice[status]}</Badge>;
}
