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
} from '@mui/material'
import { Add, Edit, Visibility } from '@mui/icons-material'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import api from '@/lib/api'
import { Ad } from '@/types'

export default function AdList() {
  const navigate = useNavigate()
  const [page] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['ads', page],
    queryFn: async () => {
      const response = await api.get(`/ads?page=${page}&page_size=50`)
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
        <Typography variant="h4">Ads</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/ads/new')}
        >
          New Ad
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Media Type</TableCell>
              <TableCell>View Count</TableCell>
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
            ) : data?.ads?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No ads found
                </TableCell>
              </TableRow>
            ) : (
              data?.ads?.map((ad: Ad) => (
                <TableRow key={ad.ad_id} hover>
                  <TableCell>
                    <Typography variant="body1">{ad.ad_name}</Typography>
                  </TableCell>
                  <TableCell>{ad.ad_type_id}</TableCell>
                  <TableCell>
                    <Chip
                      label={ad.ad_status}
                      color={getStatusColor(ad.ad_status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{ad.media_type}</TableCell>
                  <TableCell>{ad.ad_view_count}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => navigate(`/ads/${ad.ad_id}`)}
                    >
                      <Visibility />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => navigate(`/ads/${ad.ad_id}/edit`)}
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
    </Box>
  )
}
