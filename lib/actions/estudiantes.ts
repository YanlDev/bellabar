"use server";

import { db } from "@/lib/db";
import { students, enrollments, groups, courses, payments, grades, courseModules } from "@/lib/db/schema";
import { eq, asc, sql, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getStudents() {
  return db.select().from(students).orderBy(students.apellidos);
}

export async function getStudentById(id: number) {
  const [student] = await db.select().from(students).where(eq(students.id, id)).limit(1);
  return student;
}

export async function createStudent(data: {
  dni: string; nombres: string; apellidos: string;
  celular?: string; correo?: string; direccion?: string;
  fechaNacimiento?: string;
}) {
  await db.insert(students).values({
    dni: data.dni,
    nombres: data.nombres,
    apellidos: data.apellidos,
    celular: data.celular || null,
    correo: data.correo || null,
    direccion: data.direccion || null,
    fechaNacimiento: data.fechaNacimiento || null,
  });
  revalidatePath("/estudiantes");
}

export async function updateStudent(id: number, data: {
  dni: string; nombres: string; apellidos: string;
  celular?: string; correo?: string; direccion?: string;
  fechaNacimiento?: string;
  estado: "activo" | "inactivo";
}) {
  await db.update(students).set({
    dni: data.dni,
    nombres: data.nombres,
    apellidos: data.apellidos,
    celular: data.celular || null,
    correo: data.correo || null,
    direccion: data.direccion || null,
    fechaNacimiento: data.fechaNacimiento || null,
    estado: data.estado,
  }).where(eq(students.id, id));
  revalidatePath("/estudiantes");
  revalidatePath(`/estudiantes/${id}`);
}

export async function getStudentEnrollments(studentId: number) {
  const result = await db
    .select({
      id: enrollments.id,
      groupId: enrollments.groupId,
      fechaMatricula: enrollments.fechaMatricula,
      montoCurso: enrollments.montoCurso,
      montoMatricula: enrollments.montoMatricula,
      estado: enrollments.estado,
      groupCodigo: groups.codigo,
      courseName: courses.nombre,
      courseId: groups.courseId,
      totalPagado: sql<number>`coalesce((select sum(${payments.monto}) from ${payments} where ${payments.enrollmentId} = ${enrollments.id}), 0)`,
    })
    .from(enrollments)
    .leftJoin(groups, eq(enrollments.groupId, groups.id))
    .leftJoin(courses, eq(groups.courseId, courses.id))
    .where(eq(enrollments.studentId, studentId))
    .orderBy(enrollments.fechaMatricula);

  return result;
}

export async function getStudentGrades(studentId: number) {
  const result = await db
    .select({
      enrollmentId: grades.enrollmentId,
      moduleId: grades.moduleId,
      nota: grades.nota,
      moduleName: courseModules.nombre,
      moduleOrder: courseModules.orden,
      groupCodigo: groups.codigo,
      courseName: courses.nombre,
    })
    .from(grades)
    .leftJoin(enrollments, eq(grades.enrollmentId, enrollments.id))
    .leftJoin(courseModules, eq(grades.moduleId, courseModules.id))
    .leftJoin(groups, eq(enrollments.groupId, groups.id))
    .leftJoin(courses, eq(groups.courseId, courses.id))
    .where(eq(enrollments.studentId, studentId))
    .orderBy(enrollments.fechaMatricula, courseModules.orden);

  return result;
}

export async function getStudentPayments(studentId: number) {
  const result = await db
    .select({
      id: payments.id,
      enrollmentId: payments.enrollmentId,
      fechaPago: payments.fechaPago,
      monto: payments.monto,
      metodoPago: payments.metodoPago,
      observacion: payments.observacion,
      groupCodigo: groups.codigo,
      courseName: courses.nombre,
    })
    .from(payments)
    .leftJoin(enrollments, eq(payments.enrollmentId, enrollments.id))
    .leftJoin(groups, eq(enrollments.groupId, groups.id))
    .leftJoin(courses, eq(groups.courseId, courses.id))
    .where(eq(enrollments.studentId, studentId))
    .orderBy(payments.fechaPago);

  return result;
}

export async function deleteStudent(id: number) {
  const count = await db.$count(enrollments, eq(enrollments.studentId, id));
  if (count > 0) {
    return { error: "No se puede eliminar: el estudiante tiene matrículas activas." };
  }
  await db.delete(students).where(eq(students.id, id));
  revalidatePath("/estudiantes");
  return { success: true };
}
