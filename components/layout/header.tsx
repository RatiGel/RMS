"use client";


import { Bell, Search, UserCircle, Settings, UsersRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { useLanguage } from "@/contexts/language-context";
import { useCurrency, Currency } from "@/contexts/currency-context";
import { Locale } from "@/lib/i18n/translations";
import { logout } from "@/app/actions/auth";

const localeLabels: Record<Locale, string> = {
  en: "EN",
  ka: "ქარ",
  ru: "РУ",
};

const currencyLabels: Record<Currency, string> = {
  USD: "$",
  GEL: "₾",
};

interface HeaderProps {
  userName?: string;
  orgName?: string;
  avatarUrl?: string;
}

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

export function Header({ userName = "User", orgName = "My Organization", avatarUrl }: HeaderProps) {
  const { t, locale, setLocale } = useLanguage();
  const { currency, setCurrency } = useCurrency();
  const router = useRouter();

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
              <AvatarImage src={avatarUrl} alt={userName} />
              <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                {initials(userName)}
              </AvatarFallback>
            </Avatar>
            <span className="text-left hidden sm:flex sm:flex-col">
              <span className="text-sm font-medium leading-none">{userName}</span>
              <span className="text-xs text-muted-foreground mt-0.5">{orgName}</span>
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuGroup>
              <DropdownMenuLabel>{t.header.myAccount}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/dashboard/profile")}>
                <UserCircle className="h-4 w-4" />
                {t.header.profile}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/dashboard/settings")}>
                <Settings className="h-4 w-4" />
                {t.nav.settings}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/dashboard/team")}>
                <UsersRound className="h-4 w-4" />
                {t.nav.team}
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <form action={logout}>
              <button
                type="submit"
                className="relative flex w-full cursor-pointer items-center rounded-md px-1.5 py-1 text-sm text-destructive outline-none select-none hover:bg-destructive/10 focus:bg-destructive/10"
              >
                {t.header.signOut}
              </button>
            </form>
          </DropdownMenuContent>
        </DropdownMenu>

      </div>
    </header>
  );
}
