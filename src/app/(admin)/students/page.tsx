"use client";

import { useState } from "react";
import { Student, StudentStatus } from "@/types/student";
import { ExcelUpload } from "@/components/admin/ExcelUpload";
import { StatusFilter } from "@/components/admin/StatusFilter";
import { StudentList } from "@/components/admin/StudentList";
import { StudentDetail } from "@/components/admin/StudentDetail";
import { normalizeStudentData } from "@/lib/utils/excel";
import { FileSpreadsheet, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import * as XLSX from "xlsx";

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
  const [selectedStatus, setSelectedStatus] = useState<StudentStatus | "all">("unplaced");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [currentSheetName, setCurrentSheetName] = useState("");

  // Handle Excel data loaded
  const handleDataLoaded = (data: any[], sheetName: string) => {
    setRawData(data);
    setCurrentSheetName(sheetName);
    
    // Normalize student data
    const normalized = data.map((row, index) => normalizeStudentData(row, index));
    setStudents(normalized);
    
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
            Status: updatedStudent.status,
          };
        }
        return row;
      })
    );
    
    toast.success("Student updated successfully");
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
          <Button
            onClick={handleExportExcel}
            className="bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-500 dark:hover:bg-cyan-600 text-white"
          >
            <Download className="h-4 w-4 mr-2" />
            Export to Excel
          </Button>
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
          {/* Status Filter */}
          <div className="bg-card border rounded-lg p-6">
            <StatusFilter
              selectedStatus={selectedStatus}
              onStatusChange={setSelectedStatus}
            />
          </div>

          {/* Student List */}
          <div className="bg-card border rounded-lg p-6">
            <StudentList
              data={rawData}
              onStudentSelect={handleStudentSelect}
              selectedStatus={selectedStatus}
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




