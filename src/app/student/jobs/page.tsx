"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, Filter, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { jobsApi } from "@/lib/api/jobs";
import { Job, JobFilters as JobFiltersType } from "@/types/job";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { MapPin, Clock, DollarSign, Star } from "lucide-react";
import Link from "next/link";

/**
 * Jobs Listing Page
 * Displays all available jobs with search, filters, and pagination
 */
export default function JobsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<JobFiltersType>({
    page: 1,
    size: 20,
    sort_by: "created_at",
    sort_order: "desc",
    is_active: true,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set());
  const [totalJobs, setTotalJobs] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Load jobs when filters change
  useEffect(() => {
    loadJobs();
  }, [filters]);

  // Load saved jobs from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("savedJobs");
      if (saved) {
        try {
          setSavedJobs(new Set(JSON.parse(saved)));
        } catch (e) {
          console.error("Error loading saved jobs:", e);
        }
      }
    }
  }, []);

  // Load jobs from API
  const loadJobs = async () => {
    setIsLoading(true);
    try {
      const response = await jobsApi.getJobs(filters);
      setJobs(response.items);
      setTotalJobs(response.total);
      setTotalPages(response.pages);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to load jobs");
      console.error("Error loading jobs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Update filters with search query
    setFilters({
      ...filters,
      page: 1, // Reset to first page
    });
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
      // Save to localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("savedJobs", JSON.stringify(Array.from(newSet)));
      }
      return newSet;
    });
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

  // Get unique locations from jobs
  const uniqueLocations = useMemo(() => {
    const locations = new Set<string>();
    jobs.forEach((job) => {
      if (job.location) locations.add(job.location);
      if (job.work_type === "remote") locations.add("Remote");
      if (job.work_type === "hybrid") locations.add("Hybrid");
    });
    return Array.from(locations).sort();
  }, [jobs]);

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 md:px-6 py-8 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold">Browse Jobs</h1>
          <p className="text-muted-foreground">
            Discover opportunities that match your skills and interests
          </p>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* Search Bar */}
              <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search jobs by title, company, or skills..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button type="submit" className="bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-500 dark:hover:bg-cyan-600 text-white">
                  Search
                </Button>
              </form>

              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Location Filter */}
                <Select
                  value={filters.location || "all"}
                  onValueChange={(value) => {
                    setFilters({
                      ...filters,
                      location: value === "all" ? undefined : value,
                      page: 1,
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    {uniqueLocations.map((location) => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Employment Type Filter */}
                <Select
                  value={filters.employment_type || "all"}
                  onValueChange={(value) => {
                    setFilters({
                      ...filters,
                      employment_type: value === "all" ? undefined : (value as any),
                      page: 1,
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Employment Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="fulltime">Full-time</SelectItem>
                    <SelectItem value="parttime">Part-time</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="internship">Internship</SelectItem>
                  </SelectContent>
                </Select>

                {/* Work Type Filter */}
                <Select
                  value={filters.work_type || "all"}
                  onValueChange={(value) => {
                    setFilters({
                      ...filters,
                      work_type: value === "all" ? undefined : (value as any),
                      page: 1,
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Work Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Work Types</SelectItem>
                    <SelectItem value="remote">Remote</SelectItem>
                    <SelectItem value="on-site">On-site</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>

                {/* Sort By */}
                <Select
                  value={filters.sort_by || "created_at"}
                  onValueChange={(value) => {
                    setFilters({
                      ...filters,
                      sort_by: value as any,
                      page: 1,
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sort By" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="created_at">Latest</SelectItem>
                    <SelectItem value="title">Title</SelectItem>
                    <SelectItem value="location">Location</SelectItem>
                    <SelectItem value="view_count">Most Popular</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Clear Filters */}
              {(filters.location || filters.employment_type || filters.work_type) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFilters({
                      page: 1,
                      size: 20,
                      sort_by: "created_at",
                      sort_order: "desc",
                      is_active: true,
                    });
                    setSearchQuery("");
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Results Count */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {isLoading ? "Loading..." : `${totalJobs} jobs found`}
          </p>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs.map((job) => (
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
                      {job.skills_required.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{job.skills_required.length - 3} more
                        </Badge>
                      )}
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              disabled={filters.page === 1}
              onClick={() => setFilters({ ...filters, page: (filters.page || 1) - 1 })}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {filters.page || 1} of {totalPages}
            </span>
            <Button
              variant="outline"
              disabled={(filters.page || 1) >= totalPages}
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

