"use client";

import { Bell } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Booking } from "@/types";

export function NotificationBell() {
  const router = useRouter();

  const { data: bookings = [] } = useQuery<Booking[]>({
    queryKey: ["bookings"],
    queryFn: () => fetch("/api/bookings").then((r) => r.json()),
  });

  const activeCount = bookings.filter(
    (b) => b.status === "active" || b.status === "confirmed"
  ).length;

  const recent = bookings.slice(0, 5);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="relative p-2 rounded-md hover:bg-accent transition-colors outline-none">
        <Bell className="h-4 w-4" />
        {activeCount > 0 && (
          <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]">
            {activeCount > 9 ? "9+" : activeCount}
          </Badge>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Recent Bookings</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {recent.length === 0 ? (
            <p className="px-2 py-4 text-center text-sm text-muted-foreground">
              No bookings yet
            </p>
          ) : (
            recent.map((b) => (
              <DropdownMenuItem
                key={b.id}
                onClick={() => router.push("/dashboard/bookings")}
              >
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="font-medium truncate">{b.assetName}</span>
                  <span className="text-xs text-muted-foreground truncate">
                    {b.customerName} · {b.startDate} → {b.endDate}
                  </span>
                </div>
              </DropdownMenuItem>
            ))
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => router.push("/dashboard/bookings")}
            className="justify-center font-medium text-primary"
          >
            View all bookings →
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
