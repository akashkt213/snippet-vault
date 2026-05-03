import Sidebar from "@/components/shared/Sidebar";
import Navbar from "@/components/shared/Navbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#0a0a0a]">
      {/* Sidebar — fixed width, full height */}
      <Sidebar />

      {/* Right side — navbar + scrollable content */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <Navbar />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}