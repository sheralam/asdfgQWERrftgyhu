.PHONY: help start stop restart build clean migrate-up migrate-down migrate-create logs db-connect

# Variables
COMPOSE_FILE := podman-compose.yml
PODMAN_MACHINE := podman-machine-default
MIGRATION_DIR := migrations

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-20s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

check-podman: ## Check if podman machine is running
	@echo "Checking podman machine status..."
	@podman machine inspect $(PODMAN_MACHINE) >/dev/null 2>&1 || (echo "Podman machine not found. Creating..." && podman machine init $(PODMAN_MACHINE))
	@podman machine start $(PODMAN_MACHINE) 2>/dev/null || echo "Podman machine already running"

build: check-podman ## Build the backend service
	@echo "Building backend service..."
	podman-compose -f $(COMPOSE_FILE) build

start: check-podman ## Start all services
	@echo "Starting services..."
	podman-compose -f $(COMPOSE_FILE) up -d
	@echo "Services started successfully!"
	@echo "Backend API: http://localhost:8080"
	@echo "PostgreSQL: localhost:99999"

stop: ## Stop all services
	@echo "Stopping services..."
	podman-compose -f $(COMPOSE_FILE) down
	@echo "Services stopped successfully!"

restart: stop start ## Restart all services

clean: stop ## Stop services and remove volumes
	@echo "Cleaning up..."
	podman-compose -f $(COMPOSE_FILE) down -v
	@echo "Cleanup complete!"

logs: ## View logs from all services
	podman-compose -f $(COMPOSE_FILE) logs -f

logs-backend: ## View backend logs
	podman-compose -f $(COMPOSE_FILE) logs -f backend

logs-db: ## View database logs
	podman-compose -f $(COMPOSE_FILE) logs -f postgres

db-connect: ## Connect to PostgreSQL database
	@echo "Connecting to database..."
	podman exec -it car-infotainment-postgres psql -U admin -d car_infotainment

migrate-up: check-podman ## Run database migrations up
	@echo "Running migrations..."
	@if [ ! -d "$(MIGRATION_DIR)" ]; then \
		echo "Error: migrations directory not found"; \
		exit 1; \
	fi
	@podman exec -it car-infotainment-postgres psql -U admin -d car_infotainment < $(MIGRATION_DIR)/001_init_schema.sql
	@echo "Migrations completed successfully!"

migrate-down: check-podman ## Rollback database migrations
	@echo "Rolling back migrations..."
	@if [ ! -d "$(MIGRATION_DIR)" ]; then \
		echo "Error: migrations directory not found"; \
		exit 1; \
	fi
	@podman exec -it car-infotainment-postgres psql -U admin -d car_infotainment < $(MIGRATION_DIR)/001_init_schema.down.sql
	@echo "Rollback completed successfully!"

migrate-create: ## Create a new migration file (usage: make migrate-create NAME=create_users_table)
	@if [ -z "$(NAME)" ]; then \
		echo "Error: NAME is required. Usage: make migrate-create NAME=create_users_table"; \
		exit 1; \
	fi
	@mkdir -p $(MIGRATION_DIR)
	@timestamp=$$(date +%Y%m%d%H%M%S); \
	touch $(MIGRATION_DIR)/$${timestamp}_$(NAME).sql; \
	touch $(MIGRATION_DIR)/$${timestamp}_$(NAME).down.sql; \
	echo "Created migration files:"; \
	echo "  - $(MIGRATION_DIR)/$${timestamp}_$(NAME).sql"; \
	echo "  - $(MIGRATION_DIR)/$${timestamp}_$(NAME).down.sql"

dev: ## Start services and watch logs
	$(MAKE) start
	$(MAKE) logs

ps: ## Show running containers
	podman-compose -f $(COMPOSE_FILE) ps

test: ## Run tests
	@echo "Running tests..."
	go test -v ./...

lint: ## Run linter
	@echo "Running linter..."
	golangci-lint run ./...
