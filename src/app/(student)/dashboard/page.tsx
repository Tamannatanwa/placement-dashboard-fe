"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Briefcase, Bell, User, AlertCircle, LogOut, Settings, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getUserInfo, clearUserInfo } from "@/lib/utils/auth";
import { authApi } from "@/lib/api/auth";
import { toast } from "sonner";
import { ClientOnly } from "@/components/ui/ClientOnly";
import { JobStats } from "@/components/jobs/JobStats";
import { JobSearch } from "@/components/jobs/JobSearch";
import { JobFilters } from "@/components/jobs/JobFilters";
import { JobCard } from "@/components/jobs/JobCard";
import { jobsApi } from "@/lib/api/jobs";
import { studentsApi } from "@/lib/api/students";
import { Job, JobFilters as JobFiltersType } from "@/types/job";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Student Dashboard Page
 * Shows job listings with search, filters, and statistics
 */
export default function StudentDashboard() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [recentJobs, setRecentJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDashboardLoading, setIsDashboardLoading] = useState(true);
  const [userInfo, setUserInfo] = useState<{ id: string; email: string; role: string } | null>(null);
  const [filters, setFilters] = useState<JobFiltersType>({
    page: 1,
    size: 20,
    sort_by: "created_at",
    sort_order: "desc",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set());
  const [recommendedJobs, setRecommendedJobs] = useState<Job[]>([]);
  const [isLoadingRecommended, setIsLoadingRecommended] = useState(false);
  const [totalJobs, setTotalJobs] = useState(0);
  const [newThisWeek, setNewThisWeek] = useState(0);
  const [savedJobsCount, setSavedJobsCount] = useState(0);
  const [profileCompleteness, setProfileCompleteness] = useState(0);
  const [notificationsUnread, setNotificationsUnread] = useState(0);
  const [recommendationsAvailable, setRecommendationsAvailable] = useState(0);

  // Load dashboard data on mount
  useEffect(() => {
    const user = getUserInfo();
    setUserInfo(user);
    loadDashboard();
    loadSavedJobs();
    loadRecommendedJobs();
  }, []);

  const handleLogout = async () => {
    try {
      await authApi.logout();
      setUserInfo(null);
      clearUserInfo();
      toast.success("Logged out successfully");
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to logout");
    }
  };

  const userName = userInfo?.email?.split("@")[0] || "Student";
  const userInitials = userName.split(' ').map(n => n[0]).join('').toUpperCase() || "S";

  // Load jobs when filters change
  useEffect(() => {
    loadJobs();
  }, [filters]);

  // Calculate new jobs this week
  useEffect(() => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const newJobs = jobs.filter(
      (job) => new Date(job.created_at) >= weekAgo
    ).length;
    setNewThisWeek(newJobs);
  }, [jobs]);

  // Load dashboard data from API
  const loadDashboard = async () => {
    setIsDashboardLoading(true);
    try {
      const dashboardData = await studentsApi.getDashboard();
      
      // Set dashboard stats
      setRecentJobs(dashboardData.recent_jobs || []);
      setSavedJobsCount(dashboardData.saved_jobs_count || 0);
      setProfileCompleteness(dashboardData.profile_completeness || 0);
      setNotificationsUnread(dashboardData.notifications_unread || 0);
      setRecommendationsAvailable(dashboardData.recommendations_available || 0);
      
      // Update saved jobs set from API count
      if (dashboardData.student?.saved_jobs_count) {
        setSavedJobsCount(dashboardData.student.saved_jobs_count);
      }
    } catch (error: any) {
      console.error("Error loading dashboard:", error);
      // Don't show error toast for dashboard - it's not critical if it fails
    } finally {
      setIsDashboardLoading(false);
    }
  };

  // Load saved jobs from API
  const loadSavedJobs = async () => {
    try {
      const response = await studentsApi.getSavedJobs();
      const savedJobIds = new Set(response.saved_jobs.map((sj) => String(sj.job_id)));
      setSavedJobs(savedJobIds);
      setSavedJobsCount(response.total);
    } catch (error: any) {
      console.error("Error loading saved jobs:", error);
      // Silently fail - saved jobs can be loaded later
    }
  };

  // Load recommended jobs from API
  const loadRecommendedJobs = async () => {
    setIsLoadingRecommended(true);
    try {
      const response = await studentsApi.getRecommendedJobs(10, 0);
      const jobs = response.recommendations.map((rec) => rec.job);
      setRecommendedJobs(jobs);
      setRecommendationsAvailable(response.total);
    } catch (error: any) {
      console.error("Error loading recommended jobs:", error);
      // Silently fail - recommendations are optional
    } finally {
      setIsLoadingRecommended(false);
    }
  };

  // Load jobs from API
  const loadJobs = async () => {
    setIsLoading(true);
    try {
      const response = await jobsApi.getJobs(filters);
      setJobs(response.items);
      setTotalJobs(response.total);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to load jobs");
      console.error("Error loading jobs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle search - filter by skills or title
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // If API supports search, we can add it to filters
    // For now, we'll filter client-side
    if (query.trim()) {
      // Update filters with skills search if it looks like skills
      const skills = query.split(",").map((s) => s.trim()).filter(Boolean);
      if (skills.length > 0) {
        setFilters({
          ...filters,
          skills: skills.join(","),
          page: 1, // Reset to first page
        });
      }
    } else {
      // Clear skills filter when search is cleared
      const { skills, ...restFilters } = filters;
      setFilters({ ...restFilters, page: 1 });
    }
  };

  // Handle job application with view tracking
  const handleApply = async (jobId: string) => {
    try {
      // Track job view before navigating
      const jobIdNum = parseInt(jobId, 10);
      if (!isNaN(jobIdNum)) {
        await studentsApi.trackJobView(jobIdNum, {
          job_id: jobIdNum,
          duration_seconds: 0, // We'll track duration on the detail page
          source: "dashboard",
        });
      }
    } catch (error) {
      // Silently fail - view tracking is not critical
      console.error("Error tracking job view:", error);
    }
    
    // Navigate to job detail or application page
    router.push(`/jobs/${jobId}`);
  };

  // Handle save job using API
  const handleSave = async (jobId: string) => {
    const jobIdNum = parseInt(jobId, 10);
    if (isNaN(jobIdNum)) return;

    try {
      const isCurrentlySaved = savedJobs.has(jobId);
      
      if (isCurrentlySaved) {
        // Check if saved to get the saved job ID, then we'd need a delete endpoint
        // For now, we'll just show a message that unsaving requires the delete endpoint
        toast.info("To unsave, please use the saved jobs page");
        return;
      }

      // Save job via API
      await studentsApi.saveJob({
        job_id: jobIdNum,
      });

      // Update local state
      setSavedJobs((prev) => {
        const newSet = new Set(prev);
        newSet.add(jobId);
        return newSet;
      });
      setSavedJobsCount((prev) => prev + 1);
      toast.success("Job saved successfully");
    } catch (error: any) {
      console.error("Error saving job:", error);
      toast.error(error.response?.data?.message || "Failed to save job");
    }
  };

  // Filter jobs by search query (client-side for now)
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-cyan-500 dark:text-cyan-400" />
            <span className="font-bold text-xl">PlaceHub</span>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <a href="#jobs" className="text-sm font-medium hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">
              Jobs
            </a>
            <a href="/student/applications" className="text-sm font-medium hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">
              Applications
            </a>
            <a href="#companies" className="text-sm font-medium hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">
              Companies
            </a>
            <a href="#resources" className="text-sm font-medium hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">
              Resources
            </a>
          </nav>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {notificationsUnread > 0 && (
                <span className="absolute top-0 right-0 h-2 w-2 bg-cyan-600 rounded-full" />
              )}
            </Button>
            <ClientOnly
              fallback={
                <Button variant="ghost" className="flex items-center gap-2">
                  <Avatar className="h-8 w-8 bg-cyan-600 text-white">
                    <AvatarFallback>{userInitials}</AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block text-left">
                    <div className="text-sm font-medium">{userName}</div>
                    <div className="text-xs text-muted-foreground capitalize">
                      {userInfo?.role || "Student"}
                    </div>
                  </div>
                </Button>
              }
            >
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <Avatar className="h-8 w-8 bg-cyan-600 text-white">
                      <AvatarFallback>{userInitials}</AvatarFallback>
                    </Avatar>
                    <div className="hidden md:block text-left">
                      <div className="text-sm font-medium">{userName}</div>
                      <div className="text-xs text-muted-foreground capitalize">
                        {userInfo?.role || "Student"}
                      </div>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{userName}</p>
                      <p className="text-xs leading-none text-muted-foreground capitalize">
                        {userInfo?.role || "Student"}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push("/profile/wizard")}>
                    <UserCircle className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/student/settings")}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </ClientOnly>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Welcome Section */}
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold">
            Welcome back! 👋
          </h1>
          <p className="text-muted-foreground text-lg">
            Discover your next career opportunity
          </p>
        </div>

        {/* Profile Completeness Alert */}
        {profileCompleteness < 100 && (
          <Card className="border-cyan-500/20 bg-cyan-500/5">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                  <CardTitle className="text-base">Profile Strength</CardTitle>
                </div>
                <span className="text-sm font-medium">{profileCompleteness}%</span>
              </div>
              <CardDescription>
                {profileCompleteness >= 85
                  ? "Your profile is looking great! Add skills to reach 100%"
                  : "Complete your profile to get better job recommendations"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Progress value={profileCompleteness} className="h-2 mb-4" />
              <Button
                onClick={() => router.push("/profile/wizard")}
                className="w-full sm:w-auto bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-500 dark:hover:bg-cyan-600 text-white"
              >
                Complete Profile
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <JobStats
          availableJobs={totalJobs}
          newThisWeek={newThisWeek}
          applied={0} // TODO: Get from applications API
          saved={savedJobsCount}
        />

        {/* Search Bar */}
        <div className="max-w-2xl">
          <JobSearch
            onSearch={handleSearch}
            placeholder="Search jobs by title, company, or skills..."
          />
        </div>

        {/* Filters */}
        <div className="bg-card border rounded-lg p-6">
          <JobFilters
            filters={filters}
            onFiltersChange={setFilters}
            onClear={() => {
              setFilters({
                page: 1,
                size: 20,
                sort_by: "created_at",
                sort_order: "desc",
              });
            }}
          />
        </div>

        {/* Recommended Jobs Section */}
        {recommendedJobs.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Recommended for You</h2>
                <p className="text-sm text-muted-foreground">
                  Jobs matched to your profile
                </p>
              </div>
            </div>
            {isLoadingRecommended ? (
              <div className="text-center py-8">
                <div className="text-muted-foreground">Loading recommendations...</div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {recommendedJobs.slice(0, 4).map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    onApply={handleApply}
                    onSave={handleSave}
                    isSaved={savedJobs.has(job.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Recent Jobs Section */}
        {recentJobs.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Recent Jobs</h2>
                <p className="text-sm text-muted-foreground">
                  Jobs you might be interested in
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recentJobs.slice(0, 4).map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  onApply={handleApply}
                  onSave={handleSave}
                  isSaved={savedJobs.has(job.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* All Jobs Section */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {filteredJobs.length} Jobs Found
          </h2>
          <Select
            value={filters.sort_by || "created_at"}
            onValueChange={(value: "created_at" | "title" | "location" | "view_count") => {
              setFilters({ ...filters, sort_by: value });
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="created_at">Latest</SelectItem>
              <SelectItem value="title">Title</SelectItem>
              <SelectItem value="location">Location</SelectItem>
              <SelectItem value="view_count">Most Popular</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Job Listings */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="text-muted-foreground">Loading jobs...</div>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-muted-foreground">No jobs found. Try adjusting your filters.</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onApply={handleApply}
                onSave={handleSave}
                isSaved={savedJobs.has(job.id)}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalJobs > (filters.size || 20) && (
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              disabled={filters.page === 1}
              onClick={() => setFilters({ ...filters, page: (filters.page || 1) - 1 })}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {filters.page || 1} of {Math.ceil(totalJobs / (filters.size || 20))}
            </span>
            <Button
              variant="outline"
              disabled={(filters.page || 1) >= Math.ceil(totalJobs / (filters.size || 20))}
              onClick={() => setFilters({ ...filters, page: (filters.page || 1) + 1 })}
            >
              Next
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}

