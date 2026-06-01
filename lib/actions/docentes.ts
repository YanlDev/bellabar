"use server";

import { db } from "@/lib/db";
import { teachers, groups } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getTeachers() {
  return db.select().from(teachers).orderBy(teachers.apellidos);
}

export async function getTeacherById(id: number) {
  const [teacher] = await db.select().from(teachers).where(eq(teachers.id, id)).limit(1);
  return teacher;
}

export async function createTeacher(data: {
  dni: string; nombres: string; apellidos: string;
  celular?: string; correo?: string; especialidad?: string;
}) {
  await db.insert(teachers).values({
    dni: data.dni,
    nombres: data.nombres,
    apellidos: data.apellidos,
    celular: data.celular || null,
    correo: data.correo || null,
    especialidad: data.especialidad || null,
  });
  revalidatePath("/docentes");
}

export async function updateTeacher(id: number, data: {
  dni: string; nombres: string; apellidos: string;
  celular?: string; correo?: string; especialidad?: string;
  estado: "activo" | "inactivo";
}) {
  await db.update(teachers).set({
    dni: data.dni,
    nombres: data.nombres,
    apellidos: data.apellidos,
    celular: data.celular || null,
    correo: data.correo || null,
    especialidad: data.especialidad || null,
    estado: data.estado,
  }).where(eq(teachers.id, id));
  revalidatePath("/docentes");
}

export async function deleteTeacher(id: number) {
  const count = await db.$count(groups, eq(groups.teacherId, id));
  if (count > 0) {
    return { error: "No se puede eliminar: el docente tiene grupos asignados." };
  }
  await db.delete(teachers).where(eq(teachers.id, id));
  revalidatePath("/docentes");
  return { success: true };
}
