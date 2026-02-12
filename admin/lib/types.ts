/** Types aligned to OpenAPI and database schema */

export type AdvertiserType = "individual" | "business" | "enterprise" | "agency";
export type ContactType =
  | "admin"
  | "manager"
  | "sales"
  | "support"
  | "marketing"
  | "tech"
  | "it"
  | "hr"
  | "finance"
  | "operations"
  | "technical";
export type DeviceType = "shop" | "car" | "house";
export type DeviceRating = "economy" | "standard" | "premium" | "luxury";
export type DisplaySize = "s" | "m" | "l" | "xl" | "xxl";
export type StatusEnum = "active" | "inactive" | "paused" | "draft" | "expired";
export type AgeGroup = "0-5" | "6-12" | "13-18" | "19-35" | "36-55" | "55+";
export type DeviceGroupStatus = "active" | "deleted" | "paused";

export interface GeoPoint {
  latitude?: number;
  longitude?: number;
}

export interface PaginationMeta {
  total_count: number;
  limit: number;
  offset: number;
}

export interface ErrorDetail {
  code?: string;
  field?: string;
  message?: string;
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: ErrorDetail[];
  };
}

// Advertiser
export interface Advertiser {
  advertiser_id: string;
  advertiser_code: string;
  advertiser_name: string;
  advertiser_type: AdvertiserType;
  address_line_1: string;
  address_line_2?: string | null;
  city: string;
  state_province: string;
  postal_code: string;
  country: string;
  location?: GeoPoint | null;
  timezone: string;
  created_at: string;
  updated_at?: string | null;
  created_by_id?: string | null;
  updated_by_id?: string | null;
  deleted_at?: string | null;
}

export interface AdvertiserCreate {
  advertiser_code: string;
  advertiser_name: string;
  advertiser_type: AdvertiserType;
  address_line_1: string;
  address_line_2?: string | null;
  city: string;
  state_province: string;
  postal_code: string;
  country: string;
  location?: GeoPoint | null;
  timezone: string;
}

export interface AdvertiserUpdate extends Partial<AdvertiserCreate> {}

export interface AdvertiserContact {
  contact_id: string;
  advertiser_id: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  contact_address?: string | null;
  contact_city?: string | null;
  contact_state?: string | null;
  contact_postal_code?: string | null;
  contact_country?: string | null;
  contact_type: ContactType;
  is_point_of_contact: boolean;
  created_at: string;
  updated_at?: string | null;
  deleted_at?: string | null;
}

export interface AdvertiserContactCreate {
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  contact_address?: string | null;
  contact_city?: string | null;
  contact_state?: string | null;
  contact_postal_code?: string | null;
  contact_country?: string | null;
  contact_type: ContactType;
  is_point_of_contact?: boolean;
}

export interface AdvertiserContactUpdate extends Partial<AdvertiserContactCreate> {}

export interface AdvertiserBankAccount {
  bank_id: string;
  advertiser_id: string;
  bank_name: string;
  bank_account_number: string;
  bank_account_name: string;
  bank_account_routing_number?: string | null;
  bank_account_swift_code?: string | null;
  bank_account_iban?: string | null;
  bank_account_bic?: string | null;
  bank_account_currency: string;
  is_default: boolean;
  is_verified: boolean;
  is_sepa_compliant: boolean;
  created_at: string;
  updated_at?: string | null;
  deleted_at?: string | null;
}

export interface AdvertiserBankAccountCreate {
  bank_name: string;
  bank_account_number: string;
  bank_account_name: string;
  bank_account_routing_number?: string | null;
  bank_account_swift_code?: string | null;
  bank_account_iban?: string | null;
  bank_account_bic?: string | null;
  bank_account_currency: string;
  is_default?: boolean;
  is_verified?: boolean;
  is_sepa_compliant?: boolean;
}

export interface AdvertiserBankAccountUpdate extends Partial<AdvertiserBankAccountCreate> {}

// Host
export interface Host {
  host_id: string;
  host_name: string;
  target_audience_age_group?: AgeGroup | null;
  address_line_1: string;
  address_line_2?: string | null;
  city: string;
  state_province: string;
  postal_code: string;
  country: string;
  location?: GeoPoint | null;
  timezone: string;
  created_at: string;
  updated_at?: string | null;
  created_by_id?: string | null;
  updated_by_id?: string | null;
  deleted_at?: string | null;
}

export interface HostCreate {
  host_name: string;
  target_audience_age_group?: AgeGroup | null;
  address_line_1: string;
  address_line_2?: string | null;
  city: string;
  state_province: string;
  postal_code: string;
  country: string;
  location?: GeoPoint | null;
  timezone: string;
}

export interface HostUpdate extends Partial<HostCreate> {}

export interface HostContact {
  contact_id: string;
  host_id: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  contact_type: ContactType;
  is_point_of_contact: boolean;
  contact_address?: string | null;
  contact_city?: string | null;
  contact_state?: string | null;
  contact_postal_code?: string | null;
  contact_country?: string | null;
  created_at: string;
  updated_at?: string | null;
  deleted_at?: string | null;
}

export interface HostContactCreate {
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  contact_type: ContactType;
  is_point_of_contact?: boolean;
  contact_address?: string | null;
  contact_city?: string | null;
  contact_state?: string | null;
  contact_postal_code?: string | null;
  contact_country?: string | null;
}

export interface HostContactUpdate extends Partial<HostContactCreate> {}

export interface HostBankAccount {
  bank_id: string;
  host_id: string;
  bank_name: string;
  bank_account_number: string;
  bank_account_name: string;
  bank_account_currency: string;
  is_default: boolean;
  is_verified: boolean;
  is_sepa_compliant: boolean;
  created_at: string;
  updated_at?: string | null;
  deleted_at?: string | null;
}

export interface HostBankAccountCreate {
  bank_name: string;
  bank_account_number: string;
  bank_account_name: string;
  bank_account_currency: string;
  is_default?: boolean;
  is_verified?: boolean;
  is_sepa_compliant?: boolean;
}

export interface HostBankAccountUpdate extends Partial<HostBankAccountCreate> {}

export interface DeviceGroup {
  id: string;
  host_id: string;
  group_name: string;
  status: DeviceGroupStatus;
  created_at: string;
  updated_at?: string | null;
  created_by_id?: string | null;
  updated_by_id?: string | null;
}

export interface DeviceGroupCreate {
  group_name: string;
  status?: DeviceGroupStatus;
}

export interface DeviceGroupUpdate {
  group_name?: string;
  status?: DeviceGroupStatus;
}

// Device
export interface Device {
  device_id: string;
  host_id: string;
  device_group_id?: string | null;
  device_type: DeviceType;
  device_rating: DeviceRating;
  display_size: DisplaySize;
  avg_idle_time: number;
  avg_visitors_count: number;
  address_line_1: string;
  address_line_2?: string | null;
  city: string;
  state_province: string;
  postal_code: string;
  country: string;
  timezone: string;
  location?: GeoPoint | null;
  created_at: string;
  updated_at?: string | null;
  deleted_at?: string | null;
  details?: DeviceDetails | null;
}

export interface DeviceDetails {
  device_id: string;
  hardware_specifications?: string | null;
  vendor_specification?: string | null;
  vendor_name?: string | null;
  vendor_part_number?: string | null;
  vendor_serial_number?: string | null;
  purchasing_details?: string | null;
  purchase_date?: string | null;
  purchase_order_number?: string | null;
  warranty_expiry_date?: string | null;
  purchase_price?: number | null;
  currency?: string | null;
  price_notes?: string | null;
  notes?: string | null;
  serial_number?: string | null;
  model_number?: string | null;
  firmware_version?: string | null;
  installed_date?: string | null;
  last_maintenance_date?: string | null;
  created_at: string;
  updated_at?: string | null;
}

export interface DeviceDetailsCreate {
  hardware_specifications?: string | null;
  vendor_name?: string | null;
  vendor_part_number?: string | null;
  vendor_serial_number?: string | null;
  purchasing_details?: string | null;
  purchase_date?: string | null;
  purchase_order_number?: string | null;
  warranty_expiry_date?: string | null;
  purchase_price?: number | null;
  currency?: string | null;
  price_notes?: string | null;
  notes?: string | null;
  serial_number?: string | null;
  model_number?: string | null;
  firmware_version?: string | null;
  installed_date?: string | null;
  last_maintenance_date?: string | null;
}

export interface DeviceDetailsUpdate extends Partial<DeviceDetailsCreate> {}

// Campaign (mock - not in OpenAPI)
export type CampaignStatus = StatusEnum;

export interface Campaign {
  campaign_id: string;
  campaign_code: string;
  advertiser_id: string;
  campaign_name: string;
  campaign_description?: string | null;
  country: string;
  city: string;
  postcode: string;
  campaign_start_date: string;
  campaign_end_date: string;
  campaign_expiry_date?: string | null;
  campaign_max_view_duration?: { value: number; unit: string } | null;
  campaign_max_view_count?: number | null;
  campaign_status: CampaignStatus;
  created_at: string;
  updated_at?: string | null;
  created_by_id?: string | null;
  created_by_name?: string | null;
  updated_by_id?: string | null;
  updated_by_name?: string | null;
  deleted_at?: string | null;
}

export interface CampaignCreate {
  campaign_code: string;
  advertiser_id: string;
  campaign_name: string;
  campaign_description?: string | null;
  country: string;
  city: string;
  postcode: string;
  campaign_start_date: string;
  campaign_end_date: string;
  campaign_expiry_date?: string | null;
  campaign_max_view_duration?: { value: number; unit: string } | null;
  campaign_max_view_count?: number | null;
  campaign_status?: CampaignStatus;
}

export interface CampaignUpdate extends Partial<CampaignCreate> {}

// Ad (mock)
export type AdPosition =
  | "top_bar_ad"
  | "bottom_left_ad"
  | "bottom_right_ad"
  | "bottom_center_ad"
  | "center_right_content_ad"
  | "center_left_content_ad";
export type AdType = "image_only_ad" | "multimedia_ad";
export type MediaType =
  | "text"
  | "image"
  | "gif"
  | "video"
  | "html"
  | "news_rss"
  | "events"
  | "breaking_news"
  | "alerts";
export type MpaaRating = "G" | "PG" | "PG-13" | "R" | "NC-17";
export type EsrbRating = "E" | "E10+" | "T" | "M" | "AO";

export interface Ad {
  ad_id: string;
  ad_code: string;
  campaign_id: string;
  ad_name: string;
  ad_description?: string | null;
  country?: string | null;
  city?: string | null;
  postcode?: string | null;
  ad_position: AdPosition;
  ad_type: AdType;
  ad_start_date: string;
  ad_end_date: string;
  ad_expiry_date?: string | null;
  ad_in_view_duration?: { value: number; unit: string } | null;
  ad_view_count?: number;
  ad_status: StatusEnum;
  created_at: string;
  updated_at?: string | null;
  created_by_id?: string | null;
  created_by_name?: string | null;
  updated_by_id?: string | null;
  updated_by_name?: string | null;
  deleted_at?: string | null;
  content?: AdContent | null;
  time_slots?: AdTimeSlot[];
  content_ratings?: AdContentRatings | null;
}

export interface AdContent {
  content_id: string;
  ad_id: string;
  media_type: MediaType;
  media_content: string;
  ad_impression_duration: { value: number; unit: string };
  alloted_max_impression_count?: number | null;
  ad_advertiser_forwarding_url?: string | null;
}

export interface AdTimeSlot {
  time_slot_id: string;
  ad_id: string;
  time_slot_start: string;
  time_slot_end: string;
}

export interface AdContentRatings {
  rating_id: string;
  ad_id: string;
  mpaa_rating?: MpaaRating | null;
  esrb_rating?: EsrbRating | null;
  warning_required?: boolean;
  content_warnings?: unknown[];
  no_prohibited_content?: boolean;
}

export interface AdCreate {
  ad_code: string;
  campaign_id: string;
  ad_name: string;
  ad_description?: string | null;
  ad_position: AdPosition;
  ad_type: AdType;
  ad_start_date: string;
  ad_end_date: string;
  ad_status?: StatusEnum;
  content?: AdContentCreate;
  time_slots?: AdTimeSlotCreate[];
  content_ratings?: AdContentRatingsCreate;
}

export interface AdContentCreate {
  media_type: MediaType;
  media_content: string;
  ad_impression_duration: { value: number; unit: string };
  alloted_max_impression_count?: number | null;
  ad_advertiser_forwarding_url?: string | null;
}

export interface AdTimeSlotCreate {
  time_slot_start: string;
  time_slot_end: string;
}

export interface AdContentRatingsCreate {
  mpaa_rating?: MpaaRating | null;
  esrb_rating?: EsrbRating | null;
  warning_required?: boolean;
  content_warnings?: unknown[];
  no_prohibited_content?: boolean;
}

export interface AdUpdate extends Partial<Omit<AdCreate, "campaign_id">> {}

// List responses
export interface AdvertiserListResponse {
  data: Advertiser[];
  meta: PaginationMeta;
}

export interface AdvertiserContactListResponse {
  data: AdvertiserContact[];
  meta: PaginationMeta;
}

export interface AdvertiserBankAccountListResponse {
  data: AdvertiserBankAccount[];
  meta: PaginationMeta;
}

export interface HostListResponse {
  data: Host[];
  meta: PaginationMeta;
}

export interface HostContactListResponse {
  data: HostContact[];
  meta: PaginationMeta;
}

export interface HostBankAccountListResponse {
  data: HostBankAccount[];
  meta: PaginationMeta;
}

export interface DeviceGroupListResponse {
  data: DeviceGroup[];
  meta: PaginationMeta;
}

export interface DeviceListResponse {
  data: Device[];
  meta: PaginationMeta;
}

export interface CampaignListResponse {
  data: Campaign[];
  meta: PaginationMeta;
}

export interface AdListResponse {
  data: Ad[];
  meta: PaginationMeta;
}
