"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import {
  ArrowLeft, Pencil, Mail, Phone, MapPin, Calendar,
  GraduationCap, BookOpen, DollarSign, CreditCard,
  Star, CheckCircle, Clock, AlertCircle, Layers, Trash2,
} from "lucide-react";
import { getStudentById, getStudentEnrollments, getStudentGrades, getStudentPayments, updateStudent } from "@/lib/actions/estudiantes";
import { deleteEnrollment } from "@/lib/actions/matriculas";

type Student = {
  id: number; dni: string; nombres: string; apellidos: string;
  celular: string | null; correo: string | null; direccion: string | null;
  fechaNacimiento: string | null; estado: string;
};

type Enr = {
  id: number; groupId: number; fechaMatricula: string;
  montoCurso: string; montoMatricula: string; estado: string;
  groupCodigo: string | null; courseName: string | null; courseId: number | null;
  totalPagado: number;
};

type Grade = {
  enrollmentId: number; moduleId: number; nota: string;
  moduleName: string | null; moduleOrder: number | null;
  groupCodigo: string | null; courseName: string | null;
};

type Pay = {
  id: number; enrollmentId: number; fechaPago: string;
  monto: string; metodoPago: string | null; observacion: string | null;
  groupCodigo: string | null; courseName: string | null;
};

const inp = "flex h-10 w-full rounded-xl border border-[oklch(0.2_0.004_80)] bg-[oklch(0.18_0.003_85)] px-4 text-sm text-[oklch(0.92_0.003_85)] outline-none focus:border-[oklch(0.72_0.12_85/0.5)] transition-all";
const btnP = "flex h-10 items-center justify-center gap-1.5 rounded-xl bg-[oklch(0.72_0.12_85)] px-4 text-sm font-semibold text-[oklch(0.15_0.003_85)] transition-all hover:bg-[oklch(0.68_0.13_83)] active:scale-[0.98] cursor-pointer shadow-md shadow-[oklch(0.72_0.12_85/0.2)]";
const L = "text-[11px] uppercase tracking-wider font-medium text-[oklch(0.58_0.008_70)]";

export default function StudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const sid = Number(id);

  const [student, setStudent] = useState<Student | null>(null);
  const [enrollments, setEnrollments] = useState<Enr[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [pays, setPays] = useState<Pay[]>([]);
  const [tab, setTab] = useState<"enrollments"|"grades"|"payments">("enrollments");
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => { load(); }, [sid]);

  async function load() {
    const [s, e, g, p] = await Promise.all([
      getStudentById(sid),
      getStudentEnrollments(sid),
      getStudentGrades(sid),
      getStudentPayments(sid),
    ]);
    setStudent(s as Student);
    setEnrollments(e as Enr[]);
    setGrades(g as Grade[]);
    setPays(p as Pay[]);
  }

  async function handleEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await updateStudent(sid, {
      dni: fd.get("dni") as string,
      nombres: fd.get("nombres") as string,
      apellidos: fd.get("apellidos") as string,
      celular: fd.get("celular") as string || undefined,
      correo: fd.get("correo") as string || undefined,
      direccion: fd.get("direccion") as string || undefined,
      fechaNacimiento: fd.get("fechaNacimiento") as string || undefined,
      estado: (fd.get("estado") as "activo"|"inactivo")||"activo",
    });
    setEditOpen(false);
    await load();
  }

  async function handleUnenroll(enrollmentId: number, courseName: string) {
    if (!confirm(`¿Quitar matrícula de "${courseName}"? Se eliminarán pagos y notas asociados.`)) return;
    await deleteEnrollment(enrollmentId);
    await load();
  }

  if (!student) return <div className="flex items-center justify-center h-64 text-[oklch(0.55_0.01_75)]">Cargando...</div>;

  return (
    <div>
      <div className="mb-6">
        <Link href="/estudiantes" className="inline-flex items-center gap-2 text-sm text-[oklch(0.55_0.01_75)] hover:text-[oklch(0.82_0.1_82)] transition-colors">
          <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
          Volver a Estudiantes
        </Link>
      </div>

      {/* Hero */}
      <div className="rounded-2xl border border-[oklch(0.2_0.004_80)] bg-[oklch(0.145_0.003_85)] overflow-hidden mb-6">
        <div className="h-20 bg-gradient-to-br from-[oklch(0.72_0.12_85/0.15)] via-[oklch(0.35_0.07_80/0.1)] to-[oklch(0.28_0.04_270/0.1)] relative">
          <div className="absolute top-4 right-4">
            <button onClick={() => setEditOpen(true)} className="flex h-9 w-9 items-center justify-center rounded-xl bg-black/30 backdrop-blur-sm text-white hover:bg-black/50 transition-all cursor-pointer">
              <Pencil className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[oklch(0.72_0.12_85/0.1)] text-[oklch(0.82_0.1_82)] text-2xl font-bold">
              {student.nombres[0]}{student.apellidos[0]}
            </div>
            <div>
              <h1 className="text-xl font-semibold text-[oklch(0.92_0.003_85)]">
                {student.nombres} {student.apellidos}
              </h1>
              <div className="flex items-center gap-4 mt-1 text-xs text-[oklch(0.55_0.01_75)]">
                <span>DNI: {student.dni}</span>
                {student.celular && <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {student.celular}</span>}
                {student.correo && <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {student.correo}</span>}
                {student.fechaNacimiento && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {student.fechaNacimiento}</span>}
              </div>
              {student.direccion && (
                <p className="flex items-center gap-1 text-xs text-[oklch(0.55_0.01_75)] mt-1"><MapPin className="h-3 w-3" /> {student.direccion}</p>
              )}
            </div>
          </div>
          <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider ${student.estado==="activo"?"bg-[oklch(0.35_0.08_150/0.12)] text-[oklch(0.6_0.1_155)]":"bg-[oklch(0.18_0.003_85)] text-[oklch(0.42_0.008_70)]"}`}>
            {student.estado}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-[oklch(0.18_0.003_85)] rounded-xl p-1 w-fit">
        {[
          { key: "enrollments" as const, label: "Matrículas", icon: BookOpen },
          { key: "grades" as const, label: "Notas", icon: Star },
          { key: "payments" as const, label: "Pagos", icon: CreditCard },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
              tab===t.key ? "bg-[oklch(0.145_0.003_85)] text-[oklch(0.92_0.003_85)] shadow-sm" : "text-[oklch(0.55_0.01_75)] hover:text-[oklch(0.85_0.005_78)]"
            }`}>
            <t.icon className="h-4 w-4" strokeWidth={1.5} /> {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="overflow-hidden rounded-2xl border border-[oklch(0.2_0.004_80)] bg-[oklch(0.145_0.003_85)]">
        {tab === "enrollments" && (
          <table className="w-full">
            <thead><tr className="border-b border-[oklch(0.19_0.004_80)]">
              {["Curso","Grupo","Fecha","Monto Curso","Monto Mat.","Pagado","Pendiente","Estado",""].map(h=><th key={h} className="px-4 py-3 text-left text-[10px] uppercase tracking-[0.12em] text-[oklch(0.55_0.01_75)] font-medium">{h}</th>)}
            </tr></thead>
            <tbody>
              {enrollments.map(e=>{
                const montoCurso = Number(e.montoCurso);
                const pagado = Number(e.totalPagado || 0);
                const pendiente = montoCurso + Number(e.montoMatricula) - pagado;
                return (
                  <tr key={e.id} className="border-b border-[oklch(0.18_0.003_85)] hover:bg-[oklch(0.17_0.003_85)] transition-colors">
                    <td className="px-4 py-3 text-sm text-[oklch(0.85_0.005_78)]">{e.courseName||"—"}</td>
                    <td className="px-4 py-3 text-sm font-medium">{e.groupCodigo ? <Link href={`/grupos/${e.groupId}`} className="text-[oklch(0.82_0.1_82)] hover:underline">{e.groupCodigo}</Link> : "—"}</td>
                    <td className="px-4 py-3 text-sm text-[oklch(0.75_0.005_78)]">{e.fechaMatricula}</td>
                    <td className="px-4 py-3 text-sm text-[oklch(0.75_0.005_78)]">S/ {montoCurso.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm text-[oklch(0.75_0.005_78)]">S/ {Number(e.montoMatricula).toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm text-[oklch(0.6_0.1_155)]">S/ {Number(e.totalPagado || 0).toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm font-medium"><span className={pendiente>0?"text-[oklch(0.62_0.12_22)]":"text-[oklch(0.6_0.1_155)]"}>S/ {pendiente.toFixed(2)}</span></td>
                    <td className="px-4 py-3"><span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider ${e.estado==="activo"?"bg-[oklch(0.35_0.08_150/0.12)] text-[oklch(0.6_0.1_155)]":"bg-[oklch(0.18_0.003_85)] text-[oklch(0.42_0.008_70)]"}`}>{e.estado}</span></td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleUnenroll(e.id, e.courseName || "este curso")}
                        className="flex items-center gap-1 rounded-lg border border-[oklch(0.48_0.16_20/0.3)] px-2 py-1 text-xs text-[oklch(0.62_0.12_22)] hover:bg-[oklch(0.48_0.16_20/0.1)] cursor-pointer"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {enrollments.length===0&&<tr><td colSpan={9} className="px-4 py-8 text-center text-sm text-[oklch(0.55_0.01_75)]">Sin matrículas.</td></tr>}
            </tbody>
          </table>
        )}

        {tab === "grades" && (
          <table className="w-full">
            <thead><tr className="border-b border-[oklch(0.19_0.004_80)]">
              {["Curso","Grupo","Módulo","Nota",""].map(h=><th key={h} className="px-4 py-3 text-left text-[10px] uppercase tracking-[0.12em] text-[oklch(0.55_0.01_75)] font-medium">{h}</th>)}
            </tr></thead>
            <tbody>
              {grades.map(g=>(
                <tr key={`${g.enrollmentId}-${g.moduleId}`} className="border-b border-[oklch(0.18_0.003_85)] hover:bg-[oklch(0.17_0.003_85)] transition-colors">
                  <td className="px-4 py-3 text-sm text-[oklch(0.85_0.005_78)]">{g.courseName||"—"}</td>
                  <td className="px-4 py-3 text-sm text-[oklch(0.75_0.005_78)]">{g.groupCodigo||"—"}</td>
                  <td className="px-4 py-3 text-sm text-[oklch(0.85_0.005_78)]">{g.moduleOrder}. {g.moduleName}</td>
                  <td className="px-4 py-3 text-sm font-semibold"><span className={Number(g.nota)>=14?"text-[oklch(0.6_0.1_155)]":"text-[oklch(0.62_0.12_22)]"}>{Number(g.nota).toFixed(0)}</span></td>
                  <td className="px-4 py-3"><span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider ${Number(g.nota)>=14?"bg-[oklch(0.35_0.08_150/0.12)] text-[oklch(0.6_0.1_155)]":"bg-[oklch(0.62_0.12_22/0.12)] text-[oklch(0.62_0.12_22)]"}`}>{Number(g.nota)>=14?"Aprobado":"Desaprobado"}</span></td>
                </tr>
              ))}
              {grades.length===0&&<tr><td colSpan={4} className="px-4 py-8 text-center text-sm text-[oklch(0.55_0.01_75)]">Sin notas registradas.</td></tr>}
            </tbody>
          </table>
        )}

        {tab === "payments" && (
          <table className="w-full">
            <thead><tr className="border-b border-[oklch(0.19_0.004_80)]">
              {["Curso","Grupo","Fecha","Monto","Método","Observación"].map(h=><th key={h} className="px-4 py-3 text-left text-[10px] uppercase tracking-[0.12em] text-[oklch(0.55_0.01_75)] font-medium">{h}</th>)}
            </tr></thead>
            <tbody>
              {pays.map(p=>(
                <tr key={p.id} className="border-b border-[oklch(0.18_0.003_85)] hover:bg-[oklch(0.17_0.003_85)] transition-colors">
                  <td className="px-4 py-3 text-sm text-[oklch(0.85_0.005_78)]">{p.courseName||"—"}</td>
                  <td className="px-4 py-3 text-sm text-[oklch(0.75_0.005_78)]">{p.groupCodigo||"—"}</td>
                  <td className="px-4 py-3 text-sm text-[oklch(0.75_0.005_78)]">{p.fechaPago}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-[oklch(0.6_0.1_155)]">S/ {Number(p.monto).toFixed(2)}</td>
                  <td className="px-4 py-3 text-sm text-[oklch(0.75_0.005_78)]">{p.metodoPago||"—"}</td>
                  <td className="px-4 py-3 text-sm text-[oklch(0.75_0.005_78)]">{p.observacion||"—"}</td>
                </tr>
              ))}
              {pays.length===0&&<tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-[oklch(0.55_0.01_75)]">Sin pagos registrados.</td></tr>}
            </tbody>
          </table>
        )}
      </div>

      {/* Edit Dialog */}
      {editOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={()=>setEditOpen(false)}>
          <div className="w-full max-w-lg rounded-2xl border border-[oklch(0.2_0.004_80)] bg-[oklch(0.145_0.003_85)] p-6 shadow-2xl" onClick={e=>e.stopPropagation()}>
            <h2 className="text-xl font-semibold text-[oklch(0.92_0.003_85)] mb-5">Editar Estudiante</h2>
            <form onSubmit={handleEdit} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5"><label className={L}>DNI</label><input name="dni" defaultValue={student.dni} required className={inp}/></div>
                <div className="flex flex-col gap-1.5"><label className={L}>Fecha Nac.</label><input name="fechaNacimiento" type="date" defaultValue={student.fechaNacimiento||""} className={inp}/></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5"><label className={L}>Nombres</label><input name="nombres" defaultValue={student.nombres} required className={inp}/></div>
                <div className="flex flex-col gap-1.5"><label className={L}>Apellidos</label><input name="apellidos" defaultValue={student.apellidos} required className={inp}/></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5"><label className={L}>Celular</label><input name="celular" defaultValue={student.celular||""} className={inp}/></div>
                <div className="flex flex-col gap-1.5"><label className={L}>Correo</label><input name="correo" type="email" defaultValue={student.correo||""} className={inp}/></div>
              </div>
              <div className="flex flex-col gap-1.5"><label className={L}>Dirección</label><input name="direccion" defaultValue={student.direccion||""} className={inp}/></div>
              <div className="flex flex-col gap-1.5"><label className={L}>Estado</label><select name="estado" defaultValue={student.estado} className={inp}><option value="activo">Activo</option><option value="inactivo">Inactivo</option></select></div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={()=>setEditOpen(false)} className="flex-1 h-10 rounded-xl border border-[oklch(0.2_0.004_80)] text-sm text-[oklch(0.65_0.008_72)] hover:bg-[oklch(0.18_0.003_85)] transition-all cursor-pointer">Cancelar</button>
                <button type="submit" className={btnP+" flex-1"}>Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
