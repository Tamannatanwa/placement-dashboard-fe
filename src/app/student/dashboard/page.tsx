"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Legacy student dashboard route.
 * The dashboard experience has been simplified and moved to the Jobs page.
 * We keep this route only to gently redirect existing links.
 */
export default function StudentDashboardRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/jobs");
  }, [router]);

  return (
    <div className="flex min-h-[200px] items-center justify-center text-sm text-muted-foreground">
      Taking you to your jobs...
    </div>
  );
}
