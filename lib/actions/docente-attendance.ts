"use server";

import { db } from "@/lib/db";
import { teacherAttendance, teachers } from "@/lib/db/schema";
import { eq, gte, lte, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getTeacherAttendance(fecha: string) {
  const result = await db
    .select({
      id: teacherAttendance.id,
      teacherId: teacherAttendance.teacherId,
      fecha: teacherAttendance.fecha,
      horaEntrada: teacherAttendance.horaEntrada,
      horaSalida: teacherAttendance.horaSalida,
      observacion: teacherAttendance.observacion,
      teacherName: teachers.nombres,
      teacherLastname: teachers.apellidos,
      teacherDni: teachers.dni,
    })
    .from(teacherAttendance)
    .leftJoin(teachers, eq(teacherAttendance.teacherId, teachers.id))
    .where(eq(teacherAttendance.fecha, fecha))
    .orderBy(teachers.apellidos);

  return result;
}

export async function registerTeacherEntry(teacherId: number, fecha: string, horaEntrada: string) {
  const [existing] = await db
    .select()
    .from(teacherAttendance)
    .where(and(eq(teacherAttendance.teacherId, teacherId), eq(teacherAttendance.fecha, fecha)))
    .limit(1);

  if (existing) {
    await db.update(teacherAttendance)
      .set({ horaEntrada }).where(eq(teacherAttendance.id, existing.id));
  } else {
    await db.insert(teacherAttendance).values({ teacherId, fecha, horaEntrada });
  }

  revalidatePath("/asistencia-docentes");
}

export async function registerTeacherExit(id: number, horaSalida: string, observacion?: string) {
  await db.update(teacherAttendance)
    .set({ horaSalida, observacion: observacion || null })
    .where(eq(teacherAttendance.id, id));

  revalidatePath("/asistencia-docentes");
}

export async function getTeacherMonthlyReport(teacherId: number, mes: string) {
  const [year, month] = mes.split("-");
  const inicio = `${year}-${month}-01`;
  const fin = new Date(Number(year), Number(month), 0).toISOString().split("T")[0];

  return db
    .select()
    .from(teacherAttendance)
    .where(
      and(
        eq(teacherAttendance.teacherId, teacherId),
        gte(teacherAttendance.fecha, inicio),
        lte(teacherAttendance.fecha, fin)
      )
    )
    .orderBy(teacherAttendance.fecha);
}
