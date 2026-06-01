"use server";

import { db } from "@/lib/db";
import { enrollments, students, groups, courses, installments, payments, grades, attendance } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getEnrollments() {
  const result = await db
    .select({
      id: enrollments.id,
      studentId: enrollments.studentId,
      groupId: enrollments.groupId,
      fechaMatricula: enrollments.fechaMatricula,
      montoMatricula: enrollments.montoMatricula,
      montoCurso: enrollments.montoCurso,
      estado: enrollments.estado,
      studentName: students.nombres,
      studentLastname: students.apellidos,
      studentDni: students.dni,
      groupCodigo: groups.codigo,
    })
    .from(enrollments)
    .leftJoin(students, eq(enrollments.studentId, students.id))
    .leftJoin(groups, eq(enrollments.groupId, groups.id))
    .orderBy(enrollments.fechaMatricula);

  return result;
}

export async function createEnrollment(data: {
  studentId: number; groupId: number;
  fechaMatricula: string;
}) {
  // Get course info from group
  const [group] = await db
    .select({
      courseId: groups.courseId,
      coursePrecio: courses.precio,
      courseMontoMatricula: courses.montoMatricula,
      courseModalidad: courses.modalidadPago,
      courseCuotas: courses.numeroCuotas,
    })
    .from(groups)
    .leftJoin(courses, eq(groups.courseId, courses.id))
    .where(eq(groups.id, data.groupId))
    .limit(1);

  if (!group) throw new Error("Grupo no encontrado");

  const montoCurso = String(group.coursePrecio ?? "0");
  const montoMatricula = String(group.courseMontoMatricula ?? "0");

  const [enrollment] = await db.insert(enrollments).values({
    studentId: data.studentId,
    groupId: data.groupId,
    fechaMatricula: data.fechaMatricula,
    montoMatricula: montoMatricula,
    montoCurso: montoCurso,
  }).returning({ id: enrollments.id });

  // Generate installments if course is in cuotas mode
  if (group.courseModalidad === "cuotas" && group.courseCuotas && group.courseCuotas > 0) {
    const cuotas = group.courseCuotas;
    const totalCurso = Number(montoCurso);
    const totalMatricula = Number(montoMatricula);
    const montoPorCuota = (totalCurso - totalMatricula) / cuotas;

    for (let i = 1; i <= cuotas; i++) {
      const fechaInicio = new Date(data.fechaMatricula);
      fechaInicio.setMonth(fechaInicio.getMonth() + i);
      const fechaVencimiento = fechaInicio.toISOString().split("T")[0];

      await db.insert(installments).values({
        enrollmentId: enrollment.id,
        numeroCuota: i,
        monto: montoPorCuota.toFixed(2),
        fechaVencimiento,
        estado: "pendiente",
      });
    }
  }

  revalidatePath("/matriculas");
  revalidatePath("/pagos");
  revalidatePath("/");
}

export async function updateEnrollmentStatus(id: number, estado: "activo" | "finalizado" | "cancelado") {
  await db.update(enrollments).set({ estado }).where(eq(enrollments.id, id));
  revalidatePath("/matriculas");
}

export async function deleteEnrollment(id: number) {
  const payCount = await db.$count(payments, eq(payments.enrollmentId, id));
  const gradeCount = await db.$count(grades, eq(grades.enrollmentId, id));
  const instCount = await db.$count(installments, eq(installments.enrollmentId, id));

  await db.delete(enrollments).where(eq(enrollments.id, id));

  revalidatePath("/matriculas");
  revalidatePath("/grupos/[id]");
  revalidatePath("/estudiantes/[id]");
  revalidatePath("/pagos");
  revalidatePath("/");

  return {
    deleted: true,
    removed: { pagos: payCount, notas: gradeCount, cuotas: instCount },
  };
}
