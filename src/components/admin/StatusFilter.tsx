"use client";

import { StudentStatus } from "@/types/student";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import { useMemo } from "react";

interface StatusFilterProps {
  selectedStatus: StudentStatus | "all";
  onStatusChange: (status: StudentStatus | "all") => void;
  availableStatuses: Array<{ status: StudentStatus; rawStatus: string }>; // Available statuses from data
  statusCounts: Map<StudentStatus, number>; // Count of students per status
  totalCount: number; // Total number of students
}

/**
 * Filter component for student status
 * Dynamically shows only statuses that exist in the data
 */
export function StatusFilter({ selectedStatus, onStatusChange, availableStatuses, statusCounts, totalCount }: StatusFilterProps) {
  // Get unique statuses with their display labels (using original Excel status labels)
  const statusOptions = useMemo(() => {
    const statusMap = new Map<string, { value: StudentStatus; label: string; color: string }>();
    
    // Add all available statuses from data, preserving original Excel labels
    availableStatuses.forEach(({ status, rawStatus }) => {
      const key = status;
      if (!statusMap.has(key)) {
        // Prefer original status from Excel, fallback to formatted normalized status
        const label = rawStatus && rawStatus.trim() !== "" 
          ? rawStatus 
          : status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, " ");
        const color = getStatusColor(status);
        statusMap.set(key, { value: status, label, color });
      } else {
        // Update label if we find a better rawStatus (non-empty)
        const existing = statusMap.get(key)!;
        if ((!existing.label || existing.label === status) && rawStatus && rawStatus.trim() !== "") {
          statusMap.set(key, { ...existing, label: rawStatus });
        }
      }
    });
    
    return Array.from(statusMap.values());
  }, [availableStatuses]);

  // Status color mapping
  function getStatusColor(status: StudentStatus): string {
    switch (status) {
      case "placed":
        return "bg-blue-500";
      case "internship_unpaid":
        return "bg-yellow-500";
      case "internship_paid":
        return "bg-yellow-500";
      case "job_ready":
        return "bg-green-500";
      case "job_ready_under_process":
        return "bg-purple-500";
      case "long_leave":
        return "bg-red-600";
      case "dropout":
        return "bg-red-500";
      default:
        return "bg-red-500";
    }
  }

  // Always include "All Students" option with count
  const allStatuses = [
    { value: "all" as const, label: "All Students", color: "bg-slate-500", count: totalCount },
    ...statusOptions.map((status) => ({
      ...status,
      count: statusCounts.get(status.value) || 0,
    })),
  ];

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Filter className="h-4 w-4 text-muted-foreground" />
      <span className="text-sm font-medium">Filter by Status:</span>
      {allStatuses.map((status) => (
        <Button
          key={status.value}
          variant={selectedStatus === status.value ? "default" : "outline"}
          size="sm"
          onClick={() => onStatusChange(status.value)}
          className={
            selectedStatus === status.value
              ? "bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-500 dark:hover:bg-cyan-600 text-white"
              : ""
          }
        >
          <span className={`w-2 h-2 rounded-full mr-2 ${status.color}`} />
          <span>
            {status.label}
            {status.count !== undefined && (
              <span className="ml-1.5 text-xs opacity-90">
                ({status.count} {status.count === 1 ? "student" : "students"})
              </span>
            )}
          </span>
        </Button>
      ))}
    </div>
  );
}

