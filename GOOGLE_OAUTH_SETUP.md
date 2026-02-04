# Google OAuth Setup Guide

## Frontend Configuration

### 1. Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth client ID"
5. Choose "Web application"
6. Add authorized JavaScript origins:
   - `http://localhost:3000` (for development)
   - `https://yourdomain.com` (for production)
7. Add authorized redirect URIs:
   - `http://localhost:3000` (for development)
   - `https://yourdomain.com` (for production)
8. Copy the Client ID

### 2. Set Environment Variable

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here
NEXT_PUBLIC_BASE_URL=http://localhost:8000
```

### 3. Backend API Endpoint

**⚠️ IMPORTANT: This endpoint must be implemented on your backend for Google OAuth to work.**

Your backend needs to implement the following endpoint:

**POST** `/api/v1/auth/google`

**Request Body:**
```json
{
  "idToken": "authorization_code_from_google",
  "role": "student" | "placement_team" | "admin" (optional)
}
```

**Note:** The `idToken` field contains the authorization code from Google OAuth flow. Your backend needs to:
1. Exchange this authorization code for an access token and ID token using Google's token endpoint
2. Verify the ID token to get user information (email, name, etc.)
3. Validate that the email ends with `@navgurukul.org`
4. Create or login the user with the appropriate role

**Response (Success - 200):**
```json
{
  "access_token": "jwt_token",
  "refresh_token": "refresh_token",
  "token_type": "bearer",
  "user": {
    "id": "user_id",
    "email": "user@navgurukul.org",
    "role": "student"
  }
}
```

**Response (Error - 400/401):**
```json
{
  "message": "Only @navgurukul.org emails are allowed"
}
```

**Backend Implementation Notes:**

1. **Exchange authorization code for tokens:**
   - Use Google's token endpoint to exchange the authorization code for access token and ID token
   - Verify the ID token to get user information

2. **Email Domain Validation:**
   - Check that the user's email ends with `@navgurukul.org`
   - Return error if email domain doesn't match

3. **Role Assignment:**
   - If user doesn't exist, create account with the provided role
   - If user exists, return their existing role
   - Verify role is valid (student, placement_team, or admin)

4. **Security:**
   - Verify the Google ID token signature
   - Check token expiration
   - Validate the token was issued to your client ID

## Features Implemented

✅ Google OAuth login button on login page
✅ Google OAuth signup button on signup page
✅ Email domain validation (@navgurukul.org only)
✅ Role-based authentication (student, placement_team, admin)
✅ Email/password login with role selection
✅ Email/password signup with role selection
✅ Automatic redirect to appropriate dashboard based on role

## Usage

1. User clicks "Continue with Google" button
2. Google OAuth popup opens
3. User selects Google account
4. Frontend sends authorization code to backend
5. Backend verifies email domain and creates/logs in user
6. Backend returns JWT tokens
7. Frontend stores tokens and redirects to dashboard

## Error Handling

- If email is not @navgurukul.org: Shows error message
- If Google login fails: Shows error message
- If backend validation fails: Shows backend error message

