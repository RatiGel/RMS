import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/app/lib/session";

export const verifyAuth = cache(async () => {
  const session = await getSession();
  if (!session?.userId) redirect("/login");
  return session;
});

export const getCurrentUser = cache(async () => {
  return getSession();
});
