import { db } from "@/lib/db";
import { groups, courses, enrollments, teachers } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  // Find teacher by name (users.name matches teachers.nombres + apellidos)
  const nameParts = session.name.split(" ");
  const nombres = nameParts[0] || "";
  const apellidos = nameParts.slice(1).join(" ") || "";

  const [teacher] = await db
    .select({ id: teachers.id })
    .from(teachers)
    .where(and(eq(teachers.nombres, nombres), eq(teachers.apellidos, apellidos)))
    .limit(1);

  if (!teacher) return NextResponse.json({ groups: [] });

  // Get groups for this teacher
  const teacherGroups = await db
    .select({
      id: groups.id,
      codigo: groups.codigo,
      courseName: courses.nombre,
      fechaInicio: groups.fechaInicio,
      fechaFin: groups.fechaFin,
      turno: groups.turno,
      vacantes: groups.vacantes,
    })
    .from(groups)
    .innerJoin(courses, eq(groups.courseId, courses.id))
    .where(and(eq(groups.teacherId, teacher.id), eq(groups.estado, "activo")))
    .orderBy(groups.codigo);

  // Get enrolled count for each group
  const result = await Promise.all(
    teacherGroups.map(async (g) => {
      const count = await db.$count(
        enrollments,
        and(eq(enrollments.groupId, g.id), eq(enrollments.estado, "activo"))
      );
      return { ...g, enrolled: count };
    })
  );

  return NextResponse.json({ groups: result });
}
