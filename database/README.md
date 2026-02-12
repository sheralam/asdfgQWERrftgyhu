# Car Infotainment Ad Platform – Database Schema

PostgreSQL schema for the car infotainment ad platform. It supports campaigns, ads, advertisers, hosts, devices, geo-targeting, and impression tracking so the backend can serve responses like the example in `project configuration/example_response.json`.

## Requirements

- **PostgreSQL 14+** (or 12+ with compatible syntax)
- **PostGIS** for geographic types and spatial queries

## Quick Start

1. Create a database and enable extensions:

```bash
createdb car_infotainment
psql -d car_infotainment -c "CREATE EXTENSION IF NOT EXISTS postgis; CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";"
```

2. Run schema scripts in order:

```bash
psql -d car_infotainment -f 01_extensions_and_enums.sql
psql -d car_infotainment -f 02_geographic_tables.sql
psql -d car_infotainment -f 03_advertiser_tables.sql
psql -d car_infotainment -f 04_host_tables.sql
psql -d car_infotainment -f 05_campaign_tables.sql
psql -d car_infotainment -f 06_ad_tables.sql
psql -d car_infotainment -f 07_impression_tables.sql
psql -d car_infotainment -f 08_users_and_views.sql
psql -d car_infotainment -f 09_functions_and_triggers.sql
psql -d car_infotainment -f 10_indexes.sql
```

Or run the single consolidated file (if kept in sync):

```bash
psql -d car_infotainment -f schema.sql
```

## File Overview

| File | Purpose |
|------|---------|
| `01_extensions_and_enums.sql` | PostGIS, uuid-ossp, and all ENUM types |
| `02_geographic_tables.sql` | regions, countries, cities, postcodes |
| `03_advertiser_tables.sql` | advertisers, contacts, bank_accounts |
| `04_host_tables.sql` | hosts, host_contacts, host_bank_accounts, devices |
| `05_campaign_tables.sql` | campaigns, campaign_audience, campaign_cities, campaign_postcodes |
| `06_ad_tables.sql` | ads, ad_content, ad_time_slots, ad_content_ratings |
| `07_impression_tables.sql` | ad_impressions (partitioned), ad_impressions_aggregated |
| `08_users_and_views.sql` | users, active_campaigns, active_ads views |
| `09_functions_and_triggers.sql` | update_updated_at, check_impression_limit, triggers, comments |
| `10_indexes.sql` | GIST and B-tree indexes for performance |
| `11_api_query.sql` | Reference query for GET /api/v1/ads (device_id + optional location) |
| `schema_diagram.md` | ERD in Mermaid |
| `schema.sql` | Optional single-file schema (may be partial; prefer 01–10 for full setup) |

## Main Entities

- **Advertisers** – Create campaigns; have contacts and bank accounts.
- **Hosts** – Own/operate devices; have contacts and bank accounts.
- **Devices** – Display ads; linked to host and location (PostGIS).
- **Campaigns** – Belong to one advertiser; target audience via regions/countries/cities/postcodes.
- **Ads** – Belong to one campaign; have position (top_bar_ad, bottom_left_ad, etc.), type (image_only_ad, multimedia_ad), content, time slots, and optional content ratings.
- **Impressions** – One row per ad view per device; table partitioned by month; optional aggregated table for analytics.

## API Response Mapping

The `GET /api/v1/ads` response is built from:

- **data.device_id**, **data.location** – From request + devices table.
- **data.top_bar_ad**, **bottom_left_ad**, **bottom_right_ad**, **bottom_center_ad** – One ad per position (single object).
- **data.center_right_content_ad**, **data.center_left_content_ad** – Arrays of ads (multimedia_ad).
- Each ad object includes **ad_content** (media_type, media_content, ad_impression, ad_advertiser_forwarding_url) and nested **campaign** (with **advertiser** and **audience**).

Use `11_api_query.sql` as the reference for building this response (parameterize `device_id`, `latitude`, `longitude` in your backend).

## Design Notes

- **Geo-targeting**: Campaign audience is stored in campaign_audience, campaign_cities, campaign_postcodes. Filter by device location (and optional request lat/long) when selecting campaigns/ads.
- **Ad positions**: Four positions return a single ad; two (center_right_content_ad, center_left_content_ad) return arrays, per `campaign_configurations.yaml` and `example_response.json`.
- **Impressions**: `ad_impressions` is range-partitioned by `impression_timestamp`. Create new monthly partitions as needed. Use `ad_content.alloted_max_impression_count` and current impression count to enforce caps.
- **Soft deletes**: Major tables use `deleted_at`; filter with `WHERE deleted_at IS NULL` in application queries.

## ERD

See **schema_diagram.md** for the full Mermaid ERD and relationship summary.
