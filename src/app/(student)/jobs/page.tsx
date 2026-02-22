"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { JobSearch } from "@/components/jobs/JobSearch";
import { JobFilters } from "@/components/jobs/JobFilters";
import { JobCard } from "@/components/jobs/JobCard";
import { jobsApi } from "@/lib/api/jobs";
import { studentsApi } from "@/lib/api/students";
import { savedJobsApi } from "@/lib/api/saved-jobs";
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
  const [recommendedJobs, setRecommendedJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingRecommended, setIsLoadingRecommended] = useState(false);
  const [filters, setFilters] = useState<JobFiltersType>({
    page: 1,
    size: 20,
    sort_by: "created_at",
    sort_order: "desc",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [totalJobs, setTotalJobs] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set());
  const [savedJobsCount, setSavedJobsCount] = useState(0);

  useEffect(() => {
    loadJobs();
    loadRecommendedJobs();
    loadSavedJobs();
  }, [filters]);

  const loadJobs = async () => {
    const currentPage = filters.page || 1;
    const isFirstPage = currentPage === 1;

    if (isFirstPage) {
      setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }

    try {
      const response = await jobsApi.getJobs(filters);

      setJobs((prevJobs) => {
        if (isFirstPage) {
          return response.items;
        }

        const existingIds = new Set(prevJobs.map((job) => job.id));
        const newItems = response.items.filter((job) => !existingIds.has(job.id));
        return [...prevJobs, ...newItems];
      });

      setTotalJobs(response.total);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to load jobs");
      console.error("Error loading jobs:", error);
    } finally {
      if (isFirstPage) {
        setIsLoading(false);
      } else {
        setIsLoadingMore(false);
      }
    }
  };

  // Load recommended jobs from API
  const loadRecommendedJobs = async () => {
    setIsLoadingRecommended(true);
    try {
      const response = await studentsApi.getRecommendedJobs(10, 0);
      const jobs = response.recommendations.map((rec) => rec.job);
      setRecommendedJobs(jobs);
    } catch (error: any) {
      console.error("Error loading recommended jobs:", error);
      // Silently fail - recommendations are optional
    } finally {
      setIsLoadingRecommended(false);
    }
  };

  // Load saved jobs from API
  const loadSavedJobs = async () => {
    try {
      const response = await savedJobsApi.getSavedJobs();
      const savedJobIds = new Set(response.saved_jobs.map((sj) => String(sj.job_id)));
      setSavedJobs(savedJobIds);
      setSavedJobsCount(response.total);
    } catch (error: any) {
      console.error("Error loading saved jobs:", error);
      // Silently fail - saved jobs can be loaded later
    }
  };

  // Handle text search purely on the client side (title/company/skills_required).
  // We intentionally do NOT send this query as a backend `skills` filter,
  // because that expects exact skill names and can hide many valid jobs.
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleApply = (jobId: string) => {
    router.push(`/jobs/${jobId}`);
  };

  // Handle save job using API
  const handleSave = async (jobId: string) => {
    try {
      const isCurrentlySaved = savedJobs.has(jobId);
      
      if (isCurrentlySaved) {
        // Check if saved to get the saved job ID, then we'd need a delete endpoint
        // For now, we'll just show a message that unsaving requires the delete endpoint
        toast.info("To unsave, please use the saved jobs page");
        return;
      }

      // Save job via API
      await savedJobsApi.saveJob({
        job_id: jobId,
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
      toast.error(error.response?.data?.detail || error.response?.data?.message || "Failed to save job");
    }
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

  const hasMoreJobs = jobs.length < totalJobs;
  const loadMoreTriggerRef = useRef<HTMLDivElement | null>(null);

  // Infinite scroll: load next page when the sentinel div becomes visible
  useEffect(() => {
    if (!hasMoreJobs) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0];
        if (
          firstEntry.isIntersecting &&
          !isLoading &&
          !isLoadingMore &&
          (filters.page || 1) * (filters.size || 20) < totalJobs
        ) {
          setFilters((prev) => ({
            ...prev,
            page: (prev.page || 1) + 1,
          }));
        }
      },
      {
        root: null,
        rootMargin: "200px",
        threshold: 0.1,
      }
    );

    const current = loadMoreTriggerRef.current;
    if (current) {
      observer.observe(current);
    }

    return () => {
      if (current) {
        observer.unobserve(current);
      }
      observer.disconnect();
    };
  }, [hasMoreJobs, isLoading, isLoadingMore, filters.page, filters.size, totalJobs]);

  return (
    <div className="space-y-6">
      {/* Header */}
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

      {/* Main Content with Sidebar Filters */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Filters */}
        <aside className="lg:w-64 flex-shrink-0">
          <div className="bg-card border rounded-lg p-4 sticky top-4">
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
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 space-y-8">
          {/* Section 1: Recommended Jobs */}
          {recommendedJobs.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-semibold">Recommended for You</h2>
                  <p className="text-sm text-muted-foreground mt-1">
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
                  {recommendedJobs.map((job) => (
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

          {/* Section 2: All Jobs */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold">All Jobs</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {filteredJobs.length} {filteredJobs.length === 1 ? "job" : "jobs"} found
                </p>
              </div>
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

            {/* Job Listings with infinite scroll */}
            {isLoading && (filters.page || 1) === 1 ? (
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
              <>
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
                {hasMoreJobs && (
                  <div
                    ref={loadMoreTriggerRef}
                    className="flex items-center justify-center py-6 text-sm text-muted-foreground"
                  >
                    {isLoadingMore ? "Loading more jobs..." : "Scroll to load more jobs"}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


