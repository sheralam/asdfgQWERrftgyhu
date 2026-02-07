# API Endpoints - Campaign Studio

## Base URL
```
Development: http://localhost:8000/api
Production: https://api.campaign-studio.com/api
```

## Authentication

All endpoints (except auth endpoints) require Bearer token authentication:
```
Authorization: Bearer <access_token>
```

## 1. Authentication Endpoints

### POST /auth/register
Register a new user.

**Request Body:**
```json
{
  "username": "string",
  "email": "user@example.com",
  "password": "string",
  "first_name": "string",
  "last_name": "string"
}
```

**Response:** `201 Created`
```json
{
  "user_id": "uuid",
  "username": "string",
  "email": "user@example.com",
  "role": "user",
  "created_at": "2026-02-06T10:00:00Z"
}
```

### POST /auth/login
Authenticate user and get tokens.

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response:** `200 OK`
```json
{
  "access_token": "eyJhbGc...",
  "refresh_token": "eyJhbGc...",
  "token_type": "bearer",
  "expires_in": 1800,
  "user": {
    "user_id": "uuid",
    "username": "string",
    "email": "user@example.com",
    "role": "campaign_manager"
  }
}
```

### POST /auth/refresh
Refresh access token using refresh token.

**Request Body:**
```json
{
  "refresh_token": "string"
}
```

**Response:** `200 OK`
```json
{
  "access_token": "eyJhbGc...",
  "token_type": "bearer",
  "expires_in": 1800
}
```

### POST /auth/logout
Invalidate current session.

**Response:** `204 No Content`

### GET /auth/me
Get current user information.

**Response:** `200 OK`
```json
{
  "user_id": "uuid",
  "username": "string",
  "email": "user@example.com",
  "first_name": "string",
  "last_name": "string",
  "role": "campaign_manager",
  "is_active": true,
  "created_at": "2026-02-06T10:00:00Z"
}
```

## 2. Campaign Endpoints

### GET /campaigns
List all campaigns with pagination and filtering.

**Query Parameters:**
- `page` (integer, default: 1) - Page number
- `limit` (integer, default: 20, max: 100) - Items per page
- `status` (string, optional) - Filter by status: active, inactive, paused, draft, expired
- `search` (string, optional) - Search by campaign name
- `sort` (string, optional) - Sort field: created_at, updated_at, campaign_name
- `order` (string, optional) - Sort order: asc, desc

**Response:** `200 OK`
```json
{
  "data": [
    {
      "campaign_id": "uuid",
      "campaign_name": "Summer Sale 2026",
      "campaign_description": "Summer promotional campaign",
      "campaign_start_date": "2026-06-01",
      "campaign_end_date": "2026-08-31",
      "campaign_status": "active",
      "campaign_created_by_id": "uuid",
      "created_by_name": "John Doe",
      "created_at": "2026-02-06T10:00:00Z",
      "updated_at": "2026-02-06T10:00:00Z",
      "ad_count": 4
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "total_pages": 3
  }
}
```

### GET /campaigns/{campaign_id}
Get campaign details by ID.

**Response:** `200 OK`
```json
{
  "campaign_id": "uuid",
  "campaign_name": "Summer Sale 2026",
  "campaign_description": "Summer promotional campaign",
  "campaign_start_date": "2026-06-01",
  "campaign_end_date": "2026-08-31",
  "campaign_expiry_date": "2026-09-15",
  "campaign_max_view_duration": {
    "value": 30,
    "unit": "days"
  },
  "campaign_max_view_count": 1000,
  "campaign_status": "active",
  "campaign_created_by_id": "uuid",
  "created_by_name": "John Doe",
  "updated_by_name": "Jane Smith",
  "created_at": "2026-02-06T10:00:00Z",
  "updated_at": "2026-02-06T12:00:00Z",
  "audience_targeting": {
    "audience_id": "uuid",
    "region": "North America",
    "country": "United States",
    "cities": ["New York", "Los Angeles", "Chicago"],
    "postcodes": ["10001", "90001", "60601"]
  },
  "ads": [
    {
      "ad_id": "uuid",
      "ad_type_id": "top_bar_ad",
      "ad_name": "Summer Banner",
      "media_type": "image",
      "ad_status": "active",
      "created_at": "2026-02-06T10:00:00Z"
    }
  ]
}
```

### POST /campaigns
Create a new campaign.

**Required Role:** campaign_manager, app_admin, system_admin

**Request Body:**
```json
{
  "campaign_name": "Summer Sale 2026",
  "campaign_description": "Summer promotional campaign",
  "campaign_start_date": "2026-06-01",
  "campaign_end_date": "2026-08-31",
  "campaign_expiry_date": "2026-09-15",
  "campaign_max_view_duration": {
    "value": 30,
    "unit": "days"
  },
  "campaign_max_view_count": 1000,
  "campaign_status": "draft",
  "audience_targeting": {
    "region": "North America",
    "country": "United States",
    "cities": ["New York", "Los Angeles"],
    "postcodes": ["10001", "90001"]
  }
}
```

**Response:** `201 Created`
```json
{
  "campaign_id": "uuid",
  "campaign_name": "Summer Sale 2026",
  ...
}
```

**Validation Rules:**
- campaign_name: required, max 255 chars
- campaign_start_date: required, valid date
- campaign_end_date: required, must be >= start_date
- campaign_status: required, enum
- audience_targeting.region: required
- audience_targeting.country: required

### PUT /campaigns/{campaign_id}
Update an existing campaign.

**Required Role:** campaign_manager, app_admin, system_admin

**Request Body:** (Partial update supported)
```json
{
  "campaign_name": "Updated Summer Sale 2026",
  "campaign_status": "active"
}
```

**Response:** `200 OK`
```json
{
  "campaign_id": "uuid",
  "campaign_name": "Updated Summer Sale 2026",
  ...
}
```

### DELETE /campaigns/{campaign_id}
Delete a campaign and all associated ads.

**Required Role:** campaign_manager, app_admin, system_admin

**Response:** `204 No Content`

**Note:** This is a cascade delete - all associated ads, time slots, and content ratings will be deleted.

## 3. Ad Endpoints

### GET /campaigns/{campaign_id}/ads
List all ads for a specific campaign.

**Response:** `200 OK`
```json
{
  "data": [
    {
      "ad_id": "uuid",
      "campaign_id": "uuid",
      "ad_type_id": "top_bar_ad",
      "ad_name": "Summer Banner",
      "ad_description": "Top banner advertisement",
      "media_type": "image",
      "media_url": "https://cdn.example.com/image.jpg",
      "ad_impression_duration": {
        "value": 5,
        "unit": "seconds"
      },
      "ad_advertiser_forwarding_url": "https://example.com/promo",
      "ad_status": "active",
      "created_at": "2026-02-06T10:00:00Z"
    }
  ]
}
```

### GET /ads/{ad_id}
Get ad details by ID.

**Response:** `200 OK`
```json
{
  "ad_id": "uuid",
  "campaign_id": "uuid",
  "ad_type_id": "top_bar_ad",
  "ad_name": "Summer Banner",
  "ad_description": "Top banner advertisement",
  "media_type": "image",
  "media_url": "https://cdn.example.com/image.jpg",
  "media_content": null,
  "ad_impression_duration": {
    "value": 5,
    "unit": "seconds"
  },
  "ad_advertiser_forwarding_url": "https://example.com/promo",
  "ad_start_date": "2026-06-01",
  "ad_end_date": "2026-08-31",
  "ad_status": "active",
  "time_slots": [
    {
      "time_slot_id": "uuid",
      "time_slot_start": "10:00",
      "time_slot_end": "10:15"
    },
    {
      "time_slot_id": "uuid",
      "time_slot_start": "14:00",
      "time_slot_end": "14:30"
    }
  ],
  "content_rating": {
    "rating_id": "uuid",
    "warning_required": true,
    "rating_system": "MPAA",
    "rating_label": "PG",
    "content_warnings": ["Mild Language"],
    "no_prohibited_content": true
  },
  "created_at": "2026-02-06T10:00:00Z",
  "updated_at": "2026-02-06T10:00:00Z"
}
```

### POST /campaigns/{campaign_id}/ads
Create a new ad for a campaign.

**Required Role:** campaign_manager, app_admin, system_admin

**Request Body:**
```json
{
  "ad_type_id": "top_bar_ad",
  "ad_name": "Summer Banner",
  "ad_description": "Top banner advertisement",
  "media_type": "image",
  "media_url": "https://cdn.example.com/image.jpg",
  "ad_impression_duration": {
    "value": 5,
    "unit": "seconds"
  },
  "ad_advertiser_forwarding_url": "https://example.com/promo",
  "ad_start_date": "2026-06-01",
  "ad_end_date": "2026-08-31",
  "ad_status": "draft",
  "time_slots": [
    {
      "time_slot_start": "10:00",
      "time_slot_end": "10:15"
    }
  ],
  "content_rating": {
    "warning_required": true,
    "rating_system": "MPAA",
    "rating_label": "PG",
    "content_warnings": ["Mild Language"],
    "no_prohibited_content": true
  }
}
```

**Response:** `201 Created`

**Validation Rules:**
- Maximum 6 ads per campaign
- ad_type_id: required, enum
- media_type: required, must match allowed types for ad_type
- For image-only ad types: media_type must be text, image, or gif
- For multimedia ad types: any media_type allowed
- Time slots must be in 15-minute intervals
- content_rating.no_prohibited_content: must be true

### PUT /ads/{ad_id}
Update an existing ad.

**Required Role:** campaign_manager, app_admin, system_admin

**Request Body:** (Partial update supported)
```json
{
  "ad_name": "Updated Summer Banner",
  "ad_status": "active"
}
```

**Response:** `200 OK`

### DELETE /ads/{ad_id}
Delete an ad.

**Required Role:** campaign_manager, app_admin, system_admin

**Response:** `204 No Content`

## 4. Advertiser Endpoints

### GET /advertisers
List all advertisers.

**Query Parameters:**
- `page` (integer, default: 1)
- `limit` (integer, default: 20, max: 100)
- `type` (string, optional) - Filter by type: individual, business, enterprise, agency
- `search` (string, optional) - Search by name

**Response:** `200 OK`
```json
{
  "data": [
    {
      "advertiser_id": "uuid",
      "advertiser_name": "Acme Corporation",
      "advertiser_type": "business",
      "city": "New York",
      "country": "United States",
      "created_at": "2026-02-06T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 15,
    "total_pages": 1
  }
}
```

### GET /advertisers/{advertiser_id}
Get advertiser details.

**Response:** `200 OK`
```json
{
  "advertiser_id": "uuid",
  "advertiser_name": "Acme Corporation",
  "advertiser_type": "business",
  "address_line_1": "123 Main Street",
  "address_line_2": "Suite 100",
  "city": "New York",
  "state": "NY",
  "postal_code": "10001",
  "country": "United States",
  "latitude": 40.7128,
  "longitude": -74.0060,
  "timezone": "America/New_York",
  "contacts": [
    {
      "contact_id": "uuid",
      "contact_name": "John Smith",
      "contact_email": "john@acme.com",
      "contact_phone": "+1-212-555-0100",
      "contact_type": "admin",
      "is_point_of_contact": true
    }
  ],
  "bank_accounts": [
    {
      "bank_id": "uuid",
      "bank_name": "Chase Bank",
      "bank_account_name": "Acme Corporation",
      "bank_account_currency": "USD",
      "is_default": true,
      "is_verified": true
    }
  ],
  "created_at": "2026-02-06T10:00:00Z"
}
```

### POST /advertisers
Create a new advertiser.

**Required Role:** campaign_manager, app_admin, system_admin

**Request Body:**
```json
{
  "advertiser_name": "Acme Corporation",
  "advertiser_type": "business",
  "address_line_1": "123 Main Street",
  "address_line_2": "Suite 100",
  "city": "New York",
  "state": "NY",
  "postal_code": "10001",
  "country": "United States",
  "timezone": "America/New_York",
  "contacts": [
    {
      "contact_name": "John Smith",
      "contact_email": "john@acme.com",
      "contact_phone": "+1-212-555-0100",
      "contact_type": "admin",
      "is_point_of_contact": true
    }
  ]
}
```

**Response:** `201 Created`

### PUT /advertisers/{advertiser_id}
Update advertiser information.

**Required Role:** campaign_manager, app_admin, system_admin

**Response:** `200 OK`

### DELETE /advertisers/{advertiser_id}
Delete an advertiser.

**Required Role:** app_admin, system_admin

**Response:** `204 No Content`

## 5. User Management Endpoints

### GET /users
List all users (Admin only).

**Required Role:** app_admin, system_admin

**Query Parameters:**
- `page`, `limit`, `role`, `search`

**Response:** `200 OK`

### GET /users/{user_id}
Get user details.

**Required Role:** app_admin, system_admin (or own user)

**Response:** `200 OK`

### PUT /users/{user_id}
Update user information.

**Required Role:** app_admin, system_admin (or own user)

**Response:** `200 OK`

### DELETE /users/{user_id}
Delete a user.

**Required Role:** system_admin

**Response:** `204 No Content`

## 6. Error Responses

### 400 Bad Request
```json
{
  "detail": "Validation error",
  "errors": [
    {
      "field": "campaign_name",
      "message": "Campaign name is required"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "detail": "Invalid authentication credentials"
}
```

### 403 Forbidden
```json
{
  "detail": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "detail": "Campaign not found"
}
```

### 422 Unprocessable Entity
```json
{
  "detail": "Invalid input data",
  "errors": [...]
}
```

### 500 Internal Server Error
```json
{
  "detail": "Internal server error"
}
```

## 7. Rate Limiting

- 100 requests per minute per IP address
- 1000 requests per hour per authenticated user
- Headers returned:
  - `X-RateLimit-Limit`: Request limit
  - `X-RateLimit-Remaining`: Requests remaining
  - `X-RateLimit-Reset`: Unix timestamp when limit resets

## 8. API Versioning

Current version: v1 (included in base URL: `/api/v1/...`)

## 9. Pagination

All list endpoints support pagination with:
- `page`: Page number (1-indexed)
- `limit`: Items per page (default: 20, max: 100)

Response includes `pagination` object with total count and pages.

## 10. Filtering and Sorting

List endpoints support:
- Filtering via query parameters
- Sorting with `sort` and `order` parameters
- Full-text search with `search` parameter
