"use server";

import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { comparePassword, createSession, destroySession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function login(_prevState: unknown, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email y contraseña son requeridos" };
  }

  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

  if (!user) {
    return { error: "Usuario no encontrado" };
  }

  const valid = await comparePassword(password, user.password);
  if (!valid) {
    return { error: "Contraseña incorrecta" };
  }

  await createSession({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  });

  revalidatePath("/");
  redirect("/admin");
}

export async function logout() {
  await destroySession();
  revalidatePath("/login");
}
