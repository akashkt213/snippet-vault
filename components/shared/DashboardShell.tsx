import Sidebar from "@/components/shared/Sidebar";
import Navbar from "@/components/shared/Navbar";
import type { AuthenticatedUser } from "@/lib/auth/session";

type DashboardShellProps = {
  user: AuthenticatedUser;
  children: React.ReactNode;
};

export default function DashboardShell({ user, children }: DashboardShellProps) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#0a0a0a]">
      <Sidebar user={user} />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
