"use client";

import { ProfileWizard } from "@/components/profile/ProfileWizard";
import { getUserRole } from "@/lib/utils/auth";

export default function ProfileWizardPage() {
  const userRole = getUserRole() as "student" | "admin" | "placement" | null;

  return (
    <ProfileWizard
      userRole={userRole || "student"}
    />
  );
}


