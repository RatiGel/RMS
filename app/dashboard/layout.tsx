import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { TrialBanner } from "@/components/layout/trial-banner";
import { ImpersonationBanner } from "@/components/super-admin/impersonation-banner";
import { getCurrentUser } from "@/app/lib/dal";
import { SessionProvider } from "@/contexts/session-context";
import { SubscriptionProvider } from "@/contexts/subscription-context";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { cookies } from "next/headers";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getCurrentUser();

  let avatarUrl: string | undefined;
  if (session?.userId) {
    try {
      await connectDB();
      const u = await User.findById(session.userId).select("avatarUrl").lean();
      avatarUrl = (u as any)?.avatarUrl ?? undefined;
    } catch {
      // non-critical
    }
  }

  const clientSession = session ? { ...session, avatarUrl } : null;

  // Check for active super admin impersonation
  const cookieStore = await cookies();
  const impersonatingCookie = cookieStore.get("sa_impersonating")?.value;
  let impersonatingOrg: string | null = null;
  let impersonatingIsSelf = false;
  if (impersonatingCookie) {
    try {
      const data = JSON.parse(impersonatingCookie);
      impersonatingOrg = data.orgName ?? null;
      impersonatingIsSelf = data.isSelf === true;
    } catch { /* invalid cookie */ }
  }

  return (
    <SessionProvider session={clientSession}>
      <SubscriptionProvider>
        <div className="flex h-screen overflow-hidden bg-background">
          <Sidebar />
          <div className="flex flex-1 flex-col overflow-hidden">
            {impersonatingOrg && <ImpersonationBanner orgName={impersonatingOrg} isSelf={impersonatingIsSelf} />}
            <Header userName={session?.name} orgName={session?.orgName} avatarUrl={avatarUrl} />
            <TrialBanner />
            <main className="flex-1 overflow-y-auto p-6">
              {children}
            </main>
          </div>
        </div>
      </SubscriptionProvider>
    </SessionProvider>
  );
}
