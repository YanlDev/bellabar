"use client";

import { useState, useEffect } from "react";
import { LogIn, LogOut, Clock, UserCheck } from "lucide-react";
import { getTeachers } from "@/lib/actions/docentes";
import { getTeacherAttendance, registerTeacherEntry, registerTeacherExit } from "@/lib/actions/docente-attendance";

type T = { id: number; nombres: string; apellidos: string; dni: string };
type TA = { id: number; teacherId: number; fecha: string; horaEntrada: string | null; horaSalida: string | null; observacion: string | null; teacherName: string | null; teacherLastname: string | null; teacherDni: string | null };

const inp = "flex h-10 rounded-xl border border-[oklch(0.2_0.004_80)] bg-[oklch(0.18_0.003_85)] px-4 text-sm text-[oklch(0.92_0.003_85)] outline-none focus:border-[oklch(0.72_0.12_85/0.5)] transition-all";
const btnP = "flex h-10 items-center justify-center gap-1.5 rounded-xl bg-[oklch(0.72_0.12_85)] px-4 text-sm font-semibold text-white transition-all hover:bg-[oklch(0.68_0.13_83)] active:scale-[0.98] cursor-pointer shadow-md shadow-[oklch(0.72_0.12_85/0.2)]";
const btnG = "flex items-center gap-1.5 rounded-xl border border-[oklch(0.2_0.004_80)] px-3 py-1.5 text-xs font-medium text-[oklch(0.65_0.008_72)] transition-all hover:border-[oklch(0.28_0.008_78)] hover:text-[oklch(0.82_0.008_78)] cursor-pointer";

export default function AsistenciaDocentesPage() {
  const [fecha, setFecha] = useState(new Date().toISOString().split("T")[0]);
  const [teachers, setTeachers] = useState<T[]>([]);
  const [records, setRecords] = useState<TA[]>([]);
  const [entradaOpen, setEntradaOpen] = useState(false);
  const [salidaOpen, setSalidaOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<T | null>(null);
  const [horaEntrada, setHoraEntrada] = useState(new Date().toTimeString().slice(0, 5));
  const [horaSalida, setHoraSalida] = useState(new Date().toTimeString().slice(0, 5));
  const [salidaRecord, setSalidaRecord] = useState<TA | null>(null);
  const [observacion, setObservacion] = useState("");

  useEffect(() => { loadTeachers(); }, []);
  useEffect(() => { load(); }, [fecha]);

  async function loadTeachers() { setTeachers(await getTeachers() as T[]); }
  async function load() { setRecords(await getTeacherAttendance(fecha) as TA[]); }

  async function handleEntrada(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedTeacher) return;
    await registerTeacherEntry(selectedTeacher.id, fecha, horaEntrada);
    setEntradaOpen(false); setSelectedTeacher(null);
    await load();
  }

  async function handleSalida(e: React.FormEvent) {
    e.preventDefault();
    if (!salidaRecord) return;
    await registerTeacherExit(salidaRecord.id, horaSalida, observacion || undefined);
    setSalidaOpen(false); setSalidaRecord(null); setObservacion("");
    await load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-3xl font-semibold tracking-wide text-[oklch(0.92_0.003_85)]">Asistencia Docentes</h1>
          <p className="text-sm text-[oklch(0.55_0.01_75)] mt-1">Registro de entrada y salida</p>
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-4 mb-6 rounded-2xl border border-[oklch(0.2_0.004_80)] bg-[oklch(0.145_0.003_85)] p-5">
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] uppercase tracking-wider font-medium text-[oklch(0.58_0.008_70)]">Fecha</label>
          <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} className={inp+" w-40"} />
        </div>
        <button onClick={() => { setSelectedTeacher(null); setEntradaOpen(true); }} className={btnP}>
          <LogIn className="h-4 w-4" /> Registrar Entrada
        </button>
        <button onClick={() => { setSalidaRecord(null); setSalidaOpen(true); }} className={btnG}>
          <LogOut className="h-4 w-4" /> Registrar Salida
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[oklch(0.2_0.004_80)] bg-[oklch(0.145_0.003_85)]">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[oklch(0.19_0.004_80)]">
              {["DNI","Docente","Entrada","Salida","Observación",""].map(h => <th key={h} className="px-4 py-3 text-left text-[10px] uppercase tracking-[0.12em] text-[oklch(0.55_0.01_75)] font-medium">{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {records.map(r => (
              <tr key={r.id} className="border-b border-[oklch(0.18_0.003_85)] hover:bg-[oklch(0.17_0.003_85)] transition-colors">
                <td className="px-4 py-3 text-sm font-medium text-[oklch(0.9_0.003_85)]">{r.teacherDni}</td>
                <td className="px-4 py-3 text-sm text-[oklch(0.82_0.005_78)]">{r.teacherName} {r.teacherLastname}</td>
                <td className="px-4 py-3 text-sm">
                  {r.horaEntrada ? (
                    <span className="text-[oklch(0.6_0.1_155)] font-medium">{r.horaEntrada}</span>
                  ) : (
                    <span className="text-[oklch(0.48_0.008_72)]">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm">
                  {r.horaSalida ? (
                    <span className="text-[oklch(0.8_0.1_82)] font-medium">{r.horaSalida}</span>
                  ) : (
                    <span className="text-[oklch(0.62_0.12_22)] text-xs">Pendiente</span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-[oklch(0.75_0.005_78)]">{r.observacion || "—"}</td>
                <td className="px-4 py-3">
                  {!r.horaSalida && (
                    <button onClick={() => { setSalidaRecord(r); setSalidaOpen(true); }} className={btnG + " text-[oklch(0.8_0.1_82)]"}>
                      <LogOut className="h-3.5 w-3.5" /> Salida
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {records.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-[oklch(0.55_0.01_75)]">No hay registros para esta fecha.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Entrada Dialog */}
      {entradaOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setEntradaOpen(false)}>
          <div className="w-full max-w-sm rounded-2xl border border-[oklch(0.2_0.004_80)] bg-[oklch(0.145_0.003_85)] p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <h2 className="font-heading text-lg font-semibold text-[oklch(0.92_0.003_85)] mb-4 flex items-center gap-2"><LogIn className="h-5 w-5 text-[oklch(0.6_0.1_155)]" /> Registrar Entrada</h2>
            <form onSubmit={handleEntrada} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] uppercase tracking-wider font-medium text-[oklch(0.58_0.008_70)]">Docente</label>
                <select value={selectedTeacher?.id || ""} onChange={e => setSelectedTeacher(teachers.find(t => t.id === Number(e.target.value)) || null)} className="flex h-10 w-full rounded-xl border border-[oklch(0.2_0.004_80)] bg-[oklch(0.18_0.003_85)] px-4 text-sm text-[oklch(0.92_0.003_85)] outline-none" required>
                  <option value="">Seleccionar...</option>
                  {teachers.map(t => <option key={t.id} value={t.id}>{t.dni} - {t.nombres} {t.apellidos}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] uppercase tracking-wider font-medium text-[oklch(0.58_0.008_70)]">Hora de Entrada</label>
                <input type="time" value={horaEntrada} onChange={e => setHoraEntrada(e.target.value)} className={inp} required />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setEntradaOpen(false)} className="flex-1 h-10 rounded-xl border border-[oklch(0.2_0.004_80)] text-sm text-[oklch(0.65_0.008_72)] hover:bg-[oklch(0.18_0.003_85)] transition-all cursor-pointer">Cancelar</button>
                <button type="submit" className={btnP+" flex-1"}>Registrar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Salida Dialog */}
      {salidaOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setSalidaOpen(false)}>
          <div className="w-full max-w-sm rounded-2xl border border-[oklch(0.2_0.004_80)] bg-[oklch(0.145_0.003_85)] p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <h2 className="font-heading text-lg font-semibold text-[oklch(0.92_0.003_85)] mb-4 flex items-center gap-2"><LogOut className="h-5 w-5 text-[oklch(0.8_0.1_82)]" /> Registrar Salida</h2>
            {salidaRecord ? (
              <form onSubmit={handleSalida} className="flex flex-col gap-4">
                <p className="text-sm text-[oklch(0.75_0.005_78)]">
                  {salidaRecord.teacherName} {salidaRecord.teacherLastname}
                  {salidaRecord.horaEntrada && <span className="text-[oklch(0.55_0.01_75)]"> · Entrada: {salidaRecord.horaEntrada}</span>}
                </p>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] uppercase tracking-wider font-medium text-[oklch(0.58_0.008_70)]">Hora de Salida</label>
                  <input type="time" value={horaSalida} onChange={e => setHoraSalida(e.target.value)} className={inp} required />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] uppercase tracking-wider font-medium text-[oklch(0.58_0.008_70)]">Observación</label>
                  <input value={observacion} onChange={e => setObservacion(e.target.value)} className={inp} placeholder="Opcional" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setSalidaOpen(false)} className="flex-1 h-10 rounded-xl border border-[oklch(0.2_0.004_80)] text-sm text-[oklch(0.65_0.008_72)] hover:bg-[oklch(0.18_0.003_85)] transition-all cursor-pointer">Cancelar</button>
                  <button type="submit" className={btnP+" flex-1"}>Registrar</button>
                </div>
              </form>
            ) : (
              <form onSubmit={async (e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                const tid = Number(fd.get("teacherId"));
                const recs = await getTeacherAttendance(fecha);
                const rec = (recs as TA[]).filter(r => r.teacherId === tid && !r.horaSalida);
                if (!rec.length) { alert("No hay entrada registrada para este docente hoy."); return; }
                setSalidaRecord(rec[0]);
              }}>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] uppercase tracking-wider font-medium text-[oklch(0.58_0.008_70)]">Docente</label>
                  <select name="teacherId" className="flex h-10 w-full rounded-xl border border-[oklch(0.2_0.004_80)] bg-[oklch(0.18_0.003_85)] px-4 text-sm text-[oklch(0.92_0.003_85)] outline-none" required>
                    <option value="">Seleccionar...</option>
                    {teachers.filter(t => records.some(r => r.teacherId === t.id && !r.horaSalida)).map(t => <option key={t.id} value={t.id}>{t.nombres} {t.apellidos}</option>)}
                    {teachers.filter(t => records.some(r => r.teacherId === t.id && !r.horaSalida)).length === 0 && <option disabled>No hay entradas pendientes</option>}
                  </select>
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setSalidaOpen(false)} className="flex-1 h-10 rounded-xl border border-[oklch(0.2_0.004_80)] text-sm text-[oklch(0.65_0.008_72)] hover:bg-[oklch(0.18_0.003_85)] transition-all cursor-pointer">Cancelar</button>
                  <button type="submit" className={btnP+" flex-1"}>Continuar</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
