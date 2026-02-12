import type {
  Advertiser,
  AdvertiserContact,
  AdvertiserBankAccount,
  Host,
  HostContact,
  HostBankAccount,
  DeviceGroup,
  Device,
  DeviceDetails,
  Campaign,
  Ad,
  AdContent,
  AdTimeSlot,
  AdContentRatings,
} from "./types";

export const advertisers = new Map<string, Advertiser>();
export const advertiserContacts = new Map<string, AdvertiserContact>();
export const advertiserBanks = new Map<string, AdvertiserBankAccount>();

export const hosts = new Map<string, Host>();
export const hostContacts = new Map<string, HostContact>();
export const hostBanks = new Map<string, HostBankAccount>();
export const deviceGroups = new Map<string, DeviceGroup>();

export const devices = new Map<string, Device>();
export const deviceDetails = new Map<string, DeviceDetails>();

export const campaigns = new Map<string, Campaign>();
export const ads = new Map<string, Ad>();
export const adContents = new Map<string, AdContent>();
export const adTimeSlots = new Map<string, AdTimeSlot>();
export const adContentRatings = new Map<string, AdContentRatings>();

export function uuid() {
  return crypto.randomUUID();
}

export function now() {
  return new Date().toISOString();
}

// Seed a few items for demo
function seed() {
  if (advertisers.size > 0) return;
  const advId = uuid();
  advertisers.set(advId, {
    advertiser_id: advId,
    advertiser_code: "ADV-DEMO",
    advertiser_name: "Demo Advertiser",
    advertiser_type: "business",
    address_line_1: "123 Main St",
    city: "New York",
    state_province: "NY",
    postal_code: "10001",
    country: "USA",
    timezone: "America/New_York",
    created_at: now(),
    updated_at: null,
    created_by_id: null,
    updated_by_id: null,
    deleted_at: null,
  });
  const hostId = uuid();
  hosts.set(hostId, {
    host_id: hostId,
    host_name: "Demo Host",
    address_line_1: "456 Oak Ave",
    city: "Boston",
    state_province: "MA",
    postal_code: "02101",
    country: "USA",
    timezone: "America/New_York",
    created_at: now(),
    updated_at: null,
    created_by_id: null,
    updated_by_id: null,
    deleted_at: null,
  });
  const campId = uuid();
  campaigns.set(campId, {
    campaign_id: campId,
    campaign_code: "CAMP-DEMO",
    advertiser_id: advId,
    campaign_name: "Demo Campaign",
    country: "USA",
    city: "New York",
    postcode: "10001",
    campaign_start_date: "2025-01-01",
    campaign_end_date: "2025-12-31",
    campaign_status: "draft",
    created_at: now(),
    updated_at: null,
    created_by_id: null,
    created_by_name: null,
    updated_by_id: null,
    updated_by_name: null,
    deleted_at: null,
  });
  const devId = "DEV-DEMO-001";
  devices.set(devId, {
    device_id: devId,
    host_id: hostId,
    device_type: "car",
    device_rating: "premium",
    display_size: "l",
    avg_idle_time: 15,
    avg_visitors_count: 2,
    address_line_1: "789 Pine Rd",
    city: "Boston",
    state_province: "MA",
    postal_code: "02102",
    country: "USA",
    timezone: "America/New_York",
    created_at: now(),
    updated_at: null,
    deleted_at: null,
  });
}

seed();
