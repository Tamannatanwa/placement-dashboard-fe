"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Student dashboard route redirects to Jobs (dashboard removed from student flow).
 */
export default function StudentDashboardPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/jobs");
  }, [router]);

  return (
    <div className="min-h-[200px] flex items-center justify-center">
      <p className="text-muted-foreground text-sm">Redirecting to Jobs...</p>
    </div>
  );
}
