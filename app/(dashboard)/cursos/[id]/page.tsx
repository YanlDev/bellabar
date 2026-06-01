"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import {
  ArrowLeft, Pencil, Plus, Trash2, Clock, DollarSign,
  BookOpen, Layers, Users, Calendar, UserCheck,
  CheckCircle, Sparkles, Image,
} from "lucide-react";
import {
  getCourseById, getCourseModules, getCourseGroups,
  createModule, updateModule, deleteModule as removeModule,
  updateCourse,
} from "@/lib/actions/cursos";

type Course = {
  id: number; nombre: string; descripcion: string | null;
  duracion: string | null; precio: string; estado: string;
  montoMatricula: string; modalidadPago: string; numeroCuotas: number | null;
  imagenUrl: string | null;
};
type Mod = { id: number; courseId: number; nombre: string; orden: number };
type Group = {
  id: number; codigo: string; fechaInicio: string; fechaFin: string;
  turno: string | null; vacantes: number; estado: string;
  teacherName: string | null; teacherLastname: string | null;
};

const inp = "flex h-10 w-full rounded-xl border border-[oklch(0.2_0.004_80)] bg-[oklch(0.18_0.003_85)] px-4 text-sm text-[oklch(0.92_0.003_85)] placeholder:text-[oklch(0.42_0.008_70)] outline-none focus:border-[oklch(0.72_0.12_85/0.5)] transition-all";
const btnP = "flex h-10 items-center justify-center gap-1.5 rounded-xl bg-[oklch(0.72_0.12_85)] px-5 text-sm font-semibold text-[oklch(0.15_0.003_85)] transition-all hover:bg-[oklch(0.68_0.13_83)] active:scale-[0.98] cursor-pointer shadow-md shadow-[oklch(0.72_0.12_85/0.2)]";
const btnO = "flex items-center gap-1.5 rounded-xl border border-[oklch(0.2_0.004_80)] px-4 py-2 text-sm font-medium text-[oklch(0.82_0.005_78)] transition-all hover:bg-[oklch(0.18_0.003_85)] hover:border-[oklch(0.28_0.008_78)] cursor-pointer";
const L = "text-[11px] uppercase tracking-wider font-medium text-[oklch(0.58_0.008_70)]";

export default function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const courseId = Number(id);

  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Mod[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [editOpen, setEditOpen] = useState(false);
  const [moduleOpen, setModuleOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<Mod | null>(null);
  const [selectedTab, setSelectedTab] = useState<"info"|"groups">("info");

  useEffect(() => {
    (async () => {
      const [c, m, g] = await Promise.all([getCourseById(courseId), getCourseModules(courseId), getCourseGroups(courseId)]);
      setCourse(c as Course); setModules(m as Mod[]); setGroups(g as Group[]);
    })();
  }, [courseId]);

  async function reload() {
    const [c, m, g] = await Promise.all([getCourseById(courseId), getCourseModules(courseId), getCourseGroups(courseId)]);
    setCourse(c as Course); setModules(m as Mod[]); setGroups(g as Group[]);
  }

  async function handleEditSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await updateCourse(courseId, {
      nombre: fd.get("nombre") as string,
      descripcion: fd.get("descripcion") as string || undefined,
      duracion: fd.get("duracion") as string || undefined,
      precio: Number(fd.get("precio")),
      montoMatricula: Number(fd.get("montoMatricula")) || 0,
      modalidadPago: (fd.get("modalidadPago") as "unico"|"cuotas")||"unico",
      numeroCuotas: fd.get("modalidadPago")==="cuotas" ? Number(fd.get("numeroCuotas"))||undefined : undefined,
      imagenUrl: fd.get("imagenUrl") as string || undefined,
      estado: (fd.get("estado") as "activo"|"inactivo")||"activo",
    });
    setEditOpen(false); await reload();
  }

  async function handleModuleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const d = { courseId, nombre: fd.get("nombre") as string, orden: Number(fd.get("orden")) };
    editingModule ? await updateModule(editingModule.id, d) : await createModule(d);
    setModuleOpen(false); setEditingModule(null); await reload();
  }

  if (!course) return <div className="flex items-center justify-center h-64 text-[oklch(0.55_0.01_75)]">Cargando...</div>;

  const activeGroups = groups.filter(g => g.estado === "activo").slice(0, 1);
  const teacher = activeGroups[0] ? `${activeGroups[0].teacherName} ${activeGroups[0].teacherLastname}` : null;

  return (
    <div>
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link href="/cursos" className="inline-flex items-center gap-2 text-sm text-[oklch(0.55_0.01_75)] hover:text-[oklch(0.82_0.1_82)] transition-colors">
          <ArrowLeft className="h-4 w-4" strokeWidth={1.5} /> Volver a Cursos
        </Link>
      </div>

      {/* ── HERO ── */}
      <div className="relative rounded-3xl overflow-hidden border border-[oklch(0.2_0.004_80)] bg-[oklch(0.145_0.003_85)] mb-8">
        {/* Hero background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[oklch(0.72_0.12_85/0.08)] via-transparent to-[oklch(0.35_0.07_80/0.06)]" />
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-[oklch(0.72_0.12_85/0.04)] blur-3xl -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-[oklch(0.35_0.07_80/0.04)] blur-3xl translate-y-1/3 -translate-x-1/4" />
        </div>
        {/* Decorative grid lines */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: "radial-gradient(circle, oklch(0.72 0.12 85) 1px, transparent 1px)", backgroundSize: "24px 24px" }} />

        <div className="relative p-6 md:p-8">
          {/* Edit button */}
          <div className="absolute top-4 right-4 flex gap-2">
            <button onClick={() => setEditOpen(true)} className="flex h-9 w-9 items-center justify-center rounded-xl bg-black/30 backdrop-blur-sm text-white hover:bg-black/50 transition-all cursor-pointer">
              <Pencil className="h-4 w-4" />
            </button>
          </div>

          {/* Course header */}
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <span className={`text-[10px] px-2.5 py-1 rounded-full uppercase tracking-[0.15em] font-semibold ${
                  course.estado==="activo" ? "bg-[oklch(0.35_0.08_150/0.12)] text-[oklch(0.6_0.1_155)]" : "bg-[oklch(0.18_0.003_85)] text-[oklch(0.42_0.008_70)]"
                }`}>{course.estado}</span>
                <span className="text-[10px] uppercase tracking-[0.15em] text-[oklch(0.55_0.01_75)]">
                  {course.duracion}
                </span>
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-[oklch(0.92_0.003_85)] leading-tight mb-3">
                {course.nombre}
              </h1>

              {course.descripcion && (
                <p className="text-base text-[oklch(0.65_0.008_72)] leading-relaxed mb-6">
                  {course.descripcion}
                </p>
              )}

              {/* Stats row */}
              <div className="flex flex-wrap items-center gap-6 mb-6">
                <div className="flex items-center gap-2 text-sm text-[oklch(0.75_0.005_78)]">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[oklch(0.72_0.12_85/0.1)]">
                    <Layers className="h-4 w-4 text-[oklch(0.82_0.1_82)]" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-[oklch(0.55_0.01_75)]">Módulos</p>
                    <p className="font-semibold">{modules.length}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-[oklch(0.75_0.005_78)]">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[oklch(0.35_0.07_80/0.15)]">
                    <Clock className="h-4 w-4 text-[oklch(0.8_0.1_82)]" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-[oklch(0.55_0.01_75)]">Duración</p>
                    <p className="font-semibold">{course.duracion || "—"}</p>
                  </div>
                </div>
                {teacher && (
                  <div className="flex items-center gap-2 text-sm text-[oklch(0.75_0.005_78)]">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[oklch(0.5_0.06_180/0.12)]">
                      <UserCheck className="h-4 w-4 text-teal-400" strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-[oklch(0.55_0.01_75)]">Dictado por</p>
                      <p className="font-semibold">{teacher}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Price + CTA */}
              <div className="flex items-end gap-6">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-[oklch(0.55_0.01_75)] mb-1">Inversión total</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-[oklch(0.92_0.003_85)]">S/ {Number(course.precio).toFixed(0)}</span>
                    {Number(course.montoMatricula) > 0 && (
                      <span className="text-sm text-[oklch(0.55_0.01_75)]">+ S/ {Number(course.montoMatricula).toFixed(0)} matrícula</span>
                    )}
                  </div>
                  {course.modalidadPago === "cuotas" && course.numeroCuotas && (
                    <p className="text-xs text-[oklch(0.8_0.1_82)] mt-1">
                      En {course.numeroCuotas} cuotas de S/ {((Number(course.precio) - Number(course.montoMatricula)) / course.numeroCuotas).toFixed(0)}
                    </p>
                  )}
                </div>
                <Link href="/matriculas" className={`${btnP} h-12 px-8 text-base`}>Matricular Ahora</Link>
              </div>
            </div>

            {/* Course image / placeholder */}
            <div className="w-full md:w-56 h-40 md:h-48 rounded-2xl bg-gradient-to-br from-[oklch(0.72_0.12_85/0.15)] via-[oklch(0.35_0.07_80/0.1)] to-[oklch(0.18_0.003_85)] border border-[oklch(0.2_0.004_80)] flex items-center justify-center overflow-hidden shrink-0">
              {course.imagenUrl ? (
                <img src={course.imagenUrl} alt={course.nombre} className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-2 text-[oklch(0.72_0.12_85/0.3)]">
                  <BookOpen className="h-16 w-16" strokeWidth={1} />
                  <span className="text-xs uppercase tracking-wider">Sin imagen</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Module strip at bottom of hero */}
        {modules.length > 0 && (
          <div className="relative border-t border-[oklch(0.2_0.004_80)] bg-[oklch(0.125_0.003_85)/80] backdrop-blur-sm px-8 py-4">
            <div className="flex items-center gap-6 overflow-x-auto">
              {modules.map((m, i) => (
                <div key={m.id} className="flex items-center gap-3 shrink-0">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[oklch(0.72_0.12_85/0.12)] text-xs font-bold text-[oklch(0.82_0.1_82)]">
                    {m.orden}
                  </span>
                  <span className="text-sm text-[oklch(0.82_0.005_78)] whitespace-nowrap">{m.nombre}</span>
                  {i < modules.length - 1 && (
                    <div className="h-px w-6 bg-[oklch(0.2_0.004_80)]" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── SECTION: What you'll learn ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Modules + Edit CTA */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-[oklch(0.2_0.004_80)] bg-[oklch(0.145_0.003_85)] p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-[oklch(0.92_0.003_85)]">Plan de Estudios</h2>
                <p className="text-sm text-[oklch(0.55_0.01_75)] mt-1">
                  {modules.length} módulos cuidadosamente diseñados
                </p>
              </div>
              <button onClick={() => { setEditingModule(null); setModuleOpen(true); }} className={btnO}>
                <Plus className="h-4 w-4" /> Agregar Módulo
              </button>
            </div>

            {modules.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-[oklch(0.2_0.004_80)] p-8 text-center">
                <Layers className="h-10 w-10 text-[oklch(0.32_0.004_75)] mx-auto mb-3" strokeWidth={1} />
                <p className="text-sm text-[oklch(0.55_0.01_75)]">Aún no hay módulos. Agrega el contenido del curso.</p>
                <button onClick={() => { setEditingModule(null); setModuleOpen(true); }} className={`${btnP} mt-4`}>
                  <Plus className="h-4 w-4" /> Crear primer módulo
                </button>
              </div>
            ) : (
              <div className="relative pl-6 border-l-2 border-[oklch(0.72_0.12_85/0.2)] space-y-6">
                {modules.map((m, i) => (
                  <div key={m.id} className="relative group">
                    {/* Timeline dot */}
                    <div className="absolute -left-[29px] top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[oklch(0.72_0.12_85)] text-[10px] font-bold text-[oklch(0.15_0.003_85)] ring-4 ring-[oklch(0.12_0.003_85)]">
                      {m.orden}
                    </div>
                    {/* Content */}
                    <div className="rounded-2xl bg-[oklch(0.18_0.003_85)] border border-[oklch(0.19_0.003_85)] p-5 transition-all group-hover:border-[oklch(0.24_0.005_80)]">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-[oklch(0.92_0.003_85)]">Módulo {m.orden}</h3>
                          <p className="text-base text-[oklch(0.85_0.005_78)] mt-1">{m.nombre}</p>
                          <div className="flex items-center gap-3 mt-3 text-xs text-[oklch(0.55_0.01_75)]">
                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> Sesión teórico-práctica</span>
                          </div>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => { setEditingModule(m); setModuleOpen(true); }} className="flex h-7 w-7 items-center justify-center rounded-lg text-[oklch(0.48_0.008_72)] hover:text-[oklch(0.82_0.1_82)] cursor-pointer"><Pencil className="h-3.5 w-3.5" /></button>
                          <button onClick={async () => { await removeModule(m.id); await reload(); }} className="flex h-7 w-7 items-center justify-center rounded-lg text-[oklch(0.48_0.008_72)] hover:text-[oklch(0.62_0.12_22)] cursor-pointer"><Trash2 className="h-3.5 w-3.5" /></button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right sidebar: Info */}
        <div className="space-y-4">
          {/* Pricing card */}
          <div className="rounded-2xl border border-[oklch(0.2_0.004_80)] bg-[oklch(0.145_0.003_85)] p-6">
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="h-5 w-5 text-[oklch(0.82_0.1_82)]" strokeWidth={1.5} />
              <h3 className="font-bold text-[oklch(0.92_0.003_85)]">Inversión</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-[oklch(0.55_0.01_75)]">Curso</span>
                <span className="font-semibold text-[oklch(0.92_0.003_85)]">S/ {Number(course.precio).toFixed(2)}</span>
              </div>
              {Number(course.montoMatricula) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-[oklch(0.55_0.01_75)]">Matrícula</span>
                  <span className="font-semibold text-[oklch(0.92_0.003_85)]">S/ {Number(course.montoMatricula).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm border-t border-[oklch(0.19_0.004_80)] pt-3">
                <span className="text-[oklch(0.55_0.01_75)]">Total</span>
                <span className="font-bold text-[oklch(0.82_0.1_82)]">S/ {(Number(course.precio) + Number(course.montoMatricula)).toFixed(2)}</span>
              </div>
              {course.modalidadPago === "cuotas" && course.numeroCuotas && (
                <div className="rounded-xl bg-[oklch(0.72_0.12_85/0.06)] border border-[oklch(0.72_0.12_85/0.1)] p-3 mt-3">
                  <p className="text-xs text-[oklch(0.65_0.008_72)]">
                    <span className="font-semibold text-[oklch(0.82_0.1_82)]">{course.numeroCuotas} cuotas</span> de{' '}
                    <span className="font-semibold text-[oklch(0.92_0.003_85)]">
                      S/ {((Number(course.precio) - Number(course.montoMatricula)) / course.numeroCuotas).toFixed(2)}
                    </span>
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Teacher mini-card */}
          {teacher && (
            <div className="rounded-2xl border border-[oklch(0.2_0.004_80)] bg-[oklch(0.145_0.003_85)] p-6">
              <div className="flex items-center gap-2 mb-4">
                <UserCheck className="h-5 w-5 text-[oklch(0.8_0.1_82)]" strokeWidth={1.5} />
                <h3 className="font-bold text-[oklch(0.92_0.003_85)]">Instructor</h3>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[oklch(0.72_0.12_85/0.1)] text-[oklch(0.82_0.1_82)] text-lg font-bold">
                  {teacher.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-[oklch(0.92_0.003_85)]">{teacher}</p>
                  <p className="text-xs text-[oklch(0.55_0.01_75)]">Especialista</p>
                </div>
              </div>
            </div>
          )}

          {/* Groups */}
          <div className="rounded-2xl border border-[oklch(0.2_0.004_80)] bg-[oklch(0.145_0.003_85)] p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-[oklch(0.8_0.1_82)]" strokeWidth={1.5} />
                <h3 className="font-bold text-[oklch(0.92_0.003_85)]">Grupos</h3>
              </div>
              <Link href="/grupos" className="text-xs text-[oklch(0.72_0.12_85)] hover:underline">Ver todos</Link>
            </div>
            {groups.length === 0 ? (
              <p className="text-sm text-[oklch(0.55_0.01_75)]">Sin grupos abiertos.</p>
            ) : (
              <div className="space-y-2">
                {groups.slice(0, 3).map(g => (
                  <Link key={g.id} href={`/grupos/${g.id}`}
                    className="block rounded-xl bg-[oklch(0.18_0.003_85)] border border-[oklch(0.19_0.003_85)] p-3 hover:border-[oklch(0.24_0.005_80)] transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-[oklch(0.92_0.003_85)]">{g.codigo}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        g.estado==="activo" ? "bg-[oklch(0.35_0.08_150/0.12)] text-[oklch(0.6_0.1_155)]" : "bg-[oklch(0.18_0.003_85)] text-[oklch(0.42_0.008_70)]"
                      }`}>{g.estado}</span>
                    </div>
                    <div className="text-xs text-[oklch(0.55_0.01_75)] flex items-center gap-3">
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {g.fechaInicio}</span>
                      <span>{g.vacantes} vacantes</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── EDIT DIALOG ── */}
      {editOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setEditOpen(false)}>
          <div className="w-full max-w-lg rounded-2xl border border-[oklch(0.2_0.004_80)] bg-[oklch(0.145_0.003_85)] p-6 shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-[oklch(0.92_0.003_85)] mb-5">Editar Curso</h2>
            <form onSubmit={handleEditSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5"><label className={L}>URL de Imagen</label><input name="imagenUrl" defaultValue={course.imagenUrl||""} placeholder="https://..." className={inp} /></div>
              <div className="flex flex-col gap-1.5"><label className={L}>Nombre</label><input name="nombre" defaultValue={course.nombre} required className={inp} /></div>
              <div className="flex flex-col gap-1.5"><label className={L}>Descripción</label><textarea name="descripcion" defaultValue={course.descripcion||""} rows={3} className={inp} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5"><label className={L}>Duración</label><input name="duracion" defaultValue={course.duracion||""} className={inp} /></div>
                <div className="flex flex-col gap-1.5"><label className={L}>Precio (S/)</label><input name="precio" type="number" step="0.01" defaultValue={course.precio} required className={inp} /></div>
              </div>
              <div className="flex flex-col gap-1.5"><label className={L}>Matrícula (S/)</label><input name="montoMatricula" type="number" step="0.01" defaultValue={course.montoMatricula||"0"} className={inp} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className={L}>Modalidad</label>
                  <select name="modalidadPago" defaultValue={course.modalidadPago||"unico"} className={inp}><option value="unico">Pago Único</option><option value="cuotas">En Cuotas</option></select>
                </div>
                <div className="flex flex-col gap-1.5"><label className={L}>N° Cuotas</label><input name="numeroCuotas" type="number" min="1" max="12" defaultValue={course.numeroCuotas||""} className={inp} /></div>
              </div>
              <div className="flex flex-col gap-1.5"><label className={L}>Estado</label><select name="estado" defaultValue={course.estado} className={inp}><option value="activo">Activo</option><option value="inactivo">Inactivo</option></select></div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setEditOpen(false)} className="flex-1 h-10 rounded-xl border border-[oklch(0.2_0.004_80)] text-sm text-[oklch(0.65_0.008_72)] hover:bg-[oklch(0.18_0.003_85)] transition-all cursor-pointer">Cancelar</button>
                <button type="submit" className={btnP+" flex-1"}>Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODULE DIALOG ── */}
      {moduleOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => { setModuleOpen(false); setEditingModule(null); }}>
          <div className="w-full max-w-sm rounded-2xl border border-[oklch(0.2_0.004_80)] bg-[oklch(0.145_0.003_85)] p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-[oklch(0.92_0.003_85)] mb-4">{editingModule ? "Editar Módulo" : "Nuevo Módulo"}</h2>
            <form onSubmit={handleModuleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5"><label className={L}>Nombre</label><input name="nombre" defaultValue={editingModule?.nombre||""} required className={inp} /></div>
              <div className="flex flex-col gap-1.5"><label className={L}>Orden</label><input name="orden" type="number" defaultValue={editingModule?.orden||1} required className={inp} /></div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setModuleOpen(false); setEditingModule(null); }} className="flex-1 h-10 rounded-xl border border-[oklch(0.2_0.004_80)] text-sm text-[oklch(0.65_0.008_72)] hover:bg-[oklch(0.18_0.003_85)] transition-all cursor-pointer">Cancelar</button>
                <button type="submit" className={btnP+" flex-1"}>{editingModule ? "Guardar" : "Agregar"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
