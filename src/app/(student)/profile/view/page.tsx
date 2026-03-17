"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { studentsApi } from "@/lib/api/students";
import { StudentProfile } from "@/types/student-profile";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Mail, 
  Phone, 
  Briefcase, 
  Link as LinkIcon,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

const formatQualification = (value?: string) => {
  if (!value) return "Not set";
  const qual = value.toLowerCase();
  const map: Record<string, string> = {
    "10th": "10th",
    "12th": "12th",
    diploma: "Diploma",
    graduation: "Graduation",
    "post-graduation": "Post-Graduation",
    phd: "PhD",
  };
  return map[qual] || value;
};

const formatList = (list?: string[]) => (list && list.length > 0 ? list.join(", ") : "Not set");

const formatDate = (value?: string) => {
  if (!value) return "Not set";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString();
};

export default function StudentProfileViewPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await studentsApi.getMyProfile();
      setProfile(data);
    } catch (error) {
      toast.error("Failed to load profile");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading profile...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground mb-4">
              Profile not found. Please complete your profile.
            </p>
            <Button 
              onClick={() => router.push("/profile/wizard")}
              className="w-full"
            >
              Complete Profile
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const jobType = profile.preference?.job_type ?? profile.job_type;
  const workMode = profile.preference?.work_mode ?? profile.work_mode;
  const preferredJobRole = profile.preference?.preferred_job_role ?? profile.preferred_job_role;
  const preferredLocation = profile.preference?.preferred_location ?? profile.preferred_location;
  const expectedSalary = profile.preference?.expected_salary ?? profile.expected_salary;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Profile Strength - at top */}
        {profile.profile_completeness !== undefined && (
          <Card className={`mb-6 ${profile.profile_completeness === 100 ? "border-green-500/20 bg-green-500/5" : "border-cyan-500/20 bg-cyan-500/5"}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {profile.profile_completeness === 100 ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                  )}
                  <CardTitle className="text-base">Profile Strength</CardTitle>
                </div>
                <span className="text-sm font-medium">{profile.profile_completeness}%</span>
              </div>
              <CardDescription>
                {profile.profile_completeness === 100
                  ? "To get better and more relevant job recommendations, please fill in your technical skills as well as your soft skills while creating your profile."
                  : profile.profile_completeness >= 85
                  ? "Your profile is looking great! Add skills to reach 100%"
                  : "Complete your profile to get better job recommendations"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Progress value={profile.profile_completeness} className="h-2 mb-4" />
              <Button
                onClick={() => router.push("/profile/wizard")}
                className={profile.profile_completeness === 100 
                  ? "w-full sm:w-auto bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white"
                  : "w-full sm:w-auto bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-500 dark:hover:bg-cyan-600 text-white"
                }
              >
                {profile.profile_completeness === 100 ? "Update Profile" : "Complete Profile"}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Header
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">My Profile</h1>
            <p className="text-muted-foreground mt-1">
              View and manage your profile information
            </p>
          </div>
          <Button onClick={() => router.push("/profile/wizard")}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        </div> */}

        {/* Personal Information */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
              <CardTitle>Personal Information</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Full Name</p>
                <p className="font-medium">{profile.full_name || `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Not set'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <p className="font-medium">{profile.email || 'Not set'}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <p className="font-medium">{profile.phone || 'Not set'}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Date of Birth</p>
                <p className="font-medium">{formatDate(profile.date_of_birth)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Gender</p>
                <p className="font-medium">{profile.gender || 'Not set'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Highest Qualification</p>
                <p className="font-medium">{formatQualification(profile.highest_qualification || profile.degree)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Course</p>
                <p className="font-medium">{profile.course || 'Not set'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Passing Year</p>
                <p className="font-medium">{profile.passing_year || 'Not set'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Information */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
              <CardTitle>Additional Information</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Technical Skills</p>
              {profile.technical_skills && profile.technical_skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {profile.technical_skills.map((skill, index) => (
                    <Badge key={`tech-${index}`} variant="secondary">{skill}</Badge>
                  ))}
                </div>
              ) : (
                <p className="font-medium">Not set</p>
              )}
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-2">Soft Skills</p>
              {profile.soft_skills && profile.soft_skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {profile.soft_skills.map((skill, index) => (
                    <Badge key={`soft-${index}`} variant="secondary">{skill}</Badge>
                  ))}
                </div>
              ) : (
                <p className="font-medium">Not set</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Experience Type</p>
                <p className="font-medium">{profile.experience_type || "Not set"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Job Type</p>
                <p className="font-medium">{formatList(jobType)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Work Mode</p>
                <p className="font-medium">{formatList(workMode)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Preferred Job Role</p>
                <p className="font-medium">{formatList(preferredJobRole)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Preferred Location</p>
                <p className="font-medium">{formatList(preferredLocation)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Expected Salary</p>
                <p className="font-medium">{expectedSalary ? `₹${expectedSalary.toLocaleString()}` : "Not set"}</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-1">Languages</p>
              <p className="font-medium">
                {profile.languages && profile.languages.length > 0
                  ? profile.languages
                      .map((lang) => [lang.language, lang.proficiency_level].filter(Boolean).join(" - "))
                      .join(" | ")
                  : "Not set"}
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground mb-1">GitHub Profile</p>
                {profile.github_profile ? (
                  <div className="flex items-center gap-2">
                    <LinkIcon className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={profile.github_profile}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-600 dark:text-cyan-400 hover:underline"
                    >
                      {profile.github_profile}
                    </a>
                  </div>
                ) : (
                  <p className="font-medium">Not set</p>
                )}
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">LinkedIn Profile</p>
                {profile.linkedin_profile ? (
                  <div className="flex items-center gap-2">
                    <LinkIcon className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={profile.linkedin_profile}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-600 dark:text-cyan-400 hover:underline"
                    >
                      {profile.linkedin_profile}
                    </a>
                  </div>
                ) : (
                  <p className="font-medium">Not set</p>
                )}
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Portfolio / Personal Website</p>
                {profile.portfolio_url ? (
                  <div className="flex items-center gap-2">
                    <LinkIcon className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={profile.portfolio_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-600 dark:text-cyan-400 hover:underline"
                    >
                      {profile.portfolio_url}
                    </a>
                  </div>
                ) : (
                  <p className="font-medium">Not set</p>
                )}
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Resume URL</p>
                {profile.resume_url ? (
                  <div className="flex items-center gap-2">
                    <LinkIcon className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={profile.resume_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-600 dark:text-cyan-400 hover:underline"
                    >
                      {profile.resume_url}
                    </a>
                  </div>
                ) : (
                  <p className="font-medium">Not set</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

