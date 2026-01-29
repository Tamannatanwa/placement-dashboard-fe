"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, MapPin, Clock, Users, ExternalLink, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { jobsApi } from "@/lib/api/jobs";
import { studentsApi } from "@/lib/api/students";
import { Job } from "@/types/job";
import { JobCard } from "@/components/jobs/JobCard";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

/**
 * Job Detail Page
 * Shows full job information and allows application
 */
export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;

  const [job, setJob] = useState<Job | null>(null);
  const [similarJobs, setSimilarJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingSimilar, setIsLoadingSimilar] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set());
  const viewStartTime = useRef<number>(Date.now());
  const hasTrackedView = useRef<boolean>(false);

  useEffect(() => {
    if (jobId) {
      loadJob();
      checkIfSaved();
      trackJobView();
      loadSimilarJobs();
      loadSavedJobs();
    }

    // Track view duration when component unmounts
    return () => {
      if (hasTrackedView.current && jobId) {
        const duration = Math.floor((Date.now() - viewStartTime.current) / 1000);
        const jobIdNum = parseInt(jobId, 10);
        if (!isNaN(jobIdNum) && duration > 0) {
          // Track final view duration (fire and forget)
          studentsApi.trackJobView(jobIdNum, {
            job_id: jobIdNum,
            duration_seconds: duration,
            source: "job_detail",
          }).catch((error) => {
            console.error("Error tracking final job view:", error);
          });
        }
      }
    };
  }, [jobId]);

  const loadJob = async () => {
    setIsLoading(true);
    try {
      const data = await jobsApi.getJob(jobId);
      setJob(data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to load job details");
      console.error("Error loading job:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkIfSaved = async () => {
    const jobIdNum = parseInt(jobId, 10);
    if (isNaN(jobIdNum)) return;

    try {
      const response = await studentsApi.checkIfSaved(jobIdNum);
      setIsSaved(response.is_saved || false);
    } catch (error: any) {
      console.error("Error checking if job is saved:", error);
      // Silently fail - default to not saved
      setIsSaved(false);
    }
  };

  const trackJobView = async () => {
    if (hasTrackedView.current) return;
    
    const jobIdNum = parseInt(jobId, 10);
    if (isNaN(jobIdNum)) return;

    try {
      await studentsApi.trackJobView(jobIdNum, {
        job_id: jobIdNum,
        duration_seconds: 0, // Initial view, duration tracked on unmount
        source: "job_detail",
      });
      hasTrackedView.current = true;
    } catch (error) {
      // Silently fail - view tracking is not critical
      console.error("Error tracking job view:", error);
    }
  };


  const loadSimilarJobs = async () => {
    const jobIdNum = parseInt(jobId, 10);
    if (isNaN(jobIdNum)) return;

    setIsLoadingSimilar(true);
    try {
      const response = await studentsApi.getSimilarJobs(jobIdNum);
      if (response.jobs) {
        setSimilarJobs(response.jobs);
      }
    } catch (error: any) {
      console.error("Error loading similar jobs:", error);
      // Silently fail - similar jobs are optional
    } finally {
      setIsLoadingSimilar(false);
    }
  };

  const loadSavedJobs = async () => {
    try {
      const response = await studentsApi.getSavedJobs();
      const savedJobIds = new Set(response.saved_jobs.map((sj) => String(sj.job_id)));
      setSavedJobs(savedJobIds);
    } catch (error: any) {
      console.error("Error loading saved jobs:", error);
    }
  };

  const handleApply = (jobId?: string) => {
    const targetJob = jobId ? similarJobs.find((j) => j.id === jobId) : job;
    if (targetJob?.source_url) {
      window.open(targetJob.source_url, "_blank");
    } else {
      toast.info("Application link not available");
    }
  };

  const handleSave = async (targetJobId?: string) => {
    const jobIdToSave = targetJobId || jobId;
    const jobIdNum = parseInt(jobIdToSave, 10);
    if (isNaN(jobIdNum)) return;

    try {
      const isCurrentlySaved = savedJobs.has(jobIdToSave);
      
      if (isCurrentlySaved) {
        toast.info("To unsave, please use the saved jobs page");
        return;
      }

      await studentsApi.saveJob({
        job_id: jobIdNum,
      });

      setSavedJobs((prev) => {
        const newSet = new Set(prev);
        newSet.add(jobIdToSave);
        return newSet;
      });
      
      if (jobIdToSave === jobId) {
        setIsSaved(true);
      }
      
      toast.success("Job saved successfully");
    } catch (error: any) {
      console.error("Error saving job:", error);
      toast.error(error.response?.data?.message || "Failed to save job");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading job details...</div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-muted-foreground">Job not found</div>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  const formatSalary = () => {
    if (job.salary_min && job.salary_max) {
      const minLakhs = (job.salary_min / 100000).toFixed(1);
      const maxLakhs = (job.salary_max / 100000).toFixed(1);
      return `₹ ${minLakhs}L - ${maxLakhs}L`;
    }
    return "Salary not specified";
  };

  const getEmploymentType = () => {
    const type = job.employment_type || "";
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Jobs
        </Button>

        {/* Job Header */}
        <div className="bg-card border rounded-lg p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{job.title}</h1>
              <p className="text-xl text-muted-foreground mb-4">{job.company_name}</p>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                {job.location && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" />
                    <span>{job.location}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <span>₹</span>
                  <span>{formatSalary()}</span>
                </div>
                {job.created_at && (
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    <span>{formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}</span>
                  </div>
                )}
                {job.application_count !== undefined && (
                  <div className="flex items-center gap-1.5">
                    <Users className="h-4 w-4" />
                    <span>{job.application_count} applicants</span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {job.employment_type && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                    {getEmploymentType()}
                  </span>
                )}
                {job.work_type && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20">
                    {job.work_type}
                  </span>
                )}
                {job.is_fresher && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20">
                    Fresher Friendly
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2 ml-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleSave()}
                className={isSaved ? "bg-cyan-500/10" : ""}
              >
                <Bookmark className={`h-5 w-5 ${isSaved ? "fill-current" : ""}`} />
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={() => handleApply()}
              className="bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-500 dark:hover:bg-cyan-600 text-white"
              size="lg"
            >
              Apply Now
              <ExternalLink className="h-4 w-4 ml-2" />
            </Button>
            {job.source_url && (
              <Button
                variant="outline"
                onClick={() => window.open(job.source_url, "_blank")}
                size="lg"
              >
                View Original Posting
                <ExternalLink className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>

        {/* Job Details */}
        <div className="space-y-6">
          {/* Description */}
          {job.description && (
            <div className="bg-card border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Job Description</h2>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <p className="whitespace-pre-wrap text-muted-foreground">{job.description}</p>
              </div>
            </div>
          )}

          {/* Skills Required */}
          {job.skills_required && job.skills_required.length > 0 && (
            <div className="bg-card border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Skills Required</h2>
              <div className="flex flex-wrap gap-2">
                {job.skills_required.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 rounded-md bg-muted text-muted-foreground text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Experience & Salary Details */}
          <div className="bg-card border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Job Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {job.experience_min !== undefined && job.experience_max !== undefined && (
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Experience Required</div>
                  <div className="font-medium">
                    {job.experience_min} - {job.experience_max} years
                  </div>
                </div>
              )}
              {job.salary_min && job.salary_max && (
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Salary Range</div>
                  <div className="font-medium">{formatSalary()}</div>
                </div>
              )}
              {job.location && (
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Location</div>
                  <div className="font-medium">{job.location}</div>
                </div>
              )}
              {job.employment_type && (
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Employment Type</div>
                  <div className="font-medium">{getEmploymentType()}</div>
                </div>
              )}
            </div>
          </div>

          {/* Company Info */}
          {job.company && (
            <div className="bg-card border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">About Company</h2>
              <div className="space-y-2">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Company Name</div>
                  <div className="font-medium">{job.company.name}</div>
                </div>
                {job.company.domain && (
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Domain</div>
                    <div className="font-medium">{job.company.domain}</div>
                  </div>
                )}
                {job.company.website && (
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Website</div>
                    <a
                      href={job.company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-cyan-600 dark:text-cyan-400 hover:underline"
                    >
                      {job.company.website}
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Similar Jobs */}
          {similarJobs.length > 0 && (
            <div className="bg-card border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Similar Jobs</h2>
              {isLoadingSimilar ? (
                <div className="text-center py-8">
                  <div className="text-muted-foreground">Loading similar jobs...</div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {similarJobs.slice(0, 4).map((similarJob) => (
                    <JobCard
                      key={similarJob.id}
                      job={similarJob}
                      onApply={() => handleApply(similarJob.id)}
                      onSave={() => handleSave(similarJob.id)}
                      isSaved={savedJobs.has(similarJob.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


