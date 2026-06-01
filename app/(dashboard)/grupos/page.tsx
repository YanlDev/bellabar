"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Plus, Pencil, ArrowRight, Search, X, Trash2 } from "lucide-react";
import { getGroups, createGroup, updateGroup, deleteGroup } from "@/lib/actions/grupos";
import { getTeachers } from "@/lib/actions/docentes";
import { getCourses } from "@/lib/actions/cursos";

type G = {
  id: number; codigo: string; courseId: number; teacherId: number;
  fechaInicio: string; fechaFin: string; turno: string | null;
  vacantes: number; estado: string;
  courseName: string | null; teacherName: string | null; teacherLastname: string | null;
};

const inp = "flex h-10 w-full rounded-xl border border-[oklch(0.2_0.004_80)] bg-[oklch(0.18_0.003_85)] px-4 text-sm text-[oklch(0.92_0.003_85)] outline-none focus:border-[oklch(0.72_0.12_85/0.5)] transition-all";
const sel = "flex h-10 w-full rounded-xl border border-[oklch(0.2_0.004_80)] bg-[oklch(0.18_0.003_85)] px-4 text-sm text-[oklch(0.92_0.003_85)] outline-none focus:border-[oklch(0.72_0.12_85/0.5)] transition-all";
const btn = "flex h-10 items-center justify-center gap-1.5 rounded-xl bg-[oklch(0.72_0.12_85)] px-4 text-sm font-semibold text-white transition-all hover:bg-[oklch(0.68_0.13_83)] active:scale-[0.98] cursor-pointer shadow-md shadow-[oklch(0.72_0.12_85/0.2)]";
const gh = "flex items-center gap-1 rounded-xl border border-[oklch(0.2_0.004_80)] px-3 py-1.5 text-xs font-medium text-[oklch(0.65_0.008_72)] transition-all hover:border-[oklch(0.28_0.008_78)] hover:text-[oklch(0.82_0.008_78)] cursor-pointer";
const L = "text-[11px] uppercase tracking-wider font-medium text-[oklch(0.58_0.008_70)]";
const sf = "flex h-10 rounded-xl border border-[oklch(0.2_0.004_80)] bg-[oklch(0.18_0.003_85)] px-4 text-sm text-[oklch(0.92_0.003_85)] outline-none focus:border-[oklch(0.72_0.12_85/0.5)] transition-all";

export default function GruposPage() {
  const [items, setItems] = useState<G[]>([]);
  const [editing, setEditing] = useState<G | null>(null);
  const [open, setOpen] = useState(false);
  const [courses, setCourses] = useState<{id:number;nombre:string}[]>([]);
  const [ts, setTs] = useState<{id:number;nombres:string;apellidos:string}[]>([]);
  const [search, setSearch] = useState("");
  const [filterEstado, setFilterEstado] = useState("todos");
  const [filterCurso, setFilterCurso] = useState("todos");

  useEffect(() => { load(); (async()=>{setCourses(await getCourses() as any[]);setTs(await getTeachers() as any[]);})(); }, []);
  async function load() { setItems(await getGroups() as G[]); }

  const filtered = useMemo(() => items.filter(g => {
    const q = search.toLowerCase();
    return (!q || g.codigo.toLowerCase().includes(q) || g.courseName?.toLowerCase().includes(q) || g.teacherName?.toLowerCase().includes(q))
      && (filterEstado === "todos" || g.estado === filterEstado)
      && (filterCurso === "todos" || g.courseId === Number(filterCurso));
  }), [items, search, filterEstado, filterCurso]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const d = { codigo: fd.get("codigo") as string, courseId: Number(fd.get("courseId")), teacherId: Number(fd.get("teacherId")), fechaInicio: fd.get("fechaInicio") as string, fechaFin: fd.get("fechaFin") as string, turno: fd.get("turno") as string || undefined, vacantes: Number(fd.get("vacantes")) };
    editing ? await updateGroup(editing.id, { ...d, estado: (fd.get("estado") as "activo"|"inactivo")||"activo" }) : await createGroup(d);
    setOpen(false); setEditing(null); await load();
  }

  async function handleDelete(id: number, code: string) {
    if (!confirm(`¿Eliminar el grupo "${code}"?`)) return;
    const r = await deleteGroup(id);
    if (r.error) { alert(r.error); return; }
    await load();
  }

  const hasFilters = search || filterEstado !== "todos" || filterCurso !== "todos";

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="font-heading text-3xl font-semibold tracking-wide text-[oklch(0.92_0.003_85)]">Grupos</h1><p className="text-sm text-[oklch(0.55_0.01_75)] mt-1">Apertura de cursos</p></div>
        <button onClick={() => { setEditing(null); setOpen(true); }} className={btn}><Plus className="h-4 w-4" /> Nuevo Grupo</button>
      </div>

      <div className="flex flex-wrap items-end gap-3 mb-4">
        <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
          <label className={L}>Buscar</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[oklch(0.48_0.008_72)]" strokeWidth={1.5} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Código, curso, docente..." className={sf+" pl-10 w-full"} />
            {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-[oklch(0.48_0.008_72)] hover:text-[oklch(0.82_0.1_82)] cursor-pointer"><X className="h-4 w-4" /></button>}
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={L}>Estado</label>
          <select value={filterEstado} onChange={e => setFilterEstado(e.target.value)} className={sf}><option value="todos">Todos</option><option value="activo">Activo</option><option value="inactivo">Inactivo</option></select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={L}>Curso</label>
          <select value={filterCurso} onChange={e => setFilterCurso(e.target.value)} className={sf}>
            <option value="todos">Todos</option>
            {courses.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </select>
        </div>
        {hasFilters && <button onClick={() => { setSearch(""); setFilterEstado("todos"); setFilterCurso("todos"); }} className="flex items-center gap-1 text-xs text-[oklch(0.72_0.12_85)] hover:text-[oklch(0.85_0.09_82)] cursor-pointer pb-1"><X className="h-3.5 w-3.5" /> Limpiar</button>}
      </div>

      <div className="overflow-hidden rounded-2xl border border-[oklch(0.2_0.004_80)] bg-[oklch(0.145_0.003_85)]">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[oklch(0.19_0.004_80)]">
              {["Código","Curso","Docente","Inicio","Fin","Turno","Vacantes","Estado",""].map(h => <th key={h} className="px-4 py-3 text-left text-[10px] uppercase tracking-[0.12em] text-[oklch(0.55_0.01_75)] font-medium">{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {filtered.map((g) => (
              <tr key={g.id} className="border-b border-[oklch(0.18_0.003_85)] hover:bg-[oklch(0.17_0.003_85)] transition-colors">
                <td className="px-4 py-3 text-sm font-medium">
                  <Link href={`/grupos/${g.id}`} className="text-[oklch(0.85_0.09_82)] hover:text-[oklch(0.88_0.08_82)] hover:underline transition-colors">{g.codigo}</Link>
                </td>
                <td className="px-4 py-3 text-sm text-[oklch(0.82_0.005_78)]">{g.courseName}</td>
                <td className="px-4 py-3 text-sm text-[oklch(0.82_0.005_78)]">{g.teacherName} {g.teacherLastname}</td>
                <td className="px-4 py-3 text-sm text-[oklch(0.75_0.005_78)]">{g.fechaInicio}</td>
                <td className="px-4 py-3 text-sm text-[oklch(0.75_0.005_78)]">{g.fechaFin}</td>
                <td className="px-4 py-3 text-sm text-[oklch(0.75_0.005_78)]">{g.turno||"—"}</td>
                <td className="px-4 py-3 text-sm text-[oklch(0.75_0.005_78)]">{g.vacantes}</td>
                <td className="px-4 py-3"><span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider ${g.estado==="activo"?"bg-[oklch(0.35_0.08_150/0.15)] text-[oklch(0.6_0.1_155)]":"bg-[oklch(0.18_0.003_85)] text-[oklch(0.42_0.008_70)]"}`}>{g.estado}</span></td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <Link href={`/grupos/${g.id}`} className={gh}><ArrowRight className="h-3.5 w-3.5" /></Link>
                    <button onClick={() => { setEditing(g); setOpen(true); }} className={gh}><Pencil className="h-3.5 w-3.5" /></button>
                    <button onClick={() => handleDelete(g.id, g.codigo)} className={gh + " hover:border-[oklch(0.48_0.16_20/0.3)] hover:text-[oklch(0.62_0.12_22)]"}><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={9} className="px-4 py-8 text-center text-sm text-[oklch(0.55_0.01_75)]">No se encontraron grupos{hasFilters?" con los filtros aplicados":""}.</td></tr>}
          </tbody>
        </table>
      </div>
      <div className="text-xs text-[oklch(0.48_0.008_72)] mt-2">Mostrando {filtered.length} de {items.length} grupos</div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => { setOpen(false); setEditing(null); }}>
          <div className="w-full max-w-lg rounded-2xl border border-[oklch(0.2_0.004_80)] bg-[oklch(0.145_0.003_85)] p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <h2 className="font-heading text-xl font-semibold text-[oklch(0.92_0.003_85)] mb-5">{editing?"Editar":"Nuevo"} Grupo</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5"><label className={L}>Código</label><input name="codigo" defaultValue={editing?.codigo||""} placeholder="MAQ-2026-01" required className={inp} /></div>
                <div className="flex flex-col gap-1.5"><label className={L}>Turno</label><input name="turno" defaultValue={editing?.turno||""} placeholder="Mañana/Tarde" className={inp} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5"><label className={L}>Curso</label><select name="courseId" defaultValue={editing?.courseId||""} className={sel} required><option value="">Seleccionar...</option>{courses.map(c=><option key={c.id} value={c.id}>{c.nombre}</option>)}</select></div>
                <div className="flex flex-col gap-1.5"><label className={L}>Docente</label><select name="teacherId" defaultValue={editing?.teacherId||""} className={sel} required><option value="">Seleccionar...</option>{ts.map(t=><option key={t.id} value={t.id}>{t.nombres} {t.apellidos}</option>)}</select></div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5"><label className={L}>Inicio</label><input name="fechaInicio" type="date" defaultValue={editing?.fechaInicio||""} required className={inp} /></div>
                <div className="flex flex-col gap-1.5"><label className={L}>Fin</label><input name="fechaFin" type="date" defaultValue={editing?.fechaFin||""} required className={inp} /></div>
                <div className="flex flex-col gap-1.5"><label className={L}>Vacantes</label><input name="vacantes" type="number" defaultValue={editing?.vacantes||0} required className={inp} /></div>
              </div>
              {editing && <div className="flex flex-col gap-1.5"><label className={L}>Estado</label><select name="estado" defaultValue={editing.estado} className={sel}><option value="activo">Activo</option><option value="inactivo">Inactivo</option></select></div>}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={()=>{setOpen(false);setEditing(null);}} className="flex-1 h-10 rounded-xl border border-[oklch(0.2_0.004_80)] text-sm text-[oklch(0.65_0.008_72)] hover:bg-[oklch(0.18_0.003_85)] transition-all cursor-pointer">Cancelar</button>
                <button type="submit" className={btn+" flex-1"}>{editing?"Guardar":"Crear"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
