import { Grid, Paper, Typography, Box } from '@mui/material'
import {
  Campaign as CampaignIcon,
  Visibility as AdIcon,
  Business as AdvertiserIcon,
  TrendingUp,
} from '@mui/icons-material'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'

interface StatCardProps {
  title: string
  value: number | string
  icon: React.ReactNode
  color: string
}

function StatCard({ title, value, icon, color }: StatCardProps) {
  return (
    <Paper
      sx={{
        p: 3,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <Box>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          {title}
        </Typography>
        <Typography variant="h3">{value}</Typography>
      </Box>
      <Box
        sx={{
          bgcolor: color,
          borderRadius: 2,
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {icon}
      </Box>
    </Paper>
  )
}

export default function Dashboard() {
  const { data: campaigns } = useQuery({
    queryKey: ['campaigns', 'stats'],
    queryFn: async () => {
      const response = await api.get('/campaigns?page=1&page_size=1')
      return response.data
    },
  })

  const { data: ads } = useQuery({
    queryKey: ['ads', 'stats'],
    queryFn: async () => {
      const response = await api.get('/ads?page=1&page_size=1')
      return response.data
    },
  })

  const { data: advertisers } = useQuery({
    queryKey: ['advertisers', 'stats'],
    queryFn: async () => {
      const response = await api.get('/advertisers?page=1&page_size=1')
      return response.data
    },
  })

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Overview of your Campaign Studio
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Campaigns"
            value={campaigns?.total || 0}
            icon={<CampaignIcon sx={{ fontSize: 40, color: 'white' }} />}
            color="primary.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Ads"
            value={ads?.total || 0}
            icon={<AdIcon sx={{ fontSize: 40, color: 'white' }} />}
            color="secondary.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Advertisers"
            value={advertisers?.total || 0}
            icon={<AdvertiserIcon sx={{ fontSize: 40, color: 'white' }} />}
            color="success.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Campaigns"
            value={campaigns?.campaigns?.filter((c: any) => c.campaign_status === 'active').length || 0}
            icon={<TrendingUp sx={{ fontSize: 40, color: 'white' }} />}
            color="warning.main"
          />
        </Grid>
      </Grid>

      <Paper sx={{ mt: 3, p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Welcome to Campaign Studio
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Use the sidebar to navigate between campaigns, ads, advertisers, and users.
          Start by creating a new campaign to manage your advertising content.
        </Typography>
      </Paper>
    </Box>
  )
}
