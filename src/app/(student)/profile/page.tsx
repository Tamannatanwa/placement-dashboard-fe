"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ProfileWizard } from "@/components/profile/ProfileWizard";
import { getUserRole } from "@/lib/utils/auth";

export default function StudentProfilePage() {
  const router = useRouter();
  const userRole = getUserRole() as "student" | "admin" | "placement" | null;

  // Redirect to wizard for better UX
  useEffect(() => {
    router.replace("/profile/wizard");
  }, [router]);

  // Show wizard while redirecting
  return (
    <ProfileWizard
      userRole={userRole || "student"}
    />
  );
}


