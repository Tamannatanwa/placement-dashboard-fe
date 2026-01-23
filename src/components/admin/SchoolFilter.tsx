"use client";

import { Button } from "@/components/ui/button";
import { GraduationCap } from "lucide-react";
import { useMemo } from "react";

interface SchoolFilterProps {
  selectedSchool: string | "all";
  onSchoolChange: (school: string | "all") => void;
  availableSchools: string[]; // Available schools from data
  schoolCounts: Map<string, number>; // Count of students per school
  totalCount: number; // Total number of students
}

/**
 * Filter component for school
 * Dynamically shows only schools that exist in the data
 */
export function SchoolFilter({ selectedSchool, onSchoolChange, availableSchools, schoolCounts, totalCount }: SchoolFilterProps) {
  // Map school abbreviations to full forms
  const schoolMap: Record<string, string> = {
    "SOP": "School of Programming",
    "SOB": "School of Business",
    "SOD": "School of Data Analytics",
    "School of Programming": "School of Programming",
    "School of Business": "School of Business",
    "School of Data Analytics": "School of Data Analytics",
  };

  // Get unique schools with their display names
  const schoolOptions = useMemo(() => {
    const uniqueSchools = Array.from(new Set(availableSchools.filter(Boolean)));
    
    return uniqueSchools.map((school) => {
      const normalized = school.trim();
      // Check if it's an abbreviation or full form
      const displayName = schoolMap[normalized] || normalized;
      const abbreviation = Object.keys(schoolMap).find(
        (key) => schoolMap[key] === normalized || key === normalized
      ) || normalized;
      
      return {
        value: normalized,
        label: displayName,
        abbreviation: abbreviation.length <= 3 ? abbreviation : "",
      };
    }).sort((a, b) => a.label.localeCompare(b.label));
  }, [availableSchools]);

  // Always include "All Schools" option with count
  const allSchools = [
    { value: "all" as const, label: "All Schools", abbreviation: "", count: totalCount },
    ...schoolOptions.map((school) => ({
      ...school,
      count: schoolCounts.get(school.value) || 0,
    })),
  ];

  // Get school badge color
  const getSchoolColor = (school: string): string => {
    const normalized = school.toLowerCase();
    if (normalized.includes("programming") || normalized === "sop") {
      return "bg-blue-500";
    }
    if (normalized.includes("business") || normalized === "sob") {
      return "bg-green-500";
    }
    if (normalized.includes("analytics") || normalized === "sod") {
      return "bg-purple-500";
    }
    return "bg-slate-500";
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <GraduationCap className="h-4 w-4 text-muted-foreground" />
      <span className="text-sm font-medium">Filter by School:</span>
      {allSchools.map((school) => (
        <Button
          key={school.value}
          variant={selectedSchool === school.value ? "default" : "outline"}
          size="sm"
          onClick={() => onSchoolChange(school.value)}
          className={
            selectedSchool === school.value
              ? "bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-500 dark:hover:bg-cyan-600 text-white"
              : ""
          }
        >
          {school.value !== "all" && (
            <span className={`w-2 h-2 rounded-full mr-2 ${getSchoolColor(school.value)}`} />
          )}
          {school.abbreviation && school.value !== "all" ? (
            <span>
              <span className="font-semibold">{school.abbreviation}</span>
              {school.count !== undefined && (
                <span className="ml-1.5 text-xs opacity-90">
                  ({school.count} {school.count === 1 ? "student" : "students"})
                </span>
              )}
              <span className="hidden sm:inline ml-1">({school.label})</span>
            </span>
          ) : (
            <span>
              {school.label}
              {school.count !== undefined && (
                <span className="ml-1.5 text-xs opacity-90">
                  ({school.count} {school.count === 1 ? "student" : "students"})
                </span>
              )}
            </span>
          )}
        </Button>
      ))}
    </div>
  );
}

