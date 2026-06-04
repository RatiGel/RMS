"use client";

import { ShieldCheck, Sun, Moon, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "next-themes";
import { superAdminLogout } from "@/app/actions/super-admin-auth";

interface SuperAdminHeaderProps {
  adminName: string;
  adminRole?: string;
}

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

export function SuperAdminHeader({ adminName, adminRole = "owner" }: SuperAdminHeaderProps) {
  const { setTheme, resolvedTheme } = useTheme();

  return (
    <header className="flex h-16 items-center gap-4 border-b bg-card/95 backdrop-blur-sm px-6 shadow-sm">
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-4 w-4 text-primary" />
        <span className="text-sm font-semibold text-muted-foreground">Super Admin</span>
        <Badge variant="outline" className="text-xs capitalize">{adminRole}</Badge>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        <Link
          href="/dashboard"
          className="flex items-center justify-center rounded-md border p-1.5 hover:bg-accent transition-colors"
          title="My Dashboard"
        >
          <LayoutDashboard className="h-4 w-4" />
        </Link>

        <button
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          className="flex items-center justify-center rounded-md border p-1.5 hover:bg-accent transition-colors"
          aria-label="Toggle theme"
        >
          <Sun className="h-4 w-4 hidden dark:block" />
          <Moon className="h-4 w-4 dark:hidden" />
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 pl-2 rounded-md px-2 py-1.5 hover:bg-accent transition-colors outline-none">
            <Avatar className="h-7 w-7">
              <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                {initials(adminName)}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium hidden sm:block">{adminName}</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuGroup>
              <DropdownMenuLabel>{adminName}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <form action={superAdminLogout}>
                <button
                  type="submit"
                  className="relative flex w-full cursor-pointer items-center rounded-md px-1.5 py-1 text-sm text-destructive outline-none select-none hover:bg-destructive/10 focus:bg-destructive/10"
                >
                  Sign out
                </button>
              </form>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
