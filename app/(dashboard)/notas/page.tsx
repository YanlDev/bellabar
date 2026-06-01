"use client";

import { useState, useEffect } from "react";
import { Star, Save } from "lucide-react";
import { getGroups } from "@/lib/actions/grupos";
import { getGradesByGroup, getGradesByEnrollment, getModulesByEnrollment, upsertGrade } from "@/lib/actions/notas";

type SI = { enrollmentId: number; studentName: string | null; studentLastname: string | null; studentDni: string | null };
type M = { id: number; nombre: string; orden: number };
type G = { id: number; moduleId: number; nota: string; moduleName: string | null; moduleOrder: number | null };

const inp = "flex h-10 w-full rounded-xl border border-[oklch(0.2_0.004_80)] bg-[oklch(0.18_0.003_85)] px-4 text-sm text-[oklch(0.92_0.003_85)] outline-none focus:border-[oklch(0.72_0.12_85/0.5)] transition-all";
const sel = "flex h-10 rounded-xl border border-[oklch(0.2_0.004_80)] bg-[oklch(0.18_0.003_85)] px-4 text-sm text-[oklch(0.92_0.003_85)] outline-none focus:border-[oklch(0.72_0.12_85/0.5)] transition-all";
const btn = "flex h-10 items-center justify-center gap-1.5 rounded-xl bg-[oklch(0.72_0.12_85)] px-6 text-sm font-semibold text-white transition-all hover:bg-[oklch(0.68_0.13_83)] active:scale-[0.98] cursor-pointer shadow-md shadow-[oklch(0.72_0.12_85/0.2)]";

export default function NotasPage() {
  const [groups, setGroups] = useState<{id:number;codigo:string}[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null);
  const [students, setStudents] = useState<SI[]>([]);
  const [modules, setModules] = useState<M[]>([]);
  const [grades, setGrades] = useState<Record<number,G[]>>({});
  const [selStudent, setSelStudent] = useState<SI | null>(null);
  const [sGrades, setSGrades] = useState<G[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [gVals, setGVals] = useState<Record<number,number>>({});
  useEffect(() => { (async()=>setGroups(await getGroups() as any[]))(); }, []);

  async function load() {
    if(!selectedGroup) return;
    const d = await getGradesByGroup(selectedGroup);
    setStudents(d as SI[]);
    const em = await getModulesByEnrollment((d as SI[])[0]?.enrollmentId||0);
    setModules(em as M[]);
    const gm: Record<number,G[]> = {};
    for(const s of d as SI[]) gm[s.enrollmentId] = await getGradesByEnrollment(s.enrollmentId) as G[];
    setGrades(gm);
  }

  async function openStudent(s: SI) {
    setSelStudent(s);
    const g = await getGradesByEnrollment(s.enrollmentId);
    setSGrades(g as G[]);
    const em = await getModulesByEnrollment(s.enrollmentId);
    setModules(em as M[]);
    const vs: Record<number,number> = {};
    (g as G[]).forEach(gr=>{vs[gr.moduleId]=Number(gr.nota);});
    setGVals(vs);
    setDialogOpen(true);
  }

  async function save() {
    if(!selStudent) return;
    for(const m of modules) { if(gVals[m.id]!==undefined) await upsertGrade({enrollmentId:selStudent.enrollmentId,moduleId:m.id,nota:gVals[m.id]}); }
    setDialogOpen(false); await load();
  }

  function promedio(g: G[]) { if(g.length===0) return "-"; return (g.reduce((a,gr)=>a+Number(gr.nota),0)/g.length).toFixed(1); }

  return (
    <div>
      <div className="mb-8"><h1 className="font-heading text-3xl font-semibold tracking-wide text-[oklch(0.92_0.003_85)]">Calificaciones</h1><p className="text-sm text-[oklch(0.55_0.01_75)] mt-1">Notas por módulo</p></div>

      <div className="flex items-end gap-4 mb-6 rounded-2xl border border-[oklch(0.2_0.004_80)] bg-[oklch(0.145_0.003_85)] p-5">
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] uppercase tracking-wider font-medium text-[oklch(0.58_0.008_70)]">Grupo</label>
          <select value={selectedGroup||""} onChange={e=>setSelectedGroup(Number(e.target.value))} className={sel+" w-48"}><option value="">Seleccionar...</option>{groups.map(g=><option key={g.id} value={g.id}>{g.codigo}</option>)}</select>
        </div>
        <button onClick={load} className={btn}>Cargar</button>
      </div>

      {students.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-[oklch(0.2_0.004_80)] bg-[oklch(0.145_0.003_85)]">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[oklch(0.19_0.004_80)]">
                {["DNI","Estudiante",...modules.map(m=>m.nombre),"Promedio",""].map((h,i)=><th key={i} className="px-4 py-3 text-left text-[10px] uppercase tracking-[0.12em] text-[oklch(0.55_0.01_75)] font-medium">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {students.map(s=>{
                const g = grades[s.enrollmentId]||[];
                const prom = promedio(g);
                return (
                  <tr key={s.enrollmentId} className="border-b border-[oklch(0.18_0.003_85)] hover:bg-[oklch(0.17_0.003_85)] transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-[oklch(0.9_0.003_85)]">{s.studentDni}</td>
                    <td className="px-4 py-3 text-sm text-[oklch(0.82_0.005_78)]">{s.studentName} {s.studentLastname}</td>
                    {modules.map(m=>{const gr=g.find(x=>x.moduleId===m.id);return <td key={m.id} className="px-4 py-3 text-sm text-center text-[oklch(0.82_0.005_78)]">{gr?Number(gr.nota).toFixed(0):"—"}</td>})}
                    <td className={`px-4 py-3 text-sm text-center font-semibold ${Number(prom)>=14?"text-[oklch(0.6_0.1_155)]":Number(prom)>0?"text-[oklch(0.62_0.12_22)]":"text-[oklch(0.55_0.01_75)]"}`}>{prom}</td>
                    <td className="px-4 py-3"><button onClick={()=>openStudent(s)} className="flex items-center gap-1 rounded-xl border border-[oklch(0.35_0.07_80/0.3)] px-2 py-1.5 text-xs text-[oklch(0.8_0.1_82)] hover:bg-[oklch(0.35_0.07_80/0.1)] cursor-pointer"><Star className="h-3.5 w-3.5" /> Notas</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {dialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={()=>setDialogOpen(false)}>
          <div className="w-full max-w-sm rounded-2xl border border-[oklch(0.2_0.004_80)] bg-[oklch(0.145_0.003_85)] p-6 shadow-2xl" onClick={e=>e.stopPropagation()}>
            <h2 className="font-heading text-lg font-semibold text-[oklch(0.92_0.003_85)] mb-4">Notas: {selStudent?.studentName}</h2>
            <div className="space-y-3">
              {modules.map(m=>(<div key={m.id} className="flex items-center gap-3"><label className="text-xs text-[oklch(0.72_0.005_78)] w-28">{m.nombre}</label><input type="number" step="0.01" min="0" max="20" value={gVals[m.id]??""} onChange={e=>setGVals({...gVals,[m.id]:Number(e.target.value)})} className={inp+" w-24"} /></div>))}
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={()=>setDialogOpen(false)} className="flex-1 h-10 rounded-xl border border-[oklch(0.2_0.004_80)] text-sm text-[oklch(0.65_0.008_72)] hover:bg-[oklch(0.18_0.003_85)] transition-all cursor-pointer">Cancelar</button>
              <button onClick={save} className={btn+" flex-1"}><Save className="h-4 w-4" /> Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
