"use client";

import Link from "next/link";
import { Briefcase, MessageCircle, User } from "lucide-react";
import { GoogleLoginButton } from "@/components/auth/GoogleLoginButton";
import { AnimatedBackground } from "@/components/layouts/AnimatedBackground";

export default function LoginPage() {

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <AnimatedBackground backgroundImage="/images/bgImage.svg" />
      
      {/* Centered Modal Design - Matching Profile Details Design */}
      <div className="relative z-10 w-full max-w-md mx-auto p-6">
        <div className="backdrop-blur-xl border-2 border-gray-600 rounded-2xl overflow-hidden bg-white/8 p-8 space-y-6">
          {/* Title */}
          <h2 className="text-2xl font-bold text-white text-center mb-6">Welcome to PlaceHub</h2>
          
          {/* Profile Image Area - Decorative */}
          <div className="flex justify-center">
            <div className="relative group cursor-pointer">
              <div className="h-24 w-24 rounded-full glass border-2 border-purple-500/30 flex items-center justify-center overflow-hidden">
                <User className="h-12 w-12 text-purple-300" />
              </div>
              <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
          </div>

          {/* Chat Icon - Large Decorative Element */}
          <div className="flex justify-center py-2">
            <div className="relative">
              <div className="absolute inset-0 bg-purple-500/40 rounded-full blur-2xl animate-pulse"></div>
              <MessageCircle className="h-20 w-20 text-purple-400 relative z-10" />
            </div>
          </div>

          {/* Welcome Text */}
          <div className="text-center space-y-2">
            <p className="text-slate-300 text-sm">Sign in with your Google account</p>
            <p className="text-slate-400 text-xs">to access your dashboard</p>
          </div>

          {/* Google Login Button */}
          <div className="space-y-4 pt-4">
            <div className="flex justify-center">
              <GoogleLoginButton />
            </div>
          </div>

          {/* Footer Links */}
          <div className="text-center space-y-2 pt-4 border-t border-purple-500/20">
            <Link href="/" className="inline-flex items-center gap-2 text-sm text-purple-300 hover:text-purple-200 transition-colors">
              <Briefcase className="h-4 w-4" />
              <span>Back to Home</span>
            </Link>
            <p className="text-xs text-slate-500 mt-2">By continuing, you agree to our Terms of Service</p>
          </div>
        </div>
      </div>
    </div>
  );
}
