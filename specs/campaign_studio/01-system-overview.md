# System Overview - Campaign Studio

## 1. Introduction

Campaign Studio is a comprehensive content management system (CMS) designed for creating, managing, and deploying advertising campaigns for car infotainment systems. The system enables Campaign Managers to configure targeted advertisements across multiple regions, countries, cities, and postcodes.

### Configuration Files

The system's core configurations are defined in YAML files located in the `project configuration/` directory:
- `project.yaml` - Main project metadata and references
- `actors.yaml` - Advertiser and actor definitions
- `roles.yaml` - User role definitions and permissions
- `ad_types.yaml` - Advertisement type specifications
- `campaign_configurations.yaml` - Campaign configuration options
- `values.yaml` - System-wide constants and values

These configuration files provide standardized definitions that are used across the backend and frontend implementations.

## 2. System Purpose

The Car Infotainment System manages campaigns and advertisements displayed in vehicle entertainment systems. Campaign Studio provides:

- Centralized campaign creation and management
- Multi-format ad support (images, videos, HTML, RSS feeds, alerts)
- Granular audience targeting (region → country → city → postcode)
- Content rating and moderation workflows
- Time-based scheduling and duration controls
- Role-based access control for different user types

## 3. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Campaign Studio UI                       │
│                  (React Frontend - Port 5173)                │
│  - Campaign Management Interface                             │
│  - Ad Creation and Editing Forms                             │
│  - Dashboard and Analytics                                   │
│  - User Management                                           │
└─────────────────────┬───────────────────────────────────────┘
                      │ HTTP/REST API
                      │ (JSON)
┌─────────────────────▼───────────────────────────────────────┐
│                   Backend API Server                         │
│              (Python FastAPI - Port 8000)                    │
│  - RESTful API Endpoints                                     │
│  - Business Logic                                            │
│  - Authentication & Authorization                            │
│  - Data Validation                                           │
└─────────────────────┬───────────────────────────────────────┘
                      │ SQL Queries
                      │ (SQLAlchemy ORM)
┌─────────────────────▼───────────────────────────────────────┐
│                  PostgreSQL Database                         │
│                     (Port 5432)                              │
│  - Campaigns, Ads, Advertisers                               │
│  - Users, Roles, Permissions                                 │
│  - Content Ratings, Audit Logs                               │
└─────────────────────────────────────────────────────────────┘
```

## 4. Core Components

### 4.1 Frontend (Campaign Studio UI)

**Technology**: React 18 + Vite + Material-UI

**Responsibilities**:
- Render intuitive campaign creation and editing interfaces
- Validate user input before submission
- Display campaign lists with filtering and search
- Provide real-time feedback and error handling
- Manage authentication state and user sessions

**Key Pages**:
- Dashboard (overview of campaigns)
- Campaign List (paginated, searchable)
- Campaign Create/Edit (multi-step form)
- Ad Management (within campaign)
- Advertiser Management
- User Management (admin only)

### 4.2 Backend (Python API)

**Technology**: Python 3.11+ + FastAPI + SQLAlchemy + PostgreSQL

**Responsibilities**:
- Expose RESTful API endpoints
- Implement business logic and validation
- Manage database transactions
- Handle authentication and authorization
- Enforce role-based access control
- Generate audit logs

**Key Modules**:
- Campaign Management
- Ad Management
- Advertiser Management
- User & Role Management
- Authentication & Authorization
- Content Rating & Moderation

### 4.3 Database (PostgreSQL)

**Technology**: PostgreSQL 15+

**Responsibilities**:
- Store all application data
- Enforce data integrity constraints
- Support complex queries and relationships
- Maintain audit trails

**Key Tables**:
- `users` - System users
- `roles` - User roles and permissions
- `campaigns` - Campaign master data
- `ads` - Advertisement data
- `advertisers` - Advertiser information
- `audience_targeting` - Geographic targeting data
- `content_ratings` - Content rating metadata
- `audit_logs` - System activity logs

## 5. User Roles and Access

### 5.1 System Admin (Level 1)
- Full system access
- Manage all users and permissions
- Configure system settings
- Access all campaigns and data

### 5.2 App Admin (Level 2)
- Manage application components
- Create and manage users (excluding system admins)
- Access all campaigns
- Configure application settings

### 5.3 Campaign Manager (Level 3)
- Create, edit, delete campaigns
- Manage ads within campaigns
- Manage advertiser information
- View campaign analytics
- Primary target user for Campaign Studio

### 5.4 Content Moderator (Level 4)
- Review submitted content
- Approve or reject campaigns/ads
- Assign content ratings
- Enforce content policies

### 5.5 User (Level 5)
- View campaigns (read-only)
- Basic interaction capabilities

### 5.6 Guest (Level 6)
- View public content only
- No campaign management access

## 6. Data Flow

### 6.1 Campaign Creation Flow

```
1. Campaign Manager logs into Campaign Studio UI
2. Navigates to "Create Campaign" page
3. Fills out campaign properties:
   - Name, description, dates
   - Status, audience targeting
   - View duration and count limits
4. Adds ads (1-6 ads):
   - Selects ad type (top_bar, bottom_left, etc.)
   - Configures ad properties
   - Uploads media (images, videos)
   - Sets time slots and duration
   - Assigns content ratings
5. Submits campaign
6. Frontend validates input
7. Sends POST request to backend API
8. Backend validates data (Pydantic models)
9. Checks user permissions
10. Creates database records (campaign + ads)
11. Returns success response with campaign ID
12. Frontend redirects to campaign detail page
```

### 6.2 Campaign Listing Flow

```
1. User navigates to campaigns list page
2. Frontend sends GET request with pagination params
3. Backend queries database with filters
4. Applies role-based access control
5. Returns paginated campaign list
6. Frontend renders campaign cards with:
   - Campaign name and status
   - Date range
   - Number of ads
   - Creator information
   - Action buttons (edit, delete, view)
```

## 7. Key Features

### 7.1 Campaign Management
- **CRUD Operations**: Create, Read, Update, Delete campaigns
- **Status Management**: Draft, Active, Inactive, Paused, Expired
- **Date Ranges**: Start date, end date, expiry date
- **View Controls**: Max view duration and count limits

### 7.2 Ad Management
- **6 Ad Types**: 
  - Top Bar Ad (image_only)
  - Bottom Left Ad (image_only)
  - Bottom Right Ad (image_only)
  - Bottom Center Ad (image_only)
  - Center Right Content Ad (multimedia)
  - Center Left Content Ad (multimedia)
- **Multiple Media Formats**: Text, images, GIFs, videos, HTML, RSS feeds, alerts
- **Time Slot Scheduling**: 15-minute interval scheduling (24-hour format)
- **QR Code Support**: Advertiser forwarding URLs

### 7.3 Audience Targeting
- **Hierarchical Structure**: Region → Country → Cities → Postcodes
- **Flexible Targeting**:
  - Single region per campaign
  - Single country per region
  - Multiple cities (list)
  - Multiple postcodes per city (list)

### 7.4 Content Rating System
- **MPAA Ratings**: G, PG, PG-13, R, NC-17
- **ESRB Ratings**: E, E10+, T, M, AO
- **Content Warnings**: Violence, Language, Substances, Sensitivity
- **Prohibited Content Check**: Mandatory confirmation

### 7.5 Advertiser Management
- **Advertiser Profiles**: Name, type, address, contacts
- **Contact Management**: Multiple contacts per advertiser
- **Bank Account Management**: Multiple accounts with encryption
- **Address Tracking**: Full address with coordinates and timezone

## 8. Security Considerations

### 8.1 Authentication
- JWT-based token authentication
- Secure password hashing (bcrypt/argon2)
- Token expiration and refresh mechanism
- Session management

### 8.2 Authorization
- Role-based access control (RBAC)
- Endpoint-level permission checks
- Resource-level access validation
- Audit logging of all actions

### 8.3 Data Protection
- Encrypted sensitive data (bank accounts)
- HTTPS for all communications
- Input validation and sanitization
- SQL injection prevention (ORM)
- XSS protection (CSP headers)

### 8.4 Content Security
- Content rating enforcement
- Prohibited content validation
- Moderation workflow
- Content approval system

## 9. Non-Functional Requirements

### 9.1 Performance
- API response time < 200ms (p95)
- Support 100+ concurrent users
- Pagination for large datasets
- Database query optimization

### 9.2 Scalability
- Horizontal scaling capability
- Database connection pooling
- Caching strategy (Redis optional)
- CDN for static assets

### 9.3 Reliability
- 99.9% uptime target
- Automated backups
- Database transactions for consistency
- Error recovery mechanisms

### 9.4 Maintainability
- Comprehensive API documentation (OpenAPI/Swagger)
- Code comments and docstrings
- Automated testing (unit, integration)
- Migration scripts for database changes

### 9.5 Usability
- Intuitive user interface
- Form validation with clear error messages
- Responsive design (desktop, tablet)
- Accessibility compliance (WCAG 2.1)

## 10. Integration Points

### 10.1 Internal APIs
- Authentication service
- User management service
- File upload/storage service (optional)

### 10.2 External Services (Future)
- CDN for media delivery
- Email notification service
- Analytics and reporting service
- Telemetry for ad impressions

## 11. Deployment Architecture

```
Production Environment:

┌─────────────────┐
│  Load Balancer  │
│   (nginx/ALB)   │
└────────┬────────┘
         │
    ┌────┴─────┬─────────┬─────────┐
    │          │         │         │
┌───▼───┐  ┌──▼───┐  ┌──▼───┐  ┌──▼───┐
│ Web 1 │  │Web 2 │  │Web 3 │  │Web 4 │
│(React)│  │(React)│  │(React)│  │(React)│
└───┬───┘  └──┬───┘  └──┬───┘  └──┬───┘
    │         │         │         │
    └─────────┴────┬────┴─────────┘
                   │
              ┌────▼────┐
              │API GW   │
              └────┬────┘
                   │
    ┌──────────────┴──────────────┐
    │                             │
┌───▼───┐  ┌─────┐  ┌─────┐  ┌───▼───┐
│ API 1 │  │API 2│  │API 3│  │ API 4 │
│(FastAPI)│(FastAPI)(FastAPI)│(FastAPI)│
└───┬───┘  └──┬──┘  └──┬──┘  └───┬───┘
    │         │         │         │
    └─────────┴────┬────┴─────────┘
                   │
         ┌─────────▼──────────┐
         │  PostgreSQL        │
         │  (Primary/Replica) │
         └────────────────────┘
```

## 12. Development Workflow

1. **Local Development**: 
   - Backend runs on `localhost:8000`
   - Frontend runs on `localhost:5173`
   - PostgreSQL on `localhost:5432`

2. **Testing**: 
   - Unit tests for all services
   - Integration tests for API endpoints
   - E2E tests for critical user flows

3. **Version Control**: 
   - Git-based workflow
   - Feature branches
   - Pull request reviews

4. **CI/CD**: 
   - Automated testing on commit
   - Automated deployment to staging
   - Manual promotion to production

## 13. Future Enhancements

- Real-time analytics dashboard
- A/B testing for campaigns
- Advanced reporting and exports
- Multi-language support (i18n)
- Mobile app for campaign management
- Automated content moderation (AI)
- Integration with ad exchanges
- Real-time bidding support

## 14. Success Metrics

- Campaign creation time < 5 minutes
- Zero data loss incidents
- < 1% API error rate
- Campaign Manager satisfaction score > 4.5/5
- System uptime > 99.9%
