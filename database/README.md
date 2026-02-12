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

Or run the consolidated DDL and then indexes (per plan):

```bash
psql -d car_infotainment -f schema.sql
psql -d car_infotainment -f indexes.sql
```

## File Overview

| File | Purpose |
|------|---------|
| `schema.sql` | Complete DDL (extensions, enums, all tables, views, functions, triggers, comments) |
| `indexes.sql` | All index definitions for performance |
| `schema_diagram.md` | ERD with Mermaid and relationship notes |
| `queries.sql` | Sample queries including references to the main API query |
| `README.md` | This file: schema overview, usage, migration notes |
| `01_extensions_and_enums.sql` … `10_indexes.sql` | Modular DDL (alternative to schema.sql + indexes.sql) |
| `11_api_query.sql` | Full GET /api/v1/ads query (parameterized; use from backend) |

## Main Entities

- **Users** – Two roles: **admin** (creates advertisers and hosts), **campaign_manager** (creates campaigns and ads). Referenced by `advertisers.created_by_id`, `hosts.created_by_id`, `campaigns.created_by_id`, `ads.created_by_id`.
- **Advertisers** – Unique across platform (`advertiser_id`, `advertiser_code`). Have multiple campaigns; have contacts and bank accounts. Created by admin users.
- **Hosts** – Own/operate devices; have contacts and bank accounts. Created by admin users.
- **Campaigns** – Unique across platform (`campaign_id`, `campaign_code`). Belong to one advertiser; one advertiser can have many campaigns. Target audience via regions/countries/cities/postcodes. Created by campaign_manager.
- **Ads** – Unique across platform (`ad_id`, `ad_code`). Belong to one campaign; one campaign can have many ads. Have position, type, content, time slots, optional content ratings. Created by campaign_manager.
- **Devices** – Display ads; linked to host and location (PostGIS). Each host has `device_groups` (list of group names); each device has optional `device_group` (at most one, should be one of the host’s `device_groups`).
- **Impressions** – One row per ad view; table partitioned by month (no link to devices).

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
- **Impressions**: `ad_impressions` is range-partitioned by `impression_timestamp` and has no relation to devices. Create new monthly partitions as needed. Use `ad_content.alloted_max_impression_count` and current impression count to enforce caps.
- **Soft deletes**: Major tables use `deleted_at`; filter with `WHERE deleted_at IS NULL` in application queries.

## ERD

See **schema_diagram.md** for the full Mermaid ERD and relationship summary.

## Migration Considerations and Notes

- **Initial deploy**: Run `schema.sql` then `indexes.sql` on an empty database. Ensure PostGIS and uuid-ossp extensions are available.
- **Table order**: schema.sql creates tables in dependency order (geo → advertisers → hosts/devices → campaigns → ads → impressions → users). User FKs are added after `users` exists.
- **Partitions**: `ad_impressions` is partitioned by month. Create new partitions before the month starts (e.g. a cron job or migration). Example: `CREATE TABLE ad_impressions_2027_01 PARTITION OF ad_impressions FOR VALUES FROM ('2027-01-01') TO ('2027-02-01');`
- **ENUMs**: Adding new enum values requires `ALTER TYPE ... ADD VALUE`. Dropping or renaming enum values is not straightforward; prefer adding new values and deprecating in application logic.
- **Unique codes**: `advertiser_code`, `campaign_code`, and `ad_code` are NOT NULL UNIQUE. Generate them in the application (e.g. prefix + sequence or UUID short form) and enforce format in the app layer.
- **Backfills**: When backfilling impressions, use batched inserts and consider disabling or deferring triggers/indexes during bulk load, then re-enable and ANALYZE.
- **Rollback**: There is no single rollback script. Document forward-only migrations (e.g. new columns, new tables) and keep backup/restore or snapshot strategy for major changes.
