"use client";

import { useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  AreaChart, Area,
} from "recharts";
import { db } from "@/lib/db";
import { students, teachers, courses, groups, payments, enrollments } from "@/lib/db/schema";
import { eq, gte, sql } from "drizzle-orm";
import {
  GraduationCap, UserCheck, BookOpen, Users,
  DollarSign, AlertCircle,
} from "lucide-react";

const gold = "oklch(0.72 0.12 85)";
const amber = "oklch(0.35 0.07 80)";
const emerald = "oklch(0.6 0.1 155)";
const rose = "oklch(0.62 0.12 22)";
const violet = "oklch(0.28 0.04 270)";
const teal = "oklch(0.5 0.06 180)";

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch("/api/dashboard").then(r => r.json()).then(setData);
  }, []);

  if (!data) return <div className="flex items-center justify-center h-64 text-[oklch(0.55_0.01_75)]">Cargando...</div>;

  const { cards, monthlyIncome, courseDistribution } = data;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-[oklch(0.92_0.003_85)]">Dashboard</h1>
        <p className="text-sm text-[oklch(0.55_0.01_75)] mt-1">Resumen general de la academia</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {[
          { label: "Estudiantes", value: cards.totalStudents, icon: GraduationCap, color: "bg-[oklch(0.72_0.12_85/0.12)]", text: "text-[oklch(0.82_0.1_82)]" },
          { label: "Docentes", value: cards.totalTeachers, icon: UserCheck, color: "bg-[oklch(0.35_0.07_80/0.15)]", text: "text-[oklch(0.8_0.1_82)]" },
          { label: "Cursos", value: cards.activeCourses, icon: BookOpen, color: "bg-[oklch(0.5_0.06_180/0.12)]", text: "text-teal-400" },
          { label: "Grupos", value: cards.activeGroups, icon: Users, color: "bg-[oklch(0.28_0.04_270/0.15)]", text: "text-violet-400" },
          { label: "Ingresos mes", value: `S/ ${Number(cards.income).toFixed(0)}`, icon: DollarSign, color: "bg-[oklch(0.6_0.1_155/0.12)]", text: "text-emerald-400" },
          { label: "Deuda", value: `S/ ${Number(cards.debt).toFixed(0)}`, icon: AlertCircle, color: "bg-[oklch(0.62_0.12_22/0.12)]", text: "text-rose-400" },
        ].map(c => (
          <div key={c.label} className="rounded-2xl border border-[oklch(0.2_0.004_80)] bg-[oklch(0.145_0.003_85)] p-4 hover:border-[oklch(0.24_0.005_80)] transition-colors">
            <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${c.color} mb-3`}>
              <c.icon className={`h-4 w-4 ${c.text}`} strokeWidth={1.5} />
            </div>
            <p className="text-[10px] uppercase tracking-wider text-[oklch(0.55_0.01_75)]">{c.label}</p>
            <p className="text-lg font-semibold text-[oklch(0.92_0.003_85)] mt-0.5">{c.value}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Monthly Income - Bar Chart */}
        <div className="lg:col-span-2 rounded-2xl border border-[oklch(0.2_0.004_80)] bg-[oklch(0.145_0.003_85)] p-5">
          <h3 className="text-sm font-semibold text-[oklch(0.92_0.003_85)] mb-4">Ingresos Mensuales</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={monthlyIncome}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.2 0.004 80)" />
              <XAxis dataKey="mes" tick={{ fill: "oklch(0.55 0.01 75)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "oklch(0.55 0.01 75)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "oklch(0.17 0.003 85)",
                  border: "1px solid oklch(0.2 0.004 80)",
                  borderRadius: "12px",
                  color: "oklch(0.92 0.003 85)",
                  fontSize: "12px",
                }}
              />
              <Bar dataKey="ingresos" fill={gold} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Course Distribution - Donut */}
        <div className="rounded-2xl border border-[oklch(0.2_0.004_80)] bg-[oklch(0.145_0.003_85)] p-5">
          <h3 className="text-sm font-semibold text-[oklch(0.92_0.003_85)] mb-4">Alumnos por Curso</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={courseDistribution}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={85}
                dataKey="alumnos"
                nameKey="curso"
                paddingAngle={4}
                stroke="oklch(0.145 0.003 85)"
                strokeWidth={2}
              >
                {courseDistribution.map((_: any, i: number) => (
                  <Cell key={i} fill={[gold, amber, teal, violet, emerald, rose][i % 6]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "oklch(0.17 0.003 85)",
                  border: "1px solid oklch(0.2 0.004 80)",
                  borderRadius: "12px",
                  color: "oklch(0.92 0.003 85)",
                  fontSize: "12px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
