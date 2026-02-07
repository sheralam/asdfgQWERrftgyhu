import { useParams, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { Box, Button, Typography, Paper, TextField, Grid, MenuItem } from '@mui/material'
import { ArrowBack, Save } from '@mui/icons-material'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'

const adTypes = [
  'top_bar_ad',
  'bottom_left_ad',
  'bottom_right_ad',
  'bottom_center_ad',
  'center_right_content_ad',
  'center_left_content_ad',
]

const mediaTypes = ['image', 'video', 'html']
const statusOptions = ['draft', 'active', 'inactive', 'paused', 'expired']

export default function AdForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const isEditing = !!id

  const [formData, setFormData] = useState({
    campaign_id: '',
    ad_name: '',
    ad_description: '',
    ad_type_id: 'top_bar_ad',
    media_type: 'image',
    media_url: '',
    ad_status: 'draft',
  })

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/ads', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ads'] })
      navigate('/ads')
    },
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate(formData)
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/ads')}>Back</Button>
        <Typography variant="h4">{isEditing ? 'Edit Ad' : 'New Ad'}</Typography>
      </Box>

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Campaign ID"
                name="campaign_id"
                value={formData.campaign_id}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Ad Name"
                name="ad_name"
                value={formData.ad_name}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="ad_description"
                value={formData.ad_description}
                onChange={handleChange}
                multiline
                rows={4}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                select
                label="Ad Type"
                name="ad_type_id"
                value={formData.ad_type_id}
                onChange={handleChange}
              >
                {adTypes.map((type) => (
                  <MenuItem key={type} value={type}>{type}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                select
                label="Media Type"
                name="media_type"
                value={formData.media_type}
                onChange={handleChange}
              >
                {mediaTypes.map((type) => (
                  <MenuItem key={type} value={type}>{type}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Media URL"
                name="media_url"
                value={formData.media_url}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                select
                label="Status"
                name="ad_status"
                value={formData.ad_status}
                onChange={handleChange}
              >
                {statusOptions.map((status) => (
                  <MenuItem key={status} value={status}>{status}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button variant="outlined" onClick={() => navigate('/ads')}>Cancel</Button>
                <Button type="submit" variant="contained" startIcon={<Save />}>
                  {isEditing ? 'Update' : 'Create'} Ad
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  )
}
