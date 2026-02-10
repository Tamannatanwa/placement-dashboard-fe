"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PlacementPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to placement dashboard
    router.replace("/placement/dashboard");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-muted-foreground">Redirecting to dashboard...</p>
      </div>
    </div>
  );
}

