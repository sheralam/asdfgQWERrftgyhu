package domain

import (
	"time"

	"github.com/google/uuid"
)

// Advertiser represents an advertiser entity
type Advertiser struct {
	ID            uuid.UUID  `json:"advertiser_id"`
	Code          string     `json:"advertiser_code"`
	Name          string     `json:"advertiser_name"`
	Type          string     `json:"advertiser_type"`
	AddressLine1  string     `json:"address_line_1"`
	AddressLine2  *string    `json:"address_line_2,omitempty"`
	City          string     `json:"city"`
	StateProvince string     `json:"state_province"`
	PostalCode    string     `json:"postal_code"`
	Country       string     `json:"country"`
	Latitude      *float64   `json:"latitude,omitempty"`
	Longitude     *float64   `json:"longitude,omitempty"`
	Timezone      string     `json:"timezone"`
	CreatedAt     time.Time  `json:"created_at"`
	UpdatedAt     *time.Time `json:"updated_at,omitempty"`
	DeletedAt     *time.Time `json:"deleted_at,omitempty"`
}

// Campaign represents a campaign entity
type Campaign struct {
	ID               uuid.UUID  `json:"campaign_id"`
	Code             string     `json:"campaign_code"`
	AdvertiserID     uuid.UUID  `json:"advertiser_id"`
	Name             string     `json:"campaign_name"`
	Description      *string    `json:"campaign_description,omitempty"`
	Country          string     `json:"country"`
	City             string     `json:"city"`
	Postcode         string     `json:"postcode"`
	StartDate        string     `json:"campaign_start_date"`
	EndDate          string     `json:"campaign_end_date"`
	ExpiryDate       *string    `json:"campaign_expiry_date,omitempty"`
	MaxViewDuration  *string    `json:"campaign_max_view_duration,omitempty"`
	MaxViewCount     *int       `json:"campaign_max_view_count,omitempty"`
	Status           string     `json:"campaign_status"`
	CreatedAt        time.Time  `json:"created_at"`
	UpdatedAt        *time.Time `json:"updated_at,omitempty"`
	DeletedAt        *time.Time `json:"deleted_at,omitempty"`
}

// Device represents a device entity
type Device struct {
	ID              uuid.UUID  `json:"device_id"`
	HostID          uuid.UUID  `json:"host_id"`
	DeviceGroupID   *uuid.UUID `json:"device_group_id,omitempty"`
	Type            string     `json:"device_type"`
	Rating          string     `json:"device_rating"`
	DisplaySize     string     `json:"display_size"`
	AvgIdleTime     int        `json:"avg_idle_time"`
	AvgVisitorCount int        `json:"avg_visitors_count"`
	AddressLine1    string     `json:"address_line_1"`
	AddressLine2    *string    `json:"address_line_2,omitempty"`
	City            string     `json:"city"`
	StateProvince   string     `json:"state_province"`
	PostalCode      string     `json:"postal_code"`
	Country         string     `json:"country"`
	Timezone        string     `json:"timezone"`
	Latitude        *float64   `json:"latitude,omitempty"`
	Longitude       *float64   `json:"longitude,omitempty"`
	CreatedAt       time.Time  `json:"created_at"`
	UpdatedAt       *time.Time `json:"updated_at,omitempty"`
	DeletedAt       *time.Time `json:"deleted_at,omitempty"`
}
