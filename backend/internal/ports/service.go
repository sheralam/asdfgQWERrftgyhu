package ports

import (
	"context"

	"github.com/car-infotainment/backend/internal/domain"
)

// AdvertiserService defines the business logic interface for advertisers
type AdvertiserService interface {
	CreateAdvertiser(ctx context.Context, advertiser *domain.Advertiser) error
	GetAdvertiser(ctx context.Context, id string) (*domain.Advertiser, error)
	ListAdvertisers(ctx context.Context, limit, offset int) ([]*domain.Advertiser, error)
	UpdateAdvertiser(ctx context.Context, advertiser *domain.Advertiser) error
	DeleteAdvertiser(ctx context.Context, id string) error
}

// CampaignService defines the business logic interface for campaigns
type CampaignService interface {
	CreateCampaign(ctx context.Context, campaign *domain.Campaign) error
	GetCampaign(ctx context.Context, id string) (*domain.Campaign, error)
	ListCampaigns(ctx context.Context, limit, offset int) ([]*domain.Campaign, error)
	UpdateCampaign(ctx context.Context, campaign *domain.Campaign) error
	DeleteCampaign(ctx context.Context, id string) error
}
