"use client";

import { ReactNode, useState, useEffect } from "react";
import { Briefcase, Bell, UserCircle, LayoutDashboard, FileText, Settings, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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

export default function StudentLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [userInfo, setUserInfo] = useState<{ id: string; email: string; role: string } | null>(null);

  useEffect(() => {
    const user = getUserInfo();
    setUserInfo(user);
  }, []);

  const handleLogout = async () => {
    try {
      await authApi.logout();
      setUserInfo(null);
      clearUserInfo();
      toast.success("Logged out successfully");
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to logout");
    }
  };

  const userName = userInfo?.email?.split("@")[0] || "Student";
  const userInitials = userName.split(' ').map(n => n[0]).join('').toUpperCase() || "S";

  const navItems = [
    { href: "/student/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/student/jobs", label: "Jobs", icon: Briefcase },
    { href: "/student/applications", label: "Applications", icon: FileText },
    { href: "/profile/wizard", label: "Profile", icon: UserCircle },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Navbar */}
      <nav className="fixed top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="/student/dashboard" className="flex items-center gap-2 font-bold text-xl">
            <Briefcase className="h-6 w-6 text-cyan-500 dark:text-cyan-400" />
            <span>PlaceHub</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-sm font-medium transition-colors flex items-center gap-2 ${
                    isActive
                      ? "text-cyan-600 dark:text-cyan-400"
                      : "hover:text-cyan-600 dark:hover:text-cyan-400"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-purple-500 text-xs text-white">
                3
              </span>
            </Button>
            <ClientOnly
              fallback={
                <Button variant="ghost" className="flex items-center gap-2">
                  <Avatar className="h-8 w-8 bg-cyan-600 text-white">
                    <AvatarFallback>{userInitials}</AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block text-left">
                    <div className="text-sm font-medium">{userName}</div>
                    <div className="text-xs text-muted-foreground capitalize">
                      {userInfo?.role || "Student"}
                    </div>
                  </div>
                </Button>
              }
            >
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <Avatar className="h-8 w-8 bg-cyan-600 text-white">
                      <AvatarFallback>{userInitials}</AvatarFallback>
                    </Avatar>
                    <div className="hidden md:block text-left">
                      <div className="text-sm font-medium">{userName}</div>
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
                  <DropdownMenuItem asChild>
                    <Link href="/profile/wizard">
                      <UserCircle className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/student/settings">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </ClientOnly>
          </div>
        </div>
      </nav>

      <main className="flex-1 pt-16">{children}</main>
    </div>
  );
}
