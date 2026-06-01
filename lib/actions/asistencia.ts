"use server";

import { db } from "@/lib/db";
import { attendance, groups, students } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getAttendanceByGroup(groupId: number, fecha: string) {
  const result = await db
    .select({
      id: attendance.id,
      studentId: attendance.studentId,
      estado: attendance.estado,
      studentName: students.nombres,
      studentLastname: students.apellidos,
      studentDni: students.dni,
    })
    .from(attendance)
    .leftJoin(students, eq(attendance.studentId, students.id))
    .where(and(eq(attendance.groupId, groupId), eq(attendance.fecha, fecha)))
    .orderBy(students.apellidos);

  return result;
}

export async function registerAttendance(data: {
  groupId: number; studentId: number; fecha: string;
  estado: "presente" | "tardanza" | "falta";
}) {
  const [existing] = await db
    .select()
    .from(attendance)
    .where(
      and(
        eq(attendance.groupId, data.groupId),
        eq(attendance.studentId, data.studentId),
        eq(attendance.fecha, data.fecha)
      )
    )
    .limit(1);

  if (existing) {
    await db.update(attendance).set({ estado: data.estado }).where(eq(attendance.id, existing.id));
  } else {
    await db.insert(attendance).values(data);
  }

  revalidatePath("/asistencia");
}
