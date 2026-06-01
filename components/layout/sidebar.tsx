"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  GraduationCap,
  BookOpen,
  Users,
  UserCheck,
  Calendar,
  ClipboardCheck,
  CreditCard,
  Star,
  LogIn,
  LogOut,
} from "lucide-react";

const mainNav = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
];

const academicNav = [
  { href: "/cursos", label: "Cursos", icon: BookOpen },
  { href: "/docentes", label: "Docentes", icon: UserCheck },
  { href: "/estudiantes", label: "Estudiantes", icon: GraduationCap },
  { href: "/grupos", label: "Grupos", icon: Users },
];

const operationsNav = [
  { href: "/matriculas", label: "Matrículas", icon: Calendar },
  { href: "/asistencia", label: "Asistencia", icon: ClipboardCheck },
  { href: "/asistencia-docentes", label: "Asist. Docentes", icon: LogIn },
  { href: "/pagos", label: "Pagos", icon: CreditCard },
  { href: "/notas", label: "Notas", icon: Star },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);

  useEffect(() => {
    fetch("/api/session")
      .then((r) => r.json())
      .then((d) => { if (!d.error) setUser(d); })
      .catch(() => {});
  }, []);

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-[oklch(0.125_0.003_85)] border-r border-[oklch(0.19_0.004_80)] flex flex-col">
      {/* Branding */}
      <div className="flex flex-col items-center gap-2 pt-6 pb-4 border-b border-[oklch(0.19_0.004_80)] shrink-0">
        <img src="/Logo/logo.jpg" alt="Logo" className="h-10 w-10 object-cover rounded-xl shadow-md shadow-[oklch(0.72_0.12_85/0.15)] ring-1 ring-[oklch(0.72_0.12_85/0.2)]" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-4">
        <NavSection items={mainNav} pathname={pathname} />
        <NavSection label="Académico" items={academicNav} pathname={pathname} />
        <NavSection label="Operaciones" items={operationsNav} pathname={pathname} />
      </nav>

      {/* User */}
      {user && (
        <div className="border-t border-[oklch(0.19_0.004_80)] p-3 shrink-0">
          <div className="flex items-center justify-between rounded-xl px-3 py-2">
            <div>
              <p className="text-sm font-medium text-[oklch(0.92_0.003_85)]">{user.name}</p>
              <p className="text-[10px] uppercase tracking-wider text-[oklch(0.55_0.01_75)]">{user.role}</p>
            </div>
            <form action="/api/logout" method="POST">
              <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-[oklch(0.2_0.004_80)] text-[oklch(0.55_0.01_75)] transition-all hover:border-[oklch(0.35_0.07_80/0.4)] hover:text-[oklch(0.82_0.1_82)] cursor-pointer">
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </aside>
  );
}

function NavSection({ label, items, pathname }: {
  label?: string;
  items: { href: string; label: string; icon: React.ElementType }[];
  pathname: string;
}) {
  return (
    <div>
      {label && (
        <p className="text-[10px] uppercase tracking-[0.15em] text-[oklch(0.42_0.008_70)] px-3 mb-1">
          {label}
        </p>
      )}
      <div className="flex flex-col gap-0.5">
        {items.map((item) => {
          const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                active
                  ? "bg-[oklch(0.72_0.12_85/0.12)] text-[oklch(0.85_0.09_82)]"
                  : "text-[oklch(0.58_0.008_72)] hover:bg-[oklch(0.18_0.003_85)] hover:text-[oklch(0.85_0.005_78)]"
              }`}
            >
              <item.icon className="h-[18px] w-[18px]" strokeWidth={1.5} />
              {item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
