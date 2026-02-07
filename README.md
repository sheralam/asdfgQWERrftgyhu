# Campaign Studio

A comprehensive Content Management System (CMS) for creating and managing advertising campaigns for car infotainment systems.

## Overview

Campaign Studio is a full-stack application that enables advertisers and content managers to create, manage, and deploy advertising campaigns across car infotainment systems. The system supports multiple ad types, audience targeting, content ratings, and comprehensive user management.

## Features

### Campaign Management
- Create and manage advertising campaigns
- Set campaign dates and expiry
- Define view duration and count limits
- Campaign status management (active, inactive, paused, draft, expired)
- Audience targeting by region, country, city, and postcode

### Ad Management
- Support for 6 ad types:
  - Top Bar Ad
  - Bottom Left/Right/Center Ad
  - Center Left/Right Content Ad
- Multiple media types (image, video, HTML)
- Time-slot based ad scheduling (15-minute intervals)
- Content rating system (MPAA and ESRB)
- View count tracking

### Advertiser Management
- Manage advertiser profiles
- Multiple contact types
- Encrypted bank account information
- Geographic location tracking

### User Management
- Role-based access control:
  - System Admin
  - App Admin
  - Campaign Manager
  - Content Moderator
- JWT-based authentication
- User activity tracking

### Audit & Security
- Comprehensive audit logging
- Field-level encryption for sensitive data
- Token-based authentication with auto-refresh
- CORS configuration

## Technology Stack

### Backend
- **Language**: Python 3.11+
- **Framework**: FastAPI
- **Database**: PostgreSQL 15+
- **ORM**: SQLAlchemy 2.0+
- **Validation**: Pydantic v2
- **Authentication**: JWT (python-jose)
- **Migrations**: Alembic

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **UI Library**: Material-UI (MUI) v5
- **State Management**: Zustand + TanStack React Query
- **Form Management**: React Hook Form + Zod
- **Routing**: React Router v6

## Project Structure

```
car-infotainment/
├── backend/                    # Python FastAPI backend
│   ├── alembic/                # Database migrations
│   ├── app/
│   │   ├── models/             # SQLAlchemy models
│   │   ├── schemas/            # Pydantic schemas
│   │   ├── routers/            # API routes
│   │   ├── services/           # Business logic
│   │   ├── utils/              # Utilities
│   │   ├── middleware/         # Custom middleware
│   │   ├── config.py           # Configuration
│   │   ├── database.py         # Database setup
│   │   ├── dependencies.py     # FastAPI dependencies
│   │   └── main.py             # Application entry
│   ├── requirements.txt
│   └── README.md
├── frontend/                   # React TypeScript frontend
│   ├── src/
│   │   ├── components/         # Reusable components
│   │   ├── lib/                # Libraries and utilities
│   │   ├── pages/              # Page components
│   │   ├── store/              # State management
│   │   ├── types/              # TypeScript types
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── theme.ts
│   ├── package.json
│   └── README.md
├── project configuration/      # YAML configuration files
│   ├── project.yaml
│   ├── actors.yaml
│   ├── roles.yaml
│   ├── ad_types.yaml
│   ├── campaign_configurations.yaml
│   └── values.yaml
└── specs/                      # Detailed specifications
    └── campaign_studio/
        ├── 01-system-overview.md
        ├── 02-data-models-and-schema.md
        ├── 03-backend-specification.md
        ├── 04-frontend-specification.md
        ├── 05-api-endpoints.md
        ├── 06-authentication-authorization.md
        └── 07-deployment-guide.md
```

## Quick Start

### Prerequisites
- Python 3.11+
- Node.js 20+
- PostgreSQL 15+

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create database:
```bash
createdb campaign-studio
```

5. Copy and configure environment:
```bash
cp env.example .env
# Edit .env with your configuration
```

6. Run migrations:
```bash
alembic upgrade head
```

7. Start development server:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend API will be available at http://localhost:8000
API Documentation: http://localhost:8000/api/docs

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Copy and configure environment:
```bash
cp env.example .env
# Edit .env if needed (default backend URL is already set)
```

4. Start development server:
```bash
npm run dev
```

Frontend will be available at http://localhost:5173

## API Documentation

Once the backend is running, access the interactive API documentation:
- **Swagger UI**: http://localhost:8000/api/docs
- **ReDoc**: http://localhost:8000/api/redoc

## Configuration

### Backend Configuration (backend/.env)
```bash
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=campaign-studio
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres

# Security
SECRET_KEY=<your-secret-key-min-32-chars>
ENCRYPTION_KEY=<your-encryption-key-32-chars>

# CORS
CORS_ORIGINS=["http://localhost:5173"]
```

### Frontend Configuration (frontend/.env)
```bash
VITE_API_BASE_URL=http://localhost:8000/api
VITE_APP_NAME=Campaign Studio
```

## Database Migrations

```bash
# Create new migration
cd backend
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head

# Rollback last migration
alembic downgrade -1
```

## Testing

### Backend Tests
```bash
cd backend
pytest
```

### Frontend Tests
```bash
cd frontend
npm run test
```

## Deployment

Refer to the comprehensive deployment guide:
- [Deployment Guide](./specs/campaign_studio/07-deployment-guide.md)

Includes instructions for:
- Docker deployment
- Production configuration
- Nginx setup
- SSL/TLS configuration
- Monitoring and logging

## Documentation

Detailed documentation is available in the `specs/campaign_studio/` directory:

1. [System Overview](./specs/campaign_studio/01-system-overview.md)
2. [Data Models and Schema](./specs/campaign_studio/02-data-models-and-schema.md)
3. [Backend Specification](./specs/campaign_studio/03-backend-specification.md)
4. [Frontend Specification](./specs/campaign_studio/04-frontend-specification.md)
5. [API Endpoints](./specs/campaign_studio/05-api-endpoints.md)
6. [Authentication & Authorization](./specs/campaign_studio/06-authentication-authorization.md)
7. [Deployment Guide](./specs/campaign_studio/07-deployment-guide.md)

## Security

- JWT-based authentication with access and refresh tokens
- Password hashing using bcrypt
- Field-level encryption for sensitive data (bank accounts)
- Role-based access control (RBAC)
- CORS protection
- SQL injection prevention via ORM
- XSS protection via input validation

## License

Proprietary - All rights reserved

## Support

For questions or issues, refer to the detailed specifications in the `specs/` directory or contact the development team.
