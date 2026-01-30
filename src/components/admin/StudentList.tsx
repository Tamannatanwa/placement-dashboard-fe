"use client";

import { useMemo } from "react";
import { Student, StudentStatus } from "@/types/student";
import { Eye, Mail, Phone, FileText, MapPin, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { normalizeStudentData } from "@/lib/utils/excel";

interface StudentListProps {
  data: any[];
  onStudentSelect: (student: Student) => void;
  selectedStatus: StudentStatus | "all";
  selectedSchool: string | "all";
}

/**
 * Display list of students with their basic information
 * Shows filtered results based on status
 */
export function StudentList({ data, onStudentSelect, selectedStatus, selectedSchool }: StudentListProps) {
  // Normalize and filter student data using useMemo for performance
  const students: Student[] = useMemo(() => {
    const normalized = data.map((row, index) => normalizeStudentData(row, index));
    
    // Filter out students without names
    let filtered = normalized.filter((student) => {
      const name = (student.name || "").trim();
      return name !== "" && name !== "N/A";
    });
    
    // Filter by status
    if (selectedStatus !== "all") {
      filtered = filtered.filter((student) => student.status === selectedStatus);
    }
    
    // Filter by school
    if (selectedSchool !== "all") {
      filtered = filtered.filter((student) => {
        const studentSchool = (student.school || "").trim();
        const selectedSchoolTrimmed = selectedSchool.trim();
        // Match exact or check if it's an abbreviation
        return (
          studentSchool === selectedSchoolTrimmed ||
          studentSchool.toLowerCase() === selectedSchoolTrimmed.toLowerCase() ||
          (selectedSchoolTrimmed === "SOP" && studentSchool.includes("Programming")) ||
          (selectedSchoolTrimmed === "SOB" && studentSchool.includes("Business")) ||
          (selectedSchoolTrimmed === "SOD" && studentSchool.includes("Analytics"))
        );
      });
    }
    
    return filtered;
  }, [data, selectedStatus, selectedSchool]);

  // Get status badge color and label
  const getStatusInfo = (student: Student) => {
    const status = student.status;
    const rawStatus = student.rawStatus || "";
    
    // Use original status for display if available
    const displayStatus = rawStatus || status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, " ");
    
    switch (status) {
      case "placed":
        return { color: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20", label: displayStatus };
      case "internship_unpaid":
        return { color: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20", label: displayStatus };
      case "internship_paid":
        return { color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20", label: displayStatus };
      case "job_ready":
        return { color: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20", label: displayStatus };
      case "job_ready_under_process":
        return { color: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20", label: displayStatus };
      case "long_leave":
        return { color: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20", label: displayStatus };
      case "dropout":
        return { color: "bg-red-600/10 text-red-700 dark:text-red-500 border-red-600/20", label: displayStatus };
      default:
        return { color: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20", label: displayStatus };
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          Students ({students.length})
        </h3>
      </div>

      {students.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No students found with the selected filter.
        </div>
      ) : (
        <div className="space-y-2">
          {students.map((student) => (
            <div
              key={student.id}
              className="border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer"
              onClick={() => onStudentSelect(student)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h4 className="font-semibold">{student.name || "N/A"}</h4>
                    {(() => {
                      const statusInfo = getStatusInfo(student);
                      return (
                        <span className={`px-2 py-1 rounded text-xs font-medium border ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      );
                    })()}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                    {student.campus && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4 flex-shrink-0" />
                        <span>{student.campus}</span>
                      </div>
                    )}
                    {student.school && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <GraduationCap className="h-4 w-4 flex-shrink-0" />
                        <span>{student.school}</span>
                      </div>
                    )}
                    {student.email && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="h-4 w-4 flex-shrink-0" />
                        <span className="break-all">{student.email}</span>
                      </div>
                    )}
                    {student.phone && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-4 w-4 flex-shrink-0" />
                        <a 
                          href={`tel:${String(student.phone).replace(/\s/g, "").replace(/\+/g, "").replace(/-/g, "")}`}
                          className="text-cyan-600 dark:text-cyan-400 hover:underline"
                        >
                          {student.phone}
                        </a>
                      </div>
                    )}
                    {student.resume && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <FileText className="h-4 w-4 flex-shrink-0" />
                        <span>Resume Available</span>
                      </div>
                    )}
                  </div>

                  {student.group && (
                    <div className="text-xs text-muted-foreground">
                      Group: <span className="font-medium">{student.group}</span>
                    </div>
                  )}
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onStudentSelect(student);
                  }}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

