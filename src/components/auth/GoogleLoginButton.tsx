"use client";

import { GoogleLogin } from "@react-oauth/google";
import { authApi } from "@/lib/api/auth";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { getDashboardRoute } from "@/lib/utils/auth";

export function GoogleLoginButton() {
  const router = useRouter();

  const handleSuccess = async (credentialResponse: any) => {
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
      const errorMessage = error.response?.data?.message || error.message || "Authentication failed";
      toast.error(errorMessage);
    }
  };

  return (
    <GoogleLogin
      onSuccess={handleSuccess}
      onError={() => {
        console.log("Google Login Failed");
        toast.error("Google login failed. Please try again.");
      }}
    />
  );
}

