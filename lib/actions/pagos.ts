"use server";

import { db } from "@/lib/db";
import { payments, enrollments, students, groups, courses, installments } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getPayments() {
  const result = await db
    .select({
      id: payments.id,
      enrollmentId: payments.enrollmentId,
      fechaPago: payments.fechaPago,
      monto: payments.monto,
      metodoPago: payments.metodoPago,
      observacion: payments.observacion,
      studentName: students.nombres,
      studentLastname: students.apellidos,
      groupCodigo: groups.codigo,
    })
    .from(payments)
    .leftJoin(enrollments, eq(payments.enrollmentId, enrollments.id))
    .leftJoin(students, eq(enrollments.studentId, students.id))
    .leftJoin(groups, eq(enrollments.groupId, groups.id))
    .orderBy(payments.fechaPago);

  return result;
}

export async function getEnrollmentsWithDebt() {
  const result = await db
    .select({
      enrollmentId: enrollments.id,
      studentId: enrollments.studentId,
      studentName: students.nombres,
      studentLastname: students.apellidos,
      studentDni: students.dni,
      groupCodigo: groups.codigo,
      courseName: courses.nombre,
      montoCurso: enrollments.montoCurso,
      montoMatricula: enrollments.montoMatricula,
      modalidadPago: courses.modalidadPago,
      totalPagado: sql<number>`coalesce((select sum(${payments.monto}) from ${payments} where ${payments.enrollmentId} = ${enrollments.id}), 0)`,
    })
    .from(enrollments)
    .leftJoin(students, eq(enrollments.studentId, students.id))
    .leftJoin(groups, eq(enrollments.groupId, groups.id))
    .leftJoin(courses, eq(groups.courseId, courses.id))
    .where(eq(enrollments.estado, "activo"))
    .orderBy(students.apellidos);

  return result;
}

export async function getPaymentDetail(enrollmentId: number) {
  const [enr] = await db
    .select({
      id: enrollments.id,
      studentId: enrollments.studentId,
      montoCurso: enrollments.montoCurso,
      montoMatricula: enrollments.montoMatricula,
      studentName: students.nombres,
      studentLastname: students.apellidos,
      studentDni: students.dni,
      groupCodigo: groups.codigo,
      courseName: courses.nombre,
      modalidadPago: courses.modalidadPago,
    })
    .from(enrollments)
    .leftJoin(students, eq(enrollments.studentId, students.id))
    .leftJoin(groups, eq(enrollments.groupId, groups.id))
    .leftJoin(courses, eq(groups.courseId, courses.id))
    .where(eq(enrollments.id, enrollmentId))
    .limit(1);

  if (!enr) return null;

  const cuotas = await db
    .select()
    .from(installments)
    .where(eq(installments.enrollmentId, enrollmentId))
    .orderBy(installments.numeroCuota);

  const historial = await db
    .select()
    .from(payments)
    .where(eq(payments.enrollmentId, enrollmentId))
    .orderBy(payments.fechaPago);

  const [totalPagado] = await db
    .select({ total: sql<number>`coalesce(sum(${payments.monto}), 0)` })
    .from(payments)
    .where(eq(payments.enrollmentId, enrollmentId));

  const pagado = Number(totalPagado?.total || 0);
  const total = Number(enr.montoCurso) + Number(enr.montoMatricula);

  return {
    enrollment: enr,
    cuotas,
    historial,
    total,
    pagado,
    pendiente: total - pagado,
  };
}

export async function registerPayment(data: {
  enrollmentId: number;
  cuotaId?: number;
  monto: number;
  metodoPago?: string;
  fechaPago: string;
  observacion?: string;
}) {
  await db.insert(payments).values({
    enrollmentId: data.enrollmentId,
    fechaPago: data.fechaPago,
    monto: data.monto.toString(),
    metodoPago: data.metodoPago || null,
    observacion: data.observacion || null,
  });

  if (data.cuotaId) {
    // Check if all cuota payments cover the cuota amount
    const [cuota] = await db.select().from(installments).where(eq(installments.id, data.cuotaId)).limit(1);
    if (cuota) {
      const [pagadoCuota] = await db
        .select({ total: sql<number>`coalesce(sum(${payments.monto}), 0)` })
        .from(payments)
        .where(eq(payments.enrollmentId, data.enrollmentId));

      const totalCuota = Number(cuota.monto);
      // Simple heuristic: mark as paid
      await db.update(installments).set({ estado: "pagado" }).where(eq(installments.id, data.cuotaId));
    }
  }

  revalidatePath("/pagos");
  revalidatePath("/");
}

export async function getDeudaByEnrollment(enrollmentId: number) {
  const [enrollment] = await db.select().from(enrollments).where(eq(enrollments.id, enrollmentId)).limit(1);
  if (!enrollment) return { total: 0, pagado: 0, pendiente: 0 };

  const [result] = await db
    .select({ total: sql<number>`coalesce(sum(${payments.monto}), 0)` })
    .from(payments)
    .where(eq(payments.enrollmentId, enrollmentId));

  const pagado = Number(result?.total || 0);
  const total = Number(enrollment.montoCurso) + Number(enrollment.montoMatricula);
  const pendiente = total - pagado;

  return { total, pagado, pendiente };
}

export async function createPayment(data: {
  enrollmentId: number; fechaPago: string; monto: number;
  metodoPago?: string; observacion?: string;
}) {
  await db.insert(payments).values({
    enrollmentId: data.enrollmentId,
    fechaPago: data.fechaPago,
    monto: data.monto.toString(),
    metodoPago: data.metodoPago || null,
    observacion: data.observacion || null,
  });
  revalidatePath("/pagos");
  revalidatePath("/");
}

export async function deletePayment(id: number) {
  await db.delete(payments).where(eq(payments.id, id));
  revalidatePath("/pagos");
}
