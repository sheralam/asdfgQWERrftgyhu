import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '@/lib/api'
import { AuthResponse, LoginRequest, RegisterRequest } from '@/types'

interface AuthState {
  user: AuthResponse['user'] | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  login: (credentials: LoginRequest) => Promise<void>
  register: (data: RegisterRequest) => Promise<void>
  logout: () => void
  setAuth: (data: AuthResponse) => void
  checkAuth: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: localStorage.getItem('access_token'),
      refreshToken: localStorage.getItem('refresh_token'),
      isAuthenticated: !!localStorage.getItem('access_token'),

      login: async (credentials: LoginRequest) => {
        const response = await api.post<AuthResponse>('/auth/login', credentials)
        const { access_token, refresh_token, user } = response.data

        localStorage.setItem('access_token', access_token)
        if (refresh_token) {
          localStorage.setItem('refresh_token', refresh_token)
        }

        set({
          user,
          accessToken: access_token,
          refreshToken: refresh_token || null,
          isAuthenticated: true,
        })
      },

      register: async (data: RegisterRequest) => {
        const response = await api.post<AuthResponse>('/auth/register', data)
        const { access_token, refresh_token, user } = response.data

        localStorage.setItem('access_token', access_token)
        if (refresh_token) {
          localStorage.setItem('refresh_token', refresh_token)
        }

        set({
          user,
          accessToken: access_token,
          refreshToken: refresh_token || null,
          isAuthenticated: true,
        })
      },

      logout: () => {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        })
      },

      setAuth: (data: AuthResponse) => {
        const { access_token, refresh_token, user } = data
        localStorage.setItem('access_token', access_token)
        if (refresh_token) {
          localStorage.setItem('refresh_token', refresh_token)
        }

        set({
          user,
          accessToken: access_token,
          refreshToken: refresh_token || null,
          isAuthenticated: true,
        })
      },

      checkAuth: async () => {
        try {
          const response = await api.get('/auth/me')
          set({
            user: response.data,
            isAuthenticated: true,
          })
        } catch (error) {
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
          })
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
