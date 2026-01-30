"use client";

import { useState } from "react";
import { Student, StudentStatus } from "@/types/student";
import { ExcelUpload } from "@/components/admin/ExcelUpload";
import { StatusFilter } from "@/components/admin/StatusFilter";
import { SchoolFilter } from "@/components/admin/SchoolFilter";
import { StudentList } from "@/components/admin/StudentList";
import { StudentDetail } from "@/components/admin/StudentDetail";
import { normalizeStudentData } from "@/lib/utils/excel";
import { FileSpreadsheet, Download, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { performAutomatedReview } from "@/lib/utils/resumeReview";

/**
 * Admin page for managing student data from Excel files
 * Features:
 * - Upload Excel file and select sheet
 * - Filter students by status (placed, unplaced, internship, long leave)
 * - View student details (contact, resume, projects)
 * - Assign students to groups
 * - Add feedback for each student
 * - Export updated data back to Excel
 */
export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [rawData, setRawData] = useState<any[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<StudentStatus | "all">("all");
  const [selectedSchool, setSelectedSchool] = useState<string | "all">("all");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [currentSheetName, setCurrentSheetName] = useState("");

  // Handle Excel data loaded
  const handleDataLoaded = (data: any[], sheetName: string) => {
    setRawData(data);
    setCurrentSheetName(sheetName);
    
    // Normalize student data and filter out students without names
    const normalized = data
      .map((row, index) => normalizeStudentData(row, index))
      .filter((student) => {
        const name = (student.name || "").trim();
        return name !== "" && name !== "N/A";
      });
    setStudents(normalized);
    
    // Reset filters to "all" when new data is loaded
    setSelectedStatus("all");
    setSelectedSchool("all");
    
    toast.success(`Loaded ${normalized.length} students from "${sheetName}"`);
  };

  // Handle student selection
  const handleStudentSelect = (student: Student) => {
    setSelectedStudent(student);
    setIsDetailOpen(true);
  };

  // Handle student update
  const handleStudentUpdate = (updatedStudent: Student) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === updatedStudent.id ? updatedStudent : s))
    );
    
    // Update raw data as well
    setRawData((prev) =>
      prev.map((row, index) => {
        const normalized = normalizeStudentData(row, index);
        if (normalized.id === updatedStudent.id) {
          return {
            ...row,
            Group: updatedStudent.group || "",
            Feedback: updatedStudent.feedback || "",
            "Resume Score": updatedStudent.resumeScore !== undefined ? updatedStudent.resumeScore : "",
            "Resume Structure": updatedStudent.resumeStructure || "",
            "Resume Projects": updatedStudent.resumeProjects || "",
            "Project Score": updatedStudent.projectScore !== undefined ? updatedStudent.projectScore : "",
            "Project Difficulty": updatedStudent.projectDifficulty || "",
            "Project Review": updatedStudent.projectReview || "",
            Status: updatedStudent.status,
          };
        }
        return row;
      })
    );
    
    toast.success("Student updated successfully");
  };

  // Bulk automated review for all students
  const handleBulkAutoReview = () => {
    if (students.length === 0) {
      toast.error("No students to review");
      return;
    }

    let reviewedCount = 0;
    
    students.forEach((student) => {
      // Only review if resume or projects exist
      if (student.resume || student.projects) {
        const review = performAutomatedReview(
          student.resume || "",
          student.resume || "",
          student.projects || ""
        );

        // Update student with automated review
        const updatedStudent: Student = {
          ...student,
          resumeScore: review.structureScore,
          resumeStructure: review.structure,
          resumeProjects: review.projects,
          projectScore: review.projectsScore,
          projectDifficulty: review.difficulty,
          projectReview: review.projects,
        };

        // Update students state
        setStudents((prev) =>
          prev.map((s) => (s.id === updatedStudent.id ? updatedStudent : s))
        );

        // Update raw data
        setRawData((prev) =>
          prev.map((row, index) => {
            const normalized = normalizeStudentData(row, index);
            if (normalized.id === updatedStudent.id) {
              return {
                ...row,
                "Resume Score": review.structureScore,
                "Resume Structure": review.structure,
                "Resume Projects": review.projects,
                "Project Score": review.projectsScore,
                "Project Difficulty": review.difficulty,
                "Project Review": review.projects,
              };
            }
            return row;
          })
        );

        reviewedCount++;
      }
    });

    toast.success(`Automated review completed for ${reviewedCount} student(s)`);
  };

  // Export updated data to Excel
  const handleExportExcel = () => {
    if (rawData.length === 0) {
      toast.error("No data to export");
      return;
    }

    try {
      // Create a new workbook
      const workbook = XLSX.utils.book_new();
      
      // Convert updated data to worksheet
      const worksheet = XLSX.utils.json_to_sheet(rawData);
      
      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, currentSheetName || "Students");
      
      // Generate filename with timestamp
      const filename = `students_${currentSheetName}_${new Date().toISOString().split("T")[0]}.xlsx`;
      
      // Write file
      XLSX.writeFile(workbook, filename);
      
      toast.success("Excel file exported successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to export Excel file");
    }
  };

  // Export review sheets separately by school
  const handleExportFeedback = () => {
    if (students.length === 0) {
      toast.error("No students to export");
      return;
    }

    try {
      // Filter students with any review data
      const reviewedStudents = students.filter((s) => {
        return (
          (s.feedback && s.feedback.trim() !== "") ||
          (s.group && s.group.trim() !== "") ||
          (s.resumeScore !== undefined && s.resumeScore !== null) ||
          (s.resumeStructure && s.resumeStructure.trim() !== "") ||
          (s.resumeProjects && s.resumeProjects.trim() !== "") ||
          (s.projectScore !== undefined && s.projectScore !== null) ||
          (s.projectDifficulty && s.projectDifficulty.trim() !== "") ||
          (s.projectReview && s.projectReview.trim() !== "")
        );
      });

      if (reviewedStudents.length === 0) {
        toast.error("No review data found. Please review resumes and projects, add scores, feedback, or group assignments.");
        return;
      }

      // Group students by school
      const schoolGroups = new Map<string, Student[]>();
      
      reviewedStudents.forEach((student) => {
        const school = (student.school || "").trim() || "Other";
        if (!schoolGroups.has(school)) {
          schoolGroups.set(school, []);
        }
        schoolGroups.get(school)!.push(student);
      });

      // Create a new workbook with multiple sheets (one per school)
      const workbook = XLSX.utils.book_new();
      
      // School abbreviation mapping
      const schoolAbbrev: Record<string, string> = {
        "School of Programming": "SOP",
        "School of Business": "SOB",
        "School of Data Analytics": "SOD",
        "SOP": "SOP",
        "SOB": "SOB",
        "SOD": "SOD",
      };

      // Create a sheet for each school
      schoolGroups.forEach((schoolStudents, schoolName) => {
        const feedbackData = schoolStudents.map((student) => ({
          Name: student.name || "",
          Campus: student.campus || "",
          "Contact Details": student.phone || "",
          Email: student.email || "",
          School: student.school || "",
          Group: student.group || "",
          Feedback: student.feedback || "",
          "Resume Score": student.resumeScore !== undefined ? student.resumeScore : "",
          "Resume Structure": student.resumeStructure || "",
          "Resume Projects": student.resumeProjects || "",
          "Project Score": student.projectScore !== undefined ? student.projectScore : "",
          "Project Difficulty": student.projectDifficulty || "",
          "Project Review": student.projectReview || "",
        }));

        // Convert to worksheet
        const worksheet = XLSX.utils.json_to_sheet(feedbackData);
        
        // Get school abbreviation for sheet name
        const abbrev = schoolAbbrev[schoolName] || schoolName.substring(0, 10);
        const sheetName = abbrev.length <= 31 ? abbrev : abbrev.substring(0, 31);
        
        // Add worksheet to workbook
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
      });

      // Generate filename with timestamp
      const filename = `student_reviews_${new Date().toISOString().split("T")[0]}.xlsx`;
      
      // Write file
      XLSX.writeFile(workbook, filename);
      
      toast.success(`Exported ${schoolGroups.size} review sheet(s) successfully`);
    } catch (error: any) {
      toast.error(error.message || "Failed to export review sheets");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <FileSpreadsheet className="h-8 w-8 text-cyan-500 dark:text-cyan-400" />
            Student Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Upload Excel file, filter students by status, review resumes, and add feedback
          </p>
        </div>
        
        {students.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={handleBulkAutoReview}
              variant="outline"
              className="border-purple-600 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Auto Review All Students
            </Button>
            <Button
              onClick={handleExportExcel}
              variant="outline"
              className="border-cyan-600 text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-950"
            >
              <Download className="h-4 w-4 mr-2" />
              Export All Data
            </Button>
            <Button
              onClick={handleExportFeedback}
              className="bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-500 dark:hover:bg-cyan-600 text-white"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Review Sheets (By School)
            </Button>
          </div>
        )}
      </div>

      {/* Excel Upload Section */}
      <div className="bg-card border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Upload Excel File</h2>
        <ExcelUpload onDataLoaded={handleDataLoaded} />
      </div>

      {/* Filters and Student List */}
      {students.length > 0 && (
        <>
          {/* Filters */}
          <div className="bg-card border rounded-lg p-6 space-y-4">
            <StatusFilter
              selectedStatus={selectedStatus}
              onStatusChange={setSelectedStatus}
              availableStatuses={students.map((s) => ({
                status: s.status,
                rawStatus: s.rawStatus || "",
              }))}
              statusCounts={(() => {
                const counts = new Map<StudentStatus, number>();
                students.forEach((s) => {
                  counts.set(s.status, (counts.get(s.status) || 0) + 1);
                });
                return counts;
              })()}
              totalCount={students.length}
            />
            
            <div className="border-t pt-4">
              <SchoolFilter
                selectedSchool={selectedSchool}
                onSchoolChange={setSelectedSchool}
                availableSchools={students.map((s) => s.school || "").filter(Boolean)}
                schoolCounts={(() => {
                  const counts = new Map<string, number>();
                  students.forEach((s) => {
                    const school = (s.school || "").trim();
                    if (school) {
                      counts.set(school, (counts.get(school) || 0) + 1);
                    }
                  });
                  return counts;
                })()}
                totalCount={students.length}
              />
            </div>
          </div>

          {/* Student List */}
          <div className="bg-card border rounded-lg p-6">
            <StudentList
              data={rawData}
              onStudentSelect={handleStudentSelect}
              selectedStatus={selectedStatus}
              selectedSchool={selectedSchool}
            />
          </div>
        </>
      )}

      {/* Student Detail Dialog */}
      <StudentDetail
        student={selectedStudent}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onUpdate={handleStudentUpdate}
      />
    </div>
  );
}
