# Data Models and Schema - Campaign Studio

## 1. Database Schema Overview

The Campaign Studio uses PostgreSQL as its primary database. The schema is designed to support:
- Campaign and ad management
- User authentication and authorization
- Advertiser information
- Audience targeting
- Content ratings and moderation
- Audit logging

## 2. Entity Relationship Diagram

```
users ──────┐
            │
            ├──> campaigns ──> campaign_audience_targeting
            │         │
            │         └──> ads ──> ad_content_ratings
            │                │
            │                └──> ad_time_slots
            │
            └──> advertisers ──> advertiser_contacts
                        │
                        └──> advertiser_bank_accounts

roles ──> user_roles ──> users
```

## 3. Core Tables

### 3.1 Users Table

Stores system user information.

```sql
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role_id UUID REFERENCES roles(role_id),
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role_id ON users(role_id);
```

### 3.2 Roles Table

Defines user roles and permissions.

```sql
CREATE TABLE roles (
    role_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_name VARCHAR(50) UNIQUE NOT NULL,
    role_description TEXT,
    role_level INTEGER NOT NULL,
    role_priority VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_role_name CHECK (role_name IN (
        'system_admin', 'app_admin', 'campaign_manager', 
        'content_moderator', 'user', 'guest'
    ))
);

CREATE INDEX idx_roles_name ON roles(role_name);
```

### 3.3 Campaigns Table

Main table for campaign data.

```sql
CREATE TABLE campaigns (
    campaign_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_name VARCHAR(255) NOT NULL,
    campaign_description TEXT,
    campaign_start_date DATE NOT NULL,
    campaign_end_date DATE NOT NULL,
    campaign_expiry_date DATE,
    campaign_max_view_duration_value INTEGER,
    campaign_max_view_duration_unit VARCHAR(20),
    campaign_max_view_count INTEGER,
    campaign_status VARCHAR(20) NOT NULL DEFAULT 'draft',
    campaign_created_by_id UUID NOT NULL REFERENCES users(user_id),
    created_by_name VARCHAR(200),
    updated_by_name VARCHAR(200),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_campaign_status CHECK (campaign_status IN (
        'active', 'inactive', 'paused', 'draft', 'expired'
    )),
    CONSTRAINT valid_date_range CHECK (campaign_end_date >= campaign_start_date),
    CONSTRAINT valid_view_duration_unit CHECK (
        campaign_max_view_duration_unit IS NULL OR 
        campaign_max_view_duration_unit IN ('seconds', 'minutes', 'hours', 'days')
    )
);

CREATE INDEX idx_campaigns_status ON campaigns(campaign_status);
CREATE INDEX idx_campaigns_created_by ON campaigns(campaign_created_by_id);
CREATE INDEX idx_campaigns_dates ON campaigns(campaign_start_date, campaign_end_date);
```

### 3.4 Campaign Audience Targeting Table

Stores hierarchical audience targeting data.

```sql
CREATE TABLE campaign_audience_targeting (
    audience_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES campaigns(campaign_id) ON DELETE CASCADE,
    region VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL,
    cities TEXT[], -- PostgreSQL array of cities
    postcodes TEXT[], -- PostgreSQL array of postcodes
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audience_campaign ON campaign_audience_targeting(campaign_id);
CREATE INDEX idx_audience_region ON campaign_audience_targeting(region);
CREATE INDEX idx_audience_country ON campaign_audience_targeting(country);
```

### 3.5 Ads Table

Stores advertisement data for campaigns.

```sql
CREATE TABLE ads (
    ad_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES campaigns(campaign_id) ON DELETE CASCADE,
    ad_type_id VARCHAR(50) NOT NULL,
    ad_name VARCHAR(255) NOT NULL,
    ad_description TEXT,
    media_type VARCHAR(50) NOT NULL,
    media_url TEXT,
    media_content TEXT, -- For HTML content
    ad_impression_duration_value INTEGER,
    ad_impression_duration_unit VARCHAR(20),
    ad_advertiser_forwarding_url TEXT,
    ad_start_date DATE,
    ad_end_date DATE,
    ad_expiry_date DATE,
    ad_in_view_duration_value INTEGER,
    ad_in_view_duration_unit VARCHAR(20),
    ad_view_count INTEGER DEFAULT 0,
    ad_status VARCHAR(20) NOT NULL DEFAULT 'draft',
    ad_created_by_id UUID NOT NULL REFERENCES users(user_id),
    created_by_name VARCHAR(200),
    updated_by_name VARCHAR(200),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_ad_type CHECK (ad_type_id IN (
        'top_bar_ad', 'bottom_left_ad', 'bottom_right_ad', 
        'bottom_center_ad', 'center_right_content_ad', 'center_left_content_ad'
    )),
    CONSTRAINT valid_ad_status CHECK (ad_status IN (
        'active', 'inactive', 'paused', 'draft', 'expired'
    )),
    CONSTRAINT valid_media_type_image_only CHECK (
        (ad_type_id IN ('top_bar_ad', 'bottom_left_ad', 'bottom_right_ad', 'bottom_center_ad') 
         AND media_type IN ('text', 'image', 'gif'))
        OR
        (ad_type_id IN ('center_right_content_ad', 'center_left_content_ad'))
    ),
    CONSTRAINT valid_duration_unit CHECK (
        ad_impression_duration_unit IS NULL OR 
        ad_impression_duration_unit IN ('seconds', 'minutes', 'hours')
    )
);

CREATE INDEX idx_ads_campaign ON ads(campaign_id);
CREATE INDEX idx_ads_type ON ads(ad_type_id);
CREATE INDEX idx_ads_status ON ads(ad_status);
```

### 3.6 Ad Time Slots Table

Stores scheduled time slots for ad display.

```sql
CREATE TABLE ad_time_slots (
    time_slot_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ad_id UUID NOT NULL REFERENCES ads(ad_id) ON DELETE CASCADE,
    time_slot_start TIME NOT NULL,
    time_slot_end TIME NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_time_slot CHECK (time_slot_end > time_slot_start),
    CONSTRAINT valid_15min_interval CHECK (
        EXTRACT(MINUTE FROM time_slot_start)::INTEGER % 15 = 0 AND
        EXTRACT(MINUTE FROM time_slot_end)::INTEGER % 15 = 0
    )
);

CREATE INDEX idx_time_slots_ad ON ad_time_slots(ad_id);
```

### 3.7 Ad Content Ratings Table

Stores content rating information for ads.

```sql
CREATE TABLE ad_content_ratings (
    rating_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ad_id UUID NOT NULL REFERENCES ads(ad_id) ON DELETE CASCADE,
    warning_required BOOLEAN DEFAULT true,
    rating_system VARCHAR(50), -- 'MPAA' or 'ESRB'
    rating_label VARCHAR(10), -- G, PG, PG-13, R, NC-17, E, E10+, T, M, AO
    content_warnings TEXT[], -- Array of warning descriptors
    no_prohibited_content BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_rating_system CHECK (rating_system IN ('MPAA', 'ESRB', NULL)),
    CONSTRAINT valid_mpaa_rating CHECK (
        rating_system != 'MPAA' OR rating_label IN ('G', 'PG', 'PG-13', 'R', 'NC-17')
    ),
    CONSTRAINT valid_esrb_rating CHECK (
        rating_system != 'ESRB' OR rating_label IN ('E', 'E10+', 'T', 'M', 'AO')
    ),
    CONSTRAINT prohibited_content_confirmed CHECK (no_prohibited_content = true)
);

CREATE INDEX idx_ratings_ad ON ad_content_ratings(ad_id);
```

### 3.8 Advertisers Table

Stores advertiser/business information.

```sql
CREATE TABLE advertisers (
    advertiser_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    advertiser_name VARCHAR(255) NOT NULL,
    advertiser_type VARCHAR(50) NOT NULL,
    address_line_1 VARCHAR(255) NOT NULL,
    address_line_2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(100) NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    timezone VARCHAR(50) NOT NULL,
    created_by_id UUID NOT NULL REFERENCES users(user_id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_advertiser_type CHECK (advertiser_type IN (
        'individual', 'business', 'enterprise', 'agency'
    ))
);

CREATE INDEX idx_advertisers_name ON advertisers(advertiser_name);
CREATE INDEX idx_advertisers_type ON advertisers(advertiser_type);
```

### 3.9 Advertiser Contacts Table

Stores contact information for advertisers.

```sql
CREATE TABLE advertiser_contacts (
    contact_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    advertiser_id UUID NOT NULL REFERENCES advertisers(advertiser_id) ON DELETE CASCADE,
    contact_name VARCHAR(200) NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(50) NOT NULL,
    contact_address VARCHAR(255),
    contact_city VARCHAR(100),
    contact_state VARCHAR(100),
    contact_postal_code VARCHAR(20),
    contact_country VARCHAR(100),
    is_point_of_contact BOOLEAN DEFAULT false,
    contact_type VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_contact_type CHECK (contact_type IN (
        'admin', 'manager', 'sales', 'support', 'marketing', 
        'tech', 'it', 'hr', 'finance'
    ))
);

CREATE INDEX idx_contacts_advertiser ON advertiser_contacts(advertiser_id);
```

### 3.10 Advertiser Bank Accounts Table

Stores encrypted bank account information.

```sql
CREATE TABLE advertiser_bank_accounts (
    bank_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    advertiser_id UUID NOT NULL REFERENCES advertisers(advertiser_id) ON DELETE CASCADE,
    bank_name VARCHAR(255) NOT NULL,
    bank_account_number_encrypted TEXT NOT NULL,
    bank_account_name VARCHAR(255) NOT NULL,
    bank_account_routing_number VARCHAR(50),
    bank_account_swift_code VARCHAR(20),
    bank_account_iban VARCHAR(50),
    bank_account_bic VARCHAR(20),
    bank_account_currency VARCHAR(3) NOT NULL,
    is_default BOOLEAN DEFAULT false,
    is_verified BOOLEAN DEFAULT false,
    is_sepa_compliant BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_currency CHECK (LENGTH(bank_account_currency) = 3)
);

CREATE INDEX idx_bank_accounts_advertiser ON advertiser_bank_accounts(advertiser_id);
```

### 3.11 Audit Logs Table

Tracks all system activities for compliance and debugging.

```sql
CREATE TABLE audit_logs (
    log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(user_id),
    action VARCHAR(50) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at);
```

## 4. Indexes Strategy

- Primary keys have automatic indexes
- Foreign keys have indexes for join performance
- Status fields have indexes for filtering
- Date fields have indexes for range queries
- Email/username have unique indexes for lookups
- Composite indexes for common query patterns

## 5. Data Validation Rules

### Campaign Validation
- End date must be >= start date
- Status must be valid enum value
- Max view duration unit must be valid
- Created by user must exist

### Ad Validation
- Campaign must exist
- Ad type must match allowed media types
- Time slots must be in 15-minute intervals
- Content rating must be provided
- Maximum 6 ads per campaign (enforced in application)

### Advertiser Validation
- At least one contact required
- Email format validation
- Currency code must be ISO 4217
- Bank account numbers encrypted

## 6. Database Migrations

Use Alembic for database migrations:

```bash
# Create migration
alembic revision -m "description"

# Apply migrations
alembic upgrade head

# Rollback
alembic downgrade -1
```

## 7. Sample Data Queries

### Get campaigns with ad count
```sql
SELECT c.campaign_id, c.campaign_name, COUNT(a.ad_id) as ad_count
FROM campaigns c
LEFT JOIN ads a ON c.campaign_id = a.campaign_id
GROUP BY c.campaign_id, c.campaign_name;
```

### Get active campaigns by region
```sql
SELECT c.*, cat.region, cat.country
FROM campaigns c
JOIN campaign_audience_targeting cat ON c.campaign_id = cat.campaign_id
WHERE c.campaign_status = 'active'
AND c.campaign_start_date <= CURRENT_DATE
AND c.campaign_end_date >= CURRENT_DATE;
```

### Get ads with content ratings
```sql
SELECT a.ad_id, a.ad_name, acr.rating_system, acr.rating_label
FROM ads a
LEFT JOIN ad_content_ratings acr ON a.ad_id = acr.ad_id
WHERE a.campaign_id = 'specific-campaign-id';
```
