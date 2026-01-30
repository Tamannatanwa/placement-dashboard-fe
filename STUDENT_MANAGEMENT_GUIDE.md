# Student Management System - Admin Guide

## Overview
This feature allows admins to upload Excel files, filter students by placement status, review their details, assign groups, and add feedback.

## How It Works

### Step 1: Upload Excel File
1. Navigate to `/admin/students` page
2. Drag and drop your Excel file (.xlsx or .xls) or click to select
3. The system will automatically detect all sheets in your Excel file
4. Select the sheet you want to process (e.g., "xyz")
5. Click "Process Sheet" button

### Step 2: Filter Students
- Use the status filter buttons at the top:
  - **All Students**: Shows everyone
  - **Unplaced**: Students who haven't been placed yet
  - **Placed**: Students who have been placed
  - **Internship**: Students currently in internship
  - **Long Leave**: Students on long leave

### Step 3: View Student Details
- Click on any student card or "View Details" button
- View complete information:
  - Name, Email, Phone (clickable)
  - Resume link (if available)
  - Projects information
  - Current status
  - Group assignment
  - Feedback

### Step 4: Assign Groups
- Open student details
- Enter group name in "Assign to Group" field
- Examples: "Group A", "Batch 2024", "Team Alpha"

### Step 5: Add Feedback
- Open student details
- Enter feedback in the "Add Feedback" textarea
- Click "Save Changes"

### Step 6: Export Updated Data
- Click "Export to Excel" button at the top
- The system will generate a new Excel file with:
  - All original data
  - Updated group assignments
  - Added feedback
  - Updated status (if changed)

## Excel File Format

Your Excel file should have columns like:
- **Name** or **Student Name**: Student's full name
- **Email** or **Email Address**: Student's email
- **Phone** or **Contact** or **Mobile**: Phone number
- **Status**: Placement status (Placed/Unplaced/Internship/Long Leave)
- **Resume** or **Resume Link**: Link to resume file
- **Projects** or **Project Details**: Project information
- **Group**: Group assignment (optional)
- **Feedback**: Admin feedback (optional)

## Status Values Supported

The system recognizes these status values (case-insensitive):
- **Placed**: "placed", "yes", "y", "1", "selected"
- **Internship**: "internship", "intern", "training"
- **Long Leave**: "leave", "long", "break"
- **Unplaced**: Everything else (default)

## Phone Number Formatting

The system automatically formats phone numbers:
- Indian numbers (+91): `+91 12345 67890`
- 10-digit numbers: `12345 67890`
- Click phone numbers to call directly

## Features

✅ Upload Excel files with multiple sheets
✅ Select specific sheet to process
✅ Filter by placement status
✅ View student contact details (clickable phone/email)
✅ Review resumes and projects
✅ Assign students to groups
✅ Add individual feedback
✅ Export updated data back to Excel
✅ Responsive design with dark/light theme

## Technical Details

### Libraries Used
- **xlsx**: For reading/writing Excel files
- **react-dropzone**: For file upload with drag & drop
- **Next.js**: React framework
- **Tailwind CSS**: Styling

### File Structure
```
src/
├── app/(admin)/students/page.tsx    # Main admin page
├── components/admin/
│   ├── ExcelUpload.tsx              # File upload component
│   ├── StatusFilter.tsx             # Status filter buttons
│   ├── StudentList.tsx              # Student list display
│   └── StudentDetail.tsx            # Student detail modal
├── lib/utils/excel.ts                # Excel processing utilities
└── types/student.ts                  # TypeScript types
```

## Notes

- All changes are stored in browser memory (not saved to database)
- Export Excel to save your changes permanently
- Phone numbers are clickable for easy calling
- Email addresses are displayed with proper formatting
- Status filter updates the list in real-time




