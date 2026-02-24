# Backend API Requirements for Google OAuth

## Required Endpoint

### POST `/api/v1/auth/google`

This endpoint handles Google OAuth authentication.

#### Request

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "idToken": "authorization_code_from_google",
  "role": "student" | "placement_team" | "admin"
}
```

**Note:** The `idToken` field actually contains the **authorization code** from Google OAuth flow (not an ID token). Your backend needs to exchange this code for tokens.

#### Implementation Steps

1. **Exchange Authorization Code for Tokens:**
   ```
   POST https://oauth2.googleapis.com/token
   Content-Type: application/x-www-form-urlencoded
   
   code={authorization_code}
   &client_id={YOUR_GOOGLE_CLIENT_ID}
   &client_secret={YOUR_GOOGLE_CLIENT_SECRET}
   &redirect_uri={YOUR_REDIRECT_URI}
   &grant_type=authorization_code
   ```

2. **Get User Info from ID Token:**
   - Decode and verify the ID token from step 1
   - Extract user email, name, and other info
   - Verify the token signature and expiration

3. **Validate Email Domain:**
   - Check that email ends with `@navgurukul.org`
   - Return error if domain doesn't match

4. **Create or Login User:**
   - If user doesn't exist: Create new user with provided role
   - If user exists: Return existing user's role
   - Generate JWT tokens (access_token and refresh_token)

#### Response (Success - 200)

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "refresh_token_here",
  "token_type": "bearer",
  "user": {
    "id": "123",
    "email": "user@navgurukul.org",
    "role": "student"
  }
}
```

#### Response (Error - 400)

```json
{
  "message": "Only @navgurukul.org emails are allowed"
}
```

#### Response (Error - 401)

```json
{
  "message": "Invalid Google authorization code"
}
```

#### Response (Error - 500)

```json
{
  "message": "Internal server error"
}
```

## Example Backend Implementation (Python/FastAPI)

```python
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import httpx
import jwt
from google.oauth2 import id_token
from google.auth.transport import requests

router = APIRouter()

class GoogleAuthRequest(BaseModel):
    idToken: str  # Actually the authorization code
    role: str = "student"

@router.post("/api/v1/auth/google")
async def google_auth(request: GoogleAuthRequest):
    try:
        # Step 1: Exchange authorization code for tokens
        token_url = "https://oauth2.googleapis.com/token"
        token_data = {
            "code": request.idToken,
            "client_id": GOOGLE_CLIENT_ID,
            "client_secret": GOOGLE_CLIENT_SECRET,
            "redirect_uri": REDIRECT_URI,
            "grant_type": "authorization_code"
        }
        
        async with httpx.AsyncClient() as client:
            token_response = await client.post(token_url, data=token_data)
            token_response.raise_for_status()
            tokens = token_response.json()
            id_token_str = tokens["id_token"]
        
        # Step 2: Verify and decode ID token
        try:
            idinfo = id_token.verify_oauth2_token(
                id_token_str, 
                requests.Request(), 
                GOOGLE_CLIENT_ID
            )
        except ValueError:
            raise HTTPException(status_code=401, detail="Invalid Google token")
        
        email = idinfo.get("email")
        name = idinfo.get("name")
        
        # Step 3: Validate email domain
        if not email or not email.endswith("@navgurukul.org"):
            raise HTTPException(
                status_code=400, 
                detail="Only @navgurukul.org emails are allowed"
            )
        
        # Step 4: Create or get user
        user = await get_or_create_user(
            email=email,
            name=name,
            role=request.role
        )
        
        # Step 5: Generate JWT tokens
        access_token = create_access_token(user.id, user.role)
        refresh_token = create_refresh_token(user.id)
        
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "user": {
                "id": str(user.id),
                "email": user.email,
                "role": user.role
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

## Testing

Once implemented, test with:

1. Frontend Google login button should work
2. Verify email domain validation works
3. Verify role assignment works
4. Verify JWT tokens are returned correctly

## Current Status

- ✅ Frontend implementation complete
- ⏳ Backend endpoint needs to be implemented
- ⏳ Google OAuth credentials need to be configured on backend







