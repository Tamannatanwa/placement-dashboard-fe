"use client";

import { useState } from "react";
import { FileSpreadsheet, Upload, Download, Users, CheckCircle2, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExcelUpload } from "@/components/admin/ExcelUpload";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface StudentData {
  name: string;
  email: string;
  phone?: string;
  campus?: string;
  batch?: string;
  department?: string;
}

export default function BulkCreateStudentsPage() {
  const [students, setStudents] = useState<StudentData[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [createdCount, setCreatedCount] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);

  const handleDataLoaded = async (data: any[], sheetName: string) => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Normalize data from Excel
      const normalized: StudentData[] = data
        .map((row) => ({
          name: row.name || row["Student Name"] || row["Full Name"] || "",
          email: row.email || row["Email"] || row["Email Address"] || "",
          phone: row.phone || row["Phone"] || row["Contact"] || row["Mobile"] || "",
          campus: row.campus || row["Campus"] || row["College"] || "",
          batch: row.batch || row["Batch"] || row["Year"] || "",
          department: row.department || row["Department"] || row["Dept"] || "",
        }))
        .filter((student) => student.name && student.email);

      setStudents(normalized);
      setUploadProgress(100);
      toast.success(`Loaded ${normalized.length} students from "${sheetName}"`);
    } catch (error: any) {
      toast.error("Failed to process Excel file");
      console.error("Error processing file:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleBulkCreate = async () => {
    if (students.length === 0) {
      toast.error("No students to create");
      return;
    }

    setIsCreating(true);
    setCreatedCount(0);
    setErrors([]);
    const newErrors: string[] = [];

    try {
      // TODO: Replace with actual API call
      // const response = await adminApi.bulkCreateStudents(students);

      // Simulate API call
      for (let i = 0; i < students.length; i++) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        setCreatedCount(i + 1);
        setUploadProgress(((i + 1) / students.length) * 100);

        // Simulate some errors
        if (Math.random() < 0.1) {
          newErrors.push(`Failed to create ${students[i].name}: Email already exists`);
        }
      }

      setErrors(newErrors);

      if (newErrors.length === 0) {
        toast.success(`Successfully created ${students.length} students`);
        setStudents([]);
      } else {
        toast.warning(`Created ${students.length - newErrors.length} students, ${newErrors.length} failed`);
      }
    } catch (error: any) {
      toast.error("Failed to create students");
      console.error("Error creating students:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleClear = () => {
    setStudents([]);
    setCreatedCount(0);
    setErrors([]);
    setUploadProgress(0);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <FileSpreadsheet className="h-8 w-8 text-cyan-500 dark:text-cyan-400" />
          Bulk Create Students
        </h1>
        <p className="text-muted-foreground mt-2">
          Upload an Excel file to create multiple student accounts at once
        </p>
      </div>

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Excel File</CardTitle>
          <CardDescription>
            Upload a file with student information. Required columns: Name, Email
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ExcelUpload onDataLoaded={handleDataLoaded} />
          {isUploading && (
            <div className="mt-4 space-y-2">
              <Progress value={uploadProgress} />
              <p className="text-sm text-muted-foreground">Processing file...</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview Section */}
      {students.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Preview Students ({students.length})</CardTitle>
                <CardDescription>
                  Review the data before creating accounts
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={handleClear}>
                  Clear
                </Button>
                <Button
                  onClick={handleBulkCreate}
                  disabled={isCreating}
                  className="bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-500 dark:hover:bg-cyan-600 text-white"
                >
                  {isCreating ? (
                    <>
                      Creating... ({createdCount}/{students.length})
                    </>
                  ) : (
                    <>
                      <Users className="mr-2 h-4 w-4" />
                      Create {students.length} Students
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isCreating && (
              <div className="mb-4 space-y-2">
                <Progress value={uploadProgress} />
                <p className="text-sm text-muted-foreground">
                  Creating students... {createdCount} of {students.length}
                </p>
              </div>
            )}

            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Campus</TableHead>
                    <TableHead>Batch</TableHead>
                    <TableHead>Department</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.slice(0, 10).map((student, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{student.name}</TableCell>
                      <TableCell>{student.email}</TableCell>
                      <TableCell>{student.phone || "-"}</TableCell>
                      <TableCell>{student.campus || "-"}</TableCell>
                      <TableCell>{student.batch || "-"}</TableCell>
                      <TableCell>{student.department || "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {students.length > 10 && (
                <div className="p-4 text-center text-sm text-muted-foreground border-t">
                  Showing first 10 of {students.length} students
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Errors Section */}
      {errors.length > 0 && (
        <Card className="border-red-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertCircle className="h-5 w-5" />
              Errors ({errors.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {errors.map((error, index) => (
                <div key={index} className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm">
                  {error}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Success Message */}
      {createdCount > 0 && errors.length === 0 && !isCreating && (
        <Card className="border-green-500/20 bg-green-500/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
              <div>
                <div className="font-medium">Successfully created {createdCount} students</div>
                <div className="text-sm text-muted-foreground">
                  All students have been added to the system
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
