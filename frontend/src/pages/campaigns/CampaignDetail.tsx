import { useParams, useNavigate } from 'react-router-dom'
import {
  Box,
  Button,
  Typography,
  Paper,
  Grid,
  Chip,
  Divider,
  Card,
  CardContent,
} from '@mui/material'
import { Edit, ArrowBack, Delete } from '@mui/icons-material'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { Campaign } from '@/types'
import { format } from 'date-fns'

export default function CampaignDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: campaign, isLoading } = useQuery({
    queryKey: ['campaign', id],
    queryFn: async () => {
      const response = await api.get(`/campaigns/${id}`)
      return response.data as Campaign
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await api.delete(`/campaigns/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
      navigate('/campaigns')
    },
  })

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this campaign?')) {
      deleteMutation.mutate()
    }
  }

  if (isLoading) {
    return (
      <Box>
        <Typography>Loading...</Typography>
      </Box>
    )
  }

  if (!campaign) {
    return (
      <Box>
        <Typography>Campaign not found</Typography>
      </Box>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success'
      case 'inactive':
        return 'default'
      case 'paused':
        return 'warning'
      case 'draft':
        return 'info'
      case 'expired':
        return 'error'
      default:
        return 'default'
    }
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button startIcon={<ArrowBack />} onClick={() => navigate('/campaigns')}>
            Back
          </Button>
          <Typography variant="h4">{campaign.campaign_name}</Typography>
          <Chip label={campaign.campaign_status} color={getStatusColor(campaign.campaign_status)} />
        </Box>
        <Box>
          <Button
            variant="outlined"
            startIcon={<Edit />}
            onClick={() => navigate(`/campaigns/${id}/edit`)}
            sx={{ mr: 1 }}
          >
            Edit
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<Delete />}
            onClick={handleDelete}
          >
            Delete
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Campaign Details
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">
                  Description
                </Typography>
                <Typography variant="body1">
                  {campaign.campaign_description || 'No description'}
                </Typography>
              </Grid>

              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Start Date
                </Typography>
                <Typography variant="body1">
                  {format(new Date(campaign.campaign_start_date), 'MMMM dd, yyyy')}
                </Typography>
              </Grid>

              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  End Date
                </Typography>
                <Typography variant="body1">
                  {format(new Date(campaign.campaign_end_date), 'MMMM dd, yyyy')}
                </Typography>
              </Grid>

              {campaign.campaign_expiry_date && (
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Expiry Date
                  </Typography>
                  <Typography variant="body1">
                    {format(new Date(campaign.campaign_expiry_date), 'MMMM dd, yyyy')}
                  </Typography>
                </Grid>
              )}

              {campaign.campaign_max_view_count && (
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Max View Count
                  </Typography>
                  <Typography variant="body1">
                    {campaign.campaign_max_view_count}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Paper>

          {campaign.ads && campaign.ads.length > 0 && (
            <Paper sx={{ p: 3, mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Associated Ads ({campaign.ads.length})
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                {campaign.ads.map((ad) => (
                  <Grid item xs={12} key={ad.ad_id}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6">{ad.ad_name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Type: {ad.ad_type_id} • Status: {ad.ad_status}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          )}
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Metadata
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Created By
              </Typography>
              <Typography variant="body1">
                {campaign.created_by_name || 'N/A'}
              </Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Created At
              </Typography>
              <Typography variant="body1">
                {format(new Date(campaign.created_at), 'MMM dd, yyyy HH:mm')}
              </Typography>
            </Box>

            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Last Updated
              </Typography>
              <Typography variant="body1">
                {format(new Date(campaign.updated_at), 'MMM dd, yyyy HH:mm')}
              </Typography>
            </Box>

            {campaign.updated_by_name && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Updated By
                </Typography>
                <Typography variant="body1">
                  {campaign.updated_by_name}
                </Typography>
              </Box>
            )}
          </Paper>

          {campaign.audience_targeting && campaign.audience_targeting.length > 0 && (
            <Paper sx={{ p: 3, mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Audience Targeting
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {campaign.audience_targeting.map((targeting) => (
                <Box key={targeting.audience_id} sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Region: {targeting.region}
                  </Typography>
                  <Typography variant="body1">
                    Country: {targeting.country}
                  </Typography>
                  {targeting.cities && targeting.cities.length > 0 && (
                    <Typography variant="body2" color="text.secondary">
                      Cities: {targeting.cities.join(', ')}
                    </Typography>
                  )}
                </Box>
              ))}
            </Paper>
          )}
        </Grid>
      </Grid>
    </Box>
  )
}
