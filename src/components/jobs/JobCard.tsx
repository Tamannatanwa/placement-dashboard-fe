"use client";

import { Job } from "@/types/job";
import { Button } from "@/components/ui/button";
import { MapPin, Bookmark, Clock, Users, Loader2, Building2, Briefcase } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface JobCardProps {
  job: Job;
  onApply: (jobId: string) => void;
  onSave: (jobId: string) => void;
  isSaved?: boolean;
  isSaving?: boolean;
}

/**
 * Job card – modern, simple layout for fresher students
 */
export function JobCard({ job, onApply, onSave, isSaved = false, isSaving = false }: JobCardProps) {
  const formatSalary = (): string | null => {
    if (job.salary_min && job.salary_max) {
      const minLakhs = (job.salary_min / 100000).toFixed(1);
      const maxLakhs = (job.salary_max / 100000).toFixed(1);
      return `₹${minLakhs}L–${maxLakhs}L`;
    }
    return null;
  };

  const salaryDisplay = formatSalary();
  const timeAgo = job.created_at
    ? formatDistanceToNow(new Date(job.created_at), { addSuffix: true })
    : "";

  const employmentLabel =
    job.employment_type &&
    (job.employment_type.charAt(0).toUpperCase() + job.employment_type.slice(1));

  const locationDisplay =
    job.location?.trim() ||
    (job.work_type === "remote" ? "Remote" : job.work_type === "on-site" ? "On-Site" : job.work_type === "hybrid" ? "Hybrid" : null);

  return (
    <article className="group relative rounded-xl border border-border/80 bg-card p-5 shadow-sm transition-all duration-200 hover:border-cyan-500/30 hover:shadow-md">
      {/* Save */}
      <button
        onClick={() => !isSaving && onSave(job.id)}
        disabled={isSaving}
        className="absolute right-4 top-4 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-cyan-600 dark:hover:text-cyan-400 disabled:opacity-60"
        aria-label={isSaved ? "Unsave job" : "Save job"}
      >
        {isSaving ? (
          <Loader2 className="h-4 w-4 animate-spin text-cyan-600" />
        ) : (
          <Bookmark className={`h-4 w-4 ${isSaved ? "fill-cyan-500 text-cyan-500" : ""}`} />
        )}
      </button>

      {/* Header: company initial + title + company name */}
      <div className="pr-10">
        <div className="mb-3 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 text-cyan-600 dark:text-cyan-400">
          <span className="text-sm font-bold">
            {job.company_name?.charAt(0) || "J"}
          </span>
        </div>
        <h3 className="text-base font-semibold leading-tight text-foreground line-clamp-2">
          {job.title}
        </h3>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
          <Building2 className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{job.company_name}</span>
        </p>
      </div>

      {/* Quick info: location (highlight 1), job type (highlight 2), salary */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {locationDisplay && (
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-500/15 px-2.5 py-1.5 text-xs font-medium text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-300">
            <MapPin className="h-3.5 w-3.5" />
            {locationDisplay}
          </span>
        )}
        {employmentLabel && (
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/15 px-2.5 py-1.5 text-xs font-medium text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
            <Briefcase className="h-3.5 w-3.5" />
            {employmentLabel}
          </span>
        )}
        {salaryDisplay && (
          <span className="rounded-lg bg-muted/80 px-2.5 py-1.5 text-xs text-muted-foreground">
            {salaryDisplay}
          </span>
        )}
      </div>

      {/* Description – short, readable */}
      {job.description && (
        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {job.description}
        </p>
      )}

      {/* Skills – pill style, limited */}
      {job.skills_required && job.skills_required.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {job.skills_required.slice(0, 4).map((skill, i) => (
            <span
              key={i}
              className="rounded-md bg-muted/60 px-2 py-0.5 text-xs text-muted-foreground"
            >
              {skill}
            </span>
          ))}
          {job.skills_required.length > 4 && (
            <span className="rounded-md bg-muted/60 px-2 py-0.5 text-xs text-muted-foreground">
              +{job.skills_required.length - 4}
            </span>
          )}
        </div>
      )}

      {/* Footer: meta + CTA */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-4">
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          {timeAgo && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {timeAgo}
            </span>
          )}
          {job.application_count !== undefined && (
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {job.application_count} applicants
            </span>
          )}
        </div>
        <Button
          onClick={() => onApply(job.id)}
          variant="default"
          size="sm"
          className="rounded-lg bg-cyan-600 px-4 font-medium text-white shadow-sm hover:bg-cyan-700 dark:bg-cyan-500 dark:hover:bg-cyan-600"
        >
          View Details
        </Button>
      </div>
    </article>
  );
}
