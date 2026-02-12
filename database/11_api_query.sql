-- ============================================================================
-- Main API Query for GET /api/v1/ads Endpoint
-- ============================================================================

-- This query retrieves ads for a given device_id and optional location
-- Returns JSON structure matching example_response.json

WITH device_info AS (
    SELECT 
        d.device_id,
        d.location as device_location,
        d.city,
        d.state_province,
        d.postal_code,
        d.country
    FROM ad_display_device d
    WHERE d.device_id = :device_id  -- Parameter from API request
        AND d.deleted_at IS NULL
),
filtered_campaigns AS (
    SELECT DISTINCT c.*
    FROM campaigns c
    JOIN advertisers a ON c.advertiser_id = a.advertiser_id
    LEFT JOIN campaign_audience ca ON c.campaign_id = ca.campaign_id
    LEFT JOIN campaign_cities cc ON c.campaign_id = cc.campaign_id
    LEFT JOIN cities city ON cc.city_id = city.city_id
    LEFT JOIN campaign_postcodes cp ON c.campaign_id = cp.campaign_id
    LEFT JOIN postcodes pc ON cp.postcode_id = pc.postcode_id
    CROSS JOIN device_info di
    WHERE c.campaign_status = 'active'
        AND c.deleted_at IS NULL
        AND a.deleted_at IS NULL
        AND CURRENT_DATE BETWEEN c.campaign_start_date AND c.campaign_end_date
        AND (
            -- If location provided, filter by geographic match
            (:latitude IS NULL AND :longitude IS NULL)
            OR
            -- Match by city name
            city.city_name = di.city
            OR
            -- Match by postcode
            pc.postcode = di.postal_code
            OR
            -- No specific targeting (campaign applies everywhere)
            (ca.campaign_audience_id IS NULL AND cc.campaign_id IS NULL AND cp.campaign_id IS NULL)
        )
),
eligible_ads AS (
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
        c.advertiser_id,
        adv.advertiser_name,
        COALESCE((
            SELECT COUNT(*)
            FROM ad_impressions ai
            WHERE ai.ad_id = ad.ad_id
        ), 0) as current_impression_count
    FROM ads ad
    JOIN ad_content ac ON ad.ad_id = ac.ad_id
    JOIN filtered_campaigns c ON ad.campaign_id = c.campaign_id
    JOIN advertisers adv ON c.advertiser_id = adv.advertiser_id
    LEFT JOIN ad_time_slots ats ON ad.ad_id = ats.ad_id
    WHERE ad.ad_status = 'active'
        AND ad.deleted_at IS NULL
        AND CURRENT_DATE BETWEEN ad.ad_start_date AND ad.ad_end_date
        AND (
            -- No time slots defined, or current time matches a slot
            ats.time_slot_id IS NULL
            OR
            CURRENT_TIME BETWEEN ats.time_slot_start AND ats.time_slot_end
        )
        AND (
            -- No impression limit, or under the limit
            ac.alloted_max_impression_count IS NULL
            OR
            current_impression_count < ac.alloted_max_impression_count
        )
),
campaign_audience_data AS (
    SELECT 
        c.campaign_id,
        r.region_name,
        co.country_name,
        COALESCE(
            array_agg(DISTINCT city.city_name) FILTER (WHERE city.city_name IS NOT NULL),
            ARRAY[]::text[]
        ) as cities,
        COALESCE(
            array_agg(DISTINCT pc.postcode) FILTER (WHERE pc.postcode IS NOT NULL),
            ARRAY[]::text[]
        ) as postcodes
    FROM filtered_campaigns c
    LEFT JOIN campaign_audience ca ON c.campaign_id = ca.campaign_id
    LEFT JOIN regions r ON ca.region_id = r.region_id
    LEFT JOIN countries co ON ca.country_id = co.country_id
    LEFT JOIN campaign_cities cc ON c.campaign_id = cc.campaign_id
    LEFT JOIN cities city ON cc.city_id = city.city_id
    LEFT JOIN campaign_postcodes cp ON c.campaign_id = cp.campaign_id
    LEFT JOIN postcodes pc ON cp.postcode_id = pc.postcode_id
    GROUP BY c.campaign_id, r.region_name, co.country_name
)
SELECT 
    jsonb_build_object(
        'success', true,
        'data', jsonb_build_object(
            'device_id', di.device_id,
            'location', CASE 
                WHEN :latitude IS NOT NULL AND :longitude IS NOT NULL 
                THEN jsonb_build_object(
                    'longitude', :longitude,
                    'latitude', :latitude
                )
                ELSE NULL
            END,
            'top_bar_ad', (
                SELECT jsonb_build_object(
                    'ad_id', ea.ad_id,
                    'ad_name', ea.ad_name,
                    'ad_type', ea.ad_type,
                    'ad_description', ea.ad_description,
                    'ad_content', jsonb_build_object(
                        'media_type', ea.media_type,
                        'media_content', ea.media_content,
                        'ad_impression', jsonb_build_object(
                            'ad_impression_duration', ea.ad_impression_duration,
                            'alloted_max_impression_count', ea.alloted_max_impression_count
                        ),
                        'ad_advertiser_forwarding_url', ea.ad_advertiser_forwarding_url
                    ),
                    'ad_status', ea.ad_status,
                    'ad_start_date', ea.ad_start_date,
                    'ad_end_date', ea.ad_end_date,
                    'campaign', jsonb_build_object(
                        'campaign_id', ea.campaign_id,
                        'campaign_name', ea.campaign_name,
                        'campaign_description', ea.campaign_description,
                        'campaign_status', ea.campaign_status,
                        'campaign_start_date', ea.campaign_start_date,
                        'campaign_end_date', ea.campaign_end_date,
                        'advertiser', jsonb_build_object(
                            'advertiser_id', ea.advertiser_id,
                            'advertiser_name', ea.advertiser_name
                        ),
                        'audience', jsonb_build_object(
                            'region', cad.region_name,
                            'country', cad.country_name,
                            'cities', cad.cities,
                            'postcodes', cad.postcodes
                        )
                    )
                )
                FROM eligible_ads ea
                LEFT JOIN campaign_audience_data cad ON ea.campaign_id = cad.campaign_id
                WHERE ea.ad_position = 'top_bar_ad'
                ORDER BY ea.created_at DESC
                LIMIT 1
            ),
            'bottom_left_ad', (
                SELECT jsonb_build_object(
                    'ad_id', ea.ad_id,
                    'ad_name', ea.ad_name,
                    'ad_type', ea.ad_type,
                    'ad_description', ea.ad_description,
                    'ad_content', jsonb_build_object(
                        'media_type', ea.media_type,
                        'media_content', ea.media_content,
                        'ad_impression', jsonb_build_object(
                            'ad_impression_duration', ea.ad_impression_duration,
                            'alloted_max_impression_count', ea.alloted_max_impression_count
                        ),
                        'ad_advertiser_forwarding_url', ea.ad_advertiser_forwarding_url
                    ),
                    'ad_status', ea.ad_status,
                    'ad_start_date', ea.ad_start_date,
                    'ad_end_date', ea.ad_end_date,
                    'campaign', jsonb_build_object(
                        'campaign_id', ea.campaign_id,
                        'campaign_name', ea.campaign_name,
                        'campaign_description', ea.campaign_description,
                        'campaign_status', ea.campaign_status,
                        'campaign_start_date', ea.campaign_start_date,
                        'campaign_end_date', ea.campaign_end_date,
                        'advertiser', jsonb_build_object(
                            'advertiser_id', ea.advertiser_id,
                            'advertiser_name', ea.advertiser_name
                        ),
                        'audience', jsonb_build_object(
                            'region', cad.region_name,
                            'country', cad.country_name,
                            'cities', cad.cities,
                            'postcodes', cad.postcodes
                        )
                    )
                )
                FROM eligible_ads ea
                LEFT JOIN campaign_audience_data cad ON ea.campaign_id = cad.campaign_id
                WHERE ea.ad_position = 'bottom_left_ad'
                ORDER BY ea.created_at DESC
                LIMIT 1
            ),
            'bottom_right_ad', (
                SELECT jsonb_build_object(
                    'ad_id', ea.ad_id,
                    'ad_name', ea.ad_name,
                    'ad_type', ea.ad_type,
                    'ad_description', ea.ad_description,
                    'ad_content', jsonb_build_object(
                        'media_type', ea.media_type,
                        'media_content', ea.media_content,
                        'ad_impression', jsonb_build_object(
                            'ad_impression_duration', ea.ad_impression_duration,
                            'alloted_max_impression_count', ea.alloted_max_impression_count
                        ),
                        'ad_advertiser_forwarding_url', ea.ad_advertiser_forwarding_url
                    ),
                    'ad_status', ea.ad_status,
                    'ad_start_date', ea.ad_start_date,
                    'ad_end_date', ea.ad_end_date,
                    'campaign', jsonb_build_object(
                        'campaign_id', ea.campaign_id,
                        'campaign_name', ea.campaign_name,
                        'campaign_description', ea.campaign_description,
                        'campaign_status', ea.campaign_status,
                        'campaign_start_date', ea.campaign_start_date,
                        'campaign_end_date', ea.campaign_end_date,
                        'advertiser', jsonb_build_object(
                            'advertiser_id', ea.advertiser_id,
                            'advertiser_name', ea.advertiser_name
                        ),
                        'audience', jsonb_build_object(
                            'region', cad.region_name,
                            'country', cad.country_name,
                            'cities', cad.cities,
                            'postcodes', cad.postcodes
                        )
                    )
                )
                FROM eligible_ads ea
                LEFT JOIN campaign_audience_data cad ON ea.campaign_id = cad.campaign_id
                WHERE ea.ad_position = 'bottom_right_ad'
                ORDER BY ea.created_at DESC
                LIMIT 1
            ),
            'bottom_center_ad', (
                SELECT jsonb_build_object(
                    'ad_id', ea.ad_id,
                    'ad_name', ea.ad_name,
                    'ad_type', ea.ad_type,
                    'ad_description', ea.ad_description,
                    'ad_content', jsonb_build_object(
                        'media_type', ea.media_type,
                        'media_content', ea.media_content,
                        'ad_impression', jsonb_build_object(
                            'ad_impression_duration', ea.ad_impression_duration,
                            'alloted_max_impression_count', ea.alloted_max_impression_count
                        ),
                        'ad_advertiser_forwarding_url', ea.ad_advertiser_forwarding_url
                    ),
                    'ad_status', ea.ad_status,
                    'ad_start_date', ea.ad_start_date,
                    'ad_end_date', ea.ad_end_date,
                    'campaign', jsonb_build_object(
                        'campaign_id', ea.campaign_id,
                        'campaign_name', ea.campaign_name,
                        'campaign_description', ea.campaign_description,
                        'campaign_status', ea.campaign_status,
                        'campaign_start_date', ea.campaign_start_date,
                        'campaign_end_date', ea.campaign_end_date,
                        'advertiser', jsonb_build_object(
                            'advertiser_id', ea.advertiser_id,
                            'advertiser_name', ea.advertiser_name
                        ),
                        'audience', jsonb_build_object(
                            'region', cad.region_name,
                            'country', cad.country_name,
                            'cities', cad.cities,
                            'postcodes', cad.postcodes
                        )
                    )
                )
                FROM eligible_ads ea
                LEFT JOIN campaign_audience_data cad ON ea.campaign_id = cad.campaign_id
                WHERE ea.ad_position = 'bottom_center_ad'
                ORDER BY ea.created_at DESC
                LIMIT 1
            ),
            'center_right_content_ad', (
                SELECT jsonb_agg(
                    jsonb_build_object(
                        'ad_id', ea.ad_id,
                        'ad_name', ea.ad_name,
                        'ad_type', ea.ad_type,
                        'ad_description', ea.ad_description,
                        'ad_content', jsonb_build_object(
                            'media_type', ea.media_type,
                            'media_content', ea.media_content,
                            'ad_impression', jsonb_build_object(
                                'ad_impression_duration', ea.ad_impression_duration,
                                'alloted_max_impression_count', ea.alloted_max_impression_count
                            ),
                            'ad_advertiser_forwarding_url', ea.ad_advertiser_forwarding_url
                        ),
                        'ad_status', ea.ad_status,
                        'ad_start_date', ea.ad_start_date,
                        'ad_end_date', ea.ad_end_date,
                        'campaign', jsonb_build_object(
                            'campaign_id', ea.campaign_id,
                            'campaign_name', ea.campaign_name,
                            'campaign_description', ea.campaign_description,
                            'campaign_status', ea.campaign_status,
                            'campaign_start_date', ea.campaign_start_date,
                            'campaign_end_date', ea.campaign_end_date,
                            'advertiser', jsonb_build_object(
                                'advertiser_id', ea.advertiser_id,
                                'advertiser_name', ea.advertiser_name
                            ),
                            'audience', jsonb_build_object(
                                'region', cad.region_name,
                                'country', cad.country_name,
                                'cities', cad.cities,
                                'postcodes', cad.postcodes
                            )
                        )
                    )
                )
                FROM eligible_ads ea
                LEFT JOIN campaign_audience_data cad ON ea.campaign_id = cad.campaign_id
                WHERE ea.ad_position = 'center_right_content_ad'
                ORDER BY ea.created_at DESC
            ),
            'center_left_content_ad', (
                SELECT jsonb_agg(
                    jsonb_build_object(
                        'ad_id', ea.ad_id,
                        'ad_name', ea.ad_name,
                        'ad_type', ea.ad_type,
                        'ad_description', ea.ad_description,
                        'ad_content', jsonb_build_object(
                            'media_type', ea.media_type,
                            'media_content', ea.media_content,
                            'ad_impression', jsonb_build_object(
                                'ad_impression_duration', ea.ad_impression_duration,
                                'alloted_max_impression_count', ea.alloted_max_impression_count
                            ),
                            'ad_advertiser_forwarding_url', ea.ad_advertiser_forwarding_url
                        ),
                        'ad_status', ea.ad_status,
                        'ad_start_date', ea.ad_start_date,
                        'ad_end_date', ea.ad_end_date,
                        'campaign', jsonb_build_object(
                            'campaign_id', ea.campaign_id,
                            'campaign_name', ea.campaign_name,
                            'campaign_description', ea.campaign_description,
                            'campaign_status', ea.campaign_status,
                            'campaign_start_date', ea.campaign_start_date,
                            'campaign_end_date', ea.campaign_end_date,
                            'advertiser', jsonb_build_object(
                                'advertiser_id', ea.advertiser_id,
                                'advertiser_name', ea.advertiser_name
                            ),
                            'audience', jsonb_build_object(
                                'region', cad.region_name,
                                'country', cad.country_name,
                                'cities', cad.cities,
                                'postcodes', cad.postcodes
                            )
                        )
                    )
                )
                FROM eligible_ads ea
                LEFT JOIN campaign_audience_data cad ON ea.campaign_id = cad.campaign_id
                WHERE ea.ad_position = 'center_left_content_ad'
                ORDER BY ea.created_at DESC
            )
        ),
        'metadata', jsonb_build_object(
            'total_ad_positions', 6,
            'timestamp', NOW()
        )
    ) as response
FROM device_info di;

-- Example usage:
-- SELECT * FROM get_ads_for_device('device_abc123xyz', -122.4194, 37.7749);
-- SELECT * FROM get_ads_for_device('device_abc123xyz', NULL, NULL);  -- Without location
