import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// ============================================================================
// SAPC IntellySys — Next.js Edge Middleware (GAP-01 Fix)
// Enforces server-side role-based route protection BEFORE any page renders.
// This prevents horizontal privilege escalation via direct URL navigation.
// ============================================================================

/** Roles that are permitted to access each protected path prefix */
const ROUTE_PERMISSIONS: Record<string, string[]> = {
  "/dashboard/admin":    ["admin"],
  "/dashboard/teacher":  ["teacher"],
  "/dashboard/guidance": ["guidance_counselor"],
  "/dashboard/student":  ["student"],
  "/dashboard/parent":   ["parent"],
  // Shared paths accessible to all authenticated roles
  "/dashboard/profile":  ["admin", "teacher", "guidance_counselor", "student", "parent"],
  "/dashboard/docs":     ["admin", "teacher", "guidance_counselor", "student", "parent"],
};

/** Returns the canonical dashboard URL for a given role */
function roleDashboard(role: string): string {
  switch (role) {
    case "admin":             return "/dashboard/admin";
    case "teacher":           return "/dashboard/teacher";
    case "guidance_counselor":return "/dashboard/guidance";
    case "student":           return "/dashboard/student";
    case "parent":            return "/dashboard/parent";
    default:                  return "/login";
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only apply to dashboard routes
  if (!pathname.startsWith("/dashboard")) {
    return NextResponse.next();
  }

  // Read the lightweight session cookie set by auth-context on login
  const rawSession = request.cookies.get("sapc_session")?.value;

  // No session cookie → redirect to login
  if (!rawSession) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  let role: string | undefined;
  try {
    const decoded = JSON.parse(Buffer.from(rawSession, "base64").toString("utf-8"));
    role = decoded?.role;
  } catch {
    // Malformed cookie — clear it and send to login
    const loginUrl = new URL("/login", request.url);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete("sapc_session");
    return response;
  }

  if (!role) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Check the most-specific matching rule first
  const sortedRules = Object.entries(ROUTE_PERMISSIONS).sort(
    ([a], [b]) => b.length - a.length // longer (more specific) paths first
  );

  for (const [protectedPath, allowedRoles] of sortedRules) {
    if (pathname.startsWith(protectedPath)) {
      if (!allowedRoles.includes(role)) {
        // Authenticated but wrong role — redirect to their own dashboard
        return NextResponse.redirect(new URL(roleDashboard(role), request.url));
      }
      break; // matched — no need to check further
    }
  }

  // All checks passed — attach the verified role as a header for downstream use
  const response = NextResponse.next();
  response.headers.set("x-sapc-role", role);
  return response;
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
