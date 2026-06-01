import { destroySession } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  await destroySession();
  return NextResponse.redirect(new URL("/login", request.url));
}
