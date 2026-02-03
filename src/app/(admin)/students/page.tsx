"use client";

import { useState, useMemo } from "react";
import { Student, StudentStatus } from "@/types/student";
import { ExcelUpload } from "@/components/admin/ExcelUpload";
import { StatusFilter } from "@/components/admin/StatusFilter";
import { StudentList } from "@/components/admin/StudentList";
import { StudentDetail } from "@/components/admin/StudentDetail";
import { normalizeStudentData } from "@/lib/utils/excel";
import { FileSpreadsheet, Download, Users, UserCheck, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

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
  const [selectedSchool, setSelectedSchool] = useState<string | "all">("all");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [currentSheetName, setCurrentSheetName] = useState("");
  const [showActiveOnly, setShowActiveOnly] = useState<boolean | null>(null);

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

  // Calculate status filter props from students data
  const statusFilterProps = useMemo(() => {
    if (students.length === 0) {
      return {
        availableStatuses: [],
        statusCounts: new Map<StudentStatus, number>(),
        totalCount: 0,
      };
    }

    // Get unique statuses with their raw status values
    const statusMap = new Map<StudentStatus, string>();
    const statusCounts = new Map<StudentStatus, number>();

    students.forEach((student) => {
      const status = student.status as StudentStatus;
      const rawStatus = student.rawStatus || "";
      
      // Store the first rawStatus we encounter for each normalized status
      if (!statusMap.has(status)) {
        statusMap.set(status, rawStatus);
      }
      
      // Count students per status
      statusCounts.set(status, (statusCounts.get(status) || 0) + 1);
    });

    // Convert to array format
    const availableStatuses = Array.from(statusMap.entries()).map(([status, rawStatus]) => ({
      status,
      rawStatus,
    }));

    return {
      availableStatuses,
      statusCounts,
      totalCount: students.length,
    };
  }, [students]);

  // Calculate active/inactive counts
  const activeCount = useMemo(() => {
    // TODO: Replace with actual API call to get active/inactive status
    // For now, we'll assume all students are active unless marked otherwise
    return students.length;
  }, [students]);

  const inactiveCount = useMemo(() => {
    // TODO: Replace with actual API call
    return 0;
  }, [students]);

  // Handle student active/inactive toggle
  const handleToggleActive = async (student: Student, isActive: boolean) => {
    try {
      // TODO: Replace with actual API call
      // await adminApi.updateStudentStatus(student.email, { is_active: isActive });
      
      toast.success(`Student ${isActive ? "activated" : "deactivated"} successfully`);
      
      // Update local state if needed
      // This would require adding is_active to Student type
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update student status");
      console.error("Error updating student status:", error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Users className="h-8 w-8 text-cyan-500 dark:text-cyan-400" />
            Student Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage students, review resumes, assign groups, and provide feedback
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

      {/* Stats Cards */}
      {students.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{students.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Students</CardTitle>
              <UserCheck className="h-4 w-4 text-green-600 dark:text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{activeCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inactive Students</CardTitle>
              <UserX className="h-4 w-4 text-red-600 dark:text-red-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">{inactiveCount}</div>
            </CardContent>
          </Card>
        </div>
      )}

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
              availableStatuses={statusFilterProps.availableStatuses}
              statusCounts={statusFilterProps.statusCounts}
              totalCount={statusFilterProps.totalCount}
            />
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





