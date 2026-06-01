"use client";

import { useState, useEffect, useMemo } from "react";
import { Plus, CheckCircle, XCircle, Search, X } from "lucide-react";
import { getEnrollments, createEnrollment, updateEnrollmentStatus } from "@/lib/actions/matriculas";
import { getStudents } from "@/lib/actions/estudiantes";
import { getGroups } from "@/lib/actions/grupos";

type E = {
  id: number; studentId: number; groupId: number;
  fechaMatricula: string; montoMatricula: string; montoCurso: string; estado: string;
  studentName: string | null; studentLastname: string | null; studentDni: string | null;
  groupCodigo: string | null;
};

const inp = "flex h-10 w-full rounded-xl border border-[oklch(0.2_0.004_80)] bg-[oklch(0.18_0.003_85)] px-4 text-sm text-[oklch(0.92_0.003_85)] outline-none focus:border-[oklch(0.72_0.12_85/0.5)] transition-all";
const sel = "flex h-10 w-full rounded-xl border border-[oklch(0.2_0.004_80)] bg-[oklch(0.18_0.003_85)] px-4 text-sm text-[oklch(0.92_0.003_85)] outline-none focus:border-[oklch(0.72_0.12_85/0.5)] transition-all";
const btn = "flex h-10 items-center justify-center gap-1.5 rounded-xl bg-[oklch(0.72_0.12_85)] px-4 text-sm font-semibold text-white transition-all hover:bg-[oklch(0.68_0.13_83)] active:scale-[0.98] cursor-pointer shadow-md shadow-[oklch(0.72_0.12_85/0.2)]";
const L = "text-[11px] uppercase tracking-wider font-medium text-[oklch(0.58_0.008_70)]";
const sf = "flex h-10 rounded-xl border border-[oklch(0.2_0.004_80)] bg-[oklch(0.18_0.003_85)] px-4 text-sm text-[oklch(0.92_0.003_85)] outline-none focus:border-[oklch(0.72_0.12_85/0.5)] transition-all";

export default function MatriculasPage() {
  const [items, setItems] = useState<E[]>([]);
  const [open, setOpen] = useState(false);
  const [students, setStudents] = useState<{id:number;nombres:string;apellidos:string;dni:string}[]>([]);
  const [groups, setGroups] = useState<{id:number;codigo:string}[]>([]);
  const [search, setSearch] = useState("");
  const [filterEstado, setFilterEstado] = useState("todos");

  useEffect(() => { load(); (async()=>{setStudents(await getStudents() as any[]);setGroups(await getGroups() as any[]);})(); }, []);
  async function load() { setItems(await getEnrollments() as E[]); }

  const filtered = useMemo(() => items.filter(e => {
    const q = search.toLowerCase();
    return (!q || e.studentName?.toLowerCase().includes(q) || e.studentLastname?.toLowerCase().includes(q) || e.studentDni?.toLowerCase().includes(q) || e.groupCodigo?.toLowerCase().includes(q))
      && (filterEstado === "todos" || e.estado === filterEstado);
  }), [items, search, filterEstado]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await createEnrollment({ studentId: Number(fd.get("studentId")), groupId: Number(fd.get("groupId")), fechaMatricula: fd.get("fechaMatricula") as string });
    setOpen(false); await load();
  }

  async function handleStatus(id: number, estado: "activo"|"finalizado"|"cancelado") { await updateEnrollmentStatus(id, estado); await load(); }

  const hasFilters = search || filterEstado !== "todos";

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="font-heading text-3xl font-semibold tracking-wide text-[oklch(0.92_0.003_85)]">Matrículas</h1><p className="text-sm text-[oklch(0.55_0.01_75)] mt-1">Inscripción de alumnos</p></div>
        <button onClick={() => setOpen(true)} className={btn}><Plus className="h-4 w-4" /> Nueva Matrícula</button>
      </div>

      <div className="flex flex-wrap items-end gap-3 mb-4">
        <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
          <label className={L}>Buscar</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[oklch(0.48_0.008_72)]" strokeWidth={1.5} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Estudiante, DNI, grupo..." className={sf+" pl-10 w-full"} />
            {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-[oklch(0.48_0.008_72)] hover:text-[oklch(0.82_0.1_82)] cursor-pointer"><X className="h-4 w-4" /></button>}
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={L}>Estado</label>
          <select value={filterEstado} onChange={e => setFilterEstado(e.target.value)} className={sf}>
            <option value="todos">Todos</option>
            <option value="activo">Activo</option>
            <option value="finalizado">Finalizado</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>
        {hasFilters && <button onClick={() => { setSearch(""); setFilterEstado("todos"); }} className="flex items-center gap-1 text-xs text-[oklch(0.72_0.12_85)] hover:text-[oklch(0.85_0.09_82)] cursor-pointer pb-1"><X className="h-3.5 w-3.5" /> Limpiar</button>}
      </div>

      <div className="overflow-hidden rounded-2xl border border-[oklch(0.2_0.004_80)] bg-[oklch(0.145_0.003_85)]">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[oklch(0.19_0.004_80)]">
              {["Estudiante","DNI","Grupo","Fecha","Monto Mat.","Monto Curso","Estado",""].map(h => <th key={h} className="px-4 py-3 text-left text-[10px] uppercase tracking-[0.12em] text-[oklch(0.55_0.01_75)] font-medium">{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {filtered.map(e => (
              <tr key={e.id} className="border-b border-[oklch(0.18_0.003_85)] hover:bg-[oklch(0.17_0.003_85)] transition-colors">
                <td className="px-4 py-3 text-sm font-medium text-[oklch(0.9_0.003_85)]">{e.studentName} {e.studentLastname}</td>
                <td className="px-4 py-3 text-sm text-[oklch(0.82_0.005_78)]">{e.studentDni}</td>
                <td className="px-4 py-3 text-sm text-[oklch(0.82_0.005_78)]">{e.groupCodigo}</td>
                <td className="px-4 py-3 text-sm text-[oklch(0.75_0.005_78)]">{e.fechaMatricula}</td>
                <td className="px-4 py-3 text-sm text-[oklch(0.75_0.005_78)]">S/ {Number(e.montoMatricula).toFixed(2)}</td>
                <td className="px-4 py-3 text-sm text-[oklch(0.75_0.005_78)]">S/ {Number(e.montoCurso).toFixed(2)}</td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider ${e.estado==="activo"?"bg-[oklch(0.35_0.08_150/0.15)] text-[oklch(0.6_0.1_155)]":e.estado==="finalizado"?"bg-[oklch(0.32_0.06_80/0.2)] text-[oklch(0.8_0.1_82)]":"bg-[oklch(0.48_0.16_20/0.12)] text-[oklch(0.62_0.12_22)]"}`}>{e.estado}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    {e.estado === "activo" && (
                      <>
                        <button onClick={() => handleStatus(e.id, "finalizado")} className="flex items-center rounded-lg border border-[oklch(0.32_0.06_80/0.3)] p-1.5 text-[oklch(0.8_0.1_82)] hover:bg-[oklch(0.32_0.06_80/0.1)] cursor-pointer" title="Finalizar"><CheckCircle className="h-4 w-4" /></button>
                        <button onClick={() => handleStatus(e.id, "cancelado")} className="flex items-center rounded-lg border border-[oklch(0.48_0.16_20/0.3)] p-1.5 text-[oklch(0.62_0.12_22)] hover:bg-[oklch(0.48_0.16_20/0.1)] cursor-pointer" title="Cancelar"><XCircle className="h-4 w-4" /></button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={8} className="px-4 py-8 text-center text-sm text-[oklch(0.55_0.01_75)]">No se encontraron matrículas{hasFilters?" con los filtros aplicados":""}.</td></tr>}
          </tbody>
        </table>
      </div>
      <div className="text-xs text-[oklch(0.48_0.008_72)] mt-2">Mostrando {filtered.length} de {items.length} matrículas</div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setOpen(false)}>
          <div className="w-full max-w-md rounded-2xl border border-[oklch(0.2_0.004_80)] bg-[oklch(0.145_0.003_85)] p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <h2 className="font-heading text-xl font-semibold text-[oklch(0.92_0.003_85)] mb-5">Nueva Matrícula</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5"><label className={L}>Estudiante</label><select name="studentId" className={sel} required><option value="">Seleccionar...</option>{students.map(s=><option key={s.id} value={s.id}>{s.dni} - {s.nombres} {s.apellidos}</option>)}</select></div>
              <div className="flex flex-col gap-1.5"><label className={L}>Grupo</label><select name="groupId" className={sel} required><option value="">Seleccionar...</option>{groups.map(g=><option key={g.id} value={g.id}>{g.codigo}</option>)}</select></div>
              <div className="flex flex-col gap-1.5"><label className={L}>Fecha</label><input name="fechaMatricula" type="date" defaultValue={new Date().toISOString().split("T")[0]} required className={inp} /></div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={()=>setOpen(false)} className="flex-1 h-10 rounded-xl border border-[oklch(0.2_0.004_80)] text-sm text-[oklch(0.65_0.008_72)] hover:bg-[oklch(0.18_0.003_85)] transition-all cursor-pointer">Cancelar</button>
                <button type="submit" className={btn+" flex-1"}>Registrar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
