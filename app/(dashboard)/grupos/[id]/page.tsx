"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import {
  ArrowLeft, Pencil, Users, UserCheck, Calendar,
  Clock, BookOpen, GraduationCap, DollarSign,
  AlertCircle, CreditCard, Star, Trash2,
} from "lucide-react";
import {
  getGroupDetail, getGroupEnrollments,
  getGroupAttendanceSummary, getGroupPaymentSummary,
  updateGroup,
} from "@/lib/actions/grupos";
import { deleteEnrollment } from "@/lib/actions/matriculas";
import { getCourses } from "@/lib/actions/cursos";
import { getTeachers } from "@/lib/actions/docentes";

type Detail = {
  id: number; codigo: string; courseId: number; teacherId: number;
  fechaInicio: string; fechaFin: string; turno: string | null;
  vacantes: number; estado: string;
  courseName: string | null; courseDescription: string | null; coursePrecio: string | null;
  teacherName: string | null; teacherLastname: string | null; teacherDni: string | null;
};
type Enrollment = {
  id: number; studentId: number; fechaMatricula: string;
  montoMatricula: string; montoCurso: string; estado: string;
  studentName: string | null; studentLastname: string | null;
  studentDni: string | null; studentCelular: string | null;
};
type AttSummary = { studentId: number; total: number; presentes: number; tardanzas: number; faltas: number };
type PaySummary = { enrollmentId: number; studentId: number; totalCurso: string; totalPagado: number };

const inp = "flex h-10 w-full rounded-xl border border-[oklch(0.2_0.004_80)] bg-[oklch(0.18_0.003_85)] px-4 text-sm text-[oklch(0.92_0.003_85)] outline-none focus:border-[oklch(0.72_0.12_85/0.5)] transition-all";
const sel = "flex h-10 w-full rounded-xl border border-[oklch(0.2_0.004_80)] bg-[oklch(0.18_0.003_85)] px-4 text-sm text-[oklch(0.92_0.003_85)] outline-none focus:border-[oklch(0.72_0.12_85/0.5)] transition-all";
const btnP = "flex h-10 items-center justify-center gap-1.5 rounded-xl bg-[oklch(0.72_0.12_85)] px-4 text-sm font-semibold text-white transition-all hover:bg-[oklch(0.68_0.13_83)] active:scale-[0.98] cursor-pointer shadow-md shadow-[oklch(0.72_0.12_85/0.2)]";
const L = "text-[11px] uppercase tracking-wider font-medium text-[oklch(0.58_0.008_70)]";

export default function GroupDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const groupId = Number(id);

  const [detail, setDetail] = useState<Detail | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [attendance, setAttendance] = useState<AttSummary[]>([]);
  const [payments, setPayments] = useState<PaySummary[]>([]);
  const [editOpen, setEditOpen] = useState(false);
  const [courses, setCourses] = useState<{id:number;nombre:string}[]>([]);
  const [ts, setTs] = useState<{id:number;nombres:string;apellidos:string}[]>([]);
  const [tab, setTab] = useState<"students"|"attendance"|"payments">("students");

  useEffect(() => { load(); }, [groupId]);

  async function load() {
    const [d, e, a, p, c, t] = await Promise.all([
      getGroupDetail(groupId),
      getGroupEnrollments(groupId),
      getGroupAttendanceSummary(groupId),
      getGroupPaymentSummary(groupId),
      getCourses(),
      getTeachers(),
    ]);
    setDetail(d as Detail);
    setEnrollments(e as Enrollment[]);
    setAttendance(a as AttSummary[]);
    setPayments(p as PaySummary[]);
    setCourses(c as {id:number;nombre:string}[]);
    setTs(t as {id:number;nombres:string;apellidos:string}[]);
  }

  async function handleEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await updateGroup(groupId, {
      codigo: fd.get("codigo") as string,
      courseId: Number(fd.get("courseId")),
      teacherId: Number(fd.get("teacherId")),
      fechaInicio: fd.get("fechaInicio") as string,
      fechaFin: fd.get("fechaFin") as string,
      turno: fd.get("turno") as string || undefined,
      vacantes: Number(fd.get("vacantes")),
      estado: (fd.get("estado") as "activo" | "inactivo") || "activo",
    });
    setEditOpen(false);
    await load();
  }

  async function handleUnenroll(enrollmentId: number, studentName: string) {
    if (!confirm(`¿Quitar a ${studentName} de este grupo? Se eliminarán sus pagos y notas asociados.`)) return;
    await deleteEnrollment(enrollmentId);
    await load();
  }

  function getAttForStudent(sid: number) {
    return attendance.find(a => a.studentId === sid);
  }

  function getPayForEnrollment(eid: number, sid: number) {
    return payments.find(p => p.enrollmentId === eid || p.studentId === sid);
  }

  const enrolledCount = enrollments.filter(e => e.estado === "activo").length;
  const vacantesDisponibles = (detail?.vacantes || 0) - enrolledCount;

  if (!detail) {
    return <div className="flex items-center justify-center h-64 text-[oklch(0.55_0.01_75)]">Cargando...</div>;
  }

  return (
    <div>
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link href="/grupos" className="inline-flex items-center gap-2 text-sm text-[oklch(0.55_0.01_75)] hover:text-[oklch(0.75_0.14_14)] transition-colors">
          <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
          Volver a Grupos
        </Link>
      </div>

      {/* Hero */}
      <div className="rounded-2xl border border-[oklch(0.2_0.004_80)] bg-[oklch(0.145_0.003_85)] overflow-hidden mb-6">
        <div className="h-24 bg-gradient-to-br from-[oklch(0.35_0.08_78/0.3)] via-[oklch(0.72_0.12_85/0.15)] to-[oklch(0.35_0.07_80/0.1)] relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <Users className="h-12 w-12 text-[oklch(0.82_0.1_82/0.25)]" strokeWidth={1} />
          </div>
          <div className="absolute top-4 right-4">
            <button onClick={() => setEditOpen(true)} className="flex h-9 w-9 items-center justify-center rounded-xl bg-black/30 backdrop-blur-sm text-white hover:bg-black/50 transition-all cursor-pointer">
              <Pencil className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="font-heading text-2xl font-semibold tracking-wide text-[oklch(0.92_0.003_85)]">
              {detail.codigo}
            </h1>
            <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider ${detail.estado === "activo" ? "bg-[oklch(0.35_0.08_150/0.15)] text-[oklch(0.6_0.1_155)]" : "bg-[oklch(0.18_0.003_85)] text-[oklch(0.42_0.008_70)]"}`}>{detail.estado}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="flex items-center gap-3 rounded-xl bg-[oklch(0.18_0.003_85)] border border-[oklch(0.19_0.003_85)] p-3">
              <BookOpen className="h-5 w-5 text-[oklch(0.82_0.1_82)]" strokeWidth={1.5} />
              <div>
                <p className="text-[10px] uppercase tracking-wider text-[oklch(0.48_0.008_72)]">Curso</p>
                <p className="text-sm font-medium text-[oklch(0.9_0.003_85)]">{detail.courseName}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-[oklch(0.18_0.003_85)] border border-[oklch(0.19_0.003_85)] p-3">
              <UserCheck className="h-5 w-5 text-[oklch(0.8_0.1_82)]" strokeWidth={1.5} />
              <div>
                <p className="text-[10px] uppercase tracking-wider text-[oklch(0.48_0.008_72)]">Docente</p>
                <p className="text-sm font-medium text-[oklch(0.9_0.003_85)]">{detail.teacherName} {detail.teacherLastname}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-[oklch(0.18_0.003_85)] border border-[oklch(0.19_0.003_85)] p-3">
              <GraduationCap className="h-5 w-5 text-[oklch(0.6_0.1_155)]" strokeWidth={1.5} />
              <div>
                <p className="text-[10px] uppercase tracking-wider text-[oklch(0.48_0.008_72)]">Estudiantes</p>
                <p className="text-sm font-medium text-[oklch(0.9_0.003_85)]">{enrolledCount} / {detail.vacantes} <span className="text-[10px] text-[oklch(0.48_0.008_72)]">({vacantesDisponibles > 0 ? `${vacantesDisponibles} disponibles` : "lleno"})</span></p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-3">
            <div className="flex items-center gap-2 text-xs text-[oklch(0.55_0.01_75)]">
              <Calendar className="h-3.5 w-3.5" />
              {detail.fechaInicio} — {detail.fechaFin}
            </div>
            {detail.turno && (
              <div className="flex items-center gap-2 text-xs text-[oklch(0.55_0.01_75)]">
                <Clock className="h-3.5 w-3.5" />
                {detail.turno}
              </div>
            )}
            {detail.coursePrecio && (
              <div className="flex items-center gap-2 text-xs text-[oklch(0.55_0.01_75)]">
                <DollarSign className="h-3.5 w-3.5" />
                S/ {Number(detail.coursePrecio).toFixed(2)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-[oklch(0.18_0.003_85)] rounded-xl p-1 w-fit">
        {[
          { key: "students" as const, label: "Estudiantes", icon: Users },
          { key: "attendance" as const, label: "Asistencia", icon: Clock },
          { key: "payments" as const, label: "Pagos", icon: CreditCard },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
              tab === t.key
                ? "bg-[oklch(0.145_0.003_85)] text-[oklch(0.92_0.003_85)] shadow-sm"
                : "text-[oklch(0.55_0.01_75)] hover:text-[oklch(0.82_0.005_78)]"
            }`}
          >
            <t.icon className="h-4 w-4" strokeWidth={1.5} />
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="overflow-hidden rounded-2xl border border-[oklch(0.2_0.004_80)] bg-[oklch(0.145_0.003_85)]">
        {tab === "students" && (
          <table className="w-full">
            <thead>
              <tr className="border-b border-[oklch(0.19_0.004_80)]">
                {["DNI","Estudiante","Celular","Fec. Matrícula","Estado",""].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] uppercase tracking-[0.12em] text-[oklch(0.55_0.01_75)] font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {enrollments.map(e => (
                <tr key={e.id} className="border-b border-[oklch(0.18_0.003_85)] hover:bg-[oklch(0.17_0.003_85)] transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-[oklch(0.9_0.003_85)]">{e.studentDni}</td>
                  <td className="px-4 py-3 text-sm text-[oklch(0.82_0.005_78)]">{e.studentName} {e.studentLastname}</td>
                  <td className="px-4 py-3 text-sm text-[oklch(0.75_0.005_78)]">{e.studentCelular || "—"}</td>
                  <td className="px-4 py-3 text-sm text-[oklch(0.75_0.005_78)]">{e.fechaMatricula}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      e.estado === "activo" ? "bg-[oklch(0.35_0.08_150/0.15)] text-[oklch(0.6_0.1_155)]" :
                      e.estado === "finalizado" ? "bg-[oklch(0.32_0.06_80/0.2)] text-[oklch(0.8_0.1_82)]" :
                      "bg-[oklch(0.48_0.16_20/0.12)] text-[oklch(0.62_0.12_22)]"
                    }`}>{e.estado}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Link href={`/notas`} className="flex items-center gap-1 rounded-lg border border-[oklch(0.35_0.07_80/0.3)] px-2 py-1 text-xs text-[oklch(0.8_0.1_82)] hover:bg-[oklch(0.35_0.07_80/0.1)] cursor-pointer">
                        <Star className="h-3 w-3" /> Notas
                      </Link>
                      <button
                        onClick={() => handleUnenroll(e.id, `${e.studentName} ${e.studentLastname}`)}
                        className="flex items-center gap-1 rounded-lg border border-[oklch(0.48_0.16_20/0.3)] px-2 py-1 text-xs text-[oklch(0.62_0.12_22)] hover:bg-[oklch(0.48_0.16_20/0.1)] cursor-pointer"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {enrollments.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-[oklch(0.55_0.01_75)]">No hay estudiantes matriculados.</td></tr>
              )}
            </tbody>
          </table>
        )}

        {tab === "attendance" && (
          <table className="w-full">
            <thead>
              <tr className="border-b border-[oklch(0.19_0.004_80)]">
                {["DNI","Estudiante","Sesiones","Presente","Tardanza","Falta","% Asist."].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] uppercase tracking-[0.12em] text-[oklch(0.55_0.01_75)] font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {enrollments.map(e => {
                const a = getAttForStudent(e.studentId);
                const pct = a && a.total > 0 ? ((a.presentes + a.tardanzas) / a.total * 100).toFixed(0) : null;
                return (
                  <tr key={e.id} className="border-b border-[oklch(0.18_0.003_85)] hover:bg-[oklch(0.17_0.003_85)] transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-[oklch(0.9_0.003_85)]">{e.studentDni}</td>
                    <td className="px-4 py-3 text-sm text-[oklch(0.82_0.005_78)]">{e.studentName} {e.studentLastname}</td>
                    <td className="px-4 py-3 text-sm text-[oklch(0.75_0.005_78)]">{a?.total || 0}</td>
                    <td className="px-4 py-3 text-sm text-[oklch(0.6_0.1_155)] font-medium">{a?.presentes || 0}</td>
                    <td className="px-4 py-3 text-sm text-[oklch(0.8_0.1_82)] font-medium">{a?.tardanzas || 0}</td>
                    <td className="px-4 py-3 text-sm text-[oklch(0.62_0.12_22)] font-medium">{a?.faltas || 0}</td>
                    <td className="px-4 py-3">
                      {pct !== null && (
                        <span className={`text-sm font-semibold ${Number(pct) >= 80 ? "text-[oklch(0.6_0.1_155)]" : Number(pct) >= 60 ? "text-[oklch(0.8_0.1_82)]" : "text-[oklch(0.62_0.12_22)]"}`}>
                          {pct}%
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {enrollments.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-sm text-[oklch(0.55_0.01_75)]">No hay estudiantes matriculados.</td></tr>
              )}
            </tbody>
          </table>
        )}

        {tab === "payments" && (
          <table className="w-full">
            <thead>
              <tr className="border-b border-[oklch(0.19_0.004_80)]">
                {["DNI","Estudiante","Total Curso","Pagado","Pendiente","Estado"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] uppercase tracking-[0.12em] text-[oklch(0.55_0.01_75)] font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {enrollments.map(e => {
                const p = getPayForEnrollment(e.id, e.studentId);
                const pagado = p?.totalPagado || 0;
                const total = Number(e.montoCurso);
                const pendiente = total - pagado;
                return (
                  <tr key={e.id} className="border-b border-[oklch(0.18_0.003_85)] hover:bg-[oklch(0.17_0.003_85)] transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-[oklch(0.9_0.003_85)]">{e.studentDni}</td>
                    <td className="px-4 py-3 text-sm text-[oklch(0.82_0.005_78)]">{e.studentName} {e.studentLastname}</td>
                    <td className="px-4 py-3 text-sm text-[oklch(0.75_0.005_78)]">S/ {total.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm text-[oklch(0.6_0.1_155)] font-medium">S/ {pagado.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm font-medium">
                      <span className={pendiente > 0 ? "text-[oklch(0.62_0.12_22)]" : "text-[oklch(0.6_0.1_155)]"}>
                        S/ {pendiente.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        pendiente <= 0 ? "bg-[oklch(0.35_0.08_150/0.15)] text-[oklch(0.6_0.1_155)]" :
                        "bg-[oklch(0.35_0.07_80/0.2)] text-[oklch(0.8_0.1_82)]"
                      }`}>{pendiente <= 0 ? "Pagado" : "Pendiente"}</span>
                    </td>
                  </tr>
                );
              })}
              {enrollments.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-[oklch(0.55_0.01_75)]">No hay estudiantes matriculados.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Edit Dialog */}
      {editOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setEditOpen(false)}>
          <div className="w-full max-w-lg rounded-2xl border border-[oklch(0.2_0.004_80)] bg-[oklch(0.145_0.003_85)] p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <h2 className="font-heading text-xl font-semibold text-[oklch(0.92_0.003_85)] mb-5">Editar Grupo</h2>
            <form onSubmit={handleEdit} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5"><label className={L}>Código</label><input name="codigo" defaultValue={detail.codigo} required className={inp} /></div>
                <div className="flex flex-col gap-1.5"><label className={L}>Turno</label><input name="turno" defaultValue={detail.turno || ""} className={inp} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5"><label className={L}>Curso</label><select name="courseId" defaultValue={detail.courseId} className={sel} required><option value="">Seleccionar...</option>{courses.map(c=><option key={c.id} value={c.id}>{c.nombre}</option>)}</select></div>
                <div className="flex flex-col gap-1.5"><label className={L}>Docente</label><select name="teacherId" defaultValue={detail.teacherId} className={sel} required><option value="">Seleccionar...</option>{ts.map(t=><option key={t.id} value={t.id}>{t.nombres} {t.apellidos}</option>)}</select></div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5"><label className={L}>Inicio</label><input name="fechaInicio" type="date" defaultValue={detail.fechaInicio} required className={inp} /></div>
                <div className="flex flex-col gap-1.5"><label className={L}>Fin</label><input name="fechaFin" type="date" defaultValue={detail.fechaFin} required className={inp} /></div>
                <div className="flex flex-col gap-1.5"><label className={L}>Vacantes</label><input name="vacantes" type="number" defaultValue={detail.vacantes} required className={inp} /></div>
              </div>
              <div className="flex flex-col gap-1.5"><label className={L}>Estado</label><select name="estado" defaultValue={detail.estado} className={sel}><option value="activo">Activo</option><option value="inactivo">Inactivo</option></select></div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setEditOpen(false)} className="flex-1 h-10 rounded-xl border border-[oklch(0.2_0.004_80)] text-sm text-[oklch(0.65_0.008_72)] hover:bg-[oklch(0.18_0.003_85)] transition-all cursor-pointer">Cancelar</button>
                <button type="submit" className={btnP+" flex-1"}>Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
