/**
 * Authentication utility functions
 * Handles checking auth state and user info from localStorage
 */

export interface UserInfo {
  id: string;
  email: string;
  role: string;
}

/**
 * Get user info from localStorage
 * User info is stored when login is successful
 */
export function getUserInfo(): UserInfo | null {
  if (typeof window === "undefined") return null;

  try {
    const userStr = localStorage.getItem("user_info");
    if (!userStr) return null;
    return JSON.parse(userStr) as UserInfo;
  } catch {
    return null;
  }
}

/**
 * Check if user is authenticated (has access token)
 */
export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem("access_token");
}

/**
 * Get user role from localStorage
 */
export function getUserRole(): string | null {
  const user = getUserInfo();
  return user?.role || null;
}

/**
 * Store user info in localStorage
 */
export function setUserInfo(user: UserInfo): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("user_info", JSON.stringify(user));
}

/**
 * Clear user info from localStorage
 */
export function clearUserInfo(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("user_info");
}

/**
 * Get dashboard route based on user role
 */
export function getDashboardRoute(role: string): string {
  switch (role) {
    case "admin":
      return "/admin/students";
    case "placement":
      return "/placement/dashboard";
    case "student":
    default:
      return "/student/dashboard";
  }
}


