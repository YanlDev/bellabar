"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Pencil, Clock, DollarSign, BookOpen, Layers, ArrowRight, Trash2 } from "lucide-react";
import { getCourses, createCourse, updateCourse, deleteCourse } from "@/lib/actions/cursos";

type Course = { id: number; nombre: string; descripcion: string | null; duracion: string | null; precio: string; estado: string; montoMatricula: string; modalidadPago: string; numeroCuotas: number | null };

const inp = "flex h-10 w-full rounded-xl border border-[oklch(0.2_0.004_80)] bg-[oklch(0.18_0.003_85)] px-4 text-sm text-[oklch(0.92_0.003_85)] placeholder:text-[oklch(0.42_0.008_70)] outline-none focus:border-[oklch(0.72_0.12_85/0.5)] transition-all";
const btn = "flex h-10 items-center justify-center gap-1.5 rounded-xl bg-[oklch(0.72_0.12_85)] px-4 text-sm font-semibold text-white transition-all hover:bg-[oklch(0.68_0.13_83)] active:scale-[0.98] cursor-pointer shadow-md shadow-[oklch(0.72_0.12_85/0.2)]";
const L = "text-[11px] uppercase tracking-wider font-medium text-[oklch(0.58_0.008_70)]";

export default function CursosPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [editing, setEditing] = useState<Course | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() { setCourses(await getCourses() as Course[]); }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const d = { nombre: fd.get("nombre") as string, descripcion: fd.get("descripcion") as string || undefined, duracion: fd.get("duracion") as string || undefined, precio: Number(fd.get("precio")), montoMatricula: Number(fd.get("montoMatricula")) || 0, modalidadPago: (fd.get("modalidadPago") as "unico" | "cuotas") || "unico", numeroCuotas: fd.get("modalidadPago") === "cuotas" ? Number(fd.get("numeroCuotas")) || undefined : undefined };
    editing ? await updateCourse(editing.id, { ...d, estado: (fd.get("estado") as "activo"|"inactivo")||"activo" }) : await createCourse(d);
    setOpen(false); setEditing(null); await load();
  }

  async function handleDelete(id: number, name: string) {
    if (!confirm(`¿Eliminar el curso "${name}"?`)) return;
    const r = await deleteCourse(id);
    if (r.error) { alert(r.error); return; }
    await load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-3xl font-semibold tracking-wide text-[oklch(0.92_0.003_85)]">Cursos</h1>
          <p className="text-sm text-[oklch(0.55_0.01_75)] mt-1">Explora la oferta académica</p>
        </div>
        <button onClick={() => { setEditing(null); setOpen(true); }} className={btn}>
          <Plus className="h-4 w-4" /> Nuevo Curso
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.map((course) => (
          <Link
            key={course.id}
            href={`/cursos/${course.id}`}
            className="group relative overflow-hidden rounded-2xl border border-[oklch(0.2_0.004_80)] bg-[oklch(0.145_0.003_85)] p-5 transition-all duration-300 hover:border-[oklch(0.24_0.005_80)] hover:shadow-xl hover:shadow-black/30 hover:-translate-y-0.5"
          >
            {/* Decorative top accent */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[oklch(0.72_0.12_85)] to-[oklch(0.35_0.07_80)] opacity-80 group-hover:opacity-100 transition-opacity" />

            <div className="flex items-start justify-between mt-1">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[oklch(0.72_0.12_85/0.1)] group-hover:bg-[oklch(0.72_0.12_85/0.15)] transition-colors">
                <BookOpen className="h-6 w-6 text-[oklch(0.82_0.1_82)]" strokeWidth={1.5} />
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  course.estado === "activo"
                    ? "bg-[oklch(0.35_0.08_150/0.15)] text-[oklch(0.6_0.1_155)]"
                    : "bg-[oklch(0.18_0.003_85)] text-[oklch(0.42_0.008_70)]"
                }`}>{course.estado}</span>
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setEditing(course); setOpen(true); }}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-[oklch(0.2_0.004_80)] text-[oklch(0.48_0.008_72)] transition-all hover:border-[oklch(0.28_0.008_78)] hover:text-[oklch(0.82_0.008_78)] opacity-0 group-hover:opacity-100 cursor-pointer"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(course.id, course.nombre); }}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-[oklch(0.2_0.004_80)] text-[oklch(0.48_0.008_72)] transition-all hover:border-[oklch(0.48_0.16_20/0.3)] hover:text-[oklch(0.62_0.12_22)] opacity-0 group-hover:opacity-100 cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="mt-4">
              <h3 className="font-heading text-lg font-semibold text-[oklch(0.92_0.003_85)] group-hover:text-[oklch(0.85_0.09_82)] transition-colors">
                {course.nombre}
              </h3>
              {course.descripcion && (
                <p className="text-sm text-[oklch(0.58_0.008_70)] mt-1 line-clamp-2">{course.descripcion}</p>
              )}
            </div>

            <div className="mt-4 flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-4 text-xs text-[oklch(0.55_0.01_75)]">
                {course.duracion && (
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" strokeWidth={1.5} />
                    {course.duracion}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <DollarSign className="h-3.5 w-3.5" strokeWidth={1.5} />
                  S/ {Number(course.precio).toFixed(2)}
                </span>
              </div>
              {Number(course.montoMatricula) > 0 && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[oklch(0.35_0.07_80/0.15)] text-[oklch(0.8_0.1_82)]">
                  Matrícula S/ {Number(course.montoMatricula).toFixed(0)}
                </span>
              )}
              {course.modalidadPago === "cuotas" && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[oklch(0.28_0.04_270/0.15)] text-[oklch(0.72_0.08_280)]">
                  {course.numeroCuotas} cuotas
                </span>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-[oklch(0.19_0.004_80)] flex items-center justify-between">
              <span className="flex items-center gap-1 text-xs text-[oklch(0.55_0.01_75)]">
                <Layers className="h-3.5 w-3.5" strokeWidth={1.5} />
                Ver detalles
              </span>
              <ArrowRight className="h-4 w-4 text-[oklch(0.48_0.008_72)] group-hover:text-[oklch(0.82_0.1_82)] group-hover:translate-x-0.5 transition-all" strokeWidth={1.5} />
            </div>
          </Link>
        ))}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => { setOpen(false); setEditing(null); }}>
          <div className="w-full max-w-md rounded-2xl border border-[oklch(0.2_0.004_80)] bg-[oklch(0.145_0.003_85)] p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <h2 className="font-heading text-xl font-semibold text-[oklch(0.92_0.003_85)] mb-5">{editing ? "Editar Curso" : "Nuevo Curso"}</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5"><label className={L}>Nombre</label><input name="nombre" defaultValue={editing?.nombre||""} required className={inp} /></div>
              <div className="flex flex-col gap-1.5"><label className={L}>Descripción</label><input name="descripcion" defaultValue={editing?.descripcion||""} className={inp} /></div>
              <div className="flex flex-col gap-1.5"><label className={L}>Duración</label><input name="duracion" defaultValue={editing?.duracion||""} placeholder="ej. 4 módulos" className={inp} /></div>
              <div className="flex flex-col gap-1.5"><label className={L}>Precio (S/)</label><input name="precio" type="number" step="0.01" defaultValue={editing?.precio||"0"} required className={inp} /></div>
              <div className="flex flex-col gap-1.5"><label className={L}>Matrícula (S/)</label><input name="montoMatricula" type="number" step="0.01" defaultValue={editing?.montoMatricula||"0"} className={inp} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className={L}>Modalidad de Pago</label>
                  <select name="modalidadPago" defaultValue={editing?.modalidadPago||"unico"} className={inp}>
                    <option value="unico">Pago Único</option>
                    <option value="cuotas">En Cuotas</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className={L}>N° de Cuotas</label>
                  <input name="numeroCuotas" type="number" min="1" max="12" defaultValue={editing?.numeroCuotas||""} placeholder="Ej: 3" className={inp} />
                </div>
              </div>
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
