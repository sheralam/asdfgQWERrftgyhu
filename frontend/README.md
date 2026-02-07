# Campaign Studio Frontend

React-based frontend application for Campaign Studio - a CMS for managing advertising campaigns for car infotainment systems.

## Prerequisites

- Node.js 20+
- npm 10+

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp env.example .env
```

3. Update `.env` with your configuration:
   - `VITE_API_BASE_URL`: Backend API URL (default: http://localhost:8000/api)

4. Start development server:
```bash
npm run dev
```

The application will be available at http://localhost:5173

## Build for Production

```bash
npm run build
```

The production build will be in the `dist/` directory.

## Project Structure

```
frontend/
├── src/
│   ├── components/        # Reusable components
│   │   └── Layout.tsx     # Main layout with sidebar
│   ├── lib/               # Libraries and utilities
│   │   └── api.ts         # Axios instance with interceptors
│   ├── pages/             # Page components
│   │   ├── auth/          # Authentication pages
│   │   ├── campaigns/     # Campaign management
│   │   ├── ads/           # Ad management
│   │   ├── advertisers/   # Advertiser management
│   │   ├── users/         # User management
│   │   └── Dashboard.tsx  # Dashboard page
│   ├── store/             # State management
│   │   └── authStore.ts   # Auth state (Zustand)
│   ├── types/             # TypeScript types
│   │   └── index.ts       # Shared types
│   ├── App.tsx            # Main app with routing
│   ├── main.tsx           # App entry point
│   └── theme.ts           # MUI theme configuration
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Technology Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Routing**: React Router v6
- **UI Library**: Material-UI (MUI) v5
- **State Management**: Zustand
- **Data Fetching**: TanStack React Query
- **Form Management**: React Hook Form + Zod
- **HTTP Client**: Axios
- **Date Utilities**: date-fns

## Features

- JWT-based authentication with auto-refresh
- Role-based access control
- Campaign management (CRUD operations)
- Ad management with multiple types
- Advertiser management
- User management
- Responsive dashboard
- Search and filtering
- Pagination

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

## Environment Variables

- `VITE_API_BASE_URL`: Backend API base URL
- `VITE_APP_NAME`: Application name
