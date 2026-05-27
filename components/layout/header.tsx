"use client";

import { Bell, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/language-context";
import { useCurrency, Currency } from "@/contexts/currency-context";
import { Locale } from "@/lib/i18n/translations";

const localeLabels: Record<Locale, string> = {
  en: "EN",
  ka: "ქარ",
};

const currencyLabels: Record<Currency, string> = {
  USD: "$",
  GEL: "₾",
};

export function Header() {
  const { t, locale, setLocale } = useLanguage();
  const { currency, setCurrency } = useCurrency();

  return (
    <header className="flex h-16 items-center gap-4 border-b bg-card px-6">
      <div className="flex-1 max-w-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder={t.header.searchPlaceholder} className="pl-9 bg-background" />
        </div>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        {/* Currency switcher */}
        <div className="flex items-center rounded-md border overflow-hidden text-xs font-medium">
          {(Object.keys(currencyLabels) as Currency[]).map((c) => (
            <button
              key={c}
              onClick={() => setCurrency(c)}
              className={`px-2.5 py-1.5 transition-colors ${
                currency === c
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent text-muted-foreground"
              }`}
            >
              {currencyLabels[c]}
            </button>
          ))}
        </div>

        {/* Language switcher */}
        <div className="flex items-center rounded-md border overflow-hidden text-xs font-medium">
          {(Object.keys(localeLabels) as Locale[]).map((loc) => (
            <button
              key={loc}
              onClick={() => setLocale(loc)}
              className={`px-2.5 py-1.5 transition-colors ${
                locale === loc
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent text-muted-foreground"
              }`}
            >
              {localeLabels[loc]}
            </button>
          ))}
        </div>

        <button className="relative p-2 rounded-md hover:bg-accent transition-colors">
          <Bell className="h-4 w-4" />
          <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]">
            2
          </Badge>
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 pl-2 rounded-md px-2 py-1.5 hover:bg-accent transition-colors outline-none">
            <Avatar className="h-7 w-7">
              <AvatarFallback className="text-xs bg-primary text-primary-foreground">AC</AvatarFallback>
            </Avatar>
            <div className="text-left hidden sm:block">
              <p className="text-sm font-medium leading-none">Admin User</p>
              <p className="text-xs text-muted-foreground mt-0.5">AcmeCorp Rentals</p>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>{t.header.myAccount}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>{t.header.profile}</DropdownMenuItem>
            <DropdownMenuItem>{t.header.organization}</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">{t.header.signOut}</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
