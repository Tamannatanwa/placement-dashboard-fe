# API Requirements: Student Review & Feedback Management

## Overview
This document outlines the API endpoints required for the Admin/Students page (`/admin/students`) to save and manage student resume reviews, feedback, group assignments, and other review-related data.

---

## Base URL
```
/api/v1/admin/students
```

## Authentication
All endpoints require Bearer token authentication:
```
Authorization: Bearer <access_token>
```

---

## Endpoints

### 1. Update Student Review Data
**Endpoint:** `PUT /api/v1/admin/students/{student_id}/review`

**Description:** Updates review data, feedback, group assignment, and scores for a specific student.

**Path Parameters:**
- `student_id` (string/integer, required): Unique identifier for the student

**Request Body:**
```json
{
  "group": "string (optional)",
  "feedback": "string (optional)",
  "resume_score": "number (optional, 0-10)",
  "resume_structure": "string (optional)",
  "resume_projects": "string (optional)",
  "project_score": "number (optional, 0-10)",
  "project_difficulty": "string (optional, enum: 'easy' | 'medium' | 'hard')",
  "project_review": "string (optional)",
  "status": "string (optional, enum: 'placed' | 'unplaced' | 'internship_unpaid' | 'internship_paid' | 'job_ready' | 'job_ready_under_process' | 'long_leave' | 'dropout')"
}
```

**Request Body Schema:**
| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `group` | string | No | Max 255 chars | Group assignment (e.g., "Group A", "Batch 2024") |
| `feedback` | string | No | Max 5000 chars | General feedback for the student |
| `resume_score` | number | No | 0-10, integer | Resume quality score out of 10 |
| `resume_structure` | string | No | Max 5000 chars | Review of resume structure and formatting |
| `resume_projects` | string | No | Max 5000 chars | Review of projects mentioned in resume |
| `project_score` | number | No | 0-10, integer | Project quality score out of 10 |
| `project_difficulty` | string | No | Enum: 'easy', 'medium', 'hard' | Difficulty level of projects |
| `project_review` | string | No | Max 5000 chars | Detailed review of project quality and complexity |
| `status` | string | No | Enum (see above) | Updated student status |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Student review updated successfully",
  "data": {
    "student_id": "string",
    "group": "string",
    "feedback": "string",
    "resume_score": 8,
    "resume_structure": "string",
    "resume_projects": "string",
    "project_score": 7,
    "project_difficulty": "medium",
    "project_review": "string",
    "status": "job_ready",
    "updated_at": "2024-01-15T10:30:00Z",
    "updated_by": "admin_user_id"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Invalid request body or validation errors
- `401 Unauthorized`: Missing or invalid authentication token
- `403 Forbidden`: User doesn't have admin permissions
- `404 Not Found`: Student not found
- `500 Internal Server Error`: Server error

**Example Request:**
```bash
curl -X PUT "https://api.example.com/api/v1/admin/students/123/review" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "group": "Group A",
    "feedback": "Good progress, needs improvement in project complexity",
    "resume_score": 8,
    "resume_structure": "Well-structured resume with clear sections",
    "resume_projects": "Projects show good technical skills",
    "project_score": 7,
    "project_difficulty": "medium",
    "project_review": "Projects demonstrate solid understanding but could be more complex",
    "status": "job_ready"
  }'
```

---

### 2. Bulk Update Student Reviews
**Endpoint:** `PUT /api/v1/admin/students/bulk-review`

**Description:** Updates review data for multiple students in a single request.

**Request Body:**
```json
{
  "students": [
    {
      "student_id": "string (required)",
      "group": "string (optional)",
      "feedback": "string (optional)",
      "resume_score": "number (optional, 0-10)",
      "resume_structure": "string (optional)",
      "resume_projects": "string (optional)",
      "project_score": "number (optional, 0-10)",
      "project_difficulty": "string (optional)",
      "project_review": "string (optional)",
      "status": "string (optional)"
    }
  ]
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Bulk update completed",
  "data": {
    "total": 10,
    "updated": 8,
    "failed": 2,
    "results": [
      {
        "student_id": "123",
        "success": true,
        "message": "Updated successfully"
      },
      {
        "student_id": "124",
        "success": false,
        "message": "Student not found"
      }
    ]
  }
}
```

**Error Responses:**
- `400 Bad Request`: Invalid request body
- `401 Unauthorized`: Missing or invalid authentication token
- `403 Forbidden`: User doesn't have admin permissions
- `500 Internal Server Error`: Server error

---

### 3. Get Student Review Data
**Endpoint:** `GET /api/v1/admin/students/{student_id}/review`

**Description:** Retrieves review data, feedback, and scores for a specific student.

**Path Parameters:**
- `student_id` (string/integer, required): Unique identifier for the student

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "student_id": "string",
    "name": "string",
    "email": "string",
    "group": "string",
    "feedback": "string",
    "resume_score": 8,
    "resume_structure": "string",
    "resume_projects": "string",
    "project_score": 7,
    "project_difficulty": "medium",
    "project_review": "string",
    "status": "job_ready",
    "created_at": "2024-01-10T10:00:00Z",
    "updated_at": "2024-01-15T10:30:00Z",
    "updated_by": "admin_user_id"
  }
}
```

**Error Responses:**
- `401 Unauthorized`: Missing or invalid authentication token
- `403 Forbidden`: User doesn't have admin permissions
- `404 Not Found`: Student not found

---

### 4. List Students with Reviews (Optional - for future use)
**Endpoint:** `GET /api/v1/admin/students/reviews`

**Description:** Retrieves a list of students with their review data, supports filtering and pagination.

**Query Parameters:**
- `status` (string, optional): Filter by student status
- `school` (string, optional): Filter by school name
- `group` (string, optional): Filter by group assignment
- `has_review` (boolean, optional): Filter students with/without reviews
- `limit` (integer, optional, default: 50): Number of results per page
- `offset` (integer, optional, default: 0): Pagination offset

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "total": 100,
    "limit": 50,
    "offset": 0,
    "students": [
      {
        "student_id": "string",
        "name": "string",
        "email": "string",
        "status": "job_ready",
        "group": "Group A",
        "resume_score": 8,
        "project_score": 7,
        "has_feedback": true,
        "updated_at": "2024-01-15T10:30:00Z"
      }
    ]
  }
}
```

---

## Data Model

### Student Review Table Structure (Suggested)
```sql
CREATE TABLE student_reviews (
    id SERIAL PRIMARY KEY,
    student_id VARCHAR(255) NOT NULL,
    group VARCHAR(255),
    feedback TEXT,
    resume_score INTEGER CHECK (resume_score >= 0 AND resume_score <= 10),
    resume_structure TEXT,
    resume_projects TEXT,
    project_score INTEGER CHECK (project_score >= 0 AND project_score <= 10),
    project_difficulty VARCHAR(20) CHECK (project_difficulty IN ('easy', 'medium', 'hard')),
    project_review TEXT,
    status VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(255),
    FOREIGN KEY (student_id) REFERENCES students(id),
    UNIQUE(student_id)
);
```

---

## Business Rules

1. **Validation Rules:**
   - `resume_score` and `project_score` must be integers between 0-10
   - `project_difficulty` must be one of: 'easy', 'medium', 'hard'
   - `status` must be a valid status enum value
   - All text fields should have reasonable max length limits

2. **Permissions:**
   - Only users with `admin` role can access these endpoints
   - The `updated_by` field should track which admin made the update

3. **Data Integrity:**
   - Student must exist before review can be created/updated
   - Updates should be idempotent (multiple updates with same data should not cause issues)
   - Timestamps should be automatically managed

4. **Audit Trail:**
   - Track `created_at`, `updated_at`, and `updated_by` for all review data
   - Consider maintaining a history/audit log of changes

---

## Integration Notes

### Frontend Implementation
The frontend will:
1. Call `PUT /api/v1/admin/students/{student_id}/review` when admin saves review data
2. Use the student's unique identifier (could be email, ID, or a combination)
3. Handle partial updates (only send fields that have changed)
4. Display success/error messages based on API responses

### Student Identification
**Important:** The frontend currently uses Excel-based student data where students are identified by:
- Email address (primary)
- Name (secondary)
- Index-based ID (temporary, for UI only)

**Recommendation:** The backend should:
- Use email as the primary identifier for students, OR
- Provide a mapping endpoint to convert Excel data to backend student IDs, OR
- Support both email and student_id in the API

---

## Error Handling

All endpoints should return consistent error responses:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      "field_name": ["Validation error message"]
    }
  }
}
```

**Common Error Codes:**
- `VALIDATION_ERROR`: Request validation failed
- `STUDENT_NOT_FOUND`: Student with given ID not found
- `UNAUTHORIZED`: Authentication required
- `FORBIDDEN`: Insufficient permissions
- `INTERNAL_ERROR`: Server error

---

## Testing Requirements

Please provide test cases for:
1. ✅ Successful single student review update
2. ✅ Successful bulk review update
3. ✅ Validation errors (invalid scores, invalid enums)
4. ✅ Authentication/authorization failures
5. ✅ Student not found scenarios
6. ✅ Partial updates (only some fields provided)
7. ✅ Edge cases (empty strings, null values, very long text)

---

## Priority

**High Priority:**
- ✅ Update Student Review Data (Endpoint #1)
- ✅ Get Student Review Data (Endpoint #3)

**Medium Priority:**
- ⚠️ Bulk Update Student Reviews (Endpoint #2)

**Low Priority:**
- ⚪ List Students with Reviews (Endpoint #4)

---

## Questions for Backend Team

1. **Student Identification:** How should we identify students? By email, student_id, or both?
2. **Data Storage:** Should review data be stored in a separate table or merged with student table?
3. **History/Audit:** Do you need version history for review changes?
4. **Bulk Operations:** What's the maximum batch size for bulk updates?
5. **File Uploads:** Do you need endpoints for uploading resume files, or are resume URLs sufficient?
6. **Search/Filter:** What additional filters might be needed for the list endpoint?

---

## Contact

For questions or clarifications, please contact the frontend team.

**Last Updated:** 2024-01-15


