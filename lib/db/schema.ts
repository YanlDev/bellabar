import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  decimal,
  date,
  timestamp,
  time,
  pgEnum,
} from "drizzle-orm/pg-core";

// ── Enums ────────────────────────────────────────────
export const roleEnum = pgEnum("role", ["admin", "teacher"]);
export const estadoEnum = pgEnum("estado", ["activo", "inactivo"]);
export const estadoMatriculaEnum = pgEnum("estado_matricula", ["activo", "finalizado", "cancelado"]);
export const asistenciaEnum = pgEnum("asistencia", ["presente", "tardanza", "falta"]);
export const modalidadPagoEnum = pgEnum("modalidad_pago", ["unico", "cuotas"]);
export const cuotaEstadoEnum = pgEnum("cuota_estado", ["pendiente", "pagado", "vencido"]);

// ── Users ────────────────────────────────────────────
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  role: roleEnum("role").notNull().default("admin"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ── Students ─────────────────────────────────────────
export const students = pgTable("students", {
  id: serial("id").primaryKey(),
  dni: varchar("dni", { length: 20 }).notNull().unique(),
  nombres: varchar("nombres", { length: 255 }).notNull(),
  apellidos: varchar("apellidos", { length: 255 }).notNull(),
  celular: varchar("celular", { length: 20 }),
  correo: varchar("correo", { length: 255 }),
  direccion: text("direccion"),
  fechaNacimiento: date("fecha_nacimiento"),
  estado: estadoEnum("estado").notNull().default("activo"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ── Teachers ─────────────────────────────────────────
export const teachers = pgTable("teachers", {
  id: serial("id").primaryKey(),
  dni: varchar("dni", { length: 20 }).notNull().unique(),
  nombres: varchar("nombres", { length: 255 }).notNull(),
  apellidos: varchar("apellidos", { length: 255 }).notNull(),
  celular: varchar("celular", { length: 20 }),
  correo: varchar("correo", { length: 255 }),
  especialidad: varchar("especialidad", { length: 255 }),
  estado: estadoEnum("estado").notNull().default("activo"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ── Courses ──────────────────────────────────────────
export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  nombre: varchar("nombre", { length: 255 }).notNull(),
  descripcion: text("descripcion"),
  duracion: varchar("duracion", { length: 255 }),
  precio: decimal("precio", { precision: 10, scale: 2 }).notNull(),
  montoMatricula: decimal("monto_matricula", { precision: 10, scale: 2 }).notNull().default("0"),
  modalidadPago: modalidadPagoEnum("modalidad_pago").notNull().default("unico"),
  numeroCuotas: integer("numero_cuotas"),
  imagenUrl: varchar("imagen_url", { length: 500 }),
  estado: estadoEnum("estado").notNull().default("activo"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ── Course Modules ───────────────────────────────────
export const courseModules = pgTable("course_modules", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id").notNull().references(() => courses.id, { onDelete: "cascade" }),
  nombre: varchar("nombre", { length: 255 }).notNull(),
  orden: integer("orden").notNull().default(1),
});

// ── Groups ───────────────────────────────────────────
export const groups = pgTable("groups", {
  id: serial("id").primaryKey(),
  codigo: varchar("codigo", { length: 50 }).notNull().unique(),
  courseId: integer("course_id").notNull().references(() => courses.id, { onDelete: "cascade" }),
  teacherId: integer("teacher_id").notNull().references(() => teachers.id, { onDelete: "cascade" }),
  fechaInicio: date("fecha_inicio").notNull(),
  fechaFin: date("fecha_fin").notNull(),
  turno: varchar("turno", { length: 50 }),
  vacantes: integer("vacantes").notNull(),
  estado: estadoEnum("estado").notNull().default("activo"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ── Enrollments ──────────────────────────────────────
export const enrollments = pgTable("enrollments", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull().references(() => students.id, { onDelete: "cascade" }),
  groupId: integer("group_id").notNull().references(() => groups.id, { onDelete: "cascade" }),
  fechaMatricula: date("fecha_matricula").notNull().defaultNow(),
  montoMatricula: decimal("monto_matricula", { precision: 10, scale: 2 }).notNull().default("0"),
  montoCurso: decimal("monto_curso", { precision: 10, scale: 2 }).notNull(),
  estado: estadoMatriculaEnum("estado").notNull().default("activo"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ── Payments ─────────────────────────────────────────
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  enrollmentId: integer("enrollment_id").notNull().references(() => enrollments.id, { onDelete: "cascade" }),
  fechaPago: date("fecha_pago").notNull().defaultNow(),
  monto: decimal("monto", { precision: 10, scale: 2 }).notNull(),
  metodoPago: varchar("metodo_pago", { length: 50 }),
  observacion: text("observacion"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ── Attendance ───────────────────────────────────────
export const attendance = pgTable("attendance", {
  id: serial("id").primaryKey(),
  groupId: integer("group_id").notNull().references(() => groups.id, { onDelete: "cascade" }),
  studentId: integer("student_id").notNull().references(() => students.id, { onDelete: "cascade" }),
  fecha: date("fecha").notNull(),
  estado: asistenciaEnum("estado").notNull().default("presente"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ── Grades ───────────────────────────────────────────
export const grades = pgTable("grades", {
  id: serial("id").primaryKey(),
  enrollmentId: integer("enrollment_id").notNull().references(() => enrollments.id, { onDelete: "cascade" }),
  moduleId: integer("module_id").notNull().references(() => courseModules.id, { onDelete: "cascade" }),
  nota: decimal("nota", { precision: 5, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ── Installments ──────────────────────────────────────
export const installments = pgTable("installments", {
  id: serial("id").primaryKey(),
  enrollmentId: integer("enrollment_id").notNull().references(() => enrollments.id, { onDelete: "cascade" }),
  numeroCuota: integer("numero_cuota").notNull(),
  monto: decimal("monto", { precision: 10, scale: 2 }).notNull(),
  fechaVencimiento: date("fecha_vencimiento").notNull(),
  estado: cuotaEstadoEnum("estado").notNull().default("pendiente"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ── Teacher Attendance ───────────────────────────────
export const teacherAttendance = pgTable("teacher_attendance", {
  id: serial("id").primaryKey(),
  teacherId: integer("teacher_id").notNull().references(() => teachers.id, { onDelete: "cascade" }),
  fecha: date("fecha").notNull(),
  horaEntrada: time("hora_entrada"),
  horaSalida: time("hora_salida"),
  observacion: text("observacion"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
