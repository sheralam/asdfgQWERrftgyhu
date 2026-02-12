-- ============================================================================
-- Ad Impression Analytics Datastore
-- ============================================================================
-- Scalable fact store for impressions sent by display_device (one row per
-- ad_type impression). All dimensions denormalized for fast aggregation from
-- device-level up to advertiser-level and for system-wide business reporting.
--
-- Use cases:
-- - Advertiser/campaign performance: by advertiser, date, campaign, device
--   group, postcode, city. Granular to device, roll up to advertiser.
-- - System-wide insights: by time, location, cities for campaign managers
--   and product owners (high-level business reporting).
-- ============================================================================

-- ============================================================================
-- ad_impression_events: one row per impression (denormalized fact table)
-- ============================================================================
-- Display device sends each ad impression separately. Store full context at
-- impression time so insights remain correct even if ads/campaigns/devices
-- change later. Partition by impression_date for scale and retention.

CREATE TABLE ad_impression_events (
    impression_id UUID NOT NULL DEFAULT uuid_generate_v4(),
    impression_timestamp TIMESTAMPTZ NOT NULL,
    impression_date DATE NOT NULL,
    impression_hour SMALLINT NOT NULL CHECK (impression_hour >= 0 AND impression_hour <= 23),
    duration_seconds INTEGER,
    completed BOOLEAN DEFAULT FALSE,
    source VARCHAR(50) NOT NULL DEFAULT 'display_device',

    -- Ad dimension (denormalized at impression time)
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

    -- Device dimension (denormalized at impression time)
    device_id VARCHAR(255) NOT NULL,
    host_id UUID NOT NULL,
    device_group_id UUID,
    device_group_name VARCHAR(255),
    device_type device_type_enum NOT NULL,
    device_rating device_rating_enum NOT NULL,
    display_size display_size_enum NOT NULL,

    -- Location dimension (device location at impression time)
    device_city VARCHAR(255) NOT NULL,
    device_state_province VARCHAR(255),
    device_postcode VARCHAR(20) NOT NULL,
    device_country VARCHAR(255) NOT NULL,

    -- Campaign targeting (optional; for “targeted vs shown” analysis)
    campaign_country VARCHAR(255),
    campaign_city VARCHAR(255),
    campaign_postcode VARCHAR(20),

    -- Audit
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    PRIMARY KEY (impression_id, impression_date)
) PARTITION BY RANGE (impression_date);

-- Monthly partitions (extend as needed)
CREATE TABLE ad_impression_events_2026_01 PARTITION OF ad_impression_events
    FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');
CREATE TABLE ad_impression_events_2026_02 PARTITION OF ad_impression_events
    FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');
CREATE TABLE ad_impression_events_2026_03 PARTITION OF ad_impression_events
    FOR VALUES FROM ('2026-03-01') TO ('2026-04-01');
CREATE TABLE ad_impression_events_2026_04 PARTITION OF ad_impression_events
    FOR VALUES FROM ('2026-04-01') TO ('2026-05-01');
CREATE TABLE ad_impression_events_2026_05 PARTITION OF ad_impression_events
    FOR VALUES FROM ('2026-05-01') TO ('2026-06-01');
CREATE TABLE ad_impression_events_2026_06 PARTITION OF ad_impression_events
    FOR VALUES FROM ('2026-06-01') TO ('2026-07-01');
CREATE TABLE ad_impression_events_2026_07 PARTITION OF ad_impression_events
    FOR VALUES FROM ('2026-07-01') TO ('2026-08-01');
CREATE TABLE ad_impression_events_2026_08 PARTITION OF ad_impression_events
    FOR VALUES FROM ('2026-08-01') TO ('2026-09-01');
CREATE TABLE ad_impression_events_2026_09 PARTITION OF ad_impression_events
    FOR VALUES FROM ('2026-09-01') TO ('2026-10-01');
CREATE TABLE ad_impression_events_2026_10 PARTITION OF ad_impression_events
    FOR VALUES FROM ('2026-10-01') TO ('2026-11-01');
CREATE TABLE ad_impression_events_2026_11 PARTITION OF ad_impression_events
    FOR VALUES FROM ('2026-11-01') TO ('2026-12-01');
CREATE TABLE ad_impression_events_2026_12 PARTITION OF ad_impression_events
    FOR VALUES FROM ('2026-12-01') TO ('2027-01-01');

-- ============================================================================
-- impression_daily_rollups: pre-aggregated counts for fast reporting
-- ============================================================================
-- Populate via batch job from ad_impression_events. Enables dashboards without
-- scanning the fact table. rollup_type defines the grain.

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

COMMENT ON TABLE ad_impression_events IS 'Fact table: one row per ad impression from display_device; denormalized for scalable insights from device to advertiser level';
COMMENT ON TABLE impression_daily_rollups IS 'Daily pre-aggregates by rollup_type (e.g. advertiser, campaign, device_group, city, postcode, system); for fast business reporting';
COMMENT ON COLUMN impression_daily_rollups.rollup_type IS 'E.g. advertiser, campaign, ad, device_group, city, postcode, country, system';
COMMENT ON COLUMN impression_daily_rollups.dimension_id IS 'UUID or key: advertiser_id, campaign_id, device_group_id, city|country, postcode|city|country, or ''all'' for system';
