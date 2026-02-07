import { useParams, useNavigate } from 'react-router-dom'
import { Box, Button, Typography, Paper, Grid, Chip } from '@mui/material'
import { Edit, ArrowBack } from '@mui/icons-material'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { Ad } from '@/types'

export default function AdDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const { data: ad, isLoading } = useQuery({
    queryKey: ['ad', id],
    queryFn: async () => {
      const response = await api.get(`/ads/${id}`)
      return response.data as Ad
    },
  })

  if (isLoading) {
    return <Box><Typography>Loading...</Typography></Box>
  }

  if (!ad) {
    return <Box><Typography>Ad not found</Typography></Box>
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button startIcon={<ArrowBack />} onClick={() => navigate('/ads')}>
            Back
          </Button>
          <Typography variant="h4">{ad.ad_name}</Typography>
          <Chip label={ad.ad_status} />
        </Box>
        <Button
          variant="outlined"
          startIcon={<Edit />}
          onClick={() => navigate(`/ads/${id}/edit`)}
        >
          Edit
        </Button>
      </Box>

      <Paper sx={{ p: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="subtitle2" color="text.secondary">Description</Typography>
            <Typography variant="body1">{ad.ad_description || 'No description'}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="subtitle2" color="text.secondary">Type</Typography>
            <Typography variant="body1">{ad.ad_type_id}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="subtitle2" color="text.secondary">Media Type</Typography>
            <Typography variant="body1">{ad.media_type}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="subtitle2" color="text.secondary">View Count</Typography>
            <Typography variant="body1">{ad.ad_view_count}</Typography>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  )
}
