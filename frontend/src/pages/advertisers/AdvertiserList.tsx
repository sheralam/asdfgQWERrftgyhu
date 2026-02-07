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
  IconButton,
} from '@mui/material'
import { Add, Edit, Visibility } from '@mui/icons-material'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { Advertiser } from '@/types'

export default function AdvertiserList() {
  const navigate = useNavigate()

  const { data, isLoading } = useQuery({
    queryKey: ['advertisers'],
    queryFn: async () => {
      const response = await api.get('/advertisers?page=1&page_size=50')
      return response.data
    },
  })

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Advertisers</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/advertisers/new')}
        >
          New Advertiser
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>City</TableCell>
              <TableCell>Country</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : data?.advertisers?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No advertisers found
                </TableCell>
              </TableRow>
            ) : (
              data?.advertisers?.map((advertiser: Advertiser) => (
                <TableRow key={advertiser.advertiser_id} hover>
                  <TableCell>{advertiser.advertiser_name}</TableCell>
                  <TableCell>{advertiser.advertiser_type}</TableCell>
                  <TableCell>{advertiser.city}</TableCell>
                  <TableCell>{advertiser.country}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => navigate(`/advertisers/${advertiser.advertiser_id}`)}
                    >
                      <Visibility />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => navigate(`/advertisers/${advertiser.advertiser_id}/edit`)}
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
