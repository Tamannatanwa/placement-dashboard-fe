import * as XLSX from "xlsx";

/**
 * Read Excel file and extract data from a specific sheet
 * @param file - The Excel file to read
 * @param sheetName - Name of the sheet to read from
 * @returns Array of student objects
 */
export async function readExcelSheet(
  file: File,
  sheetName: string
): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        // Read the Excel file
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });

        // Get the specified sheet
        const sheet = workbook.Sheets[sheetName];
        if (!sheet) {
          reject(new Error(`Sheet "${sheetName}" not found in Excel file`));
          return;
        }

        // Convert sheet to JSON
        const jsonData = XLSX.utils.sheet_to_json(sheet);
        resolve(jsonData);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };

    reader.readAsArrayBuffer(file);
  });
}

/**
 * Get list of all sheet names from Excel file
 * @param file - The Excel file to read
 * @returns Array of sheet names
 */
export async function getSheetNames(file: File): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        resolve(workbook.SheetNames);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };

    reader.readAsArrayBuffer(file);
  });
}

/**
 * Normalize student data from Excel row
 * Maps Excel columns to our Student interface
 * Handles actual column names from the Excel sheet
 */
export function normalizeStudentData(row: any, index: number): any {
  const rawStatus = row["Current Status"] || row["Current Si"] || row["Status"] || row["status"] || "";
  
  return {
    id: `student-${index}`,
    name: row["Name"] || row["name"] || row["Student Name"] || "",
    email: row["Email"] || row["email"] || row["Email Address"] || "",
    phone: formatPhoneNumber(
      row["Contact details"] || 
      row["Contact Details"] || 
      row["Contact"] || 
      row["Phone"] || 
      row["phone"] || 
      row["Mobile"] || 
      ""
    ),
    campus: row["Campus"] || row["campus"] || "",
    school: row["School"] || row["school"] || "",
    resume: row["Resume"] || row["resume"] || row["Resume Link"] || "",
    projects: row["Projects"] || row["projects"] || row["Project Details"] || "",
    status: normalizeStatus(rawStatus),
    rawStatus: rawStatus, // Keep original status for display
    group: row["Group"] || row["group"] || "",
    feedback: row["Feedback"] || row["feedback"] || "",
    resumeScore: row["Resume Score"] || row["resumeScore"] || undefined,
    projectScore: row["Project Score"] || row["projectScore"] || undefined,
    projectDifficulty: row["Project Difficulty"] || row["projectDifficulty"] || undefined,
    // Keep all original row data for export
    ...row,
  };
}

/**
 * Format phone number for display
 * Handles various formats: +91-1234567890, 1234567890, etc.
 * Handles both string and number types
 */
function formatPhoneNumber(phone: string | number | undefined | null): string {
  // Handle null, undefined, or empty values
  if (!phone && phone !== 0) return "";
  
  // Convert to string if it's a number
  const phoneStr = String(phone).trim();
  
  if (!phoneStr) return "";
  
  // Remove all non-digit characters except +
  const cleaned = phoneStr.replace(/[^\d+]/g, "");
  
  if (!cleaned) return phoneStr; // Return original if cleaning removes everything
  
  // Handle Indian phone numbers (+91 or starting with 91)
  if (cleaned.startsWith("+91") || cleaned.startsWith("91")) {
    const digits = cleaned.replace(/^\+?91/, "");
    if (digits.length === 10) {
      return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
    }
  }
  
  // Handle 10-digit numbers
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  }
  
  // Return original if no pattern matches
  return phoneStr;
}

/**
 * Normalize status values from Excel to our status types
 * Handles all status formats from Excel including:
 * - Placed
 * - Internship - UnP (Unpaid)
 * - Internship - Paid
 * - Job Ready
 * - Job Ready - Under Process
 * - Long Leave
 * - Dropout
 */
function normalizeStatus(status: string): "placed" | "unplaced" | "internship_unpaid" | "internship_paid" | "job_ready" | "job_ready_under_process" | "long_leave" | "dropout" {
  if (!status) return "unplaced";
  
  const normalized = status.toLowerCase().trim();
  
  // Check for placed status
  if (normalized.includes("placed") && !normalized.includes("under process")) {
    return "placed";
  }
  
  // Check for internship - unpaid
  if (normalized.includes("internship") && (normalized.includes("unp") || normalized.includes("unpaid"))) {
    return "internship_unpaid";
  }
  
  // Check for internship - paid
  if (normalized.includes("internship") && normalized.includes("paid")) {
    return "internship_paid";
  }
  
  // Check for job ready - under process
  if (normalized.includes("job ready") && normalized.includes("under process")) {
    return "job_ready_under_process";
  }
  
  // Check for job ready
  if (normalized.includes("job ready")) {
    return "job_ready";
  }
  
  // Check for long leave
  if (normalized.includes("long leave") || normalized.includes("leave")) {
    return "long_leave";
  }
  
  // Check for dropout
  if (normalized.includes("dropout") || normalized.includes("drop out")) {
    return "dropout";
  }
  
  // Default to unplaced
  return "unplaced";
}

