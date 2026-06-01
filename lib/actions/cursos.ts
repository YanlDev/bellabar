"use server";

import { db } from "@/lib/db";
import { courses, courseModules, groups, teachers, installments } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getCourses() {
  return db.select().from(courses).orderBy(courses.nombre);
}

export async function getCourseById(id: number) {
  const [course] = await db.select().from(courses).where(eq(courses.id, id)).limit(1);
  return course;
}

export async function getCourseModules(courseId: number) {
  return db.select().from(courseModules).where(eq(courseModules.courseId, courseId)).orderBy(asc(courseModules.orden));
}

export async function getCourseGroups(courseId: number) {
  const result = await db
    .select({
      id: groups.id,
      codigo: groups.codigo,
      fechaInicio: groups.fechaInicio,
      fechaFin: groups.fechaFin,
      turno: groups.turno,
      vacantes: groups.vacantes,
      estado: groups.estado,
      teacherName: teachers.nombres,
      teacherLastname: teachers.apellidos,
    })
    .from(groups)
    .leftJoin(teachers, eq(groups.teacherId, teachers.id))
    .where(eq(groups.courseId, courseId))
    .orderBy(groups.codigo);

  return result;
}

export async function createCourse(data: {
  nombre: string; descripcion?: string; duracion?: string; precio: number;
  montoMatricula?: number; modalidadPago?: "unico" | "cuotas"; numeroCuotas?: number;
  imagenUrl?: string;
}) {
  await db.insert(courses).values({
    nombre: data.nombre,
    descripcion: data.descripcion || null,
    duracion: data.duracion || null,
    precio: data.precio.toString(),
    montoMatricula: (data.montoMatricula || 0).toString(),
    modalidadPago: data.modalidadPago || "unico",
    numeroCuotas: data.numeroCuotas || null,
    imagenUrl: data.imagenUrl || null,
  });
  revalidatePath("/cursos");
  revalidatePath("/cursos/[id]");
}

export async function updateCourse(id: number, data: {
  nombre: string; descripcion?: string; duracion?: string; precio: number;
  montoMatricula?: number; modalidadPago?: "unico" | "cuotas"; numeroCuotas?: number;
  imagenUrl?: string;
  estado: "activo" | "inactivo";
}) {
  await db.update(courses).set({
    nombre: data.nombre,
    descripcion: data.descripcion || null,
    duracion: data.duracion || null,
    precio: data.precio.toString(),
    montoMatricula: (data.montoMatricula || 0).toString(),
    modalidadPago: data.modalidadPago || "unico",
    numeroCuotas: data.numeroCuotas || null,
    imagenUrl: data.imagenUrl || null,
    estado: data.estado,
  }).where(eq(courses.id, id));
  revalidatePath("/cursos");
  revalidatePath(`/cursos/${id}`);
}

export async function createModule(data: { courseId: number; nombre: string; orden: number }) {
  await db.insert(courseModules).values(data);
  revalidatePath("/cursos");
  revalidatePath(`/cursos/${data.courseId}`);
}

export async function updateModule(id: number, data: { nombre: string; orden: number }) {
  await db.update(courseModules).set(data).where(eq(courseModules.id, id));
  revalidatePath("/cursos");
}

export async function deleteModule(id: number) {
  await db.delete(courseModules).where(eq(courseModules.id, id));
  revalidatePath("/cursos");
}

export async function deleteCourse(id: number) {
  const groupCount = await db.$count(groups, eq(groups.courseId, id));
  if (groupCount > 0) {
    return { error: "No se puede eliminar: el curso tiene grupos activos." };
  }
  await db.delete(courseModules).where(eq(courseModules.courseId, id));
  await db.delete(courses).where(eq(courses.id, id));
  revalidatePath("/cursos");
  return { success: true };
}
