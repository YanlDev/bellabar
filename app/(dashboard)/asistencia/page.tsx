"use client";

import { useState, useEffect } from "react";
import { Check, Clock, X } from "lucide-react";
import { getGroups } from "@/lib/actions/grupos";
import { getEnrollments } from "@/lib/actions/matriculas";
import { getAttendanceByGroup, registerAttendance } from "@/lib/actions/asistencia";

type R = { id?: number; studentId: number; estado: string; studentName: string | null; studentLastname: string | null; studentDni: string | null };

const inp = "flex h-10 rounded-xl border border-[oklch(0.2_0.004_80)] bg-[oklch(0.18_0.003_85)] px-4 text-sm text-[oklch(0.92_0.003_85)] outline-none focus:border-[oklch(0.72_0.12_85/0.5)] transition-all";
const sel = "flex h-10 rounded-xl border border-[oklch(0.2_0.004_80)] bg-[oklch(0.18_0.003_85)] px-4 text-sm text-[oklch(0.92_0.003_85)] outline-none focus:border-[oklch(0.72_0.12_85/0.5)] transition-all";
const btn = "flex h-10 items-center justify-center gap-1.5 rounded-xl bg-[oklch(0.72_0.12_85)] px-6 text-sm font-semibold text-white transition-all hover:bg-[oklch(0.68_0.13_83)] active:scale-[0.98] cursor-pointer shadow-md shadow-[oklch(0.72_0.12_85/0.2)]";

export default function AsistenciaPage() {
  const [groups, setGroups] = useState<{id:number;codigo:string}[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null);
  const [fecha, setFecha] = useState(new Date().toISOString().split("T")[0]);
  const [records, setRecords] = useState<R[]>([]);
  const [allStudents, setAllStudents] = useState<{id:number;names:string;lastnames:string;dni:string}[]>([]);
  useEffect(() => { (async()=>setGroups(await getGroups() as {id:number;codigo:string}[]))(); }, []);

  async function loadAttendance() { if(!selectedGroup) return; setRecords(await getAttendanceByGroup(selectedGroup, fecha) as R[]); }
  async function loadStudents() {
    if(!selectedGroup) return;
    const enr = await getEnrollments();
    const ge = (enr as any[]).filter((e:any)=>e.groupId===selectedGroup);
    const seen = new Set<number>();
    const unique = ge.filter((e: any) => {
      if (seen.has(e.studentId)) return false;
      seen.add(e.studentId);
      return true;
    });
    setAllStudents(unique.map((e:any)=>({id:e.studentId,names:e.studentName||"",lastnames:e.studentLastname||"",dni:e.studentDni||""})));
    await loadAttendance();
  }
  async function mark(sid: number, estado: "presente"|"tardanza"|"falta") { if(!selectedGroup) return; await registerAttendance({groupId:selectedGroup, studentId:sid, fecha, estado}); await loadAttendance(); }
  function getState(sid: number) { return records.find(r=>r.studentId===sid)?.estado||null; }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-semibold tracking-wide text-[oklch(0.92_0.003_85)]">Asistencia</h1>
        <p className="text-sm text-[oklch(0.55_0.01_75)] mt-1">Registro de asistencia por sesión</p>
      </div>

      <div className="flex flex-wrap items-end gap-4 mb-6 rounded-2xl border border-[oklch(0.2_0.004_80)] bg-[oklch(0.145_0.003_85)] p-5">
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] uppercase tracking-wider font-medium text-[oklch(0.58_0.008_70)]">Grupo</label>
          <select value={selectedGroup||""} onChange={e=>setSelectedGroup(Number(e.target.value))} className={sel+" w-48"}><option value="">Seleccionar...</option>{groups.map(g=><option key={g.id} value={g.id}>{g.codigo}</option>)}</select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] uppercase tracking-wider font-medium text-[oklch(0.58_0.008_70)]">Fecha</label>
          <input type="date" value={fecha} onChange={e=>setFecha(e.target.value)} className={inp+" w-40"} />
        </div>
        <button onClick={loadStudents} className={btn}>Cargar</button>
      </div>

      {allStudents.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-[oklch(0.2_0.004_80)] bg-[oklch(0.145_0.003_85)]">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[oklch(0.19_0.004_80)]">
                {["DNI","Estudiante","Estado","Acción"].map(h=><th key={h} className="px-4 py-3 text-left text-[10px] uppercase tracking-[0.12em] text-[oklch(0.55_0.01_75)] font-medium">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {allStudents.map(s=>{
                const est = getState(s.id);
                const base = "flex h-9 w-9 items-center justify-center rounded-xl border text-sm cursor-pointer transition-all duration-200";
                return (
                  <tr key={s.id} className="border-b border-[oklch(0.18_0.003_85)] hover:bg-[oklch(0.17_0.003_85)] transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-[oklch(0.9_0.003_85)]">{s.dni}</td>
                    <td className="px-4 py-3 text-sm text-[oklch(0.82_0.005_78)]">{s.names} {s.lastnames}</td>
                    <td className="px-4 py-3">
                      {est && <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider ${est==="presente"?"bg-[oklch(0.35_0.08_150/0.15)] text-[oklch(0.6_0.1_155)]":est==="tardanza"?"bg-[oklch(0.35_0.08_78/0.2)] text-[oklch(0.8_0.1_82)]":"bg-[oklch(0.48_0.16_20/0.12)] text-[oklch(0.62_0.12_22)]"}`}>{est}</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={()=>mark(s.id,"presente")} className={`${base} ${est==="presente"?"bg-[oklch(0.35_0.08_150/0.15)] border-[oklch(0.35_0.08_150/0.3)] text-[oklch(0.6_0.1_155)]":"border-[oklch(0.2_0.004_80)] text-[oklch(0.48_0.008_72)] hover:border-[oklch(0.35_0.08_150/0.3)] hover:text-[oklch(0.6_0.1_155)]"}`}><Check className="h-4 w-4" /></button>
                        <button onClick={()=>mark(s.id,"tardanza")} className={`${base} ${est==="tardanza"?"bg-[oklch(0.35_0.08_78/0.2)] border-[oklch(0.35_0.08_78/0.3)] text-[oklch(0.8_0.1_82)]":"border-[oklch(0.2_0.004_80)] text-[oklch(0.48_0.008_72)] hover:border-[oklch(0.35_0.08_78/0.3)] hover:text-[oklch(0.8_0.1_82)]"}`}><Clock className="h-4 w-4" /></button>
                        <button onClick={()=>mark(s.id,"falta")} className={`${base} ${est==="falta"?"bg-[oklch(0.48_0.16_20/0.12)] border-[oklch(0.48_0.16_20/0.25)] text-[oklch(0.62_0.12_22)]":"border-[oklch(0.2_0.004_80)] text-[oklch(0.48_0.008_72)] hover:border-[oklch(0.48_0.16_20/0.25)] hover:text-[oklch(0.62_0.12_22)]"}`}><X className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
