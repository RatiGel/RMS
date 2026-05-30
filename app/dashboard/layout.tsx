import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { getCurrentUser } from "@/app/lib/dal";
import { SessionProvider } from "@/contexts/session-context";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getCurrentUser();

  return (
    <SessionProvider session={session}>
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header userName={session?.name} orgName={session?.orgName} />
          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </SessionProvider>
  );
}
