"use client";

import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileSpreadsheet, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSheetNames, readExcelSheet } from "@/lib/utils/excel";
import { toast } from "sonner";

interface ExcelUploadProps {
  onDataLoaded: (data: any[], sheetName: string) => void;
}

/**
 * Component for uploading and processing Excel files
 * Allows admin to select Excel file and choose which sheet to process
 */
export function ExcelUpload({ onDataLoaded }: ExcelUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  // Handle file drop
  const onDrop = async (acceptedFiles: File[]) => {
    const uploadedFile = acceptedFiles[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    setIsLoading(true);

    try {
      // Get all sheet names from the Excel file
      const sheets = await getSheetNames(uploadedFile);
      setSheetNames(sheets);
      
      // Auto-select first sheet if available
      if (sheets.length > 0) {
        setSelectedSheet(sheets[0]);
      }

      toast.success("Excel file loaded successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to read Excel file");
      setFile(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Process selected sheet
  const handleProcessSheet = async () => {
    if (!file || !selectedSheet) {
      toast.error("Please select a file and sheet");
      return;
    }

    setIsLoading(true);
    try {
      const data = await readExcelSheet(file, selectedSheet);
      onDataLoaded(data, selectedSheet);
      toast.success(`Loaded ${data.length} records from "${selectedSheet}"`);
    } catch (error: any) {
      toast.error(error.message || "Failed to process sheet");
    } finally {
      setIsLoading(false);
    }
  };

  // Dropzone configuration
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "application/vnd.ms-excel": [".xls"],
    },
    maxFiles: 1,
  });

  return (
    <div className="space-y-4">
      {/* File Upload Area */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? "border-cyan-500 bg-cyan-500/10"
            : "border-slate-300 dark:border-slate-700 hover:border-cyan-400"
        }`}
      >
        <input {...getInputProps()} />
        <FileSpreadsheet className="h-12 w-12 mx-auto mb-4 text-cyan-500" />
        {file ? (
          <div className="space-y-2">
            <p className="text-sm font-medium">{file.name}</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setFile(null);
                setSheetNames([]);
                setSelectedSheet("");
              }}
            >
              <X className="h-4 w-4 mr-2" />
              Remove File
            </Button>
          </div>
        ) : (
          <div>
            <Upload className="h-12 w-12 mx-auto mb-4 text-slate-400" />
            <p className="text-sm text-muted-foreground">
              {isDragActive
                ? "Drop the Excel file here"
                : "Drag & drop an Excel file here, or click to select"}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Supports .xlsx and .xls files
            </p>
          </div>
        )}
      </div>

      {/* Sheet Selection */}
      {sheetNames.length > 0 && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Select Sheet:</label>
          <select
            value={selectedSheet}
            onChange={(e) => setSelectedSheet(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            {sheetNames.map((sheet) => (
              <option key={sheet} value={sheet}>
                {sheet}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Process Button */}
      {file && selectedSheet && (
        <Button
          onClick={handleProcessSheet}
          disabled={isLoading}
          className="w-full bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-500 dark:hover:bg-cyan-600 text-white"
        >
          {isLoading ? "Processing..." : `Process "${selectedSheet}" Sheet`}
        </Button>
      )}
    </div>
  );
}




