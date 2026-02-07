# Authentication & Authorization - Campaign Studio

## 1. Overview

Campaign Studio uses JWT (JSON Web Tokens) for authentication and role-based access control (RBAC) for authorization. This document outlines the security implementation for the system.

## 2. Authentication Flow

### 2.1 Registration Flow

```
User submits registration form
    ↓
Backend validates input
    ↓
Password is hashed (bcrypt)
    ↓
User record created with default role (user)
    ↓
Confirmation email sent (optional)
    ↓
User can log in
```

### 2.2 Login Flow

```
User submits credentials
    ↓
Backend validates username/email and password
    ↓
Password verified against hash
    ↓
JWT access token generated (30 min expiry)
    ↓
JWT refresh token generated (7 days expiry)
    ↓
Tokens returned to client
    ↓
Client stores tokens (localStorage/sessionStorage)
    ↓
Access token included in Authorization header for requests
```

### 2.3 Token Refresh Flow

```
Access token expires
    ↓
Client receives 401 Unauthorized
    ↓
Client sends refresh token to /auth/refresh
    ↓
Backend validates refresh token
    ↓
New access token generated and returned
    ↓
Client updates stored access token
    ↓
Client retries original request
```

## 3. JWT Token Structure

### Access Token Payload

```json
{
  "sub": "user_id_uuid",
  "username": "johndoe",
  "email": "john@example.com",
  "role": "campaign_manager",
  "type": "access",
  "exp": 1707225600,
  "iat": 1707223800
}
```

### Refresh Token Payload

```json
{
  "sub": "user_id_uuid",
  "type": "refresh",
  "exp": 1707828600,
  "iat": 1707223800
}
```

## 4. Password Security

### Hashing Algorithm
- **Algorithm**: bcrypt
- **Rounds**: 12 (configurable)
- **Salt**: Automatically generated per password

### Password Requirements
- Minimum length: 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one digit
- At least one special character
- No common passwords (check against leaked password database)

### Password Reset Flow

```
User requests password reset
    ↓
System generates unique reset token
    ↓
Reset token stored with expiration (1 hour)
    ↓
Email sent with reset link
    ↓
User clicks link and enters new password
    ↓
System validates token and expiration
    ↓
Password updated (hashed)
    ↓
All active sessions invalidated
    ↓
User logs in with new password
```

## 5. Role-Based Access Control (RBAC)

### Role Hierarchy

```
1. System Admin (Level 1) - Highest privileges
    ↓
2. App Admin (Level 2)
    ↓
3. Campaign Manager (Level 3) - Primary Campaign Studio user
    ↓
4. Content Moderator (Level 4)
    ↓
5. User (Level 5)
    ↓
6. Guest (Level 6) - Lowest privileges
```

### Role Permissions Matrix

| Resource | System Admin | App Admin | Campaign Manager | Content Moderator | User | Guest |
|----------|--------------|-----------|------------------|-------------------|------|-------|
| **Users** |
| Create users | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| Read users | ✓ | ✓ | Own only | Own only | Own only | ✗ |
| Update users | ✓ | ✓ | Own only | Own only | Own only | ✗ |
| Delete users | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| Assign roles | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| **Campaigns** |
| Create campaigns | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ |
| Read campaigns | ✓ | ✓ | ✓ | ✓ | Read-only | Read-only |
| Update campaigns | ✓ | ✓ | ✓ (own) | ✗ | ✗ | ✗ |
| Delete campaigns | ✓ | ✓ | ✓ (own) | ✗ | ✗ | ✗ |
| Publish campaigns | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ |
| **Ads** |
| Create ads | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ |
| Read ads | ✓ | ✓ | ✓ | ✓ | Read-only | Read-only |
| Update ads | ✓ | ✓ | ✓ (own) | ✗ | ✗ | ✗ |
| Delete ads | ✓ | ✓ | ✓ (own) | ✗ | ✗ | ✗ |
| Schedule ads | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ |
| **Advertisers** |
| Create advertisers | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ |
| Read advertisers | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ |
| Update advertisers | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ |
| Delete advertisers | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| **Content Moderation** |
| Review content | ✓ | ✓ | ✗ | ✓ | ✗ | ✗ |
| Approve content | ✓ | ✓ | ✗ | ✓ | ✗ | ✗ |
| Reject content | ✓ | ✓ | ✗ | ✓ | ✗ | ✗ |
| Assign ratings | ✓ | ✓ | ✗ | ✓ | ✗ | ✗ |
| **System** |
| View logs | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| System config | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Backup/Restore | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |

## 6. Implementation Details

### Backend (Python/FastAPI)

#### Authentication Middleware

```python
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """Extract and validate JWT token, return current user."""
    token = credentials.credentials
    payload = decode_token(token)
    
    if not payload or payload.get("type") != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )
    
    user_id = payload.get("sub")
    user = db.query(User).filter(User.user_id == user_id).first()
    
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive"
        )
    
    return user
```

#### Authorization Decorator

```python
def require_role(required_roles: list[str]):
    """Dependency to check if user has required role."""
    def role_checker(current_user: User = Depends(get_current_user)):
        if current_user.role.role_name not in required_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions"
            )
        return current_user
    return role_checker

# Usage in route
@router.post("/campaigns")
async def create_campaign(
    campaign: CampaignCreate,
    current_user: User = Depends(require_role(["campaign_manager", "app_admin", "system_admin"])),
    db: Session = Depends(get_db)
):
    # Create campaign logic
    pass
```

#### Resource Ownership Check

```python
def check_resource_ownership(user: User, resource_owner_id: str) -> bool:
    """Check if user owns resource or has admin role."""
    if user.role.role_name in ["system_admin", "app_admin"]:
        return True
    return str(user.user_id) == resource_owner_id

# Usage
campaign = db.query(Campaign).filter(Campaign.campaign_id == campaign_id).first()
if not check_resource_ownership(current_user, str(campaign.campaign_created_by_id)):
    raise HTTPException(status_code=403, detail="Not authorized to modify this campaign")
```

### Frontend (React/TypeScript)

#### Auth Store (Zustand)

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string, refreshToken: string) => void;
  logout: () => void;
  hasRole: (roles: string[]) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      login: (user, token, refreshToken) =>
        set({ user, token, refreshToken, isAuthenticated: true }),
      logout: () =>
        set({ user: null, token: null, refreshToken: null, isAuthenticated: false }),
      hasRole: (roles: string[]) => {
        const { user } = get();
        return user ? roles.includes(user.role) : false;
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
```

#### Protected Route Component

```typescript
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

interface PrivateRouteProps {
  children: React.ReactNode;
}

export default function PrivateRoute({ children }: PrivateRouteProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
```

#### Role-Based Route Component

```typescript
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

interface RoleRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

export default function RoleRoute({ children, allowedRoles }: RoleRouteProps) {
  const hasRole = useAuthStore((state) => state.hasRole(allowedRoles));

  if (!hasRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}
```

#### Axios Interceptor for Token Refresh

```typescript
import axios from 'axios';
import { useAuthStore } from '@/stores/authStore';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and not already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = useAuthStore.getState().refreshToken;
        const { data } = await axios.post('/api/auth/refresh', { refreshToken });
        
        // Update token in store
        useAuthStore.getState().login(
          useAuthStore.getState().user!,
          data.access_token,
          refreshToken
        );

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout user
        useAuthStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
```

## 7. Security Best Practices

### 7.1 Token Storage
- **Frontend**: Store tokens in memory (state) or localStorage
- **Never**: Store in cookies without HttpOnly flag
- **Consideration**: Use sessionStorage for more security (cleared on browser close)

### 7.2 Token Expiration
- **Access Token**: Short-lived (30 minutes)
- **Refresh Token**: Longer-lived (7 days)
- **Implement**: Token rotation on refresh

### 7.3 HTTPS
- **Always** use HTTPS in production
- **Redirect** HTTP to HTTPS
- **Set** secure flags on cookies

### 7.4 CORS Configuration
```python
# Backend CORS settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://campaign-studio.com"],  # Specific origins only
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)
```

### 7.5 Rate Limiting
- Implement rate limiting on auth endpoints
- Limit login attempts (5 per 15 minutes)
- Lock account after multiple failed attempts
- CAPTCHA for repeated failures

### 7.6 Audit Logging
Log all authentication and authorization events:
- Login attempts (success/failure)
- Token refresh
- Logout
- Permission denials
- Role changes
- Password resets

### 7.7 Session Management
- Implement session invalidation on logout
- Track active sessions per user
- Allow users to view and revoke sessions
- Automatic session cleanup

## 8. Security Testing

### 8.1 Authentication Tests
- Valid credentials → success
- Invalid credentials → 401
- Expired token → 401
- Invalid token format → 401
- Missing token → 401

### 8.2 Authorization Tests
- Role access → correct permissions
- Resource ownership → only owner can edit
- Cross-user access → 403 forbidden
- Privilege escalation attempts → blocked

### 8.3 Security Scans
- Regular dependency updates
- Vulnerability scanning
- Penetration testing
- OWASP Top 10 compliance

## 9. Compliance

### Data Protection
- GDPR compliance for EU users
- CCPA compliance for California users
- Data encryption at rest and in transit
- Right to deletion

### Audit Requirements
- Maintain audit logs for 90 days minimum
- Tamper-proof logging
- Regular security audits
- Compliance reporting

## 10. Emergency Procedures

### Compromised Account
1. Immediately invalidate all user sessions
2. Force password reset
3. Review audit logs for suspicious activity
4. Notify user of potential breach

### Compromised Secret Key
1. Rotate secret key immediately
2. Invalidate all existing tokens
3. Force re-authentication for all users
4. Update security documentation

### Data Breach
1. Follow incident response plan
2. Notify affected users
3. Report to relevant authorities
4. Conduct post-mortem analysis

This document provides comprehensive authentication and authorization guidelines for Campaign Studio.
