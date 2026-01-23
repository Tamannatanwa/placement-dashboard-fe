"use client";

export function AnimatedBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-500/30 dark:bg-cyan-400/20 rounded-full blur-3xl animate-float" />
      <div className="absolute top-60 -left-40 w-80 h-80 bg-teal-500/30 dark:bg-teal-400/20 rounded-full blur-3xl animate-float animate-pulse-slow" style={{ animationDelay: "2s" }} />
      <div className="absolute bottom-40 right-1/4 w-80 h-80 bg-cyan-400/20 dark:bg-cyan-300/15 rounded-full blur-3xl animate-float" style={{ animationDelay: "4s" }} />
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-purple-500/15 dark:bg-purple-400/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }} />
      <div className="absolute bottom-1/4 left-1/4 w-72 h-72 bg-pink-500/15 dark:bg-pink-400/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "3s" }} />
    </div>
  );
}

