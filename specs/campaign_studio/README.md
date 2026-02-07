# Campaign Studio Specifications

This directory contains comprehensive specifications for the Campaign Studio system - a CMS for creating and managing advertising campaigns for car infotainment systems.

## Overview

Campaign Studio is a full-stack application consisting of:
- **Backend**: Python REST API for data management and business logic
- **Frontend**: Node.js/React application for the Campaign Studio UI

## Documentation Structure

```
specs/
├── README.md                          # This file
├── 01-system-overview.md             # High-level system architecture
├── 02-data-models-and-schema.md      # Database schema and data models
├── 03-backend-specification.md        # Python backend API specification
├── 04-frontend-specification.md       # Node.js/React frontend specification
├── 05-api-endpoints.md               # Detailed API endpoint documentation
├── 06-authentication-authorization.md # Auth and permissions
└── 07-deployment-guide.md            # Setup and deployment instructions
```

## Project Configuration

The system configuration files are located in the `project configuration/` directory:

```
project configuration/
├── project.yaml                      # Main project configuration file
├── actors.yaml                       # Actor definitions and properties
├── roles.yaml                        # User roles and permissions
├── ad_types.yaml                     # Advertisement type definitions
├── campaign_configurations.yaml      # Campaign configuration settings
└── values.yaml                       # System-wide values and constants
```

These YAML files define the core data structures, actors, roles, and configurations used throughout the Campaign Studio system.

## Key Features

- **Campaign Management**: Create, read, update, delete campaigns
- **Ad Management**: Support for 6 ad types (4 image-only, 2 multimedia)
- **Role-Based Access Control**: System Admin, App Admin, Campaign Manager, Content Moderator
- **Advertiser Management**: Manage advertiser information and relationships
- **Audience Targeting**: Region, country, city, and postcode-level targeting
- **Content Rating System**: MPAA and ESRB rating support with content warnings
- **Time-based Scheduling**: Configure ad display times in 15-minute intervals

## Technology Stack

### Backend
- **Language**: Python 3.11+
- **Framework**: FastAPI
- **Database**: PostgreSQL 15+
- **ORM**: SQLAlchemy 2.0+
- **Validation**: Pydantic v2
- **Authentication**: JWT-based auth
- **Testing**: pytest

### Frontend
- **Runtime**: Node.js 20+
- **Framework**: React 18+
- **Build Tool**: Vite
- **State Management**: React Query + Zustand
- **UI Library**: Material-UI (MUI) v5
- **Form Management**: React Hook Form + Zod
- **Routing**: React Router v6
- **Testing**: Vitest + React Testing Library

## Getting Started

1. Review the project configuration files in `project configuration/` directory to understand the system's data structures
2. Read the [System Overview](./01-system-overview.md) for high-level architecture
3. Review [Data Models and Schema](./02-data-models-and-schema.md) for database design
4. Follow [Backend Specification](./03-backend-specification.md) to set up the API
5. Follow [Frontend Specification](./04-frontend-specification.md) to set up the UI
6. Refer to [API Endpoints](./05-api-endpoints.md) for integration details
7. Review [Authentication & Authorization](./06-authentication-authorization.md) for security
8. Use [Deployment Guide](./07-deployment-guide.md) for production setup

## Quick Start Commands

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python -m alembic upgrade head
python -m uvicorn app.main:app --reload
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## Project Standards

- Follow UNIX-style commit message conventions
- Use proper type hints in Python code
- Follow React best practices and hooks guidelines
- Write comprehensive tests for all features
- Document all API endpoints with OpenAPI/Swagger
- Use environment variables for configuration
- Never commit secrets or credentials

## Support

For questions or issues, refer to the detailed specifications in this directory.
