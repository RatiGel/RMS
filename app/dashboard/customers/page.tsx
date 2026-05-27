"use client";

import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Customer } from "@/types";
import { formatDate } from "@/utils/format";
import { useCurrency } from "@/contexts/currency-context";
import { CustomerFormDialog } from "@/components/customers/customer-form-dialog";
import { useLanguage } from "@/contexts/language-context";

export default function CustomersPage() {
  const { t } = useLanguage();
  const { formatCurrency } = useCurrency();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const { data: customers = [], isLoading } = useQuery<Customer[]>({
    queryKey: ["customers"],
    queryFn: () => fetch("/api/customers").then((r) => r.json()),
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<Customer>) =>
      fetch("/api/customers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then((r) => r.json()),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["customers"] }); toast.success("Customer added"); },
    onError: () => toast.error("Failed to add customer"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: Partial<Customer> & { id: string }) =>
      fetch(`/api/customers/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then((r) => r.json()),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["customers"] }); toast.success("Customer updated"); },
    onError: () => toast.error("Failed to update customer"),
  });

  const filtered = customers.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  );

  const initials = (name: string) => name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t.customers.title}</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {t.customers.subtitle.replace("{total}", customers.length.toString())}
          </p>
        </div>
        <Button onClick={() => { setEditingCustomer(null); setDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" /> {t.customers.addCustomer}
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder={t.customers.searchPlaceholder} className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {isLoading ? (
        <Skeleton className="h-64 rounded-xl" />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.table.customer}</TableHead>
                  <TableHead>{t.table.phone}</TableHead>
                  <TableHead>{t.table.bookings}</TableHead>
                  <TableHead>{t.table.totalSpent}</TableHead>
                  <TableHead>{t.table.memberSince}</TableHead>
                  <TableHead className="w-16"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-12">{t.customers.noCustomers}</TableCell>
                  </TableRow>
                ) : (
                  filtered.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs bg-primary/10 text-primary">{initials(c.name)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">{c.name}</p>
                            <p className="text-xs text-muted-foreground">{c.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{c.phone}</TableCell>
                      <TableCell>{c.totalBookings}</TableCell>
                      <TableCell className="font-medium">{formatCurrency(c.totalSpent)}</TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(c.createdAt)}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => { setEditingCustomer(c); setDialogOpen(true); }}>
                          {t.inventory.edit}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <CustomerFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        customer={editingCustomer}
        onSave={(data) => {
          if (editingCustomer) {
            updateMutation.mutate({ id: editingCustomer.id, ...data });
          } else {
            createMutation.mutate(data);
          }
          setDialogOpen(false);
        }}
      />
    </div>
  );
}
