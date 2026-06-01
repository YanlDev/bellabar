import { db } from "@/lib/db";
import { courses, courseModules, groups, teachers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  const activeCourses = await db
    .select({
      id: courses.id,
      nombre: courses.nombre,
      descripcion: courses.descripcion,
      duracion: courses.duracion,
      precio: courses.precio,
      montoMatricula: courses.montoMatricula,
      modalidadPago: courses.modalidadPago,
      numeroCuotas: courses.numeroCuotas,
      imagenUrl: courses.imagenUrl,
    })
    .from(courses)
    .where(eq(courses.estado, "activo"))
    .orderBy(courses.nombre);

  const coursesWithModules = await Promise.all(
    activeCourses.map(async (course) => {
      const modules = await db
        .select()
        .from(courseModules)
        .where(eq(courseModules.courseId, course.id))
        .orderBy(courseModules.orden);

      return { ...course, modules };
    })
  );

  const activeGroups = await db
    .select({
      id: groups.id,
      codigo: groups.codigo,
      courseId: groups.courseId,
      courseName: courses.nombre,
      fechaInicio: groups.fechaInicio,
      vacantes: groups.vacantes,
    })
    .from(groups)
    .leftJoin(courses, eq(groups.courseId, courses.id))
    .where(eq(groups.estado, "activo"))
    .orderBy(groups.codigo);

  return NextResponse.json({
    courses: coursesWithModules,
    groups: activeGroups,
  });
}
