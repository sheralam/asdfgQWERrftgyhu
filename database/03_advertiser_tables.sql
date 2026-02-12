-- ============================================================================
-- Advertiser Tables
-- ============================================================================

CREATE TABLE advertisers (
    advertiser_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    advertiser_name VARCHAR(500) NOT NULL,
    advertiser_type advertiser_type_enum NOT NULL,
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

CREATE TABLE advertiser_contacts (
    contact_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    advertiser_id UUID NOT NULL REFERENCES advertisers(advertiser_id) ON DELETE CASCADE,
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
    CONSTRAINT valid_advertiser_email CHECK (contact_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

CREATE TABLE advertiser_bank_accounts (
    bank_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    advertiser_id UUID NOT NULL REFERENCES advertisers(advertiser_id) ON DELETE CASCADE,
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
