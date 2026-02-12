-- ============================================================================
-- Ad Tables
-- ============================================================================
-- Campaigns can have multiple ads. Ads are unique across the platform (ad_id PK, ad_code UK).
-- Created by campaign_manager (created_by_id).

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
