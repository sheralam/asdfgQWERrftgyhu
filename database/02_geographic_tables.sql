-- ============================================================================
-- Geographic Tables
-- ============================================================================

CREATE TABLE regions (
    region_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    region_name VARCHAR(255) NOT NULL UNIQUE,
    region_code VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

CREATE TABLE countries (
    country_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    region_id UUID NOT NULL REFERENCES regions(region_id) ON DELETE CASCADE,
    country_name VARCHAR(255) NOT NULL,
    country_code VARCHAR(10) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

CREATE TABLE cities (
    city_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    country_id UUID NOT NULL REFERENCES countries(country_id) ON DELETE CASCADE,
    city_name VARCHAR(255) NOT NULL,
    state_province VARCHAR(255),
    timezone VARCHAR(100),
    location GEOGRAPHY(POINT),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

CREATE TABLE postcodes (
    postcode_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    city_id UUID NOT NULL REFERENCES cities(city_id) ON DELETE CASCADE,
    postcode VARCHAR(20) NOT NULL,
    location GEOGRAPHY(POINT),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ,
    UNIQUE(city_id, postcode)
);
