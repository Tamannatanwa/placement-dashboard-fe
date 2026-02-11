"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Bookmark, Briefcase, MapPin, Clock, Users, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { studentsApi } from "@/lib/api/students";
import { Job } from "@/types/job";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface SavedJob {
  id: string;
  job_id: number;
  saved_at: string;
  job: Job;
}

export default function SavedJobsPage() {
  const router = useRouter();
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadSavedJobs();
  }, []);

  const loadSavedJobs = async () => {
    setIsLoading(true);
    try {
      const response = await studentsApi.getSavedJobs();
      setSavedJobs(response.saved_jobs || []);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to load saved jobs");
      console.error("Error loading saved jobs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnsave = async (savedJobId: string, jobId: string) => {
    setDeletingId(savedJobId);
    try {
      // TODO: Replace with actual API call
      // await studentsApi.unsaveJob(savedJobId);
      
      // For now, just remove from local state
      setSavedJobs((prev) => prev.filter((sj) => sj.id !== savedJobId));
      toast.success("Job removed from saved");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to unsave job");
      console.error("Error unsaving job:", error);
    } finally {
      setDeletingId(null);
    }
  };

  const handleApply = (jobId: string) => {
    router.push(`/jobs/${jobId}`);
  };

  const formatSalary = (job: Job) => {
    if (job.salary_min && job.salary_max) {
      const minLakhs = (job.salary_min / 100000).toFixed(1);
      const maxLakhs = (job.salary_max / 100000).toFixed(1);
      return `₹ ${minLakhs}L - ${maxLakhs}L`;
    }
    return "Salary not specified";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="text-muted-foreground">Loading saved jobs...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Bookmark className="h-8 w-8 text-cyan-500 dark:text-cyan-400" />
              Saved Jobs
            </h1>
            <p className="text-muted-foreground mt-2">
              {savedJobs.length} {savedJobs.length === 1 ? "job" : "jobs"} saved
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => router.push("/student/dashboard")}
          >
            Back to Dashboard
          </Button>
        </div>

        {/* Saved Jobs List */}
        {savedJobs.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Bookmark className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No saved jobs yet</h3>
              <p className="text-muted-foreground mb-4">
                Start exploring jobs and save the ones you're interested in
              </p>
              <Button
                onClick={() => router.push("/student/dashboard")}
                className="bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-500 dark:hover:bg-cyan-600 text-white"
              >
                Browse Jobs
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {savedJobs.map((savedJob) => {
              const job = savedJob.job;
              return (
                <Card key={savedJob.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="h-12 w-12 rounded-lg bg-cyan-500/10 dark:bg-cyan-400/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-cyan-600 dark:text-cyan-400 font-bold text-lg">
                            {job.company_name?.charAt(0) || "J"}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg mb-1">{job.title}</h3>
                          <p className="text-muted-foreground text-sm">{job.company_name}</p>
                        </div>
                      </div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:text-red-600 dark:hover:text-red-400"
                            disabled={deletingId === savedJob.id}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Remove saved job?</DialogTitle>
                            <DialogDescription>
                              Are you sure you want to remove this job from your saved list? You can always save it again later.
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <DialogClose asChild>
                              <Button variant="outline">Cancel</Button>
                            </DialogClose>
                            <DialogClose
                              onClick={() => handleUnsave(savedJob.id, job.id)}
                              className="bg-red-600 hover:bg-red-700 text-white"
                            >
                              Remove
                            </DialogClose>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>

                    {/* Location & Salary */}
                    <div className="flex flex-wrap items-center gap-4 mb-3 text-sm text-muted-foreground">
                      {job.location && (
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-4 w-4" />
                          <span>{job.location}</span>
                        </div>
                      )}
                      <div>{formatSalary(job)}</div>
                    </div>

                    {/* Employment Type */}
                    {job.employment_type && (
                      <div className="mb-3">
                        <Badge variant="outline" className="bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20">
                          {job.employment_type.charAt(0).toUpperCase() + job.employment_type.slice(1)}
                        </Badge>
                      </div>
                    )}

                    {/* Skills */}
                    {job.skills_required && job.skills_required.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {job.skills_required.slice(0, 3).map((skill, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 rounded text-xs bg-muted text-muted-foreground"
                          >
                            {skill}
                          </span>
                        ))}
                        {job.skills_required.length > 3 && (
                          <span className="px-2 py-1 rounded text-xs bg-muted text-muted-foreground">
                            +{job.skills_required.length - 3} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>Saved {formatDistanceToNow(new Date(savedJob.saved_at), { addSuffix: true })}</span>
                        </div>
                        {job.application_count !== undefined && (
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            <span>{job.application_count} applicants</span>
                          </div>
                        )}
                      </div>
                      <Button
                        onClick={() => handleApply(job.id)}
                        className="bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-500 dark:hover:bg-cyan-600 text-white"
                        size="sm"
                      >
                        Apply Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}





