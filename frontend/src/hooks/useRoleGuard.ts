"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import type { RoleType } from "@/lib/auth-context";

// ============================================================================
// SAPC IntellySys — useRoleGuard (GAP-02 Fix)
// Client-side per-page role guard. Use alongside the edge middleware for
// defence-in-depth: middleware blocks server renders, this hook blocks
// React renders after hydration.
// ============================================================================

interface UseRoleGuardOptions {
  /**
   * One or more roles that are authorised to view this page.
   * If the authenticated user's role is not in this list they are
   * immediately redirected to their own dashboard.
   */
  allowedRoles: RoleType[];
  /**
   * Optional fallback redirect path.
   * Defaults to "/dashboard" (which then routes by role).
   */
  redirectTo?: string;
}

interface RoleGuardState {
  /** True once the auth state has resolved AND the role check has passed. */
  isAuthorized: boolean;
  /** True while auth is still loading — render nothing (or a spinner) while this is true. */
  isChecking: boolean;
}

export function useRoleGuard(
  allowedRoles: RoleType | RoleType[],
  options: Partial<UseRoleGuardOptions> = {}
): RoleGuardState {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  const redirectTo = options.redirectTo ?? "/dashboard";
  const rolesKey = Array.isArray(allowedRoles) ? allowedRoles.join(",") : allowedRoles;
  const roles = useMemo(
    () => (Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles]),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rolesKey]
  );

  useEffect(() => {
    if (isLoading) return; // wait for auth to resolve

    if (!user) {
      router.replace("/login");
      return;
    }

    if (!roles.includes(user.role)) {
      // Wrong role — bounce to their own portal, not a 403 page
      router.replace(redirectTo);
      return;
    }

    setIsAuthorized(true);
    setIsChecking(false);
  }, [user, isLoading, router, redirectTo, roles]);

  return { isAuthorized, isChecking };
}
