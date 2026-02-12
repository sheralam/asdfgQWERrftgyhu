package adapters

import (
	"context"
	"database/sql"
	"time"

	"github.com/car-infotainment/backend/internal/domain"
	"github.com/google/uuid"
	_ "github.com/lib/pq"
)

type PostgresAdvertiserRepository struct {
	db *sql.DB
}

func NewPostgresAdvertiserRepository(db *sql.DB) *PostgresAdvertiserRepository {
	return &PostgresAdvertiserRepository{db: db}
}

func (r *PostgresAdvertiserRepository) Create(ctx context.Context, advertiser *domain.Advertiser) error {
	advertiser.ID = uuid.New()
	advertiser.CreatedAt = time.Now()

	query := `
		INSERT INTO advertisers (
			advertiser_id, advertiser_code, advertiser_name, advertiser_type,
			address_line_1, address_line_2, city, state_province, postal_code,
			country, latitude, longitude, timezone, created_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
	`

	_, err := r.db.ExecContext(ctx, query,
		advertiser.ID, advertiser.Code, advertiser.Name, advertiser.Type,
		advertiser.AddressLine1, advertiser.AddressLine2, advertiser.City,
		advertiser.StateProvince, advertiser.PostalCode, advertiser.Country,
		advertiser.Latitude, advertiser.Longitude, advertiser.Timezone,
		advertiser.CreatedAt,
	)

	return err
}

func (r *PostgresAdvertiserRepository) GetByID(ctx context.Context, id string) (*domain.Advertiser, error) {
	query := `
		SELECT advertiser_id, advertiser_code, advertiser_name, advertiser_type,
			address_line_1, address_line_2, city, state_province, postal_code,
			country, latitude, longitude, timezone, created_at, updated_at, deleted_at
		FROM advertisers
		WHERE advertiser_id = $1 AND deleted_at IS NULL
	`

	advertiser := &domain.Advertiser{}
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&advertiser.ID, &advertiser.Code, &advertiser.Name, &advertiser.Type,
		&advertiser.AddressLine1, &advertiser.AddressLine2, &advertiser.City,
		&advertiser.StateProvince, &advertiser.PostalCode, &advertiser.Country,
		&advertiser.Latitude, &advertiser.Longitude, &advertiser.Timezone,
		&advertiser.CreatedAt, &advertiser.UpdatedAt, &advertiser.DeletedAt,
	)

	if err == sql.ErrNoRows {
		return nil, nil
	}

	return advertiser, err
}

func (r *PostgresAdvertiserRepository) List(ctx context.Context, limit, offset int) ([]*domain.Advertiser, error) {
	query := `
		SELECT advertiser_id, advertiser_code, advertiser_name, advertiser_type,
			address_line_1, city, state_province, postal_code, country,
			timezone, created_at
		FROM advertisers
		WHERE deleted_at IS NULL
		ORDER BY created_at DESC
		LIMIT $1 OFFSET $2
	`

	rows, err := r.db.QueryContext(ctx, query, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var advertisers []*domain.Advertiser
	for rows.Next() {
		advertiser := &domain.Advertiser{}
		err := rows.Scan(
			&advertiser.ID, &advertiser.Code, &advertiser.Name, &advertiser.Type,
			&advertiser.AddressLine1, &advertiser.City, &advertiser.StateProvince,
			&advertiser.PostalCode, &advertiser.Country, &advertiser.Timezone,
			&advertiser.CreatedAt,
		)
		if err != nil {
			return nil, err
		}
		advertisers = append(advertisers, advertiser)
	}

	return advertisers, rows.Err()
}

func (r *PostgresAdvertiserRepository) Update(ctx context.Context, advertiser *domain.Advertiser) error {
	now := time.Now()
	advertiser.UpdatedAt = &now

	query := `
		UPDATE advertisers
		SET advertiser_name = $2, advertiser_type = $3, address_line_1 = $4,
			city = $5, state_province = $6, postal_code = $7, country = $8,
			timezone = $9, updated_at = $10
		WHERE advertiser_id = $1 AND deleted_at IS NULL
	`

	_, err := r.db.ExecContext(ctx, query,
		advertiser.ID, advertiser.Name, advertiser.Type, advertiser.AddressLine1,
		advertiser.City, advertiser.StateProvince, advertiser.PostalCode,
		advertiser.Country, advertiser.Timezone, advertiser.UpdatedAt,
	)

	return err
}

func (r *PostgresAdvertiserRepository) Delete(ctx context.Context, id string) error {
	now := time.Now()
	query := `UPDATE advertisers SET deleted_at = $2 WHERE advertiser_id = $1`
	_, err := r.db.ExecContext(ctx, query, id, now)
	return err
}
