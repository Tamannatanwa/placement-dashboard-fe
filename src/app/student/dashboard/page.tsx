"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  Bookmark,
  CheckCircle2,
  TrendingUp,
  MapPin,
  Clock,
  DollarSign,
  Star,
  Filter,
  Search,
  FileEdit,
  User,
  Settings,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { jobsApi } from "@/lib/api/jobs";
import { Job } from "@/types/job";
import { toast } from "sonner";
import { getUserInfo } from "@/lib/utils/auth";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

/**
 * Student Dashboard Page
 * Main dashboard with profile strength, stats, recommended jobs, and quick actions
 */
export default function StudentDashboard() {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState<{ id: string; email: string; role: string } | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set());

  // Mock data for dashboard stats
  const [applications, setApplications] = useState(8);
  const [savedJobsCount, setSavedJobsCount] = useState(12);
  const [offers, setOffers] = useState(2);
  const [profileViews, setProfileViews] = useState(24);
  const [profileStrength, setProfileStrength] = useState(85);

  // Recent applications mock data
  const recentApplications = [
    { id: "1", title: "Senior Frontend Developer", company: "Google", date: "2024-01-18", status: "In Review", statusColor: "bg-blue-500" },
    { id: "2", title: "React Developer", company: "Meta", date: "2024-01-17", status: "Interview Scheduled", statusColor: "bg-purple-500" },
    { id: "3", title: "Full Stack Engineer", company: "Amazon", date: "2024-01-15", status: "Rejected", statusColor: "bg-red-500" },
  ];

  useEffect(() => {
    const user = getUserInfo();
    setUserInfo(user);
    loadRecommendedJobs();
    loadSavedJobs();
  }, []);

  // Load recommended jobs
  const loadRecommendedJobs = async () => {
    setIsLoading(true);
    try {
      const response = await jobsApi.getJobs({
        page: 1,
        size: 6,
        sort_by: "created_at",
        sort_order: "desc",
        is_active: true,
      });
      setJobs(response.items);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to load jobs");
      console.error("Error loading jobs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load saved jobs from localStorage
  const loadSavedJobs = () => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("savedJobs");
      if (saved) {
        try {
          const savedArray = JSON.parse(saved);
          setSavedJobs(new Set(savedArray));
          setSavedJobsCount(savedArray.length);
        } catch (e) {
          console.error("Error loading saved jobs:", e);
        }
      }
    }
  };

  // Handle save job
  const handleSave = (jobId: string) => {
    setSavedJobs((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(jobId)) {
        newSet.delete(jobId);
        toast.success("Job removed from saved");
      } else {
        newSet.add(jobId);
        toast.success("Job saved");
      }
      setSavedJobsCount(newSet.size);
      // Save to localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("savedJobs", JSON.stringify(Array.from(newSet)));
      }
      return newSet;
    });
  };

  // Filter jobs by search query
  const filteredJobs = useMemo(() => {
    if (!searchQuery.trim()) return jobs;
    return jobs.filter(
      (job) =>
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.skills_required?.some((skill) =>
          skill.toLowerCase().includes(searchQuery.toLowerCase())
        )
    );
  }, [jobs, searchQuery]);

  const userName = userInfo?.email?.split("@")[0] || "Student";

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 md:px-6 py-8 space-y-8">
        {/* Welcome Section */}
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-bold">
            Welcome back, {userName}! 👋
          </h1>
          <p className="text-lg text-muted-foreground">
            Here&apos;s what&apos;s happening with your job search today
          </p>
        </div>

        {/* Profile Strength Section */}
        <Card className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border-cyan-500/20">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2">Profile Strength</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Your profile is looking great! Add skills to reach 100%
                </p>
                <div className="space-y-2">
                  <div className="relative h-3 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full transition-all duration-500"
                      style={{ width: `${profileStrength}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      {profileStrength}% Complete
                    </span>
                    <Button
                      size="sm"
                      className="bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-500 dark:hover:bg-cyan-600 text-white"
                      onClick={() => router.push("/student/profile")}
                    >
                      Complete Profile
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Applications Card */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                  <FileText className="h-6 w-6" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">+2 this week</p>
                <p className="text-3xl font-bold">{applications}</p>
                <p className="text-sm text-muted-foreground">Applications</p>
              </div>
            </CardContent>
          </Card>

          {/* Saved Jobs Card */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                  <Bookmark className="h-6 w-6" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">3 new today</p>
                <p className="text-3xl font-bold">{savedJobsCount}</p>
                <p className="text-sm text-muted-foreground">Saved Jobs</p>
              </div>
            </CardContent>
          </Card>

          {/* Offers Card */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Pending</p>
                <p className="text-3xl font-bold">{offers}</p>
                <p className="text-sm text-muted-foreground">Offers</p>
              </div>
            </CardContent>
          </Card>

          {/* Profile Views Card */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400">
                  <TrendingUp className="h-6 w-6" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">+8 this week</p>
                <p className="text-3xl font-bold">{profileViews}</p>
                <p className="text-sm text-muted-foreground">Profile Views</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recommended For You Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Recommended For You</h2>
            <Button variant="ghost" asChild>
              <Link href="/student/jobs">
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          {/* Search Bar */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search jobs..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-5 w-5" />
            </Button>
          </div>

          {/* Job Listings */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="text-muted-foreground">Loading jobs...</div>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-muted-foreground">No jobs found. Try adjusting your search.</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredJobs.slice(0, 6).map((job) => (
                <Card key={job.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-1">{job.title}</CardTitle>
                        <p className="text-sm text-muted-foreground">{job.company_name}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleSave(job.id)}
                        className="h-8 w-8"
                      >
                        <Bookmark
                          className={`h-4 w-4 ${
                            savedJobs.has(job.id) ? "fill-cyan-600 text-cyan-600" : ""
                          }`}
                        />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Skills Tags */}
                    {job.skills_required && job.skills_required.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {job.skills_required.slice(0, 3).map((skill, idx) => (
                          <Badge
                            key={idx}
                            variant="secondary"
                            className="bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20"
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Job Details */}
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>
                          {job.work_type === "remote"
                            ? "Remote"
                            : job.work_type === "hybrid"
                            ? "Hybrid"
                            : job.location || "Not specified"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{job.employment_type || job.job_type || "Full-time"}</span>
                      </div>
                      {(job.salary_min || job.salary_max) && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <DollarSign className="h-4 w-4" />
                          <span>
                            {job.salary_min && job.salary_max
                              ? `$${job.salary_min}k-$${job.salary_max}k`
                              : job.salary_min
                              ? `$${job.salary_min}k+`
                              : `$${job.salary_max}k`}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Posted Time & Match */}
                    <div className="flex items-center justify-between pt-2 border-t">
                      <span className="text-xs text-muted-foreground">
                        {job.created_at
                          ? `Posted ${formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}`
                          : "Recently posted"}
                      </span>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-green-500 text-green-500" />
                        <span className="text-xs font-medium text-green-600 dark:text-green-400">
                          {Math.floor(Math.random() * 20 + 80)}%
                        </span>
                      </div>
                    </div>

                    {/* Apply Button */}
                    <Button
                      className="w-full bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-500 dark:hover:bg-cyan-600 text-white"
                      onClick={() => router.push(`/student/jobs/${job.id}`)}
                    >
                      Apply Now
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Recent Applications & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Applications */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Applications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentApplications.map((app) => (
                <div
                  key={app.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1">
                    <h4 className="font-semibold">{app.title}</h4>
                    <p className="text-sm text-muted-foreground">{app.company}</p>
                    <p className="text-xs text-muted-foreground mt-1">{app.date}</p>
                  </div>
                  <Badge className={`${app.statusColor} text-white`}>{app.status}</Badge>
                </div>
              ))}
              <Button variant="ghost" className="w-full" asChild>
                <Link href="/student/applications">
                  View All Applications <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start h-auto py-4 hover:bg-accent"
                onClick={() => router.push("/student/profile?tab=resume")}
              >
                <FileEdit className="mr-3 h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">Update Resume</div>
                  <div className="text-xs text-muted-foreground">Keep your resume current</div>
                </div>
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start h-auto py-4 hover:bg-accent"
                onClick={() => router.push("/student/profile")}
              >
                <User className="mr-3 h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">Edit Profile</div>
                  <div className="text-xs text-muted-foreground">Update your information</div>
                </div>
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start h-auto py-4 hover:bg-accent"
                onClick={() => router.push("/student/settings")}
              >
                <Settings className="mr-3 h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">Preferences</div>
                  <div className="text-xs text-muted-foreground">Manage your settings</div>
                </div>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
