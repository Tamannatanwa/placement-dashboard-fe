"use client";

import Link from "next/link";
import { Briefcase } from "lucide-react";
import { AuthSidePanel } from "@/components/auth/AuthSidePanel";
import { GoogleLoginButton } from "@/components/auth/GoogleLoginButton";

export default function LoginPage() {

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          {/* Logo */}
          <Link href="/" className="inline-flex items-center gap-2 font-bold text-2xl text-foreground">
            <Briefcase className="h-8 w-8 text-cyan-500 dark:text-cyan-400" />
            <span>PlaceHub</span>
          </Link>

          {/* Form Header */}
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold">Welcome to PlaceHub</h1>
            <p className="text-muted-foreground">Sign in with your Google account to get started</p>
          </div>

          {/* Google Login */}
          <GoogleLoginButton />
        </div>
      </div>

      {/* Right Side - Branded Panel */}
      <AuthSidePanel
        title="Find Your Dream Career"
        description="Access thousands of job opportunities from verified companies, track your applications, and land your perfect role."
      />
    </div>
  );
}
