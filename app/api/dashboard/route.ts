import { db } from "@/lib/db";
import { students, teachers, courses, groups, payments, enrollments } from "@/lib/db/schema";
import { eq, gte, lte, and, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];

  const [totalStudents, totalTeachers, activeCourses, activeGroups] = await Promise.all([
    db.$count(students, eq(students.estado, "activo")),
    db.$count(teachers, eq(teachers.estado, "activo")),
    db.$count(courses, eq(courses.estado, "activo")),
    db.$count(groups, eq(groups.estado, "activo")),
  ]);

  const [ingresosMes] = await db
    .select({ total: sql<number>`coalesce(sum(${payments.monto}), 0)` })
    .from(payments)
    .where(gte(payments.fechaPago, startOfMonth));

  const [deuda] = await db
    .select({
      total: sql<number>`coalesce(sum(${enrollments.montoCurso} + ${enrollments.montoMatricula}) - (
        select coalesce(sum(${payments.monto}), 0) from ${payments}
        where ${payments.enrollmentId} = ${enrollments.id}
      ), 0)`,
    })
    .from(enrollments)
    .where(eq(enrollments.estado, "activo"));

  // Monthly income for last 6 months
  const monthlyIncome = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthStart = d.toISOString().split("T")[0];
    const next = new Date(d.getFullYear(), d.getMonth() + 1, 1);
    const monthEnd = new Date(next.getTime() - 86400000).toISOString().split("T")[0];

    const [r] = await db
      .select({ total: sql<number>`coalesce(sum(${payments.monto}), 0)` })
      .from(payments)
      .where(and(gte(payments.fechaPago, monthStart), lte(payments.fechaPago, monthEnd)));

    const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    monthlyIncome.push({ mes: meses[d.getMonth()], ingresos: Number(r?.total || 0) });
  }

  // Course distribution (enrollments per course)
  const distribution = await db
    .select({
      curso: courses.nombre,
      alumnos: sql<number>`count(*)`,
    })
    .from(enrollments)
    .leftJoin(groups, eq(enrollments.groupId, groups.id))
    .leftJoin(courses, eq(groups.courseId, courses.id))
    .where(eq(enrollments.estado, "activo"))
    .groupBy(courses.nombre)
    .orderBy(sql`count(*)`);

  return NextResponse.json({
    cards: {
      totalStudents,
      totalTeachers,
      activeCourses,
      activeGroups,
      income: ingresosMes?.total || 0,
      debt: deuda?.total || 0,
    },
    monthlyIncome,
    courseDistribution: distribution,
  });
}
