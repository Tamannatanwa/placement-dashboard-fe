 "use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Briefcase, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ClientOnly } from "@/components/ui/ClientOnly";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getUserInfo, clearUserInfo } from "@/lib/utils/auth";
import { authApi } from "@/lib/api/auth";
import { JobSearch } from "@/components/jobs/JobSearch";
import { JobFilters } from "@/components/jobs/JobFilters";
import { JobCard } from "@/components/jobs/JobCard";
import { jobsApi } from "@/lib/api/jobs";
import { Job, JobFilters as JobFiltersType } from "@/types/job";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function JobsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userInfo, setUserInfo] = useState<{ id: string; email: string; role: string } | null>(null);
  const [filters, setFilters] = useState<JobFiltersType>({
    page: 1,
    size: 20,
    sort_by: "created_at",
    sort_order: "desc",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [totalJobs, setTotalJobs] = useState(0);

  useEffect(() => {
    const user = getUserInfo();
    setUserInfo(user);
  }, []);

  useEffect(() => {
    loadJobs();
  }, [filters]);

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

  const handleLogout = async () => {
    try {
      await authApi.logout();
      setUserInfo(null);
      clearUserInfo();
      toast.success("Logged out successfully");
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to logout");
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      const skills = query
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      if (skills.length > 0) {
        setFilters({
          ...filters,
          skills: skills.join(","),
          page: 1,
        });
      }
    } else {
      const { skills, ...restFilters } = filters;
      setFilters({ ...restFilters, page: 1 });
    }
  };

  const handleApply = (jobId: string) => {
    router.push(`/jobs/${jobId}`);
  };

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
  const userInitials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "S";

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
            <a
              href="/student/dashboard"
              className="text-sm font-medium hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
            >
              Dashboard
            </a>
            <a
              href="/jobs"
              className="text-sm font-medium text-cyan-600 dark:text-cyan-400"
            >
              Jobs
            </a>
            <a
              href="/jobs/saved"
              className="text-sm font-medium hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
            >
              Saved Jobs
            </a>
            <a
              href="/profile/wizard"
              className="text-sm font-medium hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
            >
              Profile
            </a>
          </nav>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
            </Button>
            <ClientOnly
              fallback={
                <Button variant="ghost" className="flex items-center gap-2">
                  <Avatar className="h-8 w-8 bg-cyan-600 text-white">
                    <AvatarFallback>{userInitials}</AvatarFallback>
                  </Avatar>
                </Button>
              }
            >
              <Button variant="ghost" className="flex items-center gap-2">
                <Avatar className="h-8 w-8 bg-cyan-600 text-white">
                  <AvatarFallback>{userInitials}</AvatarFallback>
                </Avatar>
              </Button>
            </ClientOnly>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold">Jobs</h1>
          <p className="text-muted-foreground text-lg">
            Browse all opportunities and apply directly.
          </p>
        </div>

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
              setSearchQuery("");
            }}
          />
        </div>

        {/* All Jobs Section */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {filteredJobs.length} Jobs Found
          </h2>
          <Select
            value={filters.sort_by || "created_at"}
            onValueChange={(
              value: "created_at" | "title" | "location" | "view_count"
            ) => {
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
            <div className="text-muted-foreground">
              No jobs found. Try adjusting your filters.
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onApply={handleApply}
                onSave={() => {}}
                isSaved={false}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}



