package ports

import (
	"context"

	"github.com/car-infotainment/backend/internal/domain"
)

// AdvertiserRepository defines the interface for advertiser data access
type AdvertiserRepository interface {
	Create(ctx context.Context, advertiser *domain.Advertiser) error
	GetByID(ctx context.Context, id string) (*domain.Advertiser, error)
	List(ctx context.Context, limit, offset int) ([]*domain.Advertiser, error)
	Update(ctx context.Context, advertiser *domain.Advertiser) error
	Delete(ctx context.Context, id string) error
}

// CampaignRepository defines the interface for campaign data access
type CampaignRepository interface {
	Create(ctx context.Context, campaign *domain.Campaign) error
	GetByID(ctx context.Context, id string) (*domain.Campaign, error)
	List(ctx context.Context, limit, offset int) ([]*domain.Campaign, error)
	Update(ctx context.Context, campaign *domain.Campaign) error
	Delete(ctx context.Context, id string) error
}

// DeviceRepository defines the interface for device data access
type DeviceRepository interface {
	Create(ctx context.Context, device *domain.Device) error
	GetByID(ctx context.Context, id string) (*domain.Device, error)
	List(ctx context.Context, limit, offset int) ([]*domain.Device, error)
	Update(ctx context.Context, device *domain.Device) error
	Delete(ctx context.Context, id string) error
}
