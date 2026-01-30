I’ll first scan your codebase to find all API helper files and HTTP calls, then map each API to its route and purpose, and finally identify any helpers or endpoints that aren’t referenced anywhere. I’ll keep changes minimal and just report findings, no code modifications.

[5 tools called]

I’ve pulled in all the API helper files; now I’ll scan the rest of the app to see where each API method is used so I can list their purposes and flag anything unused.

[3 tools called]

Here’s a concise map of your current APIs, with routes, purposes, and usage status.

### `authApi` (`src/lib/api/auth.ts`)

- **Common setup**
  - **Base URL**: `API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8000"`
  - **Axios instance**: `api` with JSON `Content-Type`.

- **`authApi.register(data)`**
  - **HTTP**: `POST /api/v1/auth/register`
  - **Purpose**: Register a new user (student/placement/admin). Stores `access_token`, `refresh_token`, and user info in `localStorage`, and sets default `Authorization` header.
  - **Used in**: `src/app/(auth)/signup/page.tsx` (user signup flow).
  - **Status**: **Used**.

- **`authApi.login(data)`**
  - **HTTP**: `POST /api/v1/auth/login`
  - **Purpose**: Authenticate existing user. Persists tokens and user info, sets axios `Authorization` header.
  - **Used in**: `src/app/(auth)/login/page.tsx` (login form).
  - **Status**: **Used**.

- **`authApi.logout()`**
  - **HTTP**: No backend call; front-end only.
  - **Purpose**: Clear tokens and user info from `localStorage` and remove default `Authorization` header.
  - **Used in**: `src/components/layouts/Navbar.tsx` (logout button).
  - **Status**: **Used**.

- **`authApi.getCurrentUser()`**
  - **HTTP**: `GET /api/v1/auth/me`
  - **Purpose**: Fetch current authenticated user details based on `access_token`, update cached user info.
  - **Used in**: **No usages found in repo.**
  - **Status**: **Unused API** (as of current codebase).

---

### `studentsApi` (`src/lib/api/students.ts`)

All methods share:
- **Base URL**: same `API_BASE_URL`.
- **Auth**: per-request axios instance (`getApiInstance`) that adds `Authorization: Bearer <access_token>` from `localStorage`.

- **`studentsApi.getDashboard()`**
  - **HTTP**: `GET /api/v1/students/me/dashboard`
  - **Purpose**: Student dashboard data: profile, stats, recent jobs, saved jobs count, notifications, profile completeness, recommendation counts.
  - **Used in**: `src/app/(student)/dashboard/page.tsx` (main student dashboard).
  - **Status**: **Used**.

- **`studentsApi.trackJobView(jobId, data)`**
  - **HTTP**: `POST /api/v1/students/me/jobs/{job_id}/view`
  - **Purpose**: Track job view analytics (duration, source).
  - **Used in**:
    - `src/app/(student)/jobs/[id]/page.tsx` (twice: initial view + maybe on interaction).
    - `src/app/(student)/dashboard/page.tsx` (track when job viewed from dashboard sections).
  - **Status**: **Used**.

- **`studentsApi.getActivity()`**
  - **HTTP**: `GET /api/v1/students/me/students/me/activity` (note: path looks duplicated; may be a typo vs backend).
  - **Purpose**: Intended to fetch recent student activity (logs/feed).
  - **Used in**: **No usages found.**
  - **Status**: **Unused API** (and likely needs route correction later).

- **`studentsApi.getMyProfile()`**
  - **HTTP**: `GET /api/v1/students/me/students/me` (also appears duplicated segment).
  - **Purpose**: Get current student’s profile (`StudentProfile`).
  - **Used in**: `src/app/(student)/profile/page.tsx` (load profile form).
  - **Status**: **Used**.

- **`studentsApi.updateMyProfile(data)`**
  - **HTTP**: `PUT /api/v1/students/me/students/me`
  - **Purpose**: Update student profile details (phone, degree, branch, passing year, CGPA, etc.).
  - **Used in**: `src/app/(student)/profile/page.tsx` (profile update submit).
  - **Status**: **Used**.

- **`studentsApi.getProfileCompleteness()`**
  - **HTTP**: `GET /api/v1/students/me/students/me/profile-completeness`
  - **Purpose**: Get profile completeness %, missing fields, and suggestions.
  - **Used in**: `src/app/(student)/profile/page.tsx` (to display completeness).
  - **Status**: **Used**.

- **`studentsApi.getSavedJobs()`**
  - **HTTP**: `GET /api/v1/students/me/saved-jobs/students/me/saved-jobs` (duplicated path segments).
  - **Purpose**: List saved jobs and folders, plus counts.
  - **Used in**:
    - `src/app/(student)/jobs/[id]/page.tsx` (to know saved jobs).
    - `src/app/(student)/dashboard/page.tsx` (dashboard saved jobs section).
  - **Status**: **Used**.

- **`studentsApi.saveJob(data)`**
  - **HTTP**: `POST /api/v1/students/me/saved-jobs/students/me/saved-jobs`
  - **Purpose**: Save a job to a folder with optional notes.
  - **Used in**:
    - `src/app/(student)/jobs/[id]/page.tsx` (save from job detail).
    - `src/app/(student)/dashboard/page.tsx` (save from dashboard).
  - **Status**: **Used**.

- **`studentsApi.checkIfSaved(jobId)`**
  - **HTTP**: `GET /api/v1/students/me/saved-jobs/students/me/saved-jobs/check/{job_id}`
  - **Purpose**: Check whether a specific job is already saved, return saved job info.
  - **Used in**: `src/app/(student)/jobs/[id]/page.tsx` (to toggle save state).
  - **Status**: **Used**.

- **`studentsApi.getRecommendedJobs(limit?, offset?)`**
  - **HTTP**: `GET /api/v1/students/me/recommended-jobs[?limit=..&offset=..]`
  - **Purpose**: Paginated AI/logic-based job recommendations with scores and reasons.
  - **Used in**: `src/app/(student)/dashboard/page.tsx` (recommended jobs section).
  - **Status**: **Used**.

- **`studentsApi.getSimilarJobs(jobId)`**
  - **HTTP**: `GET /api/v1/students/me/jobs/{job_id}/similar`
  - **Purpose**: Fetch similar jobs based on a selected job.
  - **Used in**: `src/app/(student)/jobs/[id]/page.tsx` (similar jobs list).
  - **Status**: **Used**.

- **`studentsApi.getRecommendationStats()`**
  - **HTTP**: `GET /api/v1/students/me/students/me/recommendation-stats`
  - **Purpose**: Get high-level stats on recommendations (total, avg score, top skills, etc.).
  - **Used in**: **No usages found.**
  - **Status**: **Unused API** (and path likely needs cleanup).

---

### `jobsApi` (`src/lib/api/jobs.ts`)

Shared:
- **Base URL**: same `API_BASE_URL`.
- **Auth**: per-request axios instance with `Authorization` from `localStorage`.

- **`jobsApi.getJobs(filters?)`**
  - **HTTP**: `GET /api/v1/jobs/?{queryParams}`
  - **Purpose**: Get paginated jobs with optional filters (`JobFilters`) via query params.
  - **Used in**:
    - `src/app/(student)/dashboard/page.tsx` (jobs listing section).
    - `src/app/(student)/jobs/[id]/page.tsx` indirectly via other pages.
    - `src/app/student/jobs/page.tsx` (jobs listing – likely older route variant).
    - `src/app/student/dashboard/page.tsx` (dashboard – likely older route variant).
  - **Status**: **Used**, but note:
    - The `(student)` routes look like the active ones.
    - `src/app/student/...` may be legacy/duplicate route versions; if those pages are unused, those usages are effectively dead.

- **`jobsApi.getJob(jobId)`**
  - **HTTP**: `GET /api/v1/jobs/{jobId}`
  - **Purpose**: Get single job detail by ID.
  - **Used in**:
    - `src/app/(student)/jobs/[id]/page.tsx`.
    - `src/app/student/jobs/[id]/page.tsx` (again, likely older/duplicate route).
  - **Status**: **Used** (same note about legacy `student` folder).

---

### Summary of **Unused APIs**

- **Unused but defined:**
  - **`authApi.getCurrentUser()`** → `GET /api/v1/auth/me`
  - **`studentsApi.getActivity()`** → `GET /api/v1/students/me/students/me/activity`
  - **`studentsApi.getRecommendationStats()`** → `GET /api/v1/students/me/students/me/recommendation-stats`

- **Potentially legacy/duplicate page routes using the same APIs:**
  - `src/app/student/dashboard/page.tsx`
  - `src/app/student/jobs/page.tsx`
  - `src/app/student/jobs/[id]/page.tsx`  
  If your active routes are under `src/app/(student)/...`, the `src/app/student/...` pages might be **unused pages**, but the underlying `jobsApi` methods themselves are still actively used elsewhere.

If you want, I can also produce a small markdown table you can drop into your docs that lists each API, method name, route, and usage locations.