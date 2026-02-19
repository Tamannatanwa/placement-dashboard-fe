import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<"input">
>(({ className, type, autoComplete, ...props }, ref) => {
  return (
    <input
      type={type}
      ref={ref}
      data-slot="input"
      className={cn(
        "file:text-white placeholder:text-gray-400 selection:bg-blue-500 selection:text-white backdrop-blur-xl border-2 border-gray-600 bg-white/8 h-9 w-full min-w-0 rounded-md px-3 py-1 text-base text-white shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-gray-500 focus-visible:ring-gray-500/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 aria-invalid:border-destructive",
        className
      )}
      {...props}
      // Set autoComplete after spreading props to ensure it overrides React Hook Form's default
      {...(autoComplete !== undefined ? { autoComplete } : {})}
    />
  );
});

Input.displayName = "Input";

export { Input }
