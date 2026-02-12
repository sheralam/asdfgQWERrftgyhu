-- ============================================================================
-- Car Infotainment Ad Platform - Sample Queries
-- ============================================================================
-- Main API query: see 11_api_query.sql for the full GET /api/v1/ads response query.
-- Use parameters: :device_id (required), :latitude, :longitude (optional).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Sample 1: List all active campaigns with advertiser name
-- ----------------------------------------------------------------------------
SELECT * FROM active_campaigns;

-- Or with explicit columns:
SELECT
    c.campaign_id,
    c.campaign_code,
    c.campaign_name,
    c.campaign_status,
    c.campaign_start_date,
    c.campaign_end_date,
    a.advertiser_id,
    a.advertiser_name,
    a.advertiser_type
FROM campaigns c
JOIN advertisers a ON c.advertiser_id = a.advertiser_id
WHERE c.campaign_status = 'active'
  AND c.deleted_at IS NULL
  AND a.deleted_at IS NULL
  AND CURRENT_DATE BETWEEN c.campaign_start_date AND c.campaign_end_date;

-- ----------------------------------------------------------------------------
-- Sample 2: List ads for a given campaign (by campaign_code or campaign_id)
-- ----------------------------------------------------------------------------
SELECT
    ad.ad_id,
    ad.ad_code,
    ad.ad_name,
    ad.ad_position,
    ad.ad_type,
    ad.ad_status,
    ad.ad_start_date,
    ad.ad_end_date,
    ac.media_type,
    ac.alloted_max_impression_count
FROM ads ad
JOIN ad_content ac ON ad.ad_id = ac.ad_id
JOIN campaigns c ON ad.campaign_id = c.campaign_id
WHERE c.campaign_code = 'CAMP_001'  -- or c.campaign_id = 'uuid-here'
  AND ad.deleted_at IS NULL;

-- ----------------------------------------------------------------------------
-- Sample 3: Impression count per ad (current total)
-- ----------------------------------------------------------------------------
SELECT
    ad.ad_id,
    ad.ad_code,
    ad.ad_name,
    ac.alloted_max_impression_count,
    COUNT(ai.impression_id) AS current_impression_count
FROM ads ad
JOIN ad_content ac ON ad.ad_id = ac.ad_id
LEFT JOIN ad_impressions ai ON ad.ad_id = ai.ad_id
WHERE ad.deleted_at IS NULL
GROUP BY ad.ad_id, ad.ad_code, ad.ad_name, ac.alloted_max_impression_count;

-- ----------------------------------------------------------------------------
-- Sample 4: Main API query for GET /api/v1/ads
-- ----------------------------------------------------------------------------
-- Execute 11_api_query.sql with bound parameters:
--   device_id  (required)  e.g. 'device_abc123xyz'
--   latitude   (optional)  e.g. 37.7749
--   longitude  (optional)  e.g. -122.4194
--
-- Example from application (pseudo):
--   query = read_file('11_api_query.sql')
--   result = db.execute(query, { device_id: req.query.device_id, latitude: req.query.latitude, longitude: req.query.longitude })
