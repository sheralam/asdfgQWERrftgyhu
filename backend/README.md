# Backend Service

## Car Infotainment Hello World Backend

Go-based backend service using hexagonal architecture with PostgreSQL database.

## Prerequisites

- Go 1.22 or later
- Podman and podman-compose
- Make

## Quick Start

```bash
# Start all services (postgres + backend)
make start

# View logs
make logs

# Stop services
make stop

# Restart services
make restart
```

## Available Make Commands

```bash
make help           # Show all available commands
make build          # Build the backend service
make start          # Start all services
make stop           # Stop all services
make restart        # Restart all services
make clean          # Stop services and remove volumes
make logs           # View logs from all services
make logs-backend   # View backend logs only
make logs-db        # View database logs only
make db-connect     # Connect to PostgreSQL database
make migrate-up     # Run database migrations
make migrate-down   # Rollback database migrations
make migrate-create # Create new migration (usage: make migrate-create NAME=my_migration)
make ps             # Show running containers
make test           # Run tests
make dev            # Start services and watch logs
```

## API Endpoints

- **Health Check**: `GET http://localhost:8080/health`
- **Hello World**: `GET http://localhost:8080/hello`
- **Hello Name**: `GET http://localhost:8080/hello/{name}`

## Database Configuration

Database configuration is stored in `values.yml`:

- **Host**: postgres (container name)
- **Port**: 99999 (external), 5432 (internal)
- **Database**: car_infotainment
- **User**: admin
- **Password**: admin123

## Project Structure (Hexagonal Architecture)

```
backend/
├── cmd/
│   └── api/
│       └── main.go              # Application entry point
├── internal/
│   ├── domain/                  # Domain models (entities)
│   │   └── models.go
│   ├── ports/                   # Interfaces (ports)
│   │   ├── repository.go        # Repository interfaces
│   │   └── service.go           # Service interfaces
│   ├── adapters/                # Adapters (implementations)
│   │   └── repository_postgres.go
│   └── service/                 # Business logic
│       └── advertiser_service.go
├── migrations/                  # Database migrations
│   ├── 001_init_schema.sql
│   └── 001_init_schema.down.sql
├── values.yml                   # Configuration
├── podman-compose.yml           # Container orchestration
├── Dockerfile                   # Backend container image
├── Makefile                     # Build and deployment commands
└── go.mod                       # Go dependencies
```

## Database Migrations

Run migrations after starting services:

```bash
make migrate-up
```

Create a new migration:

```bash
make migrate-create NAME=add_users_table
```

Rollback migrations:

```bash
make migrate-down
```

## Development

Run in development mode with live logs:

```bash
make dev
```

Connect to database:

```bash
make db-connect
```

## Testing

Test the Hello World endpoint:

```bash
curl http://localhost:8080/hello
# {"message":"Hello, World!"}

curl http://localhost:8080/hello/John
# {"message":"Hello, John!"}

curl http://localhost:8080/health
# {"status":"ok","message":"Service is healthy"}
```
