-- Rollback migration: 001_init_schema.down.sql

-- Drop tables in reverse order (respecting foreign key dependencies)
DROP TABLE IF EXISTS ad_content_ratings CASCADE;
DROP TABLE IF EXISTS ad_time_slots CASCADE;
DROP TABLE IF EXISTS ad_content CASCADE;
DROP TABLE IF EXISTS ads CASCADE;
DROP TABLE IF EXISTS campaigns CASCADE;
DROP TABLE IF EXISTS device_details CASCADE;
DROP TABLE IF EXISTS devices CASCADE;
DROP TABLE IF EXISTS device_groups CASCADE;
DROP TABLE IF EXISTS host_bank_accounts CASCADE;
DROP TABLE IF EXISTS host_contacts CASCADE;
DROP TABLE IF EXISTS hosts CASCADE;
DROP TABLE IF EXISTS advertiser_bank_accounts CASCADE;
DROP TABLE IF EXISTS advertiser_contacts CASCADE;
DROP TABLE IF EXISTS advertisers CASCADE;

-- Drop extension
DROP EXTENSION IF EXISTS "uuid-ossp";
