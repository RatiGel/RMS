"use client";

import { createContext, useContext } from "react";

export type ClientSession = {
  userId: string;
  orgId: string;
  role: string;
  name: string;
  orgName: string;
  avatarUrl?: string;
};

const SessionContext = createContext<ClientSession | null>(null);

export function SessionProvider({
  session,
  children,
}: {
  session: ClientSession | null;
  children: React.ReactNode;
}) {
  return (
    <SessionContext.Provider value={session}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  return useContext(SessionContext);
}

export function useIsStaff() {
  const session = useSession();
  return session?.role === "staff";
}
