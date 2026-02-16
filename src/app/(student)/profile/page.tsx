"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ProfileWizard } from "@/components/profile/ProfileWizard";
import { getUserRole } from "@/lib/utils/auth";

export default function StudentProfilePage() {
  const router = useRouter();
  const userRole = getUserRole() as "student" | "admin" | "placement" | null;

  // Redirect to view page by default, wizard is at /profile/wizard
  useEffect(() => {
    router.replace("/profile/view");
  }, [router]);

  // Show wizard while redirecting
  return (
    <ProfileWizard
      userRole={userRole || "student"}
    />
  );
}


