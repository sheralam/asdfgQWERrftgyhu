-- ============================================================================
-- Performance Indexes
-- ============================================================================

-- Geographic indexes (GIST for geography columns)
CREATE INDEX idx_advertisers_location ON advertisers USING GIST(location);
CREATE INDEX idx_hosts_location ON hosts USING GIST(location);
CREATE INDEX idx_devices_location ON devices USING GIST(location);
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
CREATE INDEX idx_impressions_ad_device ON ad_impressions(ad_id, device_id);
CREATE INDEX idx_impressions_timestamp ON ad_impressions(impression_timestamp);
CREATE INDEX idx_impressions_aggregated_lookup ON ad_impressions_aggregated(ad_id, aggregation_date, aggregation_hour);

-- Campaign audience indexes
CREATE INDEX idx_campaign_cities_campaign ON campaign_cities(campaign_id);
CREATE INDEX idx_campaign_cities_city ON campaign_cities(city_id);
CREATE INDEX idx_campaign_postcodes_campaign ON campaign_postcodes(campaign_id);

-- Device indexes
CREATE INDEX idx_devices_host ON devices(host_id);
CREATE INDEX idx_devices_type_rating ON devices(device_type, device_rating);
