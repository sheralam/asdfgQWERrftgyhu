-- ============================================================================
-- Car Infotainment Ad Platform - Database Schema
-- PostgreSQL 14+ with PostGIS Extension
-- ============================================================================

-- Enable PostGIS extension for geographic data types and operations
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- ENUM TYPES
-- ============================================================================

-- Advertiser types
CREATE TYPE advertiser_type_enum AS ENUM (
    'individual',
    'business',
    'enterprise',
    'agency'
);

-- Contact types
CREATE TYPE contact_type_enum AS ENUM (
    'admin',
    'manager',
    'sales',
    'support',
    'marketing',
    'tech',
    'it',
    'hr',
    'finance',
    'operations',
    'technical'
);

-- Device types
CREATE TYPE device_type_enum AS ENUM (
    'shop',
    'car',
    'house'
);

-- Device ratings
CREATE TYPE device_rating_enum AS ENUM (
    'economy',
    'standard',
    'premium',
    'luxury'
);

-- Display sizes
CREATE TYPE display_size_enum AS ENUM (
    's',
    'm',
    'l',
    'xl',
    'xxl'
);

-- Campaign and ad status
CREATE TYPE status_enum AS ENUM (
    'active',
    'inactive',
    'paused',
    'draft',
    'expired'
);

-- Ad positions
CREATE TYPE ad_position_enum AS ENUM (
    'top_bar_ad',
    'bottom_left_ad',
    'bottom_right_ad',
    'bottom_center_ad',
    'center_right_content_ad',
    'center_left_content_ad'
);

-- Ad types
CREATE TYPE ad_type_enum AS ENUM (
    'image_only_ad',
    'multimedia_ad'
);

-- Media types
CREATE TYPE media_type_enum AS ENUM (
    'text',
    'image',
    'gif',
    'video',
    'html',
    'news_rss',
    'events',
    'breaking_news',
    'alerts'
);

-- Time units
CREATE TYPE time_unit_enum AS ENUM (
    'seconds',
    'minutes',
    'hours',
    'days'
);

-- Age groups
CREATE TYPE age_group_enum AS ENUM (
    '0-5',
    '6-12',
    '13-18',
    '19-35',
    '36-55',
    '55+'
);

-- MPAA ratings
CREATE TYPE mpaa_rating_enum AS ENUM (
    'G',
    'PG',
    'PG-13',
    'R',
    'NC-17'
);

-- ESRB ratings
CREATE TYPE esrb_rating_enum AS ENUM (
    'E',
    'E10+',
    'T',
    'M',
    'AO'
);

-- ============================================================================
-- GEOGRAPHIC TABLES
-- ============================================================================

-- Regions table
CREATE TABLE regions (
    region_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    region_name VARCHAR(255) NOT NULL UNIQUE,
    region_code VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

-- Countries table
CREATE TABLE countries (
    country_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    region_id UUID NOT NULL REFERENCES regions(region_id) ON DELETE CASCADE,
    country_name VARCHAR(255) NOT NULL,
    country_code VARCHAR(10) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ,
    UNIQUE(country_code)
);

-- Cities table
CREATE TABLE cities (
    city_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    country_id UUID NOT NULL REFERENCES countries(country_id) ON DELETE CASCADE,
    city_name VARCHAR(255) NOT NULL,
    state_province VARCHAR(255),
    timezone VARCHAR(100),
    location GEOGRAPHY(POINT),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

-- Postcodes table
CREATE TABLE postcodes (
    postcode_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    city_id UUID NOT NULL REFERENCES cities(city_id) ON DELETE CASCADE,
    postcode VARCHAR(20) NOT NULL,
    location GEOGRAPHY(POINT),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ,
    UNIQUE(city_id, postcode)
);

-- ============================================================================
-- ADVERTISER TABLES
-- ============================================================================

-- Advertisers table
CREATE TABLE advertisers (
    advertiser_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    advertiser_name VARCHAR(500) NOT NULL,
    advertiser_type advertiser_type_enum NOT NULL,
    
    -- Address information
    address_line_1 VARCHAR(500) NOT NULL,
    address_line_2 VARCHAR(500),
    city VARCHAR(255) NOT NULL,
    state_province VARCHAR(255) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(255) NOT NULL,
    location GEOGRAPHY(POINT),
    timezone VARCHAR(100) NOT NULL,
    
    -- Audit fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ,
    created_by_id UUID,
    updated_by_id UUID,
    
    -- Soft delete
    deleted_at TIMESTAMPTZ
);

-- Advertiser contacts table (one-to-many)
CREATE TABLE advertiser_contacts (
    contact_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    advertiser_id UUID NOT NULL REFERENCES advertisers(advertiser_id) ON DELETE CASCADE,
    
    contact_name VARCHAR(255) NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(50) NOT NULL,
    contact_address VARCHAR(500),
    contact_city VARCHAR(255),
    contact_state VARCHAR(255),
    contact_postal_code VARCHAR(20),
    contact_country VARCHAR(255),
    contact_type contact_type_enum NOT NULL,
    is_point_of_contact BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ,
    
    CONSTRAINT valid_email CHECK (contact_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Advertiser bank accounts table (one-to-many)
CREATE TABLE advertiser_bank_accounts (
    bank_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    advertiser_id UUID NOT NULL REFERENCES advertisers(advertiser_id) ON DELETE CASCADE,
    
    bank_name VARCHAR(255) NOT NULL,
    bank_account_number TEXT NOT NULL, -- Encrypted
    bank_account_name VARCHAR(255) NOT NULL,
    bank_account_routing_number VARCHAR(100),
    bank_account_swift_code VARCHAR(20),
    bank_account_iban VARCHAR(50),
    bank_account_bic VARCHAR(20),
    bank_account_currency CHAR(3) NOT NULL, -- ISO 4217
    
    is_default BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,
    is_sepa_compliant BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ
);

-- ============================================================================
-- HOST TABLES
-- ============================================================================

-- Hosts table
CREATE TABLE hosts (
    host_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    host_name VARCHAR(500) NOT NULL,
    target_audience_age_group age_group_enum,
    
    -- Address information
    address_line_1 VARCHAR(500) NOT NULL,
    address_line_2 VARCHAR(500),
    city VARCHAR(255) NOT NULL,
    state_province VARCHAR(255) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(255) NOT NULL,
    location GEOGRAPHY(POINT),
    timezone VARCHAR(100) NOT NULL,
    
    -- Audit fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ,
    created_by_id UUID,
    updated_by_id UUID,
    deleted_at TIMESTAMPTZ
);

-- Host contacts table (one-to-many)
CREATE TABLE host_contacts (
    contact_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    host_id UUID NOT NULL REFERENCES hosts(host_id) ON DELETE CASCADE,
    
    contact_name VARCHAR(255) NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(50) NOT NULL,
    contact_address VARCHAR(500),
    contact_city VARCHAR(255),
    contact_state VARCHAR(255),
    contact_postal_code VARCHAR(20),
    contact_country VARCHAR(255),
    contact_type contact_type_enum NOT NULL,
    is_point_of_contact BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ,
    
    CONSTRAINT valid_email CHECK (contact_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Host bank accounts table (one-to-many)
CREATE TABLE host_bank_accounts (
    bank_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    host_id UUID NOT NULL REFERENCES hosts(host_id) ON DELETE CASCADE,
    
    bank_name VARCHAR(255) NOT NULL,
    bank_account_number TEXT NOT NULL, -- Encrypted
    bank_account_name VARCHAR(255) NOT NULL,
    bank_account_routing_number VARCHAR(100),
    bank_account_swift_code VARCHAR(20),
    bank_account_iban VARCHAR(50),
    bank_account_bic VARCHAR(20),
    bank_account_currency CHAR(3) NOT NULL, -- ISO 4217
    
    is_default BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,
    is_sepa_compliant BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ
);

-- ============================================================================
-- DEVICE TABLES
-- ============================================================================

-- Devices table
CREATE TABLE devices (
    device_id VARCHAR(255) PRIMARY KEY,
    host_id UUID NOT NULL REFERENCES hosts(host_id) ON DELETE CASCADE,
    
    device_type device_type_enum NOT NULL,
    device_rating device_rating_enum NOT NULL,
    display_size display_size_enum NOT NULL,
    
    -- Performance metrics
    avg_idle_time INTEGER NOT NULL CHECK (avg_idle_time % 5 = 0), -- Multiple of 5 minutes
    avg_visitors_count INTEGER NOT NULL CHECK (avg_visitors_count >= 0),
    
    -- Location information
    address_line_1 VARCHAR(500) NOT NULL,
    address_line_2 VARCHAR(500),
    city VARCHAR(255) NOT NULL,
    state_province VARCHAR(255) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(255) NOT NULL,
    location GEOGRAPHY(POINT) NOT NULL,
    timezone VARCHAR(100) NOT NULL,
    
    -- Audit fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ
);

-- ============================================================================
-- CAMPAIGN TABLES
-- ============================================================================

-- Campaigns table
CREATE TABLE campaigns (
    campaign_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    advertiser_id UUID NOT NULL REFERENCES advertisers(advertiser_id) ON DELETE CASCADE,
    
    campaign_name VARCHAR(500) NOT NULL,
    campaign_description TEXT,
    
    -- Date range
    campaign_start_date DATE NOT NULL,
    campaign_end_date DATE NOT NULL,
    campaign_expiry_date DATE,
    
    -- Limits
    campaign_max_view_duration JSONB, -- {value: number, unit: string}
    campaign_max_view_count INTEGER,
    
    -- Status
    campaign_status status_enum NOT NULL DEFAULT 'draft',
    
    -- Audit fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ,
    created_by_id UUID NOT NULL,
    created_by_name VARCHAR(255),
    updated_by_id UUID,
    updated_by_name VARCHAR(255),
    deleted_at TIMESTAMPTZ,
    
    CONSTRAINT valid_campaign_dates CHECK (campaign_end_date >= campaign_start_date),
    CONSTRAINT valid_expiry_date CHECK (campaign_expiry_date IS NULL OR campaign_expiry_date >= campaign_end_date)
);

-- Campaign audience targeting (many-to-many with regions)
CREATE TABLE campaign_audience (
    campaign_audience_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID NOT NULL REFERENCES campaigns(campaign_id) ON DELETE CASCADE,
    region_id UUID REFERENCES regions(region_id) ON DELETE CASCADE,
    country_id UUID REFERENCES countries(country_id) ON DELETE CASCADE,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(campaign_id, region_id, country_id)
);

-- Campaign cities (many-to-many)
CREATE TABLE campaign_cities (
    campaign_id UUID NOT NULL REFERENCES campaigns(campaign_id) ON DELETE CASCADE,
    city_id UUID NOT NULL REFERENCES cities(city_id) ON DELETE CASCADE,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    PRIMARY KEY (campaign_id, city_id)
);

-- Campaign postcodes (many-to-many)
CREATE TABLE campaign_postcodes (
    campaign_id UUID NOT NULL REFERENCES campaigns(campaign_id) ON DELETE CASCADE,
    postcode_id UUID NOT NULL REFERENCES postcodes(postcode_id) ON DELETE CASCADE,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    PRIMARY KEY (campaign_id, postcode_id)
);

-- See schema_ads.sql for ad-related tables
