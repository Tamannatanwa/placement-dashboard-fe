"use client";

import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { authApi } from "@/lib/api/auth";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { getDashboardRoute } from "@/lib/utils/auth";
import { Loader2 } from "lucide-react";

export function GoogleLoginButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSuccess = async (credentialResponse: any) => {
    setIsLoading(true);
    try {
      const response = await authApi.googleLogin({
        id_token: credentialResponse.credential,
      });

      if (response.access_token) {
        toast.success("Login successful!");
        const userRole = response.user?.role || "student";

        // Check if there's a redirect destination stored
        const redirectPath = sessionStorage.getItem("redirectAfterLogin");
        if (redirectPath) {
          sessionStorage.removeItem("redirectAfterLogin");
          router.push(redirectPath);
        } else {
          router.push(getDashboardRoute(userRole));
        }
      } else {
        toast.error(response.message || "Authentication failed");
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || "Authentication failed";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative inline-flex">
      <div className={isLoading ? "pointer-events-none opacity-50" : ""}>
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={() => {
            console.log("Google Login Failed");
            toast.error("Google login failed. Please try again.");
          }}
        />
      </div>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="rounded-full bg-white/80 dark:bg-slate-900/80 p-2 shadow">
            <Loader2 className="h-5 w-5 animate-spin text-cyan-600 dark:text-cyan-400" />
          </div>
        </div>
      )}
    </div>
  );
}

