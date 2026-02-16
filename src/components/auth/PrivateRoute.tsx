"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { isAuthenticated, getUserRole, getDashboardRoute } from "@/lib/utils/auth";

interface PrivateRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  redirectTo?: string;
}

/**
 * PrivateRoute component that protects routes based on authentication and roles
 * - If user is not authenticated, redirects to login
 * - If user role doesn't match allowed roles, redirects to appropriate dashboard
 */
export function PrivateRoute({
  children,
  allowedRoles,
  redirectTo,
}: PrivateRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      // Check if user is authenticated
      if (!isAuthenticated()) {
        // Store the intended destination for redirect after login
        if (pathname && pathname !== "/login") {
          sessionStorage.setItem("redirectAfterLogin", pathname);
        }
        router.push("/login");
        setIsChecking(false);
        return;
      }

      // If no role restrictions, allow access
      if (!allowedRoles || allowedRoles.length === 0) {
        setIsAuthorized(true);
        setIsChecking(false);
        return;
      }

      // Check if user role is allowed
      const userRole = getUserRole();
      if (!userRole) {
        router.push("/login");
        setIsChecking(false);
        return;
      }

      // Normalize role names (backend might return "admin", "student", "placement_team", etc.)
      const normalizedUserRole = userRole.toLowerCase();
      const normalizedAllowedRoles = allowedRoles.map((role) => role.toLowerCase());

      // Check if user role matches any allowed role
      if (normalizedAllowedRoles.includes(normalizedUserRole)) {
        setIsAuthorized(true);
        setIsChecking(false);
      } else {
        // Redirect to appropriate dashboard based on role
        const dashboardRoute = getDashboardRoute(userRole);
        router.push(redirectTo || dashboardRoute);
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [router, pathname, allowedRoles, redirectTo]);

  // Show loading state while checking authentication
  if (isChecking || !isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

