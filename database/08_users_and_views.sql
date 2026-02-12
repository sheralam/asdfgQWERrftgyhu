-- ============================================================================
-- Users Table and Views
-- ============================================================================

CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT valid_user_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- ============================================================================
-- Useful Views
-- ============================================================================

CREATE VIEW active_campaigns AS
SELECT 
    c.*,
    a.advertiser_name,
    a.advertiser_type
FROM campaigns c
JOIN advertisers a ON c.advertiser_id = a.advertiser_id
WHERE c.campaign_status = 'active'
    AND c.deleted_at IS NULL
    AND a.deleted_at IS NULL
    AND CURRENT_DATE BETWEEN c.campaign_start_date AND c.campaign_end_date;

CREATE VIEW active_ads AS
SELECT 
    ad.*,
    ac.media_type,
    ac.media_content,
    ac.ad_impression_duration,
    ac.alloted_max_impression_count,
    ac.ad_advertiser_forwarding_url,
    c.campaign_name,
    c.campaign_description,
    c.campaign_status,
    c.campaign_start_date,
    c.campaign_end_date,
    adv.advertiser_id,
    adv.advertiser_name
FROM ads ad
JOIN ad_content ac ON ad.ad_id = ac.ad_id
JOIN campaigns c ON ad.campaign_id = c.campaign_id
JOIN advertisers adv ON c.advertiser_id = adv.advertiser_id
WHERE ad.ad_status = 'active'
    AND ad.deleted_at IS NULL
    AND c.campaign_status = 'active'
    AND c.deleted_at IS NULL
    AND CURRENT_DATE BETWEEN ad.ad_start_date AND ad.ad_end_date
    AND CURRENT_DATE BETWEEN c.campaign_start_date AND c.campaign_end_date;
