"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Briefcase,
  Bookmark,
  UserCircle,
  LogOut,
  Menu,
  X,
  Settings,
  Bell,
  ChevronLeft,
  ChevronRight,
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
import { AnimatedBackground } from "@/components/layouts/AnimatedBackground";

const navigation = [
  { name: "Jobs", href: "/jobs", icon: Briefcase },
  { name: "Saved Jobs", href: "/jobs/saved", icon: Bookmark },
  { name: "Profile", href: "/profile/wizard", icon: UserCircle },
];

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userInfo, setUserInfo] = useState<{ id: string; email: string; role: string } | null>(null);
  const [notificationsUnread, setNotificationsUnread] = useState(0);

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

  return (
    <PrivateRoute allowedRoles={["student"]}>
      <div className="min-h-screen flex relative">
        <AnimatedBackground backgroundImage="/images/bgImage.svg" />
        
        {/* Mobile sidebar backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar - Fixed position, stays visible on scroll */}
        <aside
          className={`fixed top-0 left-0 z-50 h-screen backdrop-blur-xl border-2 border-gray-600 bg-[#8185B2]/10 transition-all duration-300 ease-in-out overflow-y-auto ${
            sidebarOpen ? "w-72 translate-x-0" : "w-0 -translate-x-full lg:w-16 lg:translate-x-0"
          }`}
        >
        <div className="flex flex-col h-full">
          {/* Logo and Toggle */}
          <div className="flex items-center justify-between p-4 border-b">
            <Link 
              href="/jobs" 
              className={`flex items-center gap-2 transition-opacity ${
                sidebarOpen ? "opacity-100" : "opacity-0 lg:opacity-100"
              }`}
            >
              <Briefcase className="h-6 w-6 text-purple-400 flex-shrink-0" />
              <span className={`font-bold text-xl whitespace-nowrap ${
                sidebarOpen ? "block" : "hidden lg:hidden"
              }`}>
                PlaceHub
              </span>
            </Link>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="hidden lg:flex"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                {sidebarOpen ? (
                  <ChevronLeft className="h-5 w-5" />
                ) : (
                  <ChevronRight className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => {
                    // Close mobile sidebar on navigation
                    if (window.innerWidth < 1024) {
                      setSidebarOpen(false);
                    }
                  }}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group ${
                    isActive
                      ? "backdrop-blur-xl border-2 border-gray-600 bg-white/8 text-white font-medium"
                      : "text-gray-300 hover:bg-[#282142] hover:text-white"
                  }`}
                  title={!sidebarOpen ? item.name : undefined}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  <span className={`whitespace-nowrap ${
                    sidebarOpen ? "block" : "hidden lg:hidden"
                  }`}>
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className="p-4 border-t">
            <ClientOnly
              fallback={
                <div className={`flex items-center gap-3 p-2 ${
                  sidebarOpen ? "" : "justify-center"
                }`}>
                  <Avatar className="h-8 w-8 bg-gradient-to-r from-purple-600 to-blue-600 text-white flex-shrink-0">
                    <AvatarFallback>{userInitials}</AvatarFallback>
                  </Avatar>
                  <div className={`flex-1 min-w-0 ${
                    sidebarOpen ? "block" : "hidden lg:hidden"
                  }`}>
                    <div className="text-sm font-medium truncate">{userName}</div>
                    <div className="text-xs text-muted-foreground capitalize">
                      {userInfo?.role || "Student"}
                    </div>
                  </div>
                </div>
              }
            >
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className={`w-full p-2 h-auto ${
                    !sidebarOpen ? "justify-center lg:justify-start" : "justify-start"
                  }`}>
                    <Avatar className="h-8 w-8 bg-cyan-600 text-white flex-shrink-0">
                      <AvatarFallback>{userInitials}</AvatarFallback>
                    </Avatar>
                    <div className={`text-left ml-3 ${
                      sidebarOpen ? "block" : "hidden lg:block"
                    }`}>
                      <div className="text-sm font-medium truncate">{userName}</div>
                      <div className="text-xs text-muted-foreground capitalize">
                        {userInfo?.role || "Student"}
                      </div>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{userName}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {userInfo?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push("/student/settings")}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600 dark:text-red-400">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </ClientOnly>
          </div>
        </div>
      </aside>

      {/* Main content - Takes remaining space */}
      <div className={`flex-1 transition-all duration-300 ease-in-out ${
        sidebarOpen ? "lg:ml-72" : "lg:ml-16"
      }`}>
        {/* Top bar */}
        <header className="sticky top-0 z-30 border-b-2 border-gray-600 backdrop-blur-xl bg-[#8185B2]/10 supports-[backdrop-filter]:backdrop-blur-xl">
          <div className="flex items-center justify-between px-4 py-4">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="hidden lg:flex"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                {sidebarOpen ? (
                  <ChevronLeft className="h-5 w-5" />
                ) : (
                  <ChevronRight className="h-5 w-5" />
                )}
              </Button>
            </div>
            <div className="flex-1" />
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {notificationsUnread > 0 && (
                  <span className="absolute top-0 right-0 h-2 w-2 bg-purple-500 rounded-full" />
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
                    {/* <DropdownMenuItem onClick={() => router.push("/profile/wizard")}>
                      <UserCircle className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem> */}
                    <DropdownMenuItem onClick={() => router.push("/student/settings")}>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
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
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-8 relative z-10">
          <div className="backdrop-blur-xl border-2 border-gray-600 rounded-2xl overflow-hidden bg-white/8 min-h-[calc(100vh-8rem)] p-6">
            {children}
          </div>
        </main>
      </div>
      </div>
    </PrivateRoute>
  );
}

