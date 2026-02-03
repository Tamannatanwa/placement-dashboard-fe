# API Data Mapping - Frontend to Backend

## Overview
This document shows the exact mapping between frontend Student data structure and the API request format.

---

## Frontend Student Type

```typescript
interface Student {
  id: string;                    // Frontend-generated ID (e.g., "student-0")
  name: string;                  // Student name
  email: string;                 // Student email (PRIMARY IDENTIFIER)
  phone: string;                 // Contact number
  campus?: string;               // Campus location
  school?: string;               // School name
  resume?: string;               // Resume URL/link
  projects?: string;            // Project details
  status: StudentStatus;         // Current status
  group?: string;                // → Maps to API: "group"
  feedback?: string;             // → Maps to API: "feedback"
  resumeScore?: number;          // → Maps to API: "resume_score"
  resumeStructure?: string;     // → Maps to API: "resume_structure"
  resumeProjects?: string;       // → Maps to API: "resume_projects"
  projectScore?: number;        // → Maps to API: "project_score"
  projectDifficulty?: "easy" | "medium" | "hard";  // → Maps to API: "project_difficulty"
  projectReview?: string;        // → Maps to API: "project_review"
  rawStatus?: string;            // Original status from Excel
}
```

---

## API Request Mapping

### Frontend → Backend Field Mapping

| Frontend Field | API Request Field | Type | Notes |
|----------------|-------------------|------|-------|
| `student.email` | `student_id` (in URL) | string | **Use email as student identifier** |
| `student.group` | `group` | string | Optional |
| `student.feedback` | `feedback` | string | Optional, max 5000 chars |
| `student.resumeScore` | `resume_score` | number | Optional, 0-10 |
| `student.resumeStructure` | `resume_structure` | string | Optional, max 5000 chars |
| `student.resumeProjects` | `resume_projects` | string | Optional, max 5000 chars |
| `student.projectScore` | `project_score` | number | Optional, 0-10 |
| `student.projectDifficulty` | `project_difficulty` | string | Optional, enum: 'easy'/'medium'/'hard' |
| `student.projectReview` | `project_review` | string | Optional, max 5000 chars |
| `student.status` | `status` | string | Optional, enum (see below) |

---

## Example Transformation

### Frontend Student Object:
```javascript
{
  id: "student-0",
  name: "Vishakha Parate",
  email: "vishakhaparate24@navgurukul.org",
  phone: "+91 84591 71497",
  campus: "Sarjapura",
  school: "School of Business",
  status: "job_ready_under_process",
  group: "Group A",
  feedback: "Good progress, needs improvement in project complexity",
  resumeScore: 8,
  resumeStructure: "Well-structured resume with clear sections",
  resumeProjects: "Projects show good technical skills",
  projectScore: 7,
  projectDifficulty: "medium",
  projectReview: "Projects demonstrate solid understanding but could be more complex"
}
```

### API Request:
```http
PUT /api/v1/admin/students/vishakhaparate24@navgurukul.org/review
Authorization: Bearer <token>
Content-Type: application/json

{
  "group": "Group A",
  "feedback": "Good progress, needs improvement in project complexity",
  "resume_score": 8,
  "resume_structure": "Well-structured resume with clear sections",
  "resume_projects": "Projects show good technical skills",
  "project_score": 7,
  "project_difficulty": "medium",
  "project_review": "Projects demonstrate solid understanding but could be more complex",
  "status": "job_ready_under_process"
}
```

---

## Status Enum Mapping

### Frontend Status → API Status

| Frontend Status | API Status | Description |
|-----------------|------------|-------------|
| `"placed"` | `"placed"` | Student is placed |
| `"unplaced"` | `"unplaced"` | Student is not placed |
| `"internship_unpaid"` | `"internship_unpaid"` | Unpaid internship |
| `"internship_paid"` | `"internship_paid"` | Paid internship |
| `"job_ready"` | `"job_ready"` | Ready for job |
| `"job_ready_under_process"` | `"job_ready_under_process"` | Job ready, under process |
| `"long_leave"` | `"long_leave"` | On long leave |
| `"dropout"` | `"dropout"` | Dropped out |

---

## Student Identification Strategy

### Option 1: Use Email (Recommended)
- **URL:** `PUT /api/v1/admin/students/{email}/review`
- **Pros:** Email is unique and always available in frontend
- **Cons:** Email might contain special characters (need URL encoding)

### Option 2: Use Student ID
- **URL:** `PUT /api/v1/admin/students/{student_id}/review`
- **Pros:** Clean numeric/string ID
- **Cons:** Frontend needs to map email → student_id first

### Option 3: Use Both (Flexible)
- **URL:** `PUT /api/v1/admin/students/{identifier}/review`
- **Request Body:** Include `email` or `student_id` field
- **Pros:** Most flexible
- **Cons:** More complex implementation

**Frontend Recommendation:** Use **Option 1 (Email)** as it's the most reliable identifier we have from Excel data.

---

## Partial Update Handling

The frontend will send **only the fields that have changed**. The API should:

1. Accept partial updates (not all fields required)
2. Only update fields that are provided
3. Leave other fields unchanged
4. Handle `null` or empty strings appropriately:
   - Empty string `""` → Clear the field
   - `null` → Leave field unchanged (or clear if that's the convention)
   - Omitted field → Leave field unchanged

### Example Partial Update:
```json
{
  "group": "Group B",
  "resume_score": 9
}
```
This should only update `group` and `resume_score`, leaving all other fields unchanged.

---

## Response Mapping

### API Response → Frontend Student Object

| API Response Field | Frontend Field | Notes |
|-------------------|----------------|-------|
| `data.student_id` | Used for identification | |
| `data.group` | `student.group` | |
| `data.feedback` | `student.feedback` | |
| `data.resume_score` | `student.resumeScore` | |
| `data.resume_structure` | `student.resumeStructure` | |
| `data.resume_projects` | `student.resumeProjects` | |
| `data.project_score` | `student.projectScore` | |
| `data.project_difficulty` | `student.projectDifficulty` | |
| `data.project_review` | `student.projectReview` | |
| `data.status` | `student.status` | |
| `data.updated_at` | Display in UI (optional) | |

---

## Frontend Implementation Code

The frontend will use this mapping in the `handleStudentUpdate` function:

```typescript
// In StudentDetail component
const handleSave = async () => {
  const reviewData = {
    group: group || undefined,
    feedback: feedback || undefined,
    resume_score: resumeScore || undefined,
    resume_structure: resumeStructure || undefined,
    resume_projects: resumeProjects || undefined,
    project_score: projectScore || undefined,
    project_difficulty: projectDifficulty || undefined,
    project_review: projectReview || undefined,
    status: student.status || undefined,
  };

  // Remove undefined fields
  Object.keys(reviewData).forEach(
    (key) => reviewData[key] === undefined && delete reviewData[key]
  );

  try {
    await studentReviewApi.updateReview(student.email, reviewData);
    // Update local state
    onUpdate({ ...student, ...reviewData });
  } catch (error) {
    // Handle error
  }
};
```

---

## Questions for Backend Team

1. **Student ID Format:** Should we use email, or do you have a student_id mapping?
2. **Empty Values:** How should we handle clearing a field? Send empty string `""` or `null`?
3. **Field Names:** Are you okay with snake_case (`resume_score`) or prefer camelCase (`resumeScore`)?
4. **Required Fields:** Are any fields required, or can all be optional?
5. **Default Values:** Should we send default values (e.g., `0` for scores) or omit them?

---

**Last Updated:** 2024-01-15


