-- Create schema for car infotainment system
-- Migration: 001_init_schema.sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create advertisers table
CREATE TABLE IF NOT EXISTS advertisers (
    advertiser_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    advertiser_code VARCHAR(255) UNIQUE NOT NULL,
    advertiser_name VARCHAR(500) NOT NULL,
    advertiser_type VARCHAR(50) NOT NULL CHECK (advertiser_type IN ('individual', 'business', 'enterprise', 'agency')),
    address_line_1 VARCHAR(500) NOT NULL,
    address_line_2 VARCHAR(500),
    city VARCHAR(255) NOT NULL,
    state_province VARCHAR(255) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(255) NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    timezone VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE,
    created_by_id UUID,
    updated_by_id UUID,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Create advertiser contacts table
CREATE TABLE IF NOT EXISTS advertiser_contacts (
    contact_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    advertiser_id UUID NOT NULL REFERENCES advertisers(advertiser_id) ON DELETE CASCADE,
    contact_name VARCHAR(500) NOT NULL,
    contact_email VARCHAR(320) NOT NULL,
    contact_phone VARCHAR(50) NOT NULL,
    contact_address VARCHAR(500),
    contact_city VARCHAR(255),
    contact_state VARCHAR(255),
    contact_postal_code VARCHAR(20),
    contact_country VARCHAR(255),
    contact_type VARCHAR(50) NOT NULL,
    is_point_of_contact BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Create advertiser bank accounts table
CREATE TABLE IF NOT EXISTS advertiser_bank_accounts (
    bank_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    advertiser_id UUID NOT NULL REFERENCES advertisers(advertiser_id) ON DELETE CASCADE,
    bank_name VARCHAR(500) NOT NULL,
    bank_account_number VARCHAR(100) NOT NULL,
    bank_account_name VARCHAR(500) NOT NULL,
    bank_account_currency VARCHAR(10) NOT NULL,
    is_default BOOLEAN DEFAULT false,
    is_verified BOOLEAN DEFAULT false,
    is_sepa_compliant BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Create hosts table
CREATE TABLE IF NOT EXISTS hosts (
    host_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    host_code VARCHAR(255) UNIQUE NOT NULL,
    host_name VARCHAR(500) NOT NULL,
    host_type VARCHAR(50) NOT NULL,
    address_line_1 VARCHAR(500) NOT NULL,
    address_line_2 VARCHAR(500),
    city VARCHAR(255) NOT NULL,
    state_province VARCHAR(255) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(255) NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    timezone VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE,
    created_by_id UUID,
    updated_by_id UUID,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Create host contacts table
CREATE TABLE IF NOT EXISTS host_contacts (
    contact_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    host_id UUID NOT NULL REFERENCES hosts(host_id) ON DELETE CASCADE,
    contact_name VARCHAR(500) NOT NULL,
    contact_email VARCHAR(320) NOT NULL,
    contact_phone VARCHAR(50) NOT NULL,
    contact_address VARCHAR(500),
    contact_city VARCHAR(255),
    contact_state VARCHAR(255),
    contact_postal_code VARCHAR(20),
    contact_country VARCHAR(255),
    contact_type VARCHAR(50) NOT NULL,
    is_point_of_contact BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Create host bank accounts table
CREATE TABLE IF NOT EXISTS host_bank_accounts (
    bank_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    host_id UUID NOT NULL REFERENCES hosts(host_id) ON DELETE CASCADE,
    bank_name VARCHAR(500) NOT NULL,
    bank_account_number VARCHAR(100) NOT NULL,
    bank_account_name VARCHAR(500) NOT NULL,
    bank_account_currency VARCHAR(10) NOT NULL,
    is_default BOOLEAN DEFAULT false,
    is_verified BOOLEAN DEFAULT false,
    is_sepa_compliant BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Create device groups table
CREATE TABLE IF NOT EXISTS device_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    host_id UUID NOT NULL REFERENCES hosts(host_id) ON DELETE CASCADE,
    group_name VARCHAR(500) NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('active', 'deleted', 'paused')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE,
    created_by_id UUID,
    updated_by_id UUID
);

-- Create devices table
CREATE TABLE IF NOT EXISTS devices (
    device_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    host_id UUID NOT NULL REFERENCES hosts(host_id) ON DELETE CASCADE,
    device_group_id UUID REFERENCES device_groups(id) ON DELETE SET NULL,
    device_type VARCHAR(50) NOT NULL CHECK (device_type IN ('shop', 'car', 'house')),
    device_rating VARCHAR(50) NOT NULL CHECK (device_rating IN ('economy', 'standard', 'premium', 'luxury')),
    display_size VARCHAR(10) NOT NULL CHECK (display_size IN ('s', 'm', 'l', 'xl', 'xxl')),
    avg_idle_time INTEGER NOT NULL,
    avg_visitors_count INTEGER NOT NULL,
    address_line_1 VARCHAR(500) NOT NULL,
    address_line_2 VARCHAR(500),
    city VARCHAR(255) NOT NULL,
    state_province VARCHAR(255) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(255) NOT NULL,
    timezone VARCHAR(100) NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Create device details table
CREATE TABLE IF NOT EXISTS device_details (
    device_id UUID PRIMARY KEY REFERENCES devices(device_id) ON DELETE CASCADE,
    hardware_specifications TEXT,
    vendor_specification TEXT,
    vendor_name VARCHAR(500),
    vendor_part_number VARCHAR(255),
    vendor_serial_number VARCHAR(255),
    purchasing_details TEXT,
    purchase_date DATE,
    purchase_order_number VARCHAR(255),
    warranty_expiry_date DATE,
    purchase_price DECIMAL(15, 2),
    currency VARCHAR(10),
    price_notes TEXT,
    notes TEXT,
    serial_number VARCHAR(255),
    model_number VARCHAR(255),
    firmware_version VARCHAR(100),
    installed_date DATE,
    last_maintenance_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE
);

-- Create campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
    campaign_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_code VARCHAR(255) UNIQUE NOT NULL,
    advertiser_id UUID NOT NULL REFERENCES advertisers(advertiser_id) ON DELETE CASCADE,
    campaign_name VARCHAR(500) NOT NULL,
    campaign_description TEXT,
    country VARCHAR(255) NOT NULL,
    city VARCHAR(255) NOT NULL,
    postcode VARCHAR(20) NOT NULL,
    campaign_start_date DATE NOT NULL,
    campaign_end_date DATE NOT NULL,
    campaign_expiry_date DATE,
    campaign_max_view_duration JSONB,
    campaign_max_view_count INTEGER,
    campaign_status VARCHAR(50) NOT NULL CHECK (campaign_status IN ('draft', 'active', 'paused', 'inactive', 'expired')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE,
    created_by_id UUID,
    created_by_name VARCHAR(500),
    updated_by_id UUID,
    updated_by_name VARCHAR(500),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Create ads table
CREATE TABLE IF NOT EXISTS ads (
    ad_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ad_code VARCHAR(255) UNIQUE NOT NULL,
    campaign_id UUID NOT NULL REFERENCES campaigns(campaign_id) ON DELETE CASCADE,
    ad_name VARCHAR(500) NOT NULL,
    ad_description TEXT,
    country VARCHAR(255),
    city VARCHAR(255),
    postcode VARCHAR(20),
    ad_position VARCHAR(100) NOT NULL,
    ad_type VARCHAR(50) NOT NULL,
    ad_start_date DATE NOT NULL,
    ad_end_date DATE NOT NULL,
    ad_expiry_date DATE,
    ad_in_view_duration JSONB,
    ad_view_count INTEGER DEFAULT 0,
    ad_status VARCHAR(50) NOT NULL CHECK (ad_status IN ('draft', 'active', 'paused', 'inactive', 'expired')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE,
    created_by_id UUID,
    created_by_name VARCHAR(500),
    updated_by_id UUID,
    updated_by_name VARCHAR(500),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Create ad content table
CREATE TABLE IF NOT EXISTS ad_content (
    content_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ad_id UUID NOT NULL REFERENCES ads(ad_id) ON DELETE CASCADE,
    media_type VARCHAR(50) NOT NULL,
    media_content TEXT NOT NULL,
    ad_impression_duration JSONB NOT NULL,
    alloted_max_impression_count INTEGER,
    ad_advertiser_forwarding_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE
);

-- Create ad time slots table
CREATE TABLE IF NOT EXISTS ad_time_slots (
    time_slot_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ad_id UUID NOT NULL REFERENCES ads(ad_id) ON DELETE CASCADE,
    time_slot_start TIME NOT NULL,
    time_slot_end TIME NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create ad content ratings table
CREATE TABLE IF NOT EXISTS ad_content_ratings (
    rating_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ad_id UUID NOT NULL REFERENCES ads(ad_id) ON DELETE CASCADE,
    mpaa_rating VARCHAR(10),
    esrb_rating VARCHAR(10),
    warning_required BOOLEAN DEFAULT true,
    content_warnings JSONB DEFAULT '[]',
    no_prohibited_content BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better query performance
CREATE INDEX idx_advertisers_code ON advertisers(advertiser_code);
CREATE INDEX idx_advertisers_deleted ON advertisers(deleted_at);
CREATE INDEX idx_advertiser_contacts_advertiser ON advertiser_contacts(advertiser_id);
CREATE INDEX idx_hosts_code ON hosts(host_code);
CREATE INDEX idx_hosts_deleted ON hosts(deleted_at);
CREATE INDEX idx_devices_host ON devices(host_id);
CREATE INDEX idx_devices_group ON devices(device_group_id);
CREATE INDEX idx_campaigns_advertiser ON campaigns(advertiser_id);
CREATE INDEX idx_campaigns_code ON campaigns(campaign_code);
CREATE INDEX idx_ads_campaign ON ads(campaign_id);
CREATE INDEX idx_ads_code ON ads(ad_code);

-- Add comments for documentation
COMMENT ON TABLE advertisers IS 'Stores advertiser information';
COMMENT ON TABLE hosts IS 'Stores host (venue) information';
COMMENT ON TABLE devices IS 'Stores device information for displaying ads';
COMMENT ON TABLE campaigns IS 'Stores advertising campaign information';
COMMENT ON TABLE ads IS 'Stores individual advertisement information';

COMMENT ON COLUMN devices.device_type IS 'Type of device: shop, car, or house';
COMMENT ON COLUMN devices.device_rating IS 'Rating category: economy, standard, premium, or luxury';
COMMENT ON COLUMN campaigns.campaign_status IS 'Status: draft, active, paused, inactive, or expired';
