import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { getCurrentUser } from "@/app/lib/dal";
import { SessionProvider } from "@/contexts/session-context";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";

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

  return (
    <SessionProvider session={clientSession}>
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header userName={session?.name} orgName={session?.orgName} avatarUrl={avatarUrl} />
          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </SessionProvider>
  );
}
