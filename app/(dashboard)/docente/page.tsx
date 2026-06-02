"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Users, Calendar, ClipboardCheck, Star, BookOpen, Clock } from "lucide-react";

type Group = {
  id: number; codigo: string; courseName: string | null;
  fechaInicio: string; fechaFin: string; turno: string | null;
  vacantes: number; enrolled: number;
};

export default function DocentePage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/docente")
      .then(r => r.json())
      .then(d => { setGroups(d.groups || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64 text-[oklch(0.55_0.01_75)]">Cargando...</div>;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-[oklch(0.92_0.003_85)]">
          Mis Grupos
        </h1>
        <p className="text-sm text-[oklch(0.55_0.01_75)] mt-1">
          Grupos que tienes a tu cargo
        </p>
      </div>

      {groups.length === 0 ? (
        <div className="border border-zinc-800 bg-[oklch(0.145_0.003_85)] p-12 text-center">
          <Users className="h-12 w-12 text-[oklch(0.32_0.004_75)] mx-auto mb-3" strokeWidth={1} />
          <p className="text-sm text-[oklch(0.55_0.01_75)]">No tienes grupos asignados todavía.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {groups.map(g => (
            <div key={g.id} className="border border-zinc-800 bg-[oklch(0.145_0.003_85)] p-6 hover:border-[oklch(0.24_0.005_80)] transition-colors">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[oklch(0.92_0.003_85)]">{g.codigo}</h3>
                <span className="text-[10px] px-2 py-0.5 uppercase tracking-wider bg-[oklch(0.35_0.08_150/0.12)] text-[oklch(0.6_0.1_155)]">
                  Activo
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm text-[oklch(0.82_0.005_78)] mb-2">
                <BookOpen className="h-4 w-4 text-[oklch(0.82_0.1_82)]" strokeWidth={1.5} />
                {g.courseName}
              </div>

              <div className="flex items-center gap-4 text-xs text-[oklch(0.55_0.01_75)] mb-4">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {g.fechaInicio} — {g.fechaFin}
                </span>
                {g.turno && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {g.turno}
                  </span>
                )}
                <span>{g.enrolled} / {g.vacantes} alumnos</span>
              </div>

              <div className="flex gap-2">
                <Link
                  href={`/grupos/${g.id}`}
                  className="flex items-center gap-1.5 px-4 py-2 border border-zinc-800 text-sm text-[oklch(0.82_0.005_78)] hover:border-[oklch(0.35_0.07_80/0.4)] hover:text-[oklch(0.82_0.1_82)] transition-all cursor-pointer"
                >
                  <Users className="h-4 w-4" strokeWidth={1.5} />
                  Ver Alumnos
                </Link>
                <Link
                  href={`/asistencia`}
                  className="flex items-center gap-1.5 px-4 py-2 border border-zinc-800 text-sm text-[oklch(0.82_0.005_78)] hover:border-[oklch(0.35_0.07_80/0.4)] hover:text-[oklch(0.82_0.1_82)] transition-all cursor-pointer"
                >
                  <ClipboardCheck className="h-4 w-4" strokeWidth={1.5} />
                  Asistencia
                </Link>
                <Link
                  href={`/notas`}
                  className="flex items-center gap-1.5 px-4 py-2 border border-zinc-800 text-sm text-[oklch(0.82_0.005_78)] hover:border-[oklch(0.35_0.07_80/0.4)] hover:text-[oklch(0.82_0.1_82)] transition-all cursor-pointer"
                >
                  <Star className="h-4 w-4" strokeWidth={1.5} />
                  Notas
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
