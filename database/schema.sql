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

-- User roles: admin creates advertisers and hosts; campaign_manager creates campaigns and ads
CREATE TYPE user_role_enum AS ENUM ('admin', 'campaign_manager');

-- Device group status
CREATE TYPE device_group_status_enum AS ENUM ('active', 'deleted', 'paused');

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

-- Advertisers table (unique across platform: advertiser_id PK, advertiser_code UK)
CREATE TABLE advertisers (
    advertiser_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    advertiser_code VARCHAR(255) NOT NULL UNIQUE,
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

-- Device groups table (host has 0 or many; each device assigned to max 1)
CREATE TABLE device_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    host_id UUID NOT NULL REFERENCES hosts(host_id) ON DELETE CASCADE,
    group_name VARCHAR(255) NOT NULL,
    status device_group_status_enum NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ,
    created_by_id UUID,
    updated_by_id UUID,
    UNIQUE(host_id, group_name)
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

-- Ad display device table (device_group_id: optional FK to device_groups, max 1 per device)
CREATE TABLE ad_display_device (
    device_id VARCHAR(255) PRIMARY KEY,
    host_id UUID NOT NULL REFERENCES hosts(host_id) ON DELETE CASCADE,
    device_group_id UUID REFERENCES device_groups(id) ON DELETE SET NULL,
    
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

-- Device details (1-1 with ad_display_device): hardware, vendor, purchasing, prices, notes
CREATE TABLE device_details (
    device_id VARCHAR(255) PRIMARY KEY REFERENCES ad_display_device(device_id) ON DELETE CASCADE,
    hardware_specifications TEXT,
    vendor_specification TEXT,
    vendor_name VARCHAR(255),
    vendor_part_number VARCHAR(255),
    vendor_serial_number VARCHAR(255),
    purchasing_details TEXT,
    purchase_date DATE,
    purchase_order_number VARCHAR(100),
    warranty_expiry_date DATE,
    purchase_price NUMERIC(12, 2),
    currency CHAR(3),
    price_notes TEXT,
    notes TEXT,
    serial_number VARCHAR(255),
    model_number VARCHAR(255),
    firmware_version VARCHAR(100),
    installed_date DATE,
    last_maintenance_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

-- ============================================================================
-- CAMPAIGN TABLES
-- ============================================================================

-- Campaigns table (unique across platform: campaign_id PK, campaign_code UK)
CREATE TABLE campaigns (
    campaign_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_code VARCHAR(255) NOT NULL UNIQUE,
    advertiser_id UUID NOT NULL REFERENCES advertisers(advertiser_id) ON DELETE CASCADE,
    
    campaign_name VARCHAR(500) NOT NULL,
    campaign_description TEXT,
    country VARCHAR(255) NOT NULL,
    city VARCHAR(255) NOT NULL,
    postcode VARCHAR(20) NOT NULL,
    
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

-- ============================================================================
-- AD TABLES
-- ============================================================================

-- Ads table (unique across platform: ad_id PK, ad_code UK)
CREATE TABLE ads (
    ad_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ad_code VARCHAR(255) NOT NULL UNIQUE,
    campaign_id UUID NOT NULL REFERENCES campaigns(campaign_id) ON DELETE CASCADE,
    ad_name VARCHAR(500) NOT NULL,
    ad_description TEXT,
    country VARCHAR(255),
    city VARCHAR(255),
    postcode VARCHAR(20),
    ad_position ad_position_enum NOT NULL,
    ad_type ad_type_enum NOT NULL,
    ad_start_date DATE NOT NULL,
    ad_end_date DATE NOT NULL,
    ad_expiry_date DATE,
    ad_in_view_duration JSONB,
    ad_view_count INTEGER DEFAULT 0,
    ad_status status_enum NOT NULL DEFAULT 'draft',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ,
    created_by_id UUID,
    created_by_name VARCHAR(255),
    updated_by_id UUID,
    updated_by_name VARCHAR(255),
    deleted_at TIMESTAMPTZ,
    CONSTRAINT valid_ad_dates CHECK (ad_end_date >= ad_start_date),
    CONSTRAINT valid_ad_expiry CHECK (ad_expiry_date IS NULL OR ad_expiry_date >= ad_end_date)
);

CREATE TABLE ad_content (
    content_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ad_id UUID NOT NULL REFERENCES ads(ad_id) ON DELETE CASCADE,
    media_type media_type_enum NOT NULL,
    media_content TEXT NOT NULL,
    ad_impression_duration JSONB NOT NULL,
    alloted_max_impression_count INTEGER,
    ad_advertiser_forwarding_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ,
    CONSTRAINT valid_url CHECK (ad_advertiser_forwarding_url IS NULL OR ad_advertiser_forwarding_url ~* '^https?://')
);

CREATE TABLE ad_time_slots (
    time_slot_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ad_id UUID NOT NULL REFERENCES ads(ad_id) ON DELETE CASCADE,
    time_slot_start TIME NOT NULL,
    time_slot_end TIME NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT valid_time_range CHECK (time_slot_end > time_slot_start)
);

CREATE TABLE ad_content_ratings (
    rating_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ad_id UUID NOT NULL REFERENCES ads(ad_id) ON DELETE CASCADE,
    mpaa_rating mpaa_rating_enum,
    esrb_rating esrb_rating_enum,
    warning_required BOOLEAN DEFAULT TRUE,
    content_warnings JSONB DEFAULT '[]'::jsonb,
    no_prohibited_content BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ,
    UNIQUE(ad_id)
);

-- ============================================================================
-- IMPRESSION TRACKING TABLES
-- ============================================================================

CREATE TABLE ad_impressions (
    impression_id UUID DEFAULT uuid_generate_v4(),
    ad_id UUID NOT NULL REFERENCES ads(ad_id) ON DELETE CASCADE,
    impression_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    session_duration_seconds INTEGER,
    completed BOOLEAN DEFAULT FALSE,
    user_agent TEXT,
    ip_address INET,
    PRIMARY KEY (impression_id, impression_timestamp)
) PARTITION BY RANGE (impression_timestamp);

CREATE TABLE ad_impressions_2026_01 PARTITION OF ad_impressions FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');
CREATE TABLE ad_impressions_2026_02 PARTITION OF ad_impressions FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');
CREATE TABLE ad_impressions_2026_03 PARTITION OF ad_impressions FOR VALUES FROM ('2026-03-01') TO ('2026-04-01');
CREATE TABLE ad_impressions_2026_04 PARTITION OF ad_impressions FOR VALUES FROM ('2026-04-01') TO ('2026-05-01');
CREATE TABLE ad_impressions_2026_05 PARTITION OF ad_impressions FOR VALUES FROM ('2026-05-01') TO ('2026-06-01');
CREATE TABLE ad_impressions_2026_06 PARTITION OF ad_impressions FOR VALUES FROM ('2026-06-01') TO ('2026-07-01');
CREATE TABLE ad_impressions_2026_07 PARTITION OF ad_impressions FOR VALUES FROM ('2026-07-01') TO ('2026-08-01');
CREATE TABLE ad_impressions_2026_08 PARTITION OF ad_impressions FOR VALUES FROM ('2026-08-01') TO ('2026-09-01');
CREATE TABLE ad_impressions_2026_09 PARTITION OF ad_impressions FOR VALUES FROM ('2026-09-01') TO ('2026-10-01');
CREATE TABLE ad_impressions_2026_10 PARTITION OF ad_impressions FOR VALUES FROM ('2026-10-01') TO ('2026-11-01');
CREATE TABLE ad_impressions_2026_11 PARTITION OF ad_impressions FOR VALUES FROM ('2026-11-01') TO ('2026-12-01');
CREATE TABLE ad_impressions_2026_12 PARTITION OF ad_impressions FOR VALUES FROM ('2026-12-01') TO ('2027-01-01');

-- ============================================================================
-- AD IMPRESSION ANALYTICS DATASTORE
-- ============================================================================
-- One row per impression from display_device; denormalized for scalable
-- insights from device-level to advertiser-level and system-wide reporting.

CREATE TABLE ad_impression_events (
    impression_id UUID NOT NULL DEFAULT uuid_generate_v4(),
    impression_timestamp TIMESTAMPTZ NOT NULL,
    impression_date DATE NOT NULL,
    impression_hour SMALLINT NOT NULL CHECK (impression_hour >= 0 AND impression_hour <= 23),
    duration_seconds INTEGER,
    completed BOOLEAN DEFAULT FALSE,
    source VARCHAR(50) NOT NULL DEFAULT 'display_device',
    ad_id UUID NOT NULL,
    ad_code VARCHAR(255) NOT NULL,
    ad_type ad_type_enum NOT NULL,
    ad_position ad_position_enum NOT NULL,
    ad_name VARCHAR(500),
    campaign_id UUID NOT NULL,
    campaign_code VARCHAR(255) NOT NULL,
    campaign_name VARCHAR(500),
    advertiser_id UUID NOT NULL,
    advertiser_code VARCHAR(255) NOT NULL,
    advertiser_name VARCHAR(500),
    device_id VARCHAR(255) NOT NULL,
    host_id UUID NOT NULL,
    device_group_id UUID,
    device_group_name VARCHAR(255),
    device_type device_type_enum NOT NULL,
    device_rating device_rating_enum NOT NULL,
    display_size display_size_enum NOT NULL,
    device_city VARCHAR(255) NOT NULL,
    device_state_province VARCHAR(255),
    device_postcode VARCHAR(20) NOT NULL,
    device_country VARCHAR(255) NOT NULL,
    campaign_country VARCHAR(255),
    campaign_city VARCHAR(255),
    campaign_postcode VARCHAR(20),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (impression_id, impression_date)
) PARTITION BY RANGE (impression_date);

CREATE TABLE ad_impression_events_2026_01 PARTITION OF ad_impression_events FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');
CREATE TABLE ad_impression_events_2026_02 PARTITION OF ad_impression_events FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');
CREATE TABLE ad_impression_events_2026_03 PARTITION OF ad_impression_events FOR VALUES FROM ('2026-03-01') TO ('2026-04-01');
CREATE TABLE ad_impression_events_2026_04 PARTITION OF ad_impression_events FOR VALUES FROM ('2026-04-01') TO ('2026-05-01');
CREATE TABLE ad_impression_events_2026_05 PARTITION OF ad_impression_events FOR VALUES FROM ('2026-05-01') TO ('2026-06-01');
CREATE TABLE ad_impression_events_2026_06 PARTITION OF ad_impression_events FOR VALUES FROM ('2026-06-01') TO ('2026-07-01');
CREATE TABLE ad_impression_events_2026_07 PARTITION OF ad_impression_events FOR VALUES FROM ('2026-07-01') TO ('2026-08-01');
CREATE TABLE ad_impression_events_2026_08 PARTITION OF ad_impression_events FOR VALUES FROM ('2026-08-01') TO ('2026-09-01');
CREATE TABLE ad_impression_events_2026_09 PARTITION OF ad_impression_events FOR VALUES FROM ('2026-09-01') TO ('2026-10-01');
CREATE TABLE ad_impression_events_2026_10 PARTITION OF ad_impression_events FOR VALUES FROM ('2026-10-01') TO ('2026-11-01');
CREATE TABLE ad_impression_events_2026_11 PARTITION OF ad_impression_events FOR VALUES FROM ('2026-11-01') TO ('2026-12-01');
CREATE TABLE ad_impression_events_2026_12 PARTITION OF ad_impression_events FOR VALUES FROM ('2026-12-01') TO ('2027-01-01');

CREATE TABLE impression_daily_rollups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rollup_type VARCHAR(50) NOT NULL,
    dimension_id VARCHAR(255) NOT NULL,
    dimension_label VARCHAR(500),
    impression_date DATE NOT NULL,
    impression_count BIGINT NOT NULL DEFAULT 0,
    completed_count BIGINT NOT NULL DEFAULT 0,
    total_duration_seconds BIGINT NOT NULL DEFAULT 0,
    unique_devices_count INTEGER NOT NULL DEFAULT 0,
    unique_ads_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(rollup_type, dimension_id, impression_date)
);

-- ============================================================================
-- USERS TABLE
-- ============================================================================

CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255),
    role user_role_enum NOT NULL DEFAULT 'campaign_manager',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT valid_user_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

ALTER TABLE advertisers ADD CONSTRAINT fk_advertisers_created_by FOREIGN KEY (created_by_id) REFERENCES users(user_id);
ALTER TABLE hosts ADD CONSTRAINT fk_hosts_created_by FOREIGN KEY (created_by_id) REFERENCES users(user_id);
ALTER TABLE device_groups ADD CONSTRAINT fk_device_groups_created_by FOREIGN KEY (created_by_id) REFERENCES users(user_id);
ALTER TABLE device_groups ADD CONSTRAINT fk_device_groups_updated_by FOREIGN KEY (updated_by_id) REFERENCES users(user_id);
ALTER TABLE campaigns ADD CONSTRAINT fk_campaigns_created_by FOREIGN KEY (created_by_id) REFERENCES users(user_id);
ALTER TABLE ads ADD CONSTRAINT fk_ads_created_by FOREIGN KEY (created_by_id) REFERENCES users(user_id);

-- ============================================================================
-- VIEWS
-- ============================================================================

CREATE VIEW active_campaigns AS
SELECT c.*, a.advertiser_name, a.advertiser_type
FROM campaigns c
JOIN advertisers a ON c.advertiser_id = a.advertiser_id
WHERE c.campaign_status = 'active' AND c.deleted_at IS NULL AND a.deleted_at IS NULL
  AND CURRENT_DATE BETWEEN c.campaign_start_date AND c.campaign_end_date;

CREATE VIEW active_ads AS
SELECT ad.*, ac.media_type, ac.media_content, ac.ad_impression_duration, ac.alloted_max_impression_count, ac.ad_advertiser_forwarding_url,
       c.campaign_name, c.campaign_description, c.campaign_status, c.campaign_start_date, c.campaign_end_date, adv.advertiser_id, adv.advertiser_name
FROM ads ad
JOIN ad_content ac ON ad.ad_id = ac.ad_id
JOIN campaigns c ON ad.campaign_id = c.campaign_id
JOIN advertisers adv ON c.advertiser_id = adv.advertiser_id
WHERE ad.ad_status = 'active' AND ad.deleted_at IS NULL AND c.campaign_status = 'active' AND c.deleted_at IS NULL
  AND CURRENT_DATE BETWEEN ad.ad_start_date AND ad.ad_end_date AND CURRENT_DATE BETWEEN c.campaign_start_date AND c.campaign_end_date;

-- ============================================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION check_impression_limit(p_ad_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_max_count INTEGER;
    v_current_count BIGINT;
BEGIN
    SELECT alloted_max_impression_count INTO v_max_count FROM ad_content WHERE ad_id = p_ad_id;
    IF v_max_count IS NULL THEN RETURN TRUE; END IF;
    SELECT COUNT(*) INTO v_current_count FROM ad_impressions WHERE ad_id = p_ad_id;
    RETURN v_current_count < v_max_count;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_advertisers_updated_at BEFORE UPDATE ON advertisers FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_hosts_updated_at BEFORE UPDATE ON hosts FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_device_groups_updated_at BEFORE UPDATE ON device_groups FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_device_details_updated_at BEFORE UPDATE ON device_details FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_ads_updated_at BEFORE UPDATE ON ads FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_impression_daily_rollups_updated_at BEFORE UPDATE ON impression_daily_rollups FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE advertisers IS 'Stores advertiser/client information who purchase ad campaigns';
COMMENT ON TABLE hosts IS 'Stores information about device owners/operators';
COMMENT ON TABLE device_groups IS 'Groups under a host; devices can be assigned to at most one group';
COMMENT ON TABLE ad_display_device IS 'Physical devices (cars, shops, houses) that display ads';
COMMENT ON TABLE device_details IS '1-1: hardware specs, vendor, purchasing, prices, notes per device';
COMMENT ON TABLE campaigns IS 'Marketing campaigns created by advertisers';
COMMENT ON TABLE ads IS 'Individual advertisements within campaigns';
COMMENT ON TABLE ad_content IS 'Media content and settings for each ad';
COMMENT ON TABLE ad_impressions IS 'Tracks each time an ad is displayed (partitioned by date)';
COMMENT ON TABLE ad_impression_events IS 'Fact table: one row per ad impression from display_device; denormalized for scalable insights from device to advertiser level';
COMMENT ON TABLE impression_daily_rollups IS 'Daily pre-aggregates by rollup_type (advertiser, campaign, device_group, city, postcode, system); for fast business reporting';
COMMENT ON COLUMN ad_display_device.avg_idle_time IS 'Average idle time in minutes (must be multiple of 5)';
COMMENT ON COLUMN ad_content.alloted_max_impression_count IS 'Maximum number of times this ad can be shown';
COMMENT ON COLUMN ad_time_slots.time_slot_start IS 'Start time in 15-minute intervals (HH:MM format)';
