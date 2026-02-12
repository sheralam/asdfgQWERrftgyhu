-- ============================================================================
-- Campaign Tables
-- ============================================================================

CREATE TABLE campaigns (
    campaign_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    advertiser_id UUID NOT NULL REFERENCES advertisers(advertiser_id) ON DELETE CASCADE,
    campaign_name VARCHAR(500) NOT NULL,
    campaign_description TEXT,
    campaign_start_date DATE NOT NULL,
    campaign_end_date DATE NOT NULL,
    campaign_expiry_date DATE,
    campaign_max_view_duration JSONB,
    campaign_max_view_count INTEGER,
    campaign_status status_enum NOT NULL DEFAULT 'draft',
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

CREATE TABLE campaign_audience (
    campaign_audience_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID NOT NULL REFERENCES campaigns(campaign_id) ON DELETE CASCADE,
    region_id UUID REFERENCES regions(region_id) ON DELETE CASCADE,
    country_id UUID REFERENCES countries(country_id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(campaign_id, region_id, country_id)
);

CREATE TABLE campaign_cities (
    campaign_id UUID NOT NULL REFERENCES campaigns(campaign_id) ON DELETE CASCADE,
    city_id UUID NOT NULL REFERENCES cities(city_id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (campaign_id, city_id)
);

CREATE TABLE campaign_postcodes (
    campaign_id UUID NOT NULL REFERENCES campaigns(campaign_id) ON DELETE CASCADE,
    postcode_id UUID NOT NULL REFERENCES postcodes(postcode_id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (campaign_id, postcode_id)
);
