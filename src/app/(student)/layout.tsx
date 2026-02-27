"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Briefcase,
  Bookmark,
  UserCircle,
  LogOut,
  Bell,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getUserInfo, clearUserInfo } from "@/lib/utils/auth";
import { authApi } from "@/lib/api/auth";
import { toast } from "sonner";
import { ClientOnly } from "@/components/ui/ClientOnly";
import { PrivateRoute } from "@/components/auth/PrivateRoute";

const navigation = [
  { name: "Jobs", href: "/jobs", icon: Briefcase },
  { name: "Saved Jobs", href: "/jobs/saved", icon: Bookmark },
  { name: "Profile", href: "/profile/view", icon: UserCircle },
];

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [userInfo, setUserInfo] = useState<{ id: string; email: string; role: string } | null>(null);
  const [notificationsUnread, setNotificationsUnread] = useState(0);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const isNavItemActive = (href: string) => {
    if (!pathname) return false;

    if (href === "/jobs") {
      return (
        pathname === "/jobs" ||
        (pathname.startsWith("/jobs/") && !pathname.startsWith("/jobs/saved"))
      );
    }

    if (href === "/jobs/saved") {
      return pathname === "/jobs/saved" || pathname.startsWith("/jobs/saved/");
    }

    return pathname === href || pathname.startsWith(href + "/");
  };

  useEffect(() => {
    const user = getUserInfo();
    setUserInfo(user);
    // Load notifications count if needed
  }, []);

  const handleLogout = async () => {
    try {
      await authApi.logout();
      setUserInfo(null);
      clearUserInfo();
      toast.success("Logged out successfully");
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to logout");
    }
  };

  const userName = userInfo?.email?.split("@")[0] || "Student";
  const userInitials = userName.split(' ').map(n => n[0]).join('').toUpperCase() || "S";

  useEffect(() => {
    // Close mobile nav when route changes
    setMobileNavOpen(false);
  }, [pathname]);

  return (
    <PrivateRoute allowedRoles={["student"]}>
      <div className="min-h-screen bg-background">
        {/* Top bar with navigation tabs */}
        <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-12 py-4">
            {/* Logo */}
            <Link href="/jobs" className="flex items-center gap-2">
              <Image
                src="/navgurukul-logo.png"
                alt="NavGurukul"
                width={32}
                height={32}
                className="h-8 w-auto"
                priority
              />
              <div className="hidden sm:flex flex-col leading-tight">
                <span className="text-sm font-semibold">NavGurukul</span>
                <span className="text-sm font-bold">Placement automation</span>
              </div>
            </Link>

            {/* Navigation Tabs - Center (desktop) */}
            <nav className="hidden md:flex flex-1 items-center justify-center gap-1">
              {navigation.map((item) => {
                const isActive = isNavItemActive(item.href);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      isActive
                        ? "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-medium"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="hidden sm:inline">{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Right side actions */}
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {notificationsUnread > 0 && (
                  <span className="absolute top-0 right-0 h-2 w-2 bg-cyan-600 rounded-full" />
                )}
              </Button>
              <ClientOnly
                fallback={
                  <Avatar className="h-8 w-8 bg-cyan-600 text-white">
                    <AvatarFallback>{userInitials}</AvatarFallback>
                  </Avatar>
                }
              >
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2">
                      <Avatar className="h-8 w-8 bg-cyan-600 text-white">
                        <AvatarFallback>{userInitials}</AvatarFallback>
                      </Avatar>
                      <div className="hidden md:block text-left">
                        <div className="text-sm font-medium truncate">{userName}</div>
                        <div className="text-xs text-muted-foreground capitalize">
                          {userInfo?.role || "Student"}
                        </div>
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{userName}</p>
                        <p className="text-xs leading-none text-muted-foreground capitalize">
                          {userInfo?.role || "Student"}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="text-red-600 dark:text-red-400"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </ClientOnly>
              {/* Mobile hamburger menu */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setMobileNavOpen((open) => !open)}
                aria-label="Toggle navigation menu"
              >
                {mobileNavOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </header>

        {/* Mobile navigation (below header) */}
        {mobileNavOpen && (
          <nav className="border-b bg-background md:hidden">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-12 py-2 space-y-1">
              {navigation.map((item) => {
                const isActive = isNavItemActive(item.href);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                      isActive
                        ? "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-medium"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </nav>
        )}

        {/* Page content */}
        <main className="px-4 sm:px-6 lg:px-12 py-4 lg:py-8">
          <div className="mx-auto w-full max-w-6xl">
            {children}
          </div>
        </main>
      </div>
    </PrivateRoute>
  );
}
