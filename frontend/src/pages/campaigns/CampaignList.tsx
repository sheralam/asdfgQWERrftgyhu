import { useNavigate } from 'react-router-dom'
import {
  Box,
  Button,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
} from '@mui/material'
import { Add, Edit, Visibility, Search } from '@mui/icons-material'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import api from '@/lib/api'
import { Campaign } from '@/types'
import { format } from 'date-fns'

export default function CampaignList() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [page] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['campaigns', page, search],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: '50',
      })
      if (search) params.append('search', search)
      const response = await api.get(`/campaigns?${params}`)
      return response.data
    },
  })

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
        <Typography variant="h4">Campaigns</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/campaigns/new')}
        >
          New Campaign
        </Button>
      </Box>

      <Paper sx={{ mb: 3, p: 2 }}>
        <TextField
          fullWidth
          placeholder="Search campaigns..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Start Date</TableCell>
              <TableCell>End Date</TableCell>
              <TableCell>Created By</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : data?.campaigns?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No campaigns found
                </TableCell>
              </TableRow>
            ) : (
              data?.campaigns?.map((campaign: Campaign) => (
                <TableRow key={campaign.campaign_id} hover>
                  <TableCell>
                    <Typography variant="body1">{campaign.campaign_name}</Typography>
                    {campaign.campaign_description && (
                      <Typography variant="body2" color="text.secondary">
                        {campaign.campaign_description.substring(0, 60)}
                        {campaign.campaign_description.length > 60 ? '...' : ''}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={campaign.campaign_status}
                      color={getStatusColor(campaign.campaign_status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {format(new Date(campaign.campaign_start_date), 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell>
                    {format(new Date(campaign.campaign_end_date), 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell>{campaign.created_by_name || 'N/A'}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => navigate(`/campaigns/${campaign.campaign_id}`)}
                    >
                      <Visibility />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => navigate(`/campaigns/${campaign.campaign_id}/edit`)}
                    >
                      <Edit />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {data && (
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Showing {data.campaigns?.length || 0} of {data.total || 0} campaigns
          </Typography>
        </Box>
      )}
    </Box>
  )
}
