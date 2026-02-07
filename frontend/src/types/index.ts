// User types
export interface User {
  user_id: string
  username: string
  email: string
  first_name?: string
  last_name?: string
  role?: Role
  role_id?: string
  is_active: boolean
  is_verified: boolean
  last_login?: string
  created_at: string
  updated_at: string
}

export interface Role {
  role_id: string
  role_name: string
  role_display_name: string
  role_description?: string
  permissions: Record<string, boolean>
  is_active: boolean
  created_at: string
  updated_at: string
}

// Auth types
export interface LoginRequest {
  username: string
  password: string
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
  first_name?: string
  last_name?: string
}

export interface AuthResponse {
  access_token: string
  refresh_token?: string
  token_type: string
  expires_in: number
  user?: {
    user_id: string
    username: string
    email: string
    role: string
    first_name?: string
    last_name?: string
  }
}

// Campaign types
export interface Campaign {
  campaign_id: string
  campaign_name: string
  campaign_description?: string
  campaign_start_date: string
  campaign_end_date: string
  campaign_expiry_date?: string
  campaign_max_view_duration_value?: number
  campaign_max_view_duration_unit?: string
  campaign_max_view_count?: number
  campaign_status: 'active' | 'inactive' | 'paused' | 'draft' | 'expired'
  campaign_created_by_id: string
  created_by_name?: string
  updated_by_name?: string
  created_at: string
  updated_at: string
  audience_targeting?: AudienceTargeting[]
  ads?: Ad[]
}

export interface AudienceTargeting {
  audience_id: string
  campaign_id: string
  region: string
  country: string
  cities?: string[]
  postcodes?: string[]
  created_at: string
  updated_at: string
}

export interface CampaignCreate {
  campaign_name: string
  campaign_description?: string
  campaign_start_date: string
  campaign_end_date: string
  campaign_expiry_date?: string
  campaign_max_view_duration_value?: number
  campaign_max_view_duration_unit?: string
  campaign_max_view_count?: number
  campaign_status?: string
  audience_targeting?: Omit<AudienceTargeting, 'audience_id' | 'campaign_id' | 'created_at' | 'updated_at'>[]
}

// Ad types
export interface Ad {
  ad_id: string
  campaign_id: string
  ad_type_id: string
  ad_name: string
  ad_description?: string
  media_type: string
  media_url?: string
  media_content?: string
  ad_impression_duration_value?: number
  ad_impression_duration_unit?: string
  ad_advertiser_forwarding_url?: string
  ad_start_date?: string
  ad_end_date?: string
  ad_expiry_date?: string
  ad_in_view_duration_value?: number
  ad_in_view_duration_unit?: string
  ad_view_count: number
  ad_status: 'active' | 'inactive' | 'paused' | 'draft' | 'expired'
  ad_created_by_id: string
  created_by_name?: string
  updated_by_name?: string
  created_at: string
  updated_at: string
  time_slots?: AdTimeSlot[]
  content_rating?: AdContentRating
}

export interface AdTimeSlot {
  time_slot_id: string
  ad_id: string
  time_slot_start: string
  time_slot_end: string
  created_at: string
}

export interface AdContentRating {
  rating_id: string
  ad_id: string
  warning_required: boolean
  rating_system?: string
  rating_label?: string
  content_warnings?: string[]
  no_prohibited_content: boolean
  created_at: string
  updated_at: string
}

export interface AdCreate {
  campaign_id: string
  ad_type_id: string
  ad_name: string
  ad_description?: string
  media_type: string
  media_url?: string
  media_content?: string
  ad_impression_duration_value?: number
  ad_impression_duration_unit?: string
  ad_advertiser_forwarding_url?: string
  ad_start_date?: string
  ad_end_date?: string
  ad_expiry_date?: string
  ad_in_view_duration_value?: number
  ad_in_view_duration_unit?: string
  ad_status?: string
  time_slots?: Omit<AdTimeSlot, 'time_slot_id' | 'ad_id' | 'created_at'>[]
  content_rating?: Omit<AdContentRating, 'rating_id' | 'ad_id' | 'created_at' | 'updated_at'>
}

// Advertiser types
export interface Advertiser {
  advertiser_id: string
  advertiser_name: string
  advertiser_type: string
  address_line_1: string
  address_line_2?: string
  city: string
  state: string
  postal_code: string
  country: string
  latitude?: number
  longitude?: number
  timezone: string
  created_by_id: string
  created_at: string
  updated_at: string
  contacts?: AdvertiserContact[]
  bank_accounts?: AdvertiserBankAccount[]
}

export interface AdvertiserContact {
  contact_id: string
  advertiser_id: string
  contact_name: string
  contact_email: string
  contact_phone: string
  contact_address?: string
  contact_city?: string
  contact_state?: string
  contact_postal_code?: string
  contact_country?: string
  is_point_of_contact: boolean
  contact_type: string
  created_at: string
  updated_at: string
}

export interface AdvertiserBankAccount {
  bank_id: string
  advertiser_id: string
  bank_name: string
  bank_account_name: string
  bank_account_routing_number?: string
  bank_account_swift_code?: string
  bank_account_iban?: string
  bank_account_bic?: string
  bank_account_currency: string
  is_default: boolean
  is_verified: boolean
  is_sepa_compliant: boolean
  created_at: string
  updated_at: string
}

// Pagination types
export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  page_size: number
}
