import Sidebar from "@/components/layout/sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[oklch(0.12_0.003_85)]">
      <Sidebar />
      <div className="ml-64">
        <main className="p-6 pb-12">{children}</main>
      </div>
    </div>
  );
}
