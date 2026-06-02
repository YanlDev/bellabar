import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

const adminOnly = ["/admin", "/cursos", "/estudiantes", "/grupos", "/matriculas", "/pagos", "/notas"];
const teacherAllowed = ["/docente", "/asistencia", "/asistencia-docentes"];

export async function proxy(request: Request) {
  const { pathname } = new URL(request.url);
  const token = request.headers.get("cookie")?.match(/session=([^;]+)/)?.[1];

  // Public routes
  if (pathname === "/" || pathname === "/login" || pathname.startsWith("/api/") || pathname.startsWith("/_next/") || pathname.startsWith("/Logo/")) {
    if (pathname === "/login" && token) {
      try {
        const { payload } = await jwtVerify(token, secret);
        const role = payload.role as string;
        return NextResponse.redirect(new URL(role === "admin" ? "/admin" : "/docente", request.url));
      } catch {}
    }
    return NextResponse.next();
  }

  // No token
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Verify token
  let payload: any;
  try {
    const result = await jwtVerify(token, secret);
    payload = result.payload;
  } catch {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const role = payload.role as string;

  // Teacher trying to access admin routes
  if (role === "teacher") {
    const isAdminRoute = adminOnly.some(r => pathname === r || pathname.startsWith(r + "/"));
    if (isAdminRoute) {
      return NextResponse.redirect(new URL("/docente", request.url));
    }
  }

  // Admin accessing /docente → redirect to /admin
  if (role === "admin" && pathname.startsWith("/docente")) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|api|login).*)"],
};
