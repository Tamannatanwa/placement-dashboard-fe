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
        idToken: credentialResponse.credential,
        role: "student",
      });

      if (response.access_token) {
        toast.success("Login successful!");
        const userRole = response.user?.role || "student";
        router.push(getDashboardRoute(userRole));
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

