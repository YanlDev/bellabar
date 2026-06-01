"use server";

import { db } from "@/lib/db";
import { groups, courses, teachers, enrollments, students, attendance, payments } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getGroups() {
  const result = await db
    .select({
      id: groups.id,
      codigo: groups.codigo,
      courseId: groups.courseId,
      teacherId: groups.teacherId,
      fechaInicio: groups.fechaInicio,
      fechaFin: groups.fechaFin,
      turno: groups.turno,
      vacantes: groups.vacantes,
      estado: groups.estado,
      createdAt: groups.createdAt,
      courseName: courses.nombre,
      teacherName: teachers.nombres,
      teacherLastname: teachers.apellidos,
    })
    .from(groups)
    .leftJoin(courses, eq(groups.courseId, courses.id))
    .leftJoin(teachers, eq(groups.teacherId, teachers.id))
    .orderBy(groups.codigo);

  return result;
}

export async function getGroupDetail(id: number) {
  const [result] = await db
    .select({
      id: groups.id,
      codigo: groups.codigo,
      courseId: groups.courseId,
      teacherId: groups.teacherId,
      fechaInicio: groups.fechaInicio,
      fechaFin: groups.fechaFin,
      turno: groups.turno,
      vacantes: groups.vacantes,
      estado: groups.estado,
      courseName: courses.nombre,
      courseDescription: courses.descripcion,
      coursePrecio: courses.precio,
      teacherName: teachers.nombres,
      teacherLastname: teachers.apellidos,
      teacherDni: teachers.dni,
    })
    .from(groups)
    .leftJoin(courses, eq(groups.courseId, courses.id))
    .leftJoin(teachers, eq(groups.teacherId, teachers.id))
    .where(eq(groups.id, id))
    .limit(1);

  return result;
}

export async function getGroupEnrollments(groupId: number) {
  const result = await db
    .select({
      id: enrollments.id,
      studentId: enrollments.studentId,
      fechaMatricula: enrollments.fechaMatricula,
      montoMatricula: enrollments.montoMatricula,
      montoCurso: enrollments.montoCurso,
      estado: enrollments.estado,
      studentName: students.nombres,
      studentLastname: students.apellidos,
      studentDni: students.dni,
      studentCelular: students.celular,
    })
    .from(enrollments)
    .leftJoin(students, eq(enrollments.studentId, students.id))
    .where(eq(enrollments.groupId, groupId))
    .orderBy(students.apellidos);

  return result;
}

export async function getGroupAttendanceSummary(groupId: number) {
  const result = await db
    .select({
      studentId: attendance.studentId,
      total: sql<number>`count(*)`,
      presentes: sql<number>`count(*) filter (where ${attendance.estado} = 'presente')`,
      tardanzas: sql<number>`count(*) filter (where ${attendance.estado} = 'tardanza')`,
      faltas: sql<number>`count(*) filter (where ${attendance.estado} = 'falta')`,
    })
    .from(attendance)
    .where(eq(attendance.groupId, groupId))
    .groupBy(attendance.studentId);

  return result;
}

export async function getGroupPaymentSummary(groupId: number) {
  const result = await db
    .select({
      enrollmentId: enrollments.id,
      studentId: enrollments.studentId,
      totalCurso: enrollments.montoCurso,
      totalPagado: sql<number>`coalesce((select sum(${payments.monto}) from ${payments} where ${payments.enrollmentId} = ${enrollments.id}), 0)`,
    })
    .from(enrollments)
    .where(and(eq(enrollments.groupId, groupId), eq(enrollments.estado, "activo")));

  return result;
}

export async function getGroupById(id: number) {
  const [group] = await db.select().from(groups).where(eq(groups.id, id)).limit(1);
  return group;
}

export async function createGroup(data: {
  codigo: string; courseId: number; teacherId: number;
  fechaInicio: string; fechaFin: string; turno?: string; vacantes: number;
}) {
  await db.insert(groups).values({
    codigo: data.codigo,
    courseId: data.courseId,
    teacherId: data.teacherId,
    fechaInicio: data.fechaInicio,
    fechaFin: data.fechaFin,
    turno: data.turno || null,
    vacantes: data.vacantes,
  });
  revalidatePath("/grupos");
}

export async function updateGroup(id: number, data: {
  codigo: string; courseId: number; teacherId: number;
  fechaInicio: string; fechaFin: string; turno?: string; vacantes: number;
  estado: "activo" | "inactivo";
}) {
  await db.update(groups).set({
    codigo: data.codigo,
    courseId: data.courseId,
    teacherId: data.teacherId,
    fechaInicio: data.fechaInicio,
    fechaFin: data.fechaFin,
    turno: data.turno || null,
    vacantes: data.vacantes,
    estado: data.estado,
  }).where(eq(groups.id, id));
  revalidatePath("/grupos");
  revalidatePath(`/grupos/${id}`);
}

export async function deleteGroup(id: number) {
  const count = await db.$count(enrollments, eq(enrollments.groupId, id));
  if (count > 0) {
    return { error: "No se puede eliminar: el grupo tiene estudiantes matriculados." };
  }
  await db.delete(groups).where(eq(groups.id, id));
  revalidatePath("/grupos");
  return { success: true };
}
