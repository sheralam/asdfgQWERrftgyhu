-- ============================================================================
-- Functions and Triggers
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to check impression count against allotment
CREATE OR REPLACE FUNCTION check_impression_limit(p_ad_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_max_count INTEGER;
    v_current_count BIGINT;
BEGIN
    SELECT alloted_max_impression_count INTO v_max_count
    FROM ad_content
    WHERE ad_id = p_ad_id;
    
    IF v_max_count IS NULL THEN
        RETURN TRUE;
    END IF;
    
    SELECT COUNT(*) INTO v_current_count
    FROM ad_impressions
    WHERE ad_id = p_ad_id;
    
    RETURN v_current_count < v_max_count;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_advertisers_updated_at BEFORE UPDATE ON advertisers
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_hosts_updated_at BEFORE UPDATE ON hosts
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_device_groups_updated_at BEFORE UPDATE ON device_groups
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_device_details_updated_at BEFORE UPDATE ON device_details
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_ads_updated_at BEFORE UPDATE ON ads
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON TABLE advertisers IS 'Stores advertiser/client information who purchase ad campaigns';
COMMENT ON TABLE hosts IS 'Stores information about device owners/operators';
COMMENT ON TABLE device_groups IS 'Groups under a host; devices can be assigned to at most one group';
COMMENT ON TABLE ad_display_device IS 'Physical devices (cars, shops, houses) that display ads';
COMMENT ON TABLE device_details IS '1-1: hardware specs, vendor, purchasing, prices, notes per device';
COMMENT ON TABLE campaigns IS 'Marketing campaigns created by advertisers';
COMMENT ON TABLE ads IS 'Individual advertisements within campaigns';
COMMENT ON TABLE ad_content IS 'Media content and settings for each ad';
COMMENT ON TABLE ad_impressions IS 'Tracks each time an ad is displayed (partitioned by date)';
COMMENT ON COLUMN ad_display_device.avg_idle_time IS 'Average idle time in minutes (must be multiple of 5)';
COMMENT ON COLUMN ad_content.alloted_max_impression_count IS 'Maximum number of times this ad can be shown';
COMMENT ON COLUMN ad_time_slots.time_slot_start IS 'Start time in 15-minute intervals (HH:MM format)';
