import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import {
  Box,
  Button,
  Typography,
  Paper,
  TextField,
  Grid,
  MenuItem,
} from '@mui/material'
import { ArrowBack, Save } from '@mui/icons-material'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { Campaign, CampaignCreate } from '@/types'

const statusOptions = ['draft', 'active', 'inactive', 'paused', 'expired']

export default function CampaignForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const isEditing = !!id

  const [formData, setFormData] = useState<CampaignCreate>({
    campaign_name: '',
    campaign_description: '',
    campaign_start_date: '',
    campaign_end_date: '',
    campaign_expiry_date: '',
    campaign_max_view_count: undefined,
    campaign_status: 'draft',
  })

  const { data: campaign } = useQuery({
    queryKey: ['campaign', id],
    queryFn: async () => {
      const response = await api.get(`/campaigns/${id}`)
      return response.data as Campaign
    },
    enabled: isEditing,
  })

  useEffect(() => {
    if (campaign) {
      setFormData({
        campaign_name: campaign.campaign_name,
        campaign_description: campaign.campaign_description,
        campaign_start_date: campaign.campaign_start_date,
        campaign_end_date: campaign.campaign_end_date,
        campaign_expiry_date: campaign.campaign_expiry_date,
        campaign_max_view_count: campaign.campaign_max_view_count,
        campaign_status: campaign.campaign_status,
      })
    }
  }, [campaign])

  const createMutation = useMutation({
    mutationFn: async (data: CampaignCreate) => {
      const response = await api.post('/campaigns', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
      navigate('/campaigns')
    },
  })

  const updateMutation = useMutation({
    mutationFn: async (data: CampaignCreate) => {
      const response = await api.put(`/campaigns/${id}`, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
      queryClient.invalidateQueries({ queryKey: ['campaign', id] })
      navigate(`/campaigns/${id}`)
    },
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isEditing) {
      updateMutation.mutate(formData)
    } else {
      createMutation.mutate(formData)
    }
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate(isEditing ? `/campaigns/${id}` : '/campaigns')}
          >
            Back
          </Button>
          <Typography variant="h4">
            {isEditing ? 'Edit Campaign' : 'New Campaign'}
          </Typography>
        </Box>
      </Box>

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Campaign Name"
                name="campaign_name"
                value={formData.campaign_name}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="campaign_description"
                value={formData.campaign_description}
                onChange={handleChange}
                multiline
                rows={4}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Start Date"
                name="campaign_start_date"
                type="date"
                value={formData.campaign_start_date}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="End Date"
                name="campaign_end_date"
                type="date"
                value={formData.campaign_end_date}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Expiry Date"
                name="campaign_expiry_date"
                type="date"
                value={formData.campaign_expiry_date}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Max View Count"
                name="campaign_max_view_count"
                type="number"
                value={formData.campaign_max_view_count || ''}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Status"
                name="campaign_status"
                value={formData.campaign_status}
                onChange={handleChange}
                required
              >
                {statusOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={() =>
                    navigate(isEditing ? `/campaigns/${id}` : '/campaigns')
                  }
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<Save />}
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {isEditing ? 'Update' : 'Create'} Campaign
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  )
}
