import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { hashPassword } from "@/lib/auth";
import { eq } from "drizzle-orm";

async function seed() {
  const [existing] = await db.select().from(users).where(eq(users.email, "admin@academia.pe")).limit(1);

  if (!existing) {
    const hashed = await hashPassword("admin123");
    await db.insert(users).values({
      name: "Administrador",
      email: "admin@academia.pe",
      password: hashed,
      role: "admin",
    });
    console.log("Admin user created: admin@academia.pe / admin123");
  } else {
    console.log("Admin user already exists");
  }

  process.exit(0);
}

seed();
