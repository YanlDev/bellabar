"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Plus, Pencil, Search, X, ArrowRight, Trash2 } from "lucide-react";
import { getStudents, createStudent, updateStudent, deleteStudent } from "@/lib/actions/estudiantes";

type T = {
  id: number; dni: string; nombres: string; apellidos: string;
  celular: string | null; correo: string | null; direccion: string | null;
  fechaNacimiento: string | null; estado: string;
};

const inp = "flex h-10 w-full rounded-xl border border-[oklch(0.2_0.004_80)] bg-[oklch(0.18_0.003_85)] px-4 text-sm text-[oklch(0.92_0.003_85)] placeholder:text-[oklch(0.42_0.008_70)] outline-none focus:border-[oklch(0.72_0.12_85/0.5)] transition-all";
const btn = "flex h-10 items-center justify-center gap-1.5 rounded-xl bg-[oklch(0.72_0.12_85)] px-4 text-sm font-semibold text-white transition-all hover:bg-[oklch(0.68_0.13_83)] active:scale-[0.98] cursor-pointer shadow-md shadow-[oklch(0.72_0.12_85/0.2)]";
const gh = "flex items-center gap-1 rounded-xl border border-[oklch(0.2_0.004_80)] px-3 py-1.5 text-xs font-medium text-[oklch(0.65_0.008_72)] transition-all hover:border-[oklch(0.28_0.008_78)] hover:text-[oklch(0.82_0.008_78)] cursor-pointer";
const L = "text-[11px] uppercase tracking-wider font-medium text-[oklch(0.58_0.008_70)]";
const sf = "flex h-10 rounded-xl border border-[oklch(0.2_0.004_80)] bg-[oklch(0.18_0.003_85)] px-4 text-sm text-[oklch(0.92_0.003_85)] outline-none focus:border-[oklch(0.72_0.12_85/0.5)] transition-all";

export default function EstudiantesPage() {
  const [items, setItems] = useState<T[]>([]);
  const [editing, setEditing] = useState<T | null>(null);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [filterEstado, setFilterEstado] = useState("todos");

  useEffect(() => { load(); }, []);
  async function load() { setItems(await getStudents() as T[]); }

  const filtered = useMemo(() => items.filter(t => {
    const q = search.toLowerCase();
    return (!q || t.dni.toLowerCase().includes(q) || t.nombres.toLowerCase().includes(q) || t.apellidos.toLowerCase().includes(q))
      && (filterEstado === "todos" || t.estado === filterEstado);
  }), [items, search, filterEstado]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const d = { dni: fd.get("dni") as string, nombres: fd.get("nombres") as string, apellidos: fd.get("apellidos") as string, celular: fd.get("celular") as string || undefined, correo: fd.get("correo") as string || undefined, direccion: fd.get("direccion") as string || undefined, fechaNacimiento: fd.get("fechaNacimiento") as string || undefined };
    editing ? await updateStudent(editing.id, { ...d, estado: (fd.get("estado") as "activo" | "inactivo") || "activo" }) : await createStudent(d);
    setOpen(false); setEditing(null); await load();
  }

  async function handleDelete(id: number, name: string) {
    if (!confirm(`¿Eliminar a ${name}?`)) return;
    const r = await deleteStudent(id);
    if (r.error) { alert(r.error); return; }
    await load();
  }

  const hasFilters = search || filterEstado !== "todos";

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="font-heading text-3xl font-semibold tracking-wide text-[oklch(0.92_0.003_85)]">Estudiantes</h1><p className="text-sm text-[oklch(0.55_0.01_75)] mt-1">Gestión de alumnos</p></div>
        <button onClick={() => { setEditing(null); setOpen(true); }} className={btn}><Plus className="h-4 w-4" /> Nuevo Estudiante</button>
      </div>

      <div className="flex flex-wrap items-end gap-3 mb-4">
        <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
          <label className={L}>Buscar</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[oklch(0.48_0.008_72)]" strokeWidth={1.5} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Nombre, DNI..." className={sf+" pl-10 w-full"} />
            {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-[oklch(0.48_0.008_72)] hover:text-[oklch(0.82_0.1_82)] cursor-pointer"><X className="h-4 w-4" /></button>}
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={L}>Estado</label>
          <select value={filterEstado} onChange={e => setFilterEstado(e.target.value)} className={sf}><option value="todos">Todos</option><option value="activo">Activo</option><option value="inactivo">Inactivo</option></select>
        </div>
        {hasFilters && <button onClick={() => { setSearch(""); setFilterEstado("todos"); }} className="flex items-center gap-1 text-xs text-[oklch(0.72_0.12_85)] hover:text-[oklch(0.85_0.09_82)] cursor-pointer pb-1"><X className="h-3.5 w-3.5" /> Limpiar</button>}
      </div>

      <div className="overflow-hidden rounded-2xl border border-[oklch(0.2_0.004_80)] bg-[oklch(0.145_0.003_85)]">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[oklch(0.19_0.004_80)]">
              {["DNI","Nombres","Apellidos","Celular","Correo","Fec. Nac.","Estado",""].map(h => <th key={h} className="px-4 py-3 text-left text-[10px] uppercase tracking-[0.12em] text-[oklch(0.55_0.01_75)] font-medium">{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {filtered.map((t) => (
              <tr key={t.id} className="border-b border-[oklch(0.18_0.003_85)] hover:bg-[oklch(0.17_0.003_85)] transition-colors">
                <td className="px-4 py-3 text-sm font-medium text-[oklch(0.9_0.003_85)]">{t.dni}</td>
                <td className="px-4 py-3 text-sm">
                  <Link href={`/estudiantes/${t.id}`} className="text-[oklch(0.82_0.005_78)] hover:text-[oklch(0.82_0.1_82)] hover:underline transition-colors">{t.nombres}</Link>
                </td>
                <td className="px-4 py-3 text-sm text-[oklch(0.82_0.005_78)]">{t.apellidos}</td>
                <td className="px-4 py-3 text-sm text-[oklch(0.75_0.005_78)]">{t.celular||"—"}</td>
                <td className="px-4 py-3 text-sm text-[oklch(0.75_0.005_78)]">{t.correo||"—"}</td>
                <td className="px-4 py-3 text-sm text-[oklch(0.75_0.005_78)]">{t.fechaNacimiento||"—"}</td>
                <td className="px-4 py-3"><span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider ${t.estado==="activo"?"bg-[oklch(0.35_0.08_150/0.15)] text-[oklch(0.6_0.1_155)]":"bg-[oklch(0.18_0.003_85)] text-[oklch(0.42_0.008_70)]"}`}>{t.estado}</span></td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <Link href={`/estudiantes/${t.id}`} className={gh}><ArrowRight className="h-3.5 w-3.5" /></Link>
                    <button onClick={() => { setEditing(t); setOpen(true); }} className={gh}><Pencil className="h-3.5 w-3.5" /></button>
                    <button onClick={() => handleDelete(t.id, `${t.nombres} ${t.apellidos}`)} className={gh + " hover:border-[oklch(0.48_0.16_20/0.3)] hover:text-[oklch(0.62_0.12_22)]"}><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={8} className="px-4 py-8 text-center text-sm text-[oklch(0.55_0.01_75)]">No se encontraron estudiantes{hasFilters?" con los filtros aplicados":""}.</td></tr>}
          </tbody>
        </table>
      </div>
      <div className="text-xs text-[oklch(0.48_0.008_72)] mt-2">Mostrando {filtered.length} de {items.length} estudiantes</div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => { setOpen(false); setEditing(null); }}>
          <div className="w-full max-w-lg rounded-2xl border border-[oklch(0.2_0.004_80)] bg-[oklch(0.145_0.003_85)] p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <h2 className="font-heading text-xl font-semibold text-[oklch(0.92_0.003_85)] mb-5">{editing?"Editar":"Nuevo"} Estudiante</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5"><label className={L}>DNI</label><input name="dni" defaultValue={editing?.dni||""} required className={inp} /></div>
                <div className="flex flex-col gap-1.5"><label className={L}>Fecha Nacimiento</label><input name="fechaNacimiento" type="date" defaultValue={editing?.fechaNacimiento||""} className={inp} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5"><label className={L}>Nombres</label><input name="nombres" defaultValue={editing?.nombres||""} required className={inp} /></div>
                <div className="flex flex-col gap-1.5"><label className={L}>Apellidos</label><input name="apellidos" defaultValue={editing?.apellidos||""} required className={inp} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5"><label className={L}>Celular</label><input name="celular" defaultValue={editing?.celular||""} className={inp} /></div>
                <div className="flex flex-col gap-1.5"><label className={L}>Correo</label><input name="correo" type="email" defaultValue={editing?.correo||""} className={inp} /></div>
              </div>
              <div className="flex flex-col gap-1.5"><label className={L}>Dirección</label><input name="direccion" defaultValue={editing?.direccion||""} className={inp} /></div>
              {editing && <div className="flex flex-col gap-1.5"><label className={L}>Estado</label><select name="estado" defaultValue={editing.estado} className={inp}><option value="activo">Activo</option><option value="inactivo">Inactivo</option></select></div>}
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
