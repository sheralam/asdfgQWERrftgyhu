# Frontend Specification - Campaign Studio UI

## 1. Technology Stack

- **Runtime**: Node.js 20+
- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite 5+
- **UI Library**: Material-UI (MUI) v5
- **State Management**: 
  - React Query (TanStack Query v5) for server state
  - Zustand for client state
- **Form Management**: React Hook Form + Zod
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Date Handling**: date-fns
- **Testing**: Vitest + React Testing Library
- **Code Quality**: ESLint + Prettier

## 2. Project Structure

```
frontend/
├── public/
│   └── vite.svg
├── src/
│   ├── main.tsx                # Application entry point
│   ├── App.tsx                 # Root component
│   ├── vite-env.d.ts
│   ├── api/                    # API client layer
│   │   ├── client.ts           # Axios instance
│   │   ├── campaigns.ts        # Campaign API calls
│   │   ├── ads.ts              # Ad API calls
│   │   ├── advertisers.ts      # Advertiser API calls
│   │   ├── auth.ts             # Auth API calls
│   │   └── users.ts            # User API calls
│   ├── components/             # Reusable components
│   │   ├── common/
│   │   │   ├── AppBar.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   ├── ErrorBoundary.tsx
│   │   │   └── ConfirmDialog.tsx
│   │   ├── campaigns/
│   │   │   ├── CampaignCard.tsx
│   │   │   ├── CampaignForm.tsx
│   │   │   ├── CampaignList.tsx
│   │   │   ├── CampaignDetail.tsx
│   │   │   └── AudienceTargetingForm.tsx
│   │   ├── ads/
│   │   │   ├── AdCard.tsx
│   │   │   ├── AdForm.tsx
│   │   │   ├── AdList.tsx
│   │   │   ├── TimeSlotPicker.tsx
│   │   │   └── ContentRatingForm.tsx
│   │   └── advertisers/
│   │       ├── AdvertiserForm.tsx
│   │       ├── AdvertiserList.tsx
│   │       ├── ContactForm.tsx
│   │       └── BankAccountForm.tsx
│   ├── pages/                  # Page components
│   │   ├── auth/
│   │   │   ├── LoginPage.tsx
│   │   │   └── RegisterPage.tsx
│   │   ├── campaigns/
│   │   │   ├── CampaignsPage.tsx
│   │   │   ├── CampaignCreatePage.tsx
│   │   │   ├── CampaignEditPage.tsx
│   │   │   └── CampaignDetailPage.tsx
│   │   ├── advertisers/
│   │   │   ├── AdvertisersPage.tsx
│   │   │   └── AdvertiserDetailPage.tsx
│   │   ├── dashboard/
│   │   │   └── DashboardPage.tsx
│   │   └── NotFoundPage.tsx
│   ├── hooks/                  # Custom React hooks
│   │   ├── useCampaigns.ts
│   │   ├── useAds.ts
│   │   ├── useAdvertisers.ts
│   │   ├── useAuth.ts
│   │   └── useDebounce.ts
│   ├── stores/                 # Zustand stores
│   │   ├── authStore.ts
│   │   └── uiStore.ts
│   ├── types/                  # TypeScript types
│   │   ├── campaign.ts
│   │   ├── ad.ts
│   │   ├── advertiser.ts
│   │   ├── user.ts
│   │   └── api.ts
│   ├── utils/                  # Utility functions
│   │   ├── format.ts
│   │   ├── validation.ts
│   │   └── constants.ts
│   ├── routes/                 # Route configuration
│   │   ├── index.tsx
│   │   ├── PrivateRoute.tsx
│   │   └── RoleRoute.tsx
│   ├── theme/                  # MUI theme
│   │   └── index.ts
│   └── styles/                 # Global styles
│       └── index.css
├── tests/
│   ├── setup.ts
│   ├── components/
│   └── pages/
├── package.json
├── tsconfig.json
├── vite.config.ts
├── .env.example
├── .eslintrc.json
├── .prettierrc
└── README.md
```

## 3. Core Dependencies (package.json)

```json
{
  "name": "campaign-studio-ui",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "lint": "eslint src --ext ts,tsx",
    "format": "prettier --write \"src/**/*.{ts,tsx}\""
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "@mui/material": "^5.14.0",
    "@mui/icons-material": "^5.14.0",
    "@emotion/react": "^11.11.0",
    "@emotion/styled": "^11.11.0",
    "@tanstack/react-query": "^5.12.0",
    "axios": "^1.6.0",
    "react-hook-form": "^7.48.0",
    "zod": "^3.22.0",
    "@hookform/resolvers": "^3.3.0",
    "zustand": "^4.4.0",
    "date-fns": "^2.30.0",
    "notistack": "^3.0.1"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.2.0",
    "typescript": "^5.3.0",
    "vite": "^5.0.0",
    "vitest": "^1.0.0",
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^6.1.0",
    "@testing-library/user-event": "^14.5.0",
    "eslint": "^8.54.0",
    "eslint-config-prettier": "^9.0.0",
    "eslint-plugin-react": "^7.33.0",
    "prettier": "^3.1.0"
  }
}
```

## 4. Configuration Files

### Vite Config (vite.config.ts)

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
});
```

### TypeScript Config (tsconfig.json)

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### Environment Variables (.env)

```bash
VITE_API_BASE_URL=http://localhost:8000/api
VITE_APP_NAME=Campaign Studio
```

## 5. Type Definitions

### Campaign Types (src/types/campaign.ts)

```typescript
export interface Campaign {
  campaign_id: string;
  campaign_name: string;
  campaign_description?: string;
  campaign_start_date: string;
  campaign_end_date: string;
  campaign_expiry_date?: string;
  campaign_max_view_duration?: {
    value: number;
    unit: 'seconds' | 'minutes' | 'hours' | 'days';
  };
  campaign_max_view_count?: number;
  campaign_status: 'active' | 'inactive' | 'paused' | 'draft' | 'expired';
  campaign_created_by_id: string;
  created_by_name?: string;
  updated_by_name?: string;
  created_at: string;
  updated_at: string;
  ads?: Ad[];
  audience_targeting?: AudienceTargeting;
}

export interface AudienceTargeting {
  audience_id: string;
  campaign_id: string;
  region: string;
  country: string;
  cities: string[];
  postcodes: string[];
}

export interface CreateCampaignInput {
  campaign_name: string;
  campaign_description?: string;
  campaign_start_date: string;
  campaign_end_date: string;
  campaign_expiry_date?: string;
  campaign_max_view_duration?: {
    value: number;
    unit: string;
  };
  campaign_max_view_count?: number;
  campaign_status: string;
  audience_targeting: {
    region: string;
    country: string;
    cities: string[];
    postcodes: string[];
  };
}
```

### Ad Types (src/types/ad.ts)

```typescript
export interface Ad {
  ad_id: string;
  campaign_id: string;
  ad_type_id: AdTypeId;
  ad_name: string;
  ad_description?: string;
  media_type: MediaType;
  media_url?: string;
  media_content?: string;
  ad_impression_duration?: {
    value: number;
    unit: 'seconds' | 'minutes' | 'hours';
  };
  ad_advertiser_forwarding_url?: string;
  ad_start_date?: string;
  ad_end_date?: string;
  ad_expiry_date?: string;
  ad_status: AdStatus;
  time_slots?: TimeSlot[];
  content_rating?: ContentRating;
  created_at: string;
  updated_at: string;
}

export type AdTypeId =
  | 'top_bar_ad'
  | 'bottom_left_ad'
  | 'bottom_right_ad'
  | 'bottom_center_ad'
  | 'center_right_content_ad'
  | 'center_left_content_ad';

export type MediaType = 'text' | 'image' | 'video' | 'html' | 'gif' | 'news_rss' | 'events' | 'breaking_news' | 'alerts';

export type AdStatus = 'active' | 'inactive' | 'paused' | 'draft' | 'expired';

export interface TimeSlot {
  time_slot_id?: string;
  time_slot_start: string;
  time_slot_end: string;
}

export interface ContentRating {
  rating_id?: string;
  warning_required: boolean;
  rating_system?: 'MPAA' | 'ESRB';
  rating_label?: string;
  content_warnings?: string[];
  no_prohibited_content: boolean;
}
```

## 6. API Client Layer

### Axios Client (src/api/client.ts)

```typescript
import axios from 'axios';
import { useAuthStore } from '@/stores/authStore';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

### Campaign API (src/api/campaigns.ts)

```typescript
import apiClient from './client';
import { Campaign, CreateCampaignInput } from '@/types/campaign';
import { PaginatedResponse } from '@/types/api';

export const campaignApi = {
  getAll: async (params?: { page?: number; limit?: number; status?: string }) => {
    const { data } = await apiClient.get<PaginatedResponse<Campaign>>('/campaigns', { params });
    return data;
  },

  getById: async (id: string) => {
    const { data } = await apiClient.get<Campaign>(`/campaigns/${id}`);
    return data;
  },

  create: async (campaign: CreateCampaignInput) => {
    const { data } = await apiClient.post<Campaign>('/campaigns', campaign);
    return data;
  },

  update: async (id: string, campaign: Partial<CreateCampaignInput>) => {
    const { data } = await apiClient.put<Campaign>(`/campaigns/${id}`, campaign);
    return data;
  },

  delete: async (id: string) => {
    await apiClient.delete(`/campaigns/${id}`);
  },
};
```

## 7. Custom Hooks

### useCampaigns Hook (src/hooks/useCampaigns.ts)

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { campaignApi } from '@/api/campaigns';
import { CreateCampaignInput } from '@/types/campaign';
import { useSnackbar } from 'notistack';

export const useCampaigns = (params?: { page?: number; limit?: number; status?: string }) => {
  return useQuery({
    queryKey: ['campaigns', params],
    queryFn: () => campaignApi.getAll(params),
  });
};

export const useCampaign = (id: string) => {
  return useQuery({
    queryKey: ['campaigns', id],
    queryFn: () => campaignApi.getById(id),
    enabled: !!id,
  });
};

export const useCreateCampaign = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: (campaign: CreateCampaignInput) => campaignApi.create(campaign),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      enqueueSnackbar('Campaign created successfully', { variant: 'success' });
    },
    onError: (error: any) => {
      enqueueSnackbar(error.response?.data?.detail || 'Failed to create campaign', {
        variant: 'error',
      });
    },
  });
};

export const useUpdateCampaign = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: ({ id, campaign }: { id: string; campaign: Partial<CreateCampaignInput> }) =>
      campaignApi.update(id, campaign),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['campaigns', variables.id] });
      enqueueSnackbar('Campaign updated successfully', { variant: 'success' });
    },
    onError: (error: any) => {
      enqueueSnackbar(error.response?.data?.detail || 'Failed to update campaign', {
        variant: 'error',
      });
    },
  });
};

export const useDeleteCampaign = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: (id: string) => campaignApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      enqueueSnackbar('Campaign deleted successfully', { variant: 'success' });
    },
    onError: (error: any) => {
      enqueueSnackbar(error.response?.data?.detail || 'Failed to delete campaign', {
        variant: 'error',
      });
    },
  });
};
```

## 8. State Management

### Auth Store (src/stores/authStore.ts)

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  user_id: string;
  username: string;
  email: string;
  role: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (user, token) => set({ user, token, isAuthenticated: true }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
    }
  )
);
```

## 9. Routing

### Routes (src/routes/index.tsx)

```typescript
import { createBrowserRouter } from 'react-router-dom';
import App from '@/App';
import LoginPage from '@/pages/auth/LoginPage';
import DashboardPage from '@/pages/dashboard/DashboardPage';
import CampaignsPage from '@/pages/campaigns/CampaignsPage';
import CampaignCreatePage from '@/pages/campaigns/CampaignCreatePage';
import CampaignEditPage from '@/pages/campaigns/CampaignEditPage';
import CampaignDetailPage from '@/pages/campaigns/CampaignDetailPage';
import PrivateRoute from './PrivateRoute';
import RoleRoute from './RoleRoute';
import NotFoundPage from '@/pages/NotFoundPage';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: <PrivateRoute><App /></PrivateRoute>,
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: 'campaigns',
        element: <CampaignsPage />,
      },
      {
        path: 'campaigns/new',
        element: (
          <RoleRoute allowedRoles={['campaign_manager', 'app_admin', 'system_admin']}>
            <CampaignCreatePage />
          </RoleRoute>
        ),
      },
      {
        path: 'campaigns/:id',
        element: <CampaignDetailPage />,
      },
      {
        path: 'campaigns/:id/edit',
        element: (
          <RoleRoute allowedRoles={['campaign_manager', 'app_admin', 'system_admin']}>
            <CampaignEditPage />
          </RoleRoute>
        ),
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
```

## 10. Main Entry Point

### main.tsx

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { SnackbarProvider } from 'notistack';
import { router } from './routes';
import theme from './theme';
import './styles/index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <SnackbarProvider maxSnack={3}>
          <RouterProvider router={router} />
        </SnackbarProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
```

## 11. Development Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm run test

# Lint code
npm run lint

# Format code
npm run format
```

## 12. Key Features

- Responsive Material-UI design
- Form validation with Zod
- Optimistic updates with React Query
- Protected routes with role-based access
- Error boundary for graceful error handling
- Toast notifications for user feedback
- Dark/light theme support (MUI)

This specification provides the complete frontend structure for Campaign Studio.
