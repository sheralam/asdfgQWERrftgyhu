import { useParams, useNavigate } from 'react-router-dom'
import { Box, Button, Typography, Paper, Grid } from '@mui/material'
import { Edit, ArrowBack } from '@mui/icons-material'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { Advertiser } from '@/types'

export default function AdvertiserDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const { data: advertiser, isLoading } = useQuery({
    queryKey: ['advertiser', id],
    queryFn: async () => {
      const response = await api.get(`/advertisers/${id}`)
      return response.data as Advertiser
    },
  })

  if (isLoading) return <Box><Typography>Loading...</Typography></Box>
  if (!advertiser) return <Box><Typography>Advertiser not found</Typography></Box>

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button startIcon={<ArrowBack />} onClick={() => navigate('/advertisers')}>Back</Button>
          <Typography variant="h4">{advertiser.advertiser_name}</Typography>
        </Box>
        <Button variant="outlined" startIcon={<Edit />} onClick={() => navigate(`/advertisers/${id}/edit`)}>
          Edit
        </Button>
      </Box>

      <Paper sx={{ p: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="subtitle2" color="text.secondary">Type</Typography>
            <Typography variant="body1">{advertiser.advertiser_type}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="subtitle2" color="text.secondary">Timezone</Typography>
            <Typography variant="body1">{advertiser.timezone}</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle2" color="text.secondary">Address</Typography>
            <Typography variant="body1">
              {advertiser.address_line_1}<br />
              {advertiser.address_line_2 && <>{advertiser.address_line_2}<br /></>}
              {advertiser.city}, {advertiser.state} {advertiser.postal_code}<br />
              {advertiser.country}
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  )
}
