import { db } from "@/lib/db";
import { groups, courses, enrollments, teachers } from "@/lib/db/schema";
import { eq, and, like } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  // Match teacher by name (partial match on apellidos since user.name may not include full apellidos)
  const nameParts = session.name.split(" ");
  const nombres = nameParts[0] || "";
  const apellidoFirst = nameParts[1] || "";

  const [teacher] = await db
    .select({ id: teachers.id })
    .from(teachers)
    .where(and(
      eq(teachers.nombres, nombres),
      like(teachers.apellidos, `${apellidoFirst}%`)
    ))
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
