"use client";

import { createContext, useContext, ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface SubscriptionInfo {
  plan: "trial" | "starter" | "pro";
  trialStartDate: string;
  planStartDate: string | null;
  trialDaysLeft: number;
  trialExpired: boolean;
  assetLimit: number | null;
  canAccessTeam: boolean;
  canAccessInvoices: boolean;
}

interface SubscriptionContextValue extends SubscriptionInfo {
  isLoading: boolean;
  upgrade: (plan: "starter" | "pro") => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextValue | null>(null);

const QUERY_KEY = ["subscription"];

async function fetchSubscription(): Promise<SubscriptionInfo> {
  const res = await fetch("/api/subscription");
  if (!res.ok) throw new Error("Failed to fetch subscription");
  return res.json();
}

async function postUpgrade(plan: "starter" | "pro"): Promise<SubscriptionInfo> {
  const res = await fetch("/api/subscription", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ plan }),
  });
  if (!res.ok) throw new Error("Failed to upgrade plan");
  return res.json();
}

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<SubscriptionInfo>({
    queryKey: QUERY_KEY,
    queryFn: fetchSubscription,
    staleTime: 60_000,
  });

  const mutation = useMutation({
    mutationFn: postUpgrade,
    onSuccess: (updated) => {
      queryClient.setQueryData(QUERY_KEY, updated);
    },
  });

  const upgrade = async (plan: "starter" | "pro") => {
    await mutation.mutateAsync(plan);
  };

  const value: SubscriptionContextValue = {
    plan: data?.plan ?? "trial",
    trialStartDate: data?.trialStartDate ?? new Date().toISOString(),
    planStartDate: data?.planStartDate ?? null,
    trialDaysLeft: data?.trialDaysLeft ?? 30,
    trialExpired: data?.trialExpired ?? false,
    assetLimit: data?.assetLimit ?? null,
    canAccessTeam: data?.canAccessTeam ?? false,
    canAccessInvoices: data?.canAccessInvoices ?? false,
    isLoading,
    upgrade,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription(): SubscriptionContextValue {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) throw new Error("useSubscription must be used inside SubscriptionProvider");
  return ctx;
}
