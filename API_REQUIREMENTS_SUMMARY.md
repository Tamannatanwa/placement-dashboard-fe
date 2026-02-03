# API Requirements Summary - Student Review Management

## Quick Reference

### Primary Endpoint (Required)
```
PUT /api/v1/admin/students/{student_id}/review
```

**What it does:** Saves/updates student review data including feedback, scores, group assignment, and status.

**Key Fields to Save:**
- `group` - Group assignment (string)
- `feedback` - General feedback (text)
- `resume_score` - Resume quality score 0-10 (number)
- `resume_structure` - Resume structure review (text)
- `resume_projects` - Resume projects review (text)
- `project_score` - Project quality score 0-10 (number)
- `project_difficulty` - easy/medium/hard (string)
- `project_review` - Project review (text)
- `status` - Student status (string enum)

**Authentication:** Bearer token required (admin role)

---

### Secondary Endpoint (Recommended)
```
GET /api/v1/admin/students/{student_id}/review
```

**What it does:** Retrieves saved review data for a student.

---

## Request Example

```json
PUT /api/v1/admin/students/{student_id}/review
Authorization: Bearer <token>
Content-Type: application/json

{
  "group": "Group A",
  "feedback": "Good progress, needs improvement",
  "resume_score": 8,
  "resume_structure": "Well-structured resume",
  "resume_projects": "Projects show good skills",
  "project_score": 7,
  "project_difficulty": "medium",
  "project_review": "Solid understanding",
  "status": "job_ready"
}
```

---

## Response Example

```json
{
  "success": true,
  "message": "Student review updated successfully",
  "data": {
    "student_id": "123",
    "group": "Group A",
    "feedback": "Good progress, needs improvement",
    "resume_score": 8,
    "project_score": 7,
    "status": "job_ready",
    "updated_at": "2024-01-15T10:30:00Z"
  }
}
```

---

## Important Notes

1. **Student ID:** Frontend uses email or Excel-based IDs. Backend should clarify identification method.
2. **Partial Updates:** Frontend may send only changed fields - API should handle partial updates.
3. **Validation:** Scores must be 0-10, difficulty must be easy/medium/hard.
4. **Permissions:** Only admin users can access these endpoints.

---

For detailed specifications, see `API_REQUIREMENTS_STUDENT_REVIEW.md`


