import { headers } from "next/headers";
import { SuperAdminSidebar } from "@/components/super-admin/sidebar";
import { SuperAdminHeader } from "@/components/super-admin/header";
import { getSession } from "@/app/lib/session";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";

export default async function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers();
  const currentPath = headersList.get("x-sa-path") ?? "";
  const isLoginPage = currentPath === "/super-admin/login";

  if (isLoginPage) {
    return <>{children}</>;
  }

  const session = await getSession();
  let superAdminRole = "owner";

  if (session?.userId) {
    try {
      await connectDB();
      const u = await User.findById(session.userId).select("superAdminRole").lean();
      superAdminRole = (u as { superAdminRole?: string })?.superAdminRole ?? "owner";
    } catch { /* non-critical */ }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <SuperAdminSidebar />
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <SuperAdminHeader adminName={session?.name ?? "Admin"} adminRole={superAdminRole} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
