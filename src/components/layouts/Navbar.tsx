"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Briefcase, LogOut, User, Settings } from "lucide-react";
import { isAuthenticated, getUserInfo, getUserRole, getDashboardRoute } from "@/lib/utils/auth";
import { authApi } from "@/lib/api/auth";
import { toast } from "sonner";
import { ClientOnly } from "@/components/ui/ClientOnly";
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
    <nav className="fixed top-0 z-50 w-full border-b-2 border-gray-600 backdrop-blur-xl bg-[#8185B2]/10 supports-[backdrop-filter]:backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl group">
          <div className="relative">
            <div className="absolute inset-0 bg-purple-500/30 rounded-lg blur-md group-hover:blur-xl transition-all"></div>
            <Briefcase className="h-6 w-6 text-purple-300 relative z-10 group-hover:text-purple-200 transition-colors" />
          </div>
          <span className="bg-gradient-to-r from-purple-200 via-purple-100 to-blue-200 bg-clip-text text-transparent group-hover:from-purple-100 group-hover:via-white group-hover:to-blue-100 transition-all">
            PlaceHub
          </span>
        </Link>
        
        <div className="hidden md:flex items-center gap-6">
          <Link 
            href="#features" 
            className="text-sm font-medium text-purple-200 hover:text-white transition-all relative group px-3 py-1.5 rounded-lg hover:bg-purple-500/20"
          >
            Features
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-400 to-blue-400 group-hover:w-full transition-all duration-300"></span>
          </Link>
          <Link 
            href="#companies" 
            className="text-sm font-medium text-purple-200 hover:text-white transition-all relative group px-3 py-1.5 rounded-lg hover:bg-purple-500/20"
          >
            Companies
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-400 to-blue-400 group-hover:w-full transition-all duration-300"></span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {isAuth && userInfo ? (
            <>
              <Button 
                variant="ghost" 
                onClick={handleDashboardClick} 
                className="hidden sm:flex hover:bg-purple-500/20 hover:text-white text-purple-200 border border-transparent hover:border-purple-400/30 transition-all"
              >
                Dashboard
              </Button>
              <ClientOnly
                fallback={
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full hover:ring-2 hover:ring-purple-400/50 transition-all">
                    <Avatar className="h-8 w-8 ring-2 ring-purple-500/30">
                      <AvatarFallback className="bg-gradient-to-r from-purple-600 via-purple-500 to-blue-600 text-white">
                        {userInfo.email.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                }
              >
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full hover:ring-2 hover:ring-purple-400/50 transition-all group">
                      <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <Avatar className="h-8 w-8 ring-2 ring-purple-500/30 relative z-10">
                        <AvatarFallback className="bg-gradient-to-r from-purple-600 via-purple-500 to-blue-600 text-white">
                          {userInfo.email.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 glass-modal border-purple-500/30" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none text-white">{userInfo.email}</p>
                        <p className="text-xs leading-none text-purple-300 capitalize">
                          {userInfo.role}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-purple-500/20" />
                    <DropdownMenuItem onClick={handleDashboardClick} className="hover:bg-purple-500/20 hover:text-white focus:bg-purple-500/20 focus:text-white">
                      <User className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        if (userInfo?.role === "student") {
                          router.push("/profile/wizard");
                        } else if (userInfo?.role === "admin") {
                          router.push("/admin/profile");
                        } else {
                          router.push("/placement/profile");
                        }
                      }}
                      className="hover:bg-purple-500/20 hover:text-white focus:bg-purple-500/20 focus:text-white"
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-purple-500/20" />
                    <DropdownMenuItem onClick={handleLogout} className="hover:bg-red-500/20 hover:text-red-300 focus:bg-red-500/20 focus:text-red-300">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </ClientOnly>
            </>
          ) : (
            <Button 
              className="bg-gradient-to-r from-purple-600 via-purple-500 to-blue-600 hover:from-purple-500 hover:via-purple-400 hover:to-blue-500 text-white shadow-lg shadow-purple-500/50 hover:shadow-purple-400/60 transition-all duration-300 font-semibold px-6 py-2 rounded-lg border border-purple-400/30 hover:border-purple-300/50" 
              asChild
            >
              <Link href="/login" className="flex items-center gap-2">
                Get Started
                <span className="text-lg">→</span>
              </Link>
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}

