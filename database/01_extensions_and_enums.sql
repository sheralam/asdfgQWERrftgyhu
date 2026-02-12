-- ============================================================================
-- Car Infotainment Ad Platform - Extensions and ENUM Types
-- PostgreSQL 14+
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- ENUM TYPES
-- ============================================================================

CREATE TYPE advertiser_type_enum AS ENUM ('individual', 'business', 'enterprise', 'agency');

CREATE TYPE contact_type_enum AS ENUM ('admin', 'manager', 'sales', 'support', 'marketing', 'tech', 'it', 'hr', 'finance', 'operations', 'technical');

CREATE TYPE device_type_enum AS ENUM ('shop', 'car', 'house');

CREATE TYPE device_rating_enum AS ENUM ('economy', 'standard', 'premium', 'luxury');

CREATE TYPE display_size_enum AS ENUM ('s', 'm', 'l', 'xl', 'xxl');

CREATE TYPE status_enum AS ENUM ('active', 'inactive', 'paused', 'draft', 'expired');

CREATE TYPE ad_position_enum AS ENUM ('top_bar_ad', 'bottom_left_ad', 'bottom_right_ad', 'bottom_center_ad', 'center_right_content_ad', 'center_left_content_ad');

CREATE TYPE ad_type_enum AS ENUM ('image_only_ad', 'multimedia_ad');

CREATE TYPE media_type_enum AS ENUM ('text', 'image', 'gif', 'video', 'html', 'news_rss', 'events', 'breaking_news', 'alerts');

CREATE TYPE time_unit_enum AS ENUM ('seconds', 'minutes', 'hours', 'days');

CREATE TYPE age_group_enum AS ENUM ('0-5', '6-12', '13-18', '19-35', '36-55', '55+');

CREATE TYPE mpaa_rating_enum AS ENUM ('G', 'PG', 'PG-13', 'R', 'NC-17');

CREATE TYPE esrb_rating_enum AS ENUM ('E', 'E10+', 'T', 'M', 'AO');

-- User roles: admin creates advertisers; campaign_manager creates campaigns and ads
CREATE TYPE user_role_enum AS ENUM ('admin', 'campaign_manager');
