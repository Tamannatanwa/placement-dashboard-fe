"use client";

import { Briefcase, TrendingUp, Clock, Star } from "lucide-react";

interface JobStatsProps {
  availableJobs: number;
  newThisWeek: number;
  applied: number;
  saved: number;
}

/**
 * Statistics cards showing job metrics
 */
export function JobStats({ availableJobs, newThisWeek, applied, saved }: JobStatsProps) {
  const stats = [
    {
      label: "Available Jobs",
      value: availableJobs,
      icon: Briefcase,
      color: "text-cyan-600 dark:text-cyan-400",
      bgColor: "bg-cyan-500/10 dark:bg-cyan-400/10",
    },
    {
      label: "New This Week",
      value: newThisWeek,
      icon: TrendingUp,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-500/10 dark:bg-green-400/10",
    },
    {
      label: "Applied",
      value: applied,
      icon: Clock,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-500/10 dark:bg-blue-400/10",
    },
    {
      label: "Saved",
      value: saved,
      icon: Star,
      color: "text-yellow-600 dark:text-yellow-400",
      bgColor: "bg-yellow-500/10 dark:bg-yellow-400/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3">
              <div className={`h-10 w-10 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}


