"use server";

import { db } from "@/lib/db";
import { grades, enrollments, students, courseModules, groups } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getGradesByEnrollment(enrollmentId: number) {
  const result = await db
    .select({
      id: grades.id,
      moduleId: grades.moduleId,
      nota: grades.nota,
      moduleName: courseModules.nombre,
      moduleOrder: courseModules.orden,
    })
    .from(grades)
    .leftJoin(courseModules, eq(grades.moduleId, courseModules.id))
    .where(eq(grades.enrollmentId, enrollmentId))
    .orderBy(courseModules.orden);

  return result;
}

export async function getGradesByGroup(groupId: number) {
  const result = await db
    .select({
      enrollmentId: enrollments.id,
      studentName: students.nombres,
      studentLastname: students.apellidos,
      studentDni: students.dni,
    })
    .from(enrollments)
    .leftJoin(students, eq(enrollments.studentId, students.id))
    .where(and(eq(enrollments.groupId, groupId), eq(enrollments.estado, "activo")))
    .orderBy(students.apellidos);

  return result;
}

export async function getModulesByEnrollment(enrollmentId: number) {
  const [enrollment] = await db
    .select({ groupId: enrollments.groupId })
    .from(enrollments)
    .where(eq(enrollments.id, enrollmentId))
    .limit(1);

  if (!enrollment) return [];

  const [group] = await db
    .select({ courseId: groups.courseId })
    .from(groups)
    .where(eq(groups.id, enrollment.groupId))
    .limit(1);

  if (!group) return [];

  return db.select().from(courseModules).where(eq(courseModules.courseId, group.courseId)).orderBy(courseModules.orden);
}

export async function upsertGrade(data: { enrollmentId: number; moduleId: number; nota: number }) {
  const [existing] = await db
    .select()
    .from(grades)
    .where(
      and(
        eq(grades.enrollmentId, data.enrollmentId),
        eq(grades.moduleId, data.moduleId)
      )
    )
    .limit(1);

  if (existing) {
    await db.update(grades).set({ nota: data.nota.toString() }).where(eq(grades.id, existing.id));
  } else {
    await db.insert(grades).values({
      enrollmentId: data.enrollmentId,
      moduleId: data.moduleId,
      nota: data.nota.toString(),
    });
  }

  revalidatePath("/notas");
}
