# Car Infotainment Ad Platform – OpenAPI Documentation

OpenAPI 3.0 specification for CRUD operations on **Advertisers**, **Device details**, and **Hosts**, including their dependent schemas (contacts, bank accounts, device groups).

## Structure

```
openapi/
├── openapi.yaml          # Main spec (info, servers, security, inlined paths, components)
├── schemas/              # Reusable schema definitions (referenced by openapi.yaml)
│   ├── common.yaml       # Enums, timestamps, pagination, errors, GeoPoint
│   ├── advertisers.yaml
│   ├── advertiser-contacts.yaml
│   ├── advertiser-banks.yaml
│   ├── devices.yaml      # Device + device_details
│   ├── hosts.yaml
│   ├── host-contacts.yaml
│   ├── host-banks.yaml
│   └── device-groups.yaml
├── paths/                # Path items per resource (source files)
│   ├── advertisers.yaml
│   ├── advertiser-contacts.yaml
│   ├── advertiser-banks.yaml
│   ├── devices.yaml
│   ├── hosts.yaml
│   ├── host-contacts.yaml
│   ├── host-banks.yaml
│   ├── device-groups.yaml
│   └── combined.yaml     # Merged paths (generated; used to inline into openapi.yaml)
└── README.md             # This file
```

The main `openapi.yaml` inlines the path definitions (from `paths/combined.yaml`) so that `#/components/schemas/...` and `#/components/responses/...` resolve correctly. To regenerate the inlined paths from the individual path files, merge the path YAML files (e.g. strip comments and concatenate) into `paths/combined.yaml`, then run the inline script from the plan or re-merge into `openapi.yaml`.

## API Overview

### Advertisers

- **Base path:** `/api/v1/advertisers`
- **Endpoints:** `GET` (list), `POST` (create), `GET /{advertiser_id}` (get), `PUT /{advertiser_id}` (update), `DELETE /{advertiser_id}` (soft delete)
- **Dependent APIs:**
  - **Contacts:** `GET/POST /api/v1/advertisers/{advertiser_id}/contacts`, `GET/PUT/DELETE .../contacts/{contact_id}`
  - **Bank accounts:** `GET/POST /api/v1/advertisers/{advertiser_id}/bank-accounts`, `GET/PUT/DELETE .../bank-accounts/{bank_id}`

### Devices

- **Base path:** `/api/v1/devices`
- **Endpoints:** `GET` (list, filter by host_id, device_type, device_rating), `POST` (create device, optional details), `GET/PUT/DELETE /{device_id}`
- **Device details (1-1):** `GET/POST/PUT /api/v1/devices/{device_id}/details`

### Hosts

- **Base path:** `/api/v1/hosts`
- **Endpoints:** `GET` (list), `POST` (create), `GET /{host_id}` (get), `PUT /{host_id}` (update), `DELETE /{host_id}` (soft delete)
- **Dependent APIs:**
  - **Contacts:** `GET/POST /api/v1/hosts/{host_id}/contacts`, `GET/PUT/DELETE .../contacts/{contact_id}`
  - **Bank accounts:** `GET/POST /api/v1/hosts/{host_id}/bank-accounts`, `GET/PUT/DELETE .../bank-accounts/{bank_id}`
  - **Device groups:** `GET/POST /api/v1/hosts/{host_id}/device-groups`, `GET/PUT/DELETE .../device-groups/{group_id}`

## Authentication

All endpoints assume **Bearer token** authentication. The spec declares:

```yaml
security:
  - bearerAuth: []
```

- Use header: `Authorization: Bearer <token>`.
- The backend should set `created_by_id` and `updated_by_id` from the authenticated user.

## Behaviour

- **Soft deletes:** `DELETE` on advertisers, hosts, and devices sets `deleted_at`; list endpoints exclude deleted by default (use `include_deleted` or `include_deleted` query when supported).
- **Pagination:** List endpoints use `limit` (default 20, max 100) and `offset`.
- **Validation:** Enums and field lengths align with the database schema; `advertiser_code` is unique; contact emails must be valid.
- **Cascade:** Deleting an advertiser or host cascades to its contacts and bank accounts (and for hosts, device groups and devices as per DB).

## Viewing and validating the spec

### View in Swagger UI

From the repo root:

```bash
npx @redocly/cli preview-docs openapi/openapi.yaml
# or
npx swagger-ui-watcher openapi/openapi.yaml
```

Or use any OpenAPI 3.0 viewer (e.g. Swagger Editor, Redoc) and point it at `openapi/openapi.yaml`.

### Validate with Redocly CLI

```bash
npx @redocly/cli lint openapi/openapi.yaml
```

### Validate with Swagger CLI

```bash
npx @apidevtools/swagger-cli validate openapi/openapi.yaml
```

Schema definitions remain in `schemas/*.yaml` and are referenced from `openapi.yaml`. To produce a single-file spec (e.g. for tools that do not resolve multi-file refs), run:

```bash
npx @redocly/cli bundle openapi/openapi.yaml -o openapi/bundled.yaml
```

## Example requests

### Create advertiser

```bash
curl -X POST https://api.example.com/api/v1/advertisers \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "advertiser_code": "ADV-001",
    "advertiser_name": "Acme Corp",
    "advertiser_type": "business",
    "address_line_1": "123 Main St",
    "city": "New York",
    "state_province": "NY",
    "postal_code": "10001",
    "country": "USA",
    "timezone": "America/New_York"
  }'
```

### Create device with details

```bash
curl -X POST https://api.example.com/api/v1/devices \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "device_id": "DEV-001",
    "host_id": "<host_uuid>",
    "device_type": "car",
    "device_rating": "premium",
    "display_size": "l",
    "avg_idle_time": 15,
    "avg_visitors_count": 2,
    "address_line_1": "456 Oak Ave",
    "city": "Boston",
    "state_province": "MA",
    "postal_code": "02101",
    "country": "USA",
    "timezone": "America/New_York",
    "details": {
      "vendor_name": "Vendor Inc",
      "model_number": "M1",
      "purchase_price": 999.99,
      "currency": "USD"
    }
  }'
```

### Add host contact

```bash
curl -X POST https://api.example.com/api/v1/hosts/<host_id>/contacts \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "contact_name": "Jane Doe",
    "contact_email": "jane@example.com",
    "contact_phone": "+1-555-0100",
    "contact_type": "manager",
    "is_point_of_contact": true
  }'
```

## Database alignment

Schemas and enums match the PostgreSQL schema in `database/schema.sql` (e.g. `advertiser_type_enum`, `contact_type_enum`, `device_type_enum`, `device_rating_enum`, `display_size_enum`, `age_group_enum`, `device_group_status_enum`). Geographic fields use a `GeoPoint` (latitude/longitude) representation for PostGIS `GEOGRAPHY(POINT)`.
