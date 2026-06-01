import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function proxy(request: Request) {
  const { pathname } = new URL(request.url);
  const token = request.headers.get("cookie")?.match(/session=([^;]+)/)?.[1];

  // Public routes
  if (pathname === "/" || pathname === "/login" || pathname.startsWith("/api/") || pathname.startsWith("/_next/") || pathname.startsWith("/Logo/")) {
    // Redirect logged-in users away from login page
    if (pathname === "/login" && token) {
      try {
        await jwtVerify(token, secret);
        return NextResponse.redirect(new URL("/admin", request.url));
      } catch {}
    }
    return NextResponse.next();
  }

  // Protected routes
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    await jwtVerify(token, secret);
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|api|login).*)"],
};
