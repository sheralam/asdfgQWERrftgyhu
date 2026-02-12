-- ============================================================================
-- Car Infotainment Ad Platform - Performance Indexes
-- Run after schema.sql
-- ============================================================================

-- Geographic indexes (GIST for geography columns)
CREATE INDEX idx_advertisers_location ON advertisers USING GIST(location);
CREATE INDEX idx_hosts_location ON hosts USING GIST(location);
CREATE INDEX idx_ad_display_device_location ON ad_display_device USING GIST(location);
CREATE INDEX idx_cities_location ON cities USING GIST(location);
CREATE INDEX idx_postcodes_location ON postcodes USING GIST(location);

-- Campaign indexes
CREATE INDEX idx_campaigns_status_dates ON campaigns(campaign_status, campaign_start_date, campaign_end_date) WHERE deleted_at IS NULL;
CREATE INDEX idx_campaigns_advertiser ON campaigns(advertiser_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_campaigns_active ON campaigns(campaign_id) WHERE campaign_status = 'active' AND deleted_at IS NULL;

-- Ad indexes
CREATE INDEX idx_ads_status_dates_position ON ads(ad_status, ad_start_date, ad_end_date, ad_position) WHERE deleted_at IS NULL;
CREATE INDEX idx_ads_campaign ON ads(campaign_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_ads_active ON ads(ad_id) WHERE ad_status = 'active' AND deleted_at IS NULL;
CREATE INDEX idx_ads_position ON ads(ad_position);

-- Ad content indexes
CREATE INDEX idx_ad_content_ad_id ON ad_content(ad_id);

-- Impression indexes
CREATE INDEX idx_impressions_ad_id ON ad_impressions(ad_id);
CREATE INDEX idx_impressions_timestamp ON ad_impressions(impression_timestamp);

-- Campaign audience indexes
CREATE INDEX idx_campaign_cities_campaign ON campaign_cities(campaign_id);
CREATE INDEX idx_campaign_cities_city ON campaign_cities(city_id);
CREATE INDEX idx_campaign_postcodes_campaign ON campaign_postcodes(campaign_id);

-- Device group indexes
CREATE INDEX idx_device_groups_host ON device_groups(host_id);
CREATE INDEX idx_device_groups_status ON device_groups(status) WHERE status = 'active';

-- Device details indexes (1-1 with ad_display_device)
CREATE INDEX idx_device_details_vendor ON device_details(vendor_name);
CREATE INDEX idx_device_details_purchase_date ON device_details(purchase_date);

-- Ad display device indexes
CREATE INDEX idx_ad_display_device_host ON ad_display_device(host_id);
CREATE INDEX idx_ad_display_device_device_group ON ad_display_device(device_group_id);
CREATE INDEX idx_ad_display_device_type_rating ON ad_display_device(device_type, device_rating);

-- Impression analytics datastore: fact table indexes
CREATE INDEX idx_impression_events_date ON ad_impression_events(impression_date);
CREATE INDEX idx_impression_events_advertiser_date ON ad_impression_events(advertiser_id, impression_date);
CREATE INDEX idx_impression_events_campaign_date ON ad_impression_events(campaign_id, impression_date);
CREATE INDEX idx_impression_events_ad_date ON ad_impression_events(ad_id, impression_date);
CREATE INDEX idx_impression_events_device_date ON ad_impression_events(device_id, impression_date);
CREATE INDEX idx_impression_events_host_date ON ad_impression_events(host_id, impression_date);
CREATE INDEX idx_impression_events_device_group_date ON ad_impression_events(device_group_id, impression_date) WHERE device_group_id IS NOT NULL;
CREATE INDEX idx_impression_events_city_date ON ad_impression_events(device_city, impression_date);
CREATE INDEX idx_impression_events_postcode_date ON ad_impression_events(device_postcode, impression_date);
CREATE INDEX idx_impression_events_country_date ON ad_impression_events(device_country, impression_date);
CREATE INDEX idx_impression_events_timestamp ON ad_impression_events(impression_timestamp);
-- Impression daily rollups
CREATE INDEX idx_impression_rollups_type_date ON impression_daily_rollups(rollup_type, impression_date);
CREATE INDEX idx_impression_rollups_dimension_date ON impression_daily_rollups(dimension_id, impression_date);
CREATE INDEX idx_impression_rollups_date ON impression_daily_rollups(impression_date);
