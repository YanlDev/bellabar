import { db } from "@/lib/db";
import {
  students, teachers, courses, courseModules,
  groups, enrollments, payments, attendance, grades,
  installments, teacherAttendance,
} from "@/lib/db/schema";

async function seed() {
  console.log("🧹 Limpiando datos existentes...");
  await db.delete(teacherAttendance);
  await db.delete(grades);
  await db.delete(attendance);
  await db.delete(payments);
  await db.delete(installments);
  await db.delete(enrollments);
  await db.delete(courseModules);
  await db.delete(groups);
  await db.delete(courses);
  await db.delete(teachers);
  await db.delete(students);
  console.log("🌱 Insertando datos demo...");

  // ── Students ──
  const studentData = [
    { dni: "12345678", nombres: "María", apellidos: "Quispe Mamani", celular: "951234567", correo: "maria@email.com", direccion: "Jr. Lima 123, Juliaca" },
    { dni: "23456789", nombres: "Lucía", apellidos: "García López", celular: "952345678", correo: "lucia@email.com" },
    { dni: "34567890", nombres: "Ana", apellidos: "Pérez Chávez", celular: "953456789", correo: "ana@email.com", direccion: "Av. Circunvalación 456" },
    { dni: "45678901", nombres: "Carmen", apellidos: "Torres Huanca", celular: "954567890" },
    { dni: "56789012", nombres: "Rosa", apellidos: "Mendoza Flores", celular: "955678901", correo: "rosa@email.com" },
    { dni: "67890123", nombres: "Juan", apellidos: "Cárdenas Rojas", celular: "956789012", direccion: "Jr. Puno 789" },
    { dni: "78901234", nombres: "Diana", apellidos: "Vargas Cruz", celular: "957890123", correo: "diana@email.com" },
    { dni: "89012345", nombres: "Karla", apellidos: "Sánchez Apaza", celular: "958901234" },
    { dni: "90123456", nombres: "Gloria", apellidos: "Ramírez Condori", celular: "959012345", correo: "gloria@email.com" },
    { dni: "01234567", nombres: "Paola", apellidos: "Castillo Parí", celular: "950123456", direccion: "Av. Floral 321" },
  ];

  const createdStudents = [];
  for (const s of studentData) {
    const [r] = await db.insert(students).values({
      dni: s.dni, nombres: s.nombres, apellidos: s.apellidos,
      celular: s.celular, correo: s.correo || null,
      direccion: s.direccion || null,
    }).returning({ id: students.id });
    createdStudents.push(r);
  }
  console.log(`✓ ${createdStudents.length} estudiantes`);

  // ── Teachers ──
  const teacherData = [
    { dni: "11111111", nombres: "Sofía", apellidos: "Delgado Ruiz", celular: "961111111", correo: "sofia@academia.pe", especialidad: "Maquillaje Profesional" },
    { dni: "22222222", nombres: "Roberto", apellidos: "Medina Choque", celular: "962222222", especialidad: "Peinados y Colorimetría" },
    { dni: "33333333", nombres: "Gabriela", apellidos: "Álvarez Ticona", celular: "963333333", correo: "gabriela@academia.pe", especialidad: "Uñas Acrílicas" },
    { dni: "44444444", nombres: "Fernando", apellidos: "Paredes Suca", celular: "964444444", especialidad: "Faciales y Spa" },
  ];

  const createdTeachers = [];
  for (const t of teacherData) {
    const [r] = await db.insert(teachers).values({
      dni: t.dni, nombres: t.nombres, apellidos: t.apellidos,
      celular: t.celular, correo: t.correo || null,
      especialidad: t.especialidad,
    }).returning({ id: teachers.id });
    createdTeachers.push(r);
  }
  console.log(`✓ ${createdTeachers.length} docentes`);

  // ── Courses ──
  const courseData = [
    { nombre: "Maquillaje Profesional", descripcion: "Domina las técnicas de maquillaje social, artístico y profesional. Aprende a resaltar la belleza natural.", duracion: "4 módulos", precio: "700", montoMatricula: "100", modalidad: "cuotas" as const, cuotas: 3 },
    { nombre: "Peinados y Colorimetría", descripcion: "Técnicas avanzadas de peinado, trenzado y color. Todo lo que necesitas para destacar en el mundo de la belleza capilar.", duracion: "3 módulos", precio: "500", montoMatricula: "50", modalidad: "unico" as const },
    { nombre: "Uñas Acrílicas y Decoración", descripcion: "Desde lo básico hasta diseños avanzados. Técnicas de esculpido, gel, acrílico y nail art.", duracion: "3 módulos", precio: "450", montoMatricula: "50", modalidad: "cuotas" as const, cuotas: 2 },
    { nombre: "Faciales y Tratamientos Spa", descripcion: "Aprende tratamientos faciales, limpieza profunda, hidratación y protocolos de spa profesional.", duracion: "2 módulos", precio: "400", montoMatricula: "0", modalidad: "unico" as const },
    { nombre: "Maquillaje Social Express", descripcion: "Curso intensivo de maquillaje para eventos sociales. Ideal para quienes quieren empezar rápido.", duracion: "2 módulos", precio: "300", montoMatricula: "0", modalidad: "unico" as const },
  ];

  const createdCourses = [];
  for (const c of courseData) {
    const [r] = await db.insert(courses).values({
      nombre: c.nombre, descripcion: c.descripcion, duracion: c.duracion,
      precio: c.precio, montoMatricula: c.montoMatricula,
      modalidadPago: c.modalidad, numeroCuotas: c.cuotas || null,
    }).returning({ id: courses.id });
    createdCourses.push(r);
  }
  console.log(`✓ ${createdCourses.length} cursos`);

  // ── Course Modules ──
  const modulesData: { courseIdx: number; nombre: string; orden: number }[] = [
    // Maquillaje Profesional
    { courseIdx: 0, nombre: "Introducción al Maquillaje", orden: 1 },
    { courseIdx: 0, nombre: "Técnicas Básicas", orden: 2 },
    { courseIdx: 0, nombre: "Maquillaje Social", orden: 3 },
    { courseIdx: 0, nombre: "Maquillaje Profesional", orden: 4 },
    // Peinados
    { courseIdx: 1, nombre: "Fundamentos del Peinado", orden: 1 },
    { courseIdx: 1, nombre: "Trenzados y Recogidos", orden: 2 },
    { courseIdx: 1, nombre: "Colorimetría Capilar", orden: 3 },
    // Uñas
    { courseIdx: 2, nombre: "Preparación y Cuidado", orden: 1 },
    { courseIdx: 2, nombre: "Acrílico y Gel", orden: 2 },
    { courseIdx: 2, nombre: "Nail Art y Decoración", orden: 3 },
    // Facial
    { courseIdx: 3, nombre: "Limpieza y Diagnóstico", orden: 1 },
    { courseIdx: 3, nombre: "Tratamientos Avanzados", orden: 2 },
    // Express
    { courseIdx: 4, nombre: "Bases y Correcciones", orden: 1 },
    { courseIdx: 4, nombre: "Looks para Eventos", orden: 2 },
  ];

  for (const m of modulesData) {
    await db.insert(courseModules).values({
      courseId: createdCourses[m.courseIdx].id,
      nombre: m.nombre, orden: m.orden,
    });
  }
  console.log(`✓ ${modulesData.length} módulos de curso`);

  // ── Groups ──
  const groupData = [
    { codigo: "MAQ-2026-01", courseIdx: 0, teacherIdx: 0, inicio: "2026-06-15", fin: "2026-09-15", turno: "Mañana", vacantes: 15 },
    { codigo: "MAQ-2026-02", courseIdx: 0, teacherIdx: 0, inicio: "2026-07-01", fin: "2026-10-01", turno: "Tarde", vacantes: 12 },
    { codigo: "PEI-2026-01", courseIdx: 1, teacherIdx: 1, inicio: "2026-06-20", fin: "2026-08-20", turno: "Mañana", vacantes: 10 },
    { codigo: "UNAS-2026-01", courseIdx: 2, teacherIdx: 2, inicio: "2026-06-10", fin: "2026-08-10", turno: "Tarde", vacantes: 10 },
    { codigo: "FAC-2026-01", courseIdx: 3, teacherIdx: 3, inicio: "2026-07-01", fin: "2026-08-15", turno: "Mañana", vacantes: 8 },
    { codigo: "EXP-2026-01", courseIdx: 4, teacherIdx: 0, inicio: "2026-06-05", fin: "2026-07-15", turno: "Tarde", vacantes: 20 },
  ];

  const createdGroups = [];
  for (const g of groupData) {
    const [r] = await db.insert(groups).values({
      codigo: g.codigo,
      courseId: createdCourses[g.courseIdx].id,
      teacherId: createdTeachers[g.teacherIdx].id,
      fechaInicio: g.inicio, fechaFin: g.fin,
      turno: g.turno, vacantes: g.vacantes,
    }).returning({ id: groups.id });
    createdGroups.push(r);
  }
  console.log(`✓ ${createdGroups.length} grupos`);

  // ── Enrollments ──
  const enrollmentData = [
    { studentIdx: 0, groupIdx: 0, montoCurso: "700", montoMatricula: "100", fecha: "2026-06-01" },
    { studentIdx: 1, groupIdx: 0, montoCurso: "700", montoMatricula: "100", fecha: "2026-06-02" },
    { studentIdx: 2, groupIdx: 0, montoCurso: "700", montoMatricula: "100", fecha: "2026-06-03" },
    { studentIdx: 3, groupIdx: 1, montoCurso: "700", montoMatricula: "100", fecha: "2026-06-01" },
    { studentIdx: 4, groupIdx: 1, montoCurso: "700", montoMatricula: "100", fecha: "2026-06-02" },
    { studentIdx: 5, groupIdx: 2, montoCurso: "500", montoMatricula: "50", fecha: "2026-06-01" },
    { studentIdx: 6, groupIdx: 2, montoCurso: "500", montoMatricula: "50", fecha: "2026-06-03" },
    { studentIdx: 7, groupIdx: 3, montoCurso: "450", montoMatricula: "50", fecha: "2026-06-01" },
    { studentIdx: 8, groupIdx: 3, montoCurso: "450", montoMatricula: "50", fecha: "2026-06-02" },
    { studentIdx: 9, groupIdx: 4, montoCurso: "400", montoMatricula: "0", fecha: "2026-06-01" },
    { studentIdx: 0, groupIdx: 5, montoCurso: "300", montoMatricula: "0", fecha: "2026-06-01" },
    { studentIdx: 3, groupIdx: 5, montoCurso: "300", montoMatricula: "0", fecha: "2026-06-02" },
    { studentIdx: 2, groupIdx: 5, montoCurso: "300", montoMatricula: "0", fecha: "2026-06-03" },
    // Some completed enrollments
    { studentIdx: 5, groupIdx: 3, montoCurso: "450", montoMatricula: "50", fecha: "2026-05-01", estado: "finalizado" as const },
  ];

  const createdEnrollments = [];
  for (const e of enrollmentData) {
    const [r] = await db.insert(enrollments).values({
      studentId: createdStudents[e.studentIdx].id,
      groupId: createdGroups[e.groupIdx].id,
      fechaMatricula: e.fecha,
      montoCurso: e.montoCurso,
      montoMatricula: e.montoMatricula,
      estado: (e as any).estado || "activo",
    }).returning({ id: enrollments.id });
    createdEnrollments.push(r);
  }
  console.log(`✓ ${createdEnrollments.length} matrículas`);

  // ── Payments ──
  const paymentData = [
    { enrollmentIdx: 0, monto: "200", metodo: "efectivo", fecha: "2026-06-01", obs: "Matrícula + 1ra cuota" },
    { enrollmentIdx: 0, monto: "200", metodo: "yape", fecha: "2026-06-10", obs: "2da cuota" },
    { enrollmentIdx: 1, monto: "300", metodo: "transferencia", fecha: "2026-06-02" },
    { enrollmentIdx: 2, monto: "200", metodo: "efectivo", fecha: "2026-06-03" },
    { enrollmentIdx: 3, monto: "250", metodo: "yape", fecha: "2026-06-01" },
    { enrollmentIdx: 4, monto: "200", metodo: "efectivo", fecha: "2026-06-02" },
    { enrollmentIdx: 5, monto: "100", metodo: "tarjeta", fecha: "2026-06-01", obs: "1ra cuota" },
    { enrollmentIdx: 6, monto: "150", metodo: "efectivo", fecha: "2026-06-03" },
    { enrollmentIdx: 7, monto: "200", metodo: "yape", fecha: "2026-06-01" },
    { enrollmentIdx: 8, monto: "200", metodo: "efectivo", fecha: "2026-06-02" },
    { enrollmentIdx: 9, monto: "400", metodo: "transferencia", fecha: "2026-06-01", obs: "Pago completo" },
    { enrollmentIdx: 10, monto: "100", metodo: "efectivo", fecha: "2026-06-01" },
  ];

  for (const p of paymentData) {
    await db.insert(payments).values({
      enrollmentId: createdEnrollments[p.enrollmentIdx].id,
      fechaPago: p.fecha, monto: p.monto,
      metodoPago: p.metodo, observacion: p.obs || null,
    });
  }
  console.log(`✓ ${paymentData.length} pagos`);

  // ── Attendance ──
  const attendanceData = [];
  const fechas = ["2026-06-05", "2026-06-08", "2026-06-12", "2026-06-15", "2026-06-19"];
  const dataGroup1 = [0, 1, 2]; // student indices in group 0 (MAQ-2026-01)
  for (const f of fechas) {
    for (const s of dataGroup1) {
      attendanceData.push({
        groupIdx: 0, studentIdx: s, fecha: f,
        estado: Math.random() > 0.15 ? "presente" as const : (Math.random() > 0.5 ? "tardanza" as const : "falta" as const),
      });
    }
  }
  const dataGroup2 = [5, 6]; // PEI
  for (const f of fechas.slice(0, 3)) {
    for (const s of dataGroup2) {
      attendanceData.push({
        groupIdx: 2, studentIdx: s, fecha: f,
        estado: Math.random() > 0.2 ? "presente" as const : "tardanza" as const,
      });
    }
  }

  for (const a of attendanceData) {
    await db.insert(attendance).values({
      groupId: createdGroups[a.groupIdx].id,
      studentId: createdStudents[a.studentIdx].id,
      fecha: a.fecha, estado: a.estado,
    });
  }
  console.log(`✓ ${attendanceData.length} registros de asistencia`);

  // ── Grades ──
  const gradeEntries = [
    // Student 0 (María) en MAQ-2026-01
    { enrollmentIdx: 0, module: 0, nota: "18" },
    { enrollmentIdx: 0, module: 1, nota: "17" },
    { enrollmentIdx: 0, module: 2, nota: "19" },
    // Student 1 (Lucía)
    { enrollmentIdx: 1, module: 0, nota: "15" },
    { enrollmentIdx: 1, module: 1, nota: "16" },
    // Student 2 (Ana)
    { enrollmentIdx: 2, module: 0, nota: "20" },
    { enrollmentIdx: 2, module: 1, nota: "18" },
    { enrollmentIdx: 2, module: 2, nota: "19" },
    { enrollmentIdx: 2, module: 3, nota: "20" },
    // PEI
    { enrollmentIdx: 5, module: 4, nota: "14" },
    { enrollmentIdx: 6, module: 4, nota: "16" },
    { enrollmentIdx: 6, module: 5, nota: "17" },
  ];

  // Build a map: module index in modulesData -> actual module id
  // modulesData is ordered, so module index maps to order in insertion
  // Actually, module IDs are auto-increment, so I need to query them
  const allModules = await db.select().from(courseModules).orderBy(courseModules.orden);
  const moduleIndexMap = allModules.map(m => m.id);

  for (const g of gradeEntries) {
    await db.insert(grades).values({
      enrollmentId: createdEnrollments[g.enrollmentIdx].id,
      moduleId: moduleIndexMap[g.module], // module index maps to ordered module ID
      nota: g.nota,
    });
  }
  console.log(`✓ ${gradeEntries.length} notas`);

  // ── Installments for cuotas courses ──
  for (let i = 0; i < createdEnrollments.length; i++) {
    const e = createdEnrollments[i];
    const ed = enrollmentData[i];
    if (!ed) continue;
    // Check if course is in cuotas mode
    const course = courseData.find((c, idx) => idx === groupData[ed.groupIdx].courseIdx);
    if (course && course.modalidad === "cuotas" && course.cuotas) {
      const totalCurso = Number(course.precio) - Number(course.montoMatricula);
      const montoPorCuota = totalCurso / course.cuotas;
      for (let c = 1; c <= course.cuotas; c++) {
        const fecha = new Date(ed.fecha);
        fecha.setMonth(fecha.getMonth() + c);
        await db.insert(installments).values({
          enrollmentId: e.id,
          numeroCuota: c,
          monto: montoPorCuota.toFixed(2),
          fechaVencimiento: fecha.toISOString().split("T")[0],
          estado: "pendiente",
        });
      }
    }
  }
  console.log("✓ Cuotas generadas");

  // ── Teacher Attendance ──
  const teacherAttData = [
    { teacherIdx: 0, fecha: "2026-06-05", entrada: "08:00", salida: "14:00" },
    { teacherIdx: 0, fecha: "2026-06-06", entrada: "14:00", salida: "20:00" },
    { teacherIdx: 1, fecha: "2026-06-05", entrada: "08:30", salida: "13:30" },
    { teacherIdx: 2, fecha: "2026-06-05", entrada: "14:00", salida: "19:00" },
    { teacherIdx: 3, fecha: "2026-06-06", entrada: "09:00", salida: "12:00" },
  ];
  for (const t of teacherAttData) {
    await db.insert(teacherAttendance).values({
      teacherId: createdTeachers[t.teacherIdx].id,
      fecha: t.fecha,
      horaEntrada: t.entrada,
      horaSalida: t.salida,
    });
  }
  console.log(`✓ ${teacherAttData.length} asistencias de docentes`);

  console.log("\n✅ Datos demo insertados correctamente!");
  process.exit(0);
}

seed().catch(e => { console.error(e); process.exit(1); });
