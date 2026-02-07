import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import Layout from './components/Layout'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import Dashboard from './pages/Dashboard'
import CampaignList from './pages/campaigns/CampaignList'
import CampaignDetail from './pages/campaigns/CampaignDetail'
import CampaignForm from './pages/campaigns/CampaignForm'
import AdList from './pages/ads/AdList'
import AdDetail from './pages/ads/AdDetail'
import AdForm from './pages/ads/AdForm'
import AdvertiserList from './pages/advertisers/AdvertiserList'
import AdvertiserDetail from './pages/advertisers/AdvertiserDetail'
import AdvertiserForm from './pages/advertisers/AdvertiserForm'
import UserList from './pages/users/UserList'

interface ProtectedRouteProps {
  children: React.ReactNode
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        
        {/* Campaign routes */}
        <Route path="campaigns" element={<CampaignList />} />
        <Route path="campaigns/new" element={<CampaignForm />} />
        <Route path="campaigns/:id" element={<CampaignDetail />} />
        <Route path="campaigns/:id/edit" element={<CampaignForm />} />
        
        {/* Ad routes */}
        <Route path="ads" element={<AdList />} />
        <Route path="ads/new" element={<AdForm />} />
        <Route path="ads/:id" element={<AdDetail />} />
        <Route path="ads/:id/edit" element={<AdForm />} />
        
        {/* Advertiser routes */}
        <Route path="advertisers" element={<AdvertiserList />} />
        <Route path="advertisers/new" element={<AdvertiserForm />} />
        <Route path="advertisers/:id" element={<AdvertiserDetail />} />
        <Route path="advertisers/:id/edit" element={<AdvertiserForm />} />
        
        {/* User routes */}
        <Route path="users" element={<UserList />} />
      </Route>
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
