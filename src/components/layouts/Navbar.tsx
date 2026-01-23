"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Briefcase, LogOut, User } from "lucide-react";
import { isAuthenticated, getUserInfo, getUserRole, getDashboardRoute } from "@/lib/utils/auth";
import { authApi } from "@/lib/api/auth";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function Navbar() {
  const router = useRouter();
  const [isAuth, setIsAuth] = useState(false);
  const [userInfo, setUserInfo] = useState<{ id: string; email: string; role: string } | null>(null);

  useEffect(() => {
    // Check authentication status on mount and when storage changes
    const checkAuth = () => {
      const authenticated = isAuthenticated();
      setIsAuth(authenticated);
      if (authenticated) {
        const user = getUserInfo();
        setUserInfo(user);
      } else {
        setUserInfo(null);
      }
    };

    checkAuth();

    // Listen for storage changes (e.g., when user logs in/out in another tab)
    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
  }, []);

  const handleLogout = async () => {
    try {
      await authApi.logout();
      setIsAuth(false);
      setUserInfo(null);
      toast.success("Logged out successfully");
      router.push("/");
    } catch (error) {
      toast.error("Failed to logout");
    }
  };

  const handleDashboardClick = () => {
    if (userInfo?.role) {
      router.push(getDashboardRoute(userInfo.role));
    }
  };

  return (
    <nav className="fixed top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <Briefcase className="h-6 w-6 text-cyan-500 dark:text-cyan-400" />
          <span>PlaceHub</span>
        </Link>
        
        <div className="hidden md:flex items-center gap-6">
          <Link href="#features" className="text-sm font-medium hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">
           Features
          </Link>
          <Link href="#companies" className="text-sm font-medium hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">
            Companies
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {isAuth && userInfo ? (
            <>
              <Button variant="ghost" onClick={handleDashboardClick} className="hidden sm:flex">
                Dashboard
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-cyan-600 text-white">
                        {userInfo.email.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{userInfo.email}</p>
                      <p className="text-xs leading-none text-muted-foreground capitalize">
                        {userInfo.role}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleDashboardClick}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/login">Log In</Link>
              </Button>
              <Button className="bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-500 dark:hover:bg-cyan-600 text-white" asChild>
                <Link href="/signup">Get Started</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

