-- ============================================================================
-- Impression Tracking Tables
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

-- Create partitions for 2026 (add more as needed)
CREATE TABLE ad_impressions_2026_01 PARTITION OF ad_impressions
    FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');

CREATE TABLE ad_impressions_2026_02 PARTITION OF ad_impressions
    FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');

CREATE TABLE ad_impressions_2026_03 PARTITION OF ad_impressions
    FOR VALUES FROM ('2026-03-01') TO ('2026-04-01');

CREATE TABLE ad_impressions_2026_04 PARTITION OF ad_impressions
    FOR VALUES FROM ('2026-04-01') TO ('2026-05-01');

CREATE TABLE ad_impressions_2026_05 PARTITION OF ad_impressions
    FOR VALUES FROM ('2026-05-01') TO ('2026-06-01');

CREATE TABLE ad_impressions_2026_06 PARTITION OF ad_impressions
    FOR VALUES FROM ('2026-06-01') TO ('2026-07-01');

CREATE TABLE ad_impressions_2026_07 PARTITION OF ad_impressions
    FOR VALUES FROM ('2026-07-01') TO ('2026-08-01');

CREATE TABLE ad_impressions_2026_08 PARTITION OF ad_impressions
    FOR VALUES FROM ('2026-08-01') TO ('2026-09-01');

CREATE TABLE ad_impressions_2026_09 PARTITION OF ad_impressions
    FOR VALUES FROM ('2026-09-01') TO ('2026-10-01');

CREATE TABLE ad_impressions_2026_10 PARTITION OF ad_impressions
    FOR VALUES FROM ('2026-10-01') TO ('2026-11-01');

CREATE TABLE ad_impressions_2026_11 PARTITION OF ad_impressions
    FOR VALUES FROM ('2026-11-01') TO ('2026-12-01');

CREATE TABLE ad_impressions_2026_12 PARTITION OF ad_impressions
    FOR VALUES FROM ('2026-12-01') TO ('2027-01-01');
