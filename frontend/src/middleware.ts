import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // If visiting /dashboard root, redirect to /dashboard/guidance as initial entrypoint
  if (pathname === "/dashboard") {
    return NextResponse.redirect(new URL("/dashboard/guidance", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard", "/dashboard/:path*"],
};
