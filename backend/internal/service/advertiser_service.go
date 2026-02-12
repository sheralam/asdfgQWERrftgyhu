package service

import (
	"context"

	"github.com/car-infotainment/backend/internal/domain"
	"github.com/car-infotainment/backend/internal/ports"
)

type advertiserService struct {
	repo ports.AdvertiserRepository
}

func NewAdvertiserService(repo ports.AdvertiserRepository) ports.AdvertiserService {
	return &advertiserService{repo: repo}
}

func (s *advertiserService) CreateAdvertiser(ctx context.Context, advertiser *domain.Advertiser) error {
	return s.repo.Create(ctx, advertiser)
}

func (s *advertiserService) GetAdvertiser(ctx context.Context, id string) (*domain.Advertiser, error) {
	return s.repo.GetByID(ctx, id)
}

func (s *advertiserService) ListAdvertisers(ctx context.Context, limit, offset int) ([]*domain.Advertiser, error) {
	return s.repo.List(ctx, limit, offset)
}

func (s *advertiserService) UpdateAdvertiser(ctx context.Context, advertiser *domain.Advertiser) error {
	return s.repo.Update(ctx, advertiser)
}

func (s *advertiserService) DeleteAdvertiser(ctx context.Context, id string) error {
	return s.repo.Delete(ctx, id)
}
