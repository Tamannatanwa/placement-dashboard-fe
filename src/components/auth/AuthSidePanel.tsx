"use client";

import { Briefcase } from "lucide-react";

interface AuthSidePanelProps {
  title: string;
  description: string;
}

export function AuthSidePanel({ title, description }: AuthSidePanelProps) {
  return (
    <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 items-center justify-center p-12 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-cyan-400 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-teal-400 rounded-full blur-3xl" />
      </div>
      
      <div className="relative z-10 text-center space-y-8 max-w-md">
        <div className="flex justify-center">
          <div className="h-24 w-24 rounded-2xl bg-cyan-500/20 dark:bg-cyan-400/20 flex items-center justify-center backdrop-blur-sm border border-cyan-500/30 dark:border-cyan-400/30">
            <Briefcase className="h-12 w-12 text-cyan-400 dark:text-cyan-300" />
          </div>
        </div>
        
        <div className="space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            {title}
          </h2>
          <p className="text-lg text-slate-300 dark:text-slate-400 leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}






