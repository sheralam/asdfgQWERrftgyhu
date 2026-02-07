"""Initial schema: roles, users, campaigns, ads, advertisers, audit_logs.

Revision ID: 001
Revises:
Create Date: 2026-02-06

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "roles",
        sa.Column("role_id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("role_name", sa.String(100), nullable=False),
        sa.Column("role_display_name", sa.String(150), nullable=False),
        sa.Column("role_description", sa.Text(), nullable=True),
        sa.Column("permissions", postgresql.JSONB(), nullable=False, server_default='{}'),
        sa.Column("is_active", sa.Boolean(), server_default="true"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.UniqueConstraint("role_name", name="uq_roles_role_name"),
    )
    op.create_index("idx_roles_name", "roles", ["role_name"], unique=False)

    op.create_table(
        "users",
        sa.Column("user_id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("username", sa.String(100), nullable=False),
        sa.Column("email", sa.String(255), nullable=False),
        sa.Column("password_hash", sa.String(255), nullable=False),
        sa.Column("first_name", sa.String(100), nullable=True),
        sa.Column("last_name", sa.String(100), nullable=True),
        sa.Column("role_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("is_active", sa.Boolean(), default=True),
        sa.Column("is_verified", sa.Boolean(), default=False),
        sa.Column("last_login", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.ForeignKeyConstraint(["role_id"], ["roles.role_id"], name="users_role_id_fkey"),
        sa.UniqueConstraint("username", name="uq_users_username"),
        sa.UniqueConstraint("email", name="uq_users_email"),
    )
    op.create_index("idx_users_email", "users", ["email"], unique=False)
    op.create_index("idx_users_username", "users", ["username"], unique=False)
    op.create_index("idx_users_role_id", "users", ["role_id"], unique=False)

    op.create_table(
        "campaigns",
        sa.Column("campaign_id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("campaign_name", sa.String(255), nullable=False),
        sa.Column("campaign_description", sa.Text(), nullable=True),
        sa.Column("campaign_start_date", sa.Date(), nullable=False),
        sa.Column("campaign_end_date", sa.Date(), nullable=False),
        sa.Column("campaign_expiry_date", sa.Date(), nullable=True),
        sa.Column("campaign_max_view_duration_value", sa.Integer(), nullable=True),
        sa.Column("campaign_max_view_duration_unit", sa.String(20), nullable=True),
        sa.Column("campaign_max_view_count", sa.Integer(), nullable=True),
        sa.Column("campaign_status", sa.String(20), nullable=False, server_default="draft"),
        sa.Column("campaign_created_by_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("created_by_name", sa.String(200), nullable=True),
        sa.Column("updated_by_name", sa.String(200), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.ForeignKeyConstraint(
            ["campaign_created_by_id"], ["users.user_id"], name="campaigns_campaign_created_by_id_fkey"
        ),
        sa.CheckConstraint(
            "campaign_status IN ('active', 'inactive', 'paused', 'draft', 'expired')",
            name="valid_campaign_status",
        ),
        sa.CheckConstraint(
            "campaign_end_date >= campaign_start_date",
            name="valid_date_range",
        ),
        sa.CheckConstraint(
            "campaign_max_view_duration_unit IS NULL OR "
            "campaign_max_view_duration_unit IN ('seconds', 'minutes', 'hours', 'days')",
            name="valid_view_duration_unit",
        ),
    )
    op.create_index("idx_campaigns_status", "campaigns", ["campaign_status"], unique=False)
    op.create_index("idx_campaigns_created_by", "campaigns", ["campaign_created_by_id"], unique=False)
    op.create_index(
        "idx_campaigns_dates",
        "campaigns",
        ["campaign_start_date", "campaign_end_date"],
        unique=False,
    )

    op.create_table(
        "campaign_audience_targeting",
        sa.Column("audience_id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("campaign_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("region", sa.String(100), nullable=False),
        sa.Column("country", sa.String(100), nullable=False),
        sa.Column("cities", postgresql.ARRAY(sa.Text()), nullable=True),
        sa.Column("postcodes", postgresql.ARRAY(sa.Text()), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.ForeignKeyConstraint(
            ["campaign_id"],
            ["campaigns.campaign_id"],
            name="campaign_audience_targeting_campaign_id_fkey",
            ondelete="CASCADE",
        ),
    )
    op.create_index(
        "idx_audience_campaign",
        "campaign_audience_targeting",
        ["campaign_id"],
        unique=False,
    )
    op.create_index("idx_audience_region", "campaign_audience_targeting", ["region"], unique=False)
    op.create_index("idx_audience_country", "campaign_audience_targeting", ["country"], unique=False)

    op.create_table(
        "ads",
        sa.Column("ad_id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("campaign_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("ad_type_id", sa.String(50), nullable=False),
        sa.Column("ad_name", sa.String(255), nullable=False),
        sa.Column("ad_description", sa.Text(), nullable=True),
        sa.Column("media_type", sa.String(50), nullable=False),
        sa.Column("media_url", sa.Text(), nullable=True),
        sa.Column("media_content", sa.Text(), nullable=True),
        sa.Column("ad_impression_duration_value", sa.Integer(), nullable=True),
        sa.Column("ad_impression_duration_unit", sa.String(20), nullable=True),
        sa.Column("ad_advertiser_forwarding_url", sa.Text(), nullable=True),
        sa.Column("ad_start_date", sa.Date(), nullable=True),
        sa.Column("ad_end_date", sa.Date(), nullable=True),
        sa.Column("ad_expiry_date", sa.Date(), nullable=True),
        sa.Column("ad_in_view_duration_value", sa.Integer(), nullable=True),
        sa.Column("ad_in_view_duration_unit", sa.String(20), nullable=True),
        sa.Column("ad_view_count", sa.Integer(), server_default="0"),
        sa.Column("ad_status", sa.String(20), nullable=False, server_default="draft"),
        sa.Column("ad_created_by_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("created_by_name", sa.String(200), nullable=True),
        sa.Column("updated_by_name", sa.String(200), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.ForeignKeyConstraint(["campaign_id"], ["campaigns.campaign_id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["ad_created_by_id"], ["users.user_id"]),
        sa.CheckConstraint(
            "ad_type_id IN ('top_bar_ad', 'bottom_left_ad', 'bottom_right_ad', "
            "'bottom_center_ad', 'center_right_content_ad', 'center_left_content_ad')",
            name="valid_ad_type",
        ),
        sa.CheckConstraint(
            "ad_status IN ('active', 'inactive', 'paused', 'draft', 'expired')",
            name="valid_ad_status",
        ),
        sa.CheckConstraint(
            "ad_impression_duration_unit IS NULL OR "
            "ad_impression_duration_unit IN ('seconds', 'minutes', 'hours')",
            name="valid_duration_unit",
        ),
    )
    op.create_index("idx_ads_campaign", "ads", ["campaign_id"], unique=False)
    op.create_index("idx_ads_type", "ads", ["ad_type_id"], unique=False)
    op.create_index("idx_ads_status", "ads", ["ad_status"], unique=False)

    op.create_table(
        "ad_time_slots",
        sa.Column("time_slot_id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("ad_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("time_slot_start", sa.Time(), nullable=False),
        sa.Column("time_slot_end", sa.Time(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.ForeignKeyConstraint(["ad_id"], ["ads.ad_id"], ondelete="CASCADE"),
        sa.CheckConstraint("time_slot_end > time_slot_start", name="valid_time_slot"),
    )
    op.create_index("idx_time_slots_ad", "ad_time_slots", ["ad_id"], unique=False)

    op.create_table(
        "ad_content_ratings",
        sa.Column("rating_id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("ad_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("warning_required", sa.Boolean(), server_default="true"),
        sa.Column("rating_system", sa.String(50), nullable=True),
        sa.Column("rating_label", sa.String(10), nullable=True),
        sa.Column("content_warnings", postgresql.ARRAY(sa.Text()), nullable=True),
        sa.Column("no_prohibited_content", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.ForeignKeyConstraint(["ad_id"], ["ads.ad_id"], ondelete="CASCADE"),
        sa.CheckConstraint("rating_system IN ('MPAA', 'ESRB') OR rating_system IS NULL", name="valid_rating_system"),
        sa.CheckConstraint(
            "rating_system != 'MPAA' OR rating_label IN ('G', 'PG', 'PG-13', 'R', 'NC-17')",
            name="valid_mpaa_rating",
        ),
        sa.CheckConstraint(
            "rating_system != 'ESRB' OR rating_label IN ('E', 'E10+', 'T', 'M', 'AO')",
            name="valid_esrb_rating",
        ),
        sa.CheckConstraint("no_prohibited_content = true", name="prohibited_content_confirmed"),
    )
    op.create_index("idx_ratings_ad", "ad_content_ratings", ["ad_id"], unique=False)

    op.create_table(
        "advertisers",
        sa.Column("advertiser_id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("advertiser_name", sa.String(255), nullable=False),
        sa.Column("advertiser_type", sa.String(50), nullable=False),
        sa.Column("address_line_1", sa.String(255), nullable=False),
        sa.Column("address_line_2", sa.String(255), nullable=True),
        sa.Column("city", sa.String(100), nullable=False),
        sa.Column("state", sa.String(100), nullable=False),
        sa.Column("postal_code", sa.String(20), nullable=False),
        sa.Column("country", sa.String(100), nullable=False),
        sa.Column("latitude", sa.Numeric(10, 8), nullable=True),
        sa.Column("longitude", sa.Numeric(11, 8), nullable=True),
        sa.Column("timezone", sa.String(50), nullable=False),
        sa.Column("created_by_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.ForeignKeyConstraint(["created_by_id"], ["users.user_id"]),
        sa.CheckConstraint(
            "advertiser_type IN ('individual', 'business', 'enterprise', 'agency')",
            name="valid_advertiser_type",
        ),
    )
    op.create_index("idx_advertisers_name", "advertisers", ["advertiser_name"], unique=False)
    op.create_index("idx_advertisers_type", "advertisers", ["advertiser_type"], unique=False)

    op.create_table(
        "advertiser_contacts",
        sa.Column("contact_id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("advertiser_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("contact_name", sa.String(200), nullable=False),
        sa.Column("contact_email", sa.String(255), nullable=False),
        sa.Column("contact_phone", sa.String(50), nullable=False),
        sa.Column("contact_address", sa.String(255), nullable=True),
        sa.Column("contact_city", sa.String(100), nullable=True),
        sa.Column("contact_state", sa.String(100), nullable=True),
        sa.Column("contact_postal_code", sa.String(20), nullable=True),
        sa.Column("contact_country", sa.String(100), nullable=True),
        sa.Column("is_point_of_contact", sa.Boolean(), server_default="false"),
        sa.Column("contact_type", sa.String(50), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.ForeignKeyConstraint(
            ["advertiser_id"],
            ["advertisers.advertiser_id"],
            ondelete="CASCADE",
        ),
        sa.CheckConstraint(
            "contact_type IN ('admin', 'manager', 'sales', 'support', 'marketing', "
            "'tech', 'it', 'hr', 'finance')",
            name="valid_contact_type",
        ),
    )
    op.create_index(
        "idx_contacts_advertiser",
        "advertiser_contacts",
        ["advertiser_id"],
        unique=False,
    )

    op.create_table(
        "advertiser_bank_accounts",
        sa.Column("bank_id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("advertiser_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("bank_name", sa.String(255), nullable=False),
        sa.Column("bank_account_number_encrypted", sa.Text(), nullable=False),
        sa.Column("bank_account_name", sa.String(255), nullable=False),
        sa.Column("bank_account_routing_number", sa.String(50), nullable=True),
        sa.Column("bank_account_swift_code", sa.String(20), nullable=True),
        sa.Column("bank_account_iban", sa.String(50), nullable=True),
        sa.Column("bank_account_bic", sa.String(20), nullable=True),
        sa.Column("bank_account_currency", sa.String(3), nullable=False),
        sa.Column("is_default", sa.Boolean(), server_default="false"),
        sa.Column("is_verified", sa.Boolean(), server_default="false"),
        sa.Column("is_sepa_compliant", sa.Boolean(), server_default="false"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.ForeignKeyConstraint(
            ["advertiser_id"],
            ["advertisers.advertiser_id"],
            ondelete="CASCADE",
        ),
        sa.CheckConstraint("LENGTH(bank_account_currency) = 3", name="valid_currency"),
    )
    op.create_index(
        "idx_bank_accounts_advertiser",
        "advertiser_bank_accounts",
        ["advertiser_id"],
        unique=False,
    )

    op.create_table(
        "audit_logs",
        sa.Column("log_id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("action", sa.String(50), nullable=False),
        sa.Column("resource_type", sa.String(50), nullable=False),
        sa.Column("resource_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("old_values", postgresql.JSONB(), nullable=True),
        sa.Column("new_values", postgresql.JSONB(), nullable=True),
        sa.Column("ip_address", postgresql.INET(), nullable=True),
        sa.Column("user_agent", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.ForeignKeyConstraint(["user_id"], ["users.user_id"]),
    )
    op.create_index("idx_audit_user", "audit_logs", ["user_id"], unique=False)
    op.create_index(
        "idx_audit_resource",
        "audit_logs",
        ["resource_type", "resource_id"],
        unique=False,
    )
    op.create_index("idx_audit_created", "audit_logs", ["created_at"], unique=False)


def downgrade() -> None:
    op.drop_index("idx_audit_created", table_name="audit_logs")
    op.drop_index("idx_audit_resource", table_name="audit_logs")
    op.drop_index("idx_audit_user", table_name="audit_logs")
    op.drop_table("audit_logs")
    op.drop_index("idx_bank_accounts_advertiser", table_name="advertiser_bank_accounts")
    op.drop_table("advertiser_bank_accounts")
    op.drop_index("idx_contacts_advertiser", table_name="advertiser_contacts")
    op.drop_table("advertiser_contacts")
    op.drop_index("idx_advertisers_type", table_name="advertisers")
    op.drop_index("idx_advertisers_name", table_name="advertisers")
    op.drop_table("advertisers")
    op.drop_index("idx_ratings_ad", table_name="ad_content_ratings")
    op.drop_table("ad_content_ratings")
    op.drop_index("idx_time_slots_ad", table_name="ad_time_slots")
    op.drop_table("ad_time_slots")
    op.drop_index("idx_ads_status", table_name="ads")
    op.drop_index("idx_ads_type", table_name="ads")
    op.drop_index("idx_ads_campaign", table_name="ads")
    op.drop_table("ads")
    op.drop_index("idx_audience_country", table_name="campaign_audience_targeting")
    op.drop_index("idx_audience_region", table_name="campaign_audience_targeting")
    op.drop_index("idx_audience_campaign", table_name="campaign_audience_targeting")
    op.drop_table("campaign_audience_targeting")
    op.drop_index("idx_campaigns_dates", table_name="campaigns")
    op.drop_index("idx_campaigns_created_by", table_name="campaigns")
    op.drop_index("idx_campaigns_status", table_name="campaigns")
    op.drop_table("campaigns")
    op.drop_index("idx_users_role_id", table_name="users")
    op.drop_index("idx_users_username", table_name="users")
    op.drop_index("idx_users_email", table_name="users")
    op.drop_table("users")
    op.drop_index("idx_roles_name", table_name="roles")
    op.drop_table("roles")
