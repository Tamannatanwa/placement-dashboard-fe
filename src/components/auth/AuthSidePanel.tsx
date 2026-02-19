"use client";

import { Briefcase } from "lucide-react";
import { AnimatedBackground } from "@/components/layouts/AnimatedBackground";

interface AuthSidePanelProps {
  title: string;
  description: string;
}

export function AuthSidePanel({ title, description }: AuthSidePanelProps) {
  return (
    <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12 relative overflow-hidden">
      <AnimatedBackground backgroundImage="/images/bgImage.svg" />
      {/* Background Pattern Overlay */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl" />
      </div>
      
      <div className="relative z-10 text-center space-y-8 max-w-md">
        <div className="flex justify-center">
          <div className="h-24 w-24 rounded-2xl glass flex items-center justify-center border border-purple-500/30">
            <Briefcase className="h-12 w-12 text-purple-300" />
          </div>
        </div>
        
        <div className="space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            {title}
          </h2>
          <p className="text-lg text-slate-300 leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}







