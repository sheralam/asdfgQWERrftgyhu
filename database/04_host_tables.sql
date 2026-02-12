-- ============================================================================
-- Host Tables
-- ============================================================================

CREATE TABLE hosts (
    host_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    host_name VARCHAR(500) NOT NULL,
    target_audience_age_group age_group_enum,
    address_line_1 VARCHAR(500) NOT NULL,
    address_line_2 VARCHAR(500),
    city VARCHAR(255) NOT NULL,
    state_province VARCHAR(255) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(255) NOT NULL,
    location GEOGRAPHY(POINT),
    timezone VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ,
    created_by_id UUID,
    updated_by_id UUID,
    deleted_at TIMESTAMPTZ
);

CREATE TABLE host_contacts (
    contact_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    host_id UUID NOT NULL REFERENCES hosts(host_id) ON DELETE CASCADE,
    contact_name VARCHAR(255) NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(50) NOT NULL,
    contact_address VARCHAR(500),
    contact_city VARCHAR(255),
    contact_state VARCHAR(255),
    contact_postal_code VARCHAR(20),
    contact_country VARCHAR(255),
    contact_type contact_type_enum NOT NULL,
    is_point_of_contact BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT valid_host_email CHECK (contact_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

CREATE TABLE host_bank_accounts (
    bank_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    host_id UUID NOT NULL REFERENCES hosts(host_id) ON DELETE CASCADE,
    bank_name VARCHAR(255) NOT NULL,
    bank_account_number TEXT NOT NULL,
    bank_account_name VARCHAR(255) NOT NULL,
    bank_account_routing_number VARCHAR(100),
    bank_account_swift_code VARCHAR(20),
    bank_account_iban VARCHAR(50),
    bank_account_bic VARCHAR(20),
    bank_account_currency CHAR(3) NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,
    is_sepa_compliant BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ
);

CREATE TABLE devices (
    device_id VARCHAR(255) PRIMARY KEY,
    host_id UUID NOT NULL REFERENCES hosts(host_id) ON DELETE CASCADE,
    device_type device_type_enum NOT NULL,
    device_rating device_rating_enum NOT NULL,
    display_size display_size_enum NOT NULL,
    avg_idle_time INTEGER NOT NULL CHECK (avg_idle_time % 5 = 0),
    avg_visitors_count INTEGER NOT NULL CHECK (avg_visitors_count >= 0),
    address_line_1 VARCHAR(500) NOT NULL,
    address_line_2 VARCHAR(500),
    city VARCHAR(255) NOT NULL,
    state_province VARCHAR(255) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(255) NOT NULL,
    location GEOGRAPHY(POINT) NOT NULL,
    timezone VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ
);
