'use client';

import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Button,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel,
  Grid,
  Autocomplete,
} from '@mui/material';
import { Add, Edit, Delete, Close, Visibility, ArrowForward, CheckCircle, CalendarToday, Lock, Security } from '@mui/icons-material';
import Layout from '@/components/Layout';
import SearchToolbar from '@/components/shared/SearchToolbar';
import { useRouter } from 'next/navigation';
import { InputAdornment } from '@mui/material';

interface Trip {
  id: number;
  trip_number: string;
  party_id: number;
  party_name: string;
  truck_id: number;
  truck_number: string;
  truck_ownership_type: string;
  driver_id: number;
  driver_name: string;
  from_location: string;
  to_location: string;
  start_date: string;
  end_date: string;
  status: string;
  freight_amount: number;
  advance_amount: number;
  balance_amount: number;
  billing_type: string;
  material_description: string;
  weight_tons: number;
  lr_number: string;
  start_odometer_reading: number;
  end_odometer_reading: number;
  notes: string;
}

const billingTypes = [
  { value: 'fixed', label: 'Fixed' },
  { value: 'per_tonne', label: 'Per Tonne' },
  { value: 'per_bag', label: 'Per Bag' },
];

export default function TripsPage() {
  const router = useRouter();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [parties, setParties] = useState<any[]>([]);
  const [trucks, setTrucks] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('active');
  const [formData, setFormData] = useState({
    trip_number: '',
    party_id: '',
    truck_id: '',
    driver_id: '',
    from_location: '',
    to_location: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    status: 'booked',
    freight_amount: '',
    advance_amount: '0',
    balance_amount: '',
    billing_type: 'fixed',
    material_description: '',
    weight_tons: '',
    lr_number: '',
    start_odometer_reading: '',
    end_odometer_reading: '',
    notes: '',
  });
  const [showMoreDetails, setShowMoreDetails] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchTrips();
    fetchParties();
    fetchTrucks();
    fetchDrivers();
  }, []);

  const fetchTrips = async () => {
    try {
      const response = await fetch('/api/trips');
      const data = await response.json();
      setTrips(data);
    } catch (err) {
      setError('Failed to fetch trips');
    }
  };

  const fetchParties = async () => {
    try {
      const response = await fetch('/api/parties');
      const data = await response.json();
      setParties(data);
    } catch (err) {
      console.error('Failed to fetch parties');
    }
  };

  const fetchTrucks = async () => {
    try {
      const response = await fetch('/api/trucks');
      const data = await response.json();
      setTrucks(data);
    } catch (err) {
      console.error('Failed to fetch trucks');
    }
  };

  const fetchDrivers = async () => {
    try {
      const response = await fetch('/api/drivers');
      const data = await response.json();
      setDrivers(data);
    } catch (err) {
      console.error('Failed to fetch drivers');
    }
  };

  const handleOpen = (trip?: Trip) => {
    if (trip) {
      setEditingTrip(trip);
      setFormData({
        trip_number: trip.trip_number,
        party_id: String(trip.party_id),
        truck_id: String(trip.truck_id || ''),
        driver_id: String(trip.driver_id || ''),
        from_location: trip.from_location,
        to_location: trip.to_location,
        start_date: trip.start_date,
        end_date: trip.end_date || '',
        status: trip.status,
        freight_amount: String(trip.freight_amount || 0),
        advance_amount: String(trip.advance_amount || 0),
        balance_amount: String(trip.balance_amount || 0),
        billing_type: trip.billing_type,
        material_description: trip.material_description,
        weight_tons: String(trip.weight_tons || 0),
        lr_number: trip.lr_number,
        start_odometer_reading: String(trip.start_odometer_reading || ''),
        end_odometer_reading: String(trip.end_odometer_reading || ''),
        notes: trip.notes,
      });
    } else {
      setEditingTrip(null);
      setFormData({
        trip_number: `TRP${Date.now()}`,
        party_id: '',
        truck_id: '',
        driver_id: '',
        from_location: '',
        to_location: '',
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
        status: 'booked',
        freight_amount: '',
        advance_amount: '0',
        balance_amount: '',
        billing_type: 'fixed',
        material_description: '',
        weight_tons: '',
        lr_number: '',
        start_odometer_reading: '',
        end_odometer_reading: '',
        notes: '',
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingTrip(null);
    setError('');
    setShowMoreDetails(false);
  };

  const handleSubmit = async () => {
    try {
      // Validation
      if (!formData.party_id || !formData.from_location || !formData.to_location) {
        setError('Please fill in all required fields (Party, Origin, Destination)');
        return;
      }

      const url = editingTrip ? `/api/trips/${editingTrip.id}` : '/api/trips';
      const method = editingTrip ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSuccess(editingTrip ? 'Trip updated successfully' : 'Trip added successfully');
        handleClose();
        fetchTrips();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to save trip');
      }
    } catch (err) {
      setError('Failed to save trip');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this trip?')) {
      try {
        const response = await fetch(`/api/trips/${id}`, { method: 'DELETE' });
        if (response.ok) {
          setSuccess('Trip deleted successfully');
          fetchTrips();
          setTimeout(() => setSuccess(''), 3000);
        }
      } catch (err) {
        setError('Failed to delete trip');
      }
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Format truck number "TN 23 T 3546" style
  const formatTruckNumber = (truckNumber: string) => {
    if (!truckNumber) return null;
    
    // Try to split by spaces or parse common formats
    const parts = truckNumber.replace(/\s+/g, ' ').trim().split(' ');
    return parts;
  };

  // Filter trips based on search, month, and status
  const getFilteredTrips = () => {
    return trips.filter((trip) => {
      // Search filter
      const matchesSearch = !searchQuery || 
        trip.trip_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trip.party_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trip.truck_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trip.lr_number?.toLowerCase().includes(searchQuery.toLowerCase());

      // Month filter
      const matchesMonth = selectedMonth === 'all' || (() => {
        const tripDate = new Date(trip.start_date);
        const now = new Date();
        const tripMonth = tripDate.getMonth();
        const tripYear = tripDate.getFullYear();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        
        return tripMonth === currentMonth && tripYear === currentYear;
      })();

      // Status filter
      const matchesStatus = selectedStatus === 'all' || 
        (selectedStatus === 'active' && trip.status !== 'completed' && trip.status !== 'settled');

      return matchesSearch && matchesMonth && matchesStatus;
    });
  };

  return (
    <Layout>
      <Container maxWidth="lg">
        <Box sx={{ my: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#2B2D42' }}>
              Bookings
            </Typography>
            <Button 
              variant="contained" 
              startIcon={<Add />} 
              onClick={() => router.push('/trips/new')}
              sx={{
                bgcolor: '#6930CA',
                '&:hover': { bgcolor: '#5225A8' },
                textTransform: 'none',
                fontWeight: 500,
              }}
            >
              New Booking
            </Button>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

          <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
            {/* Search and Filter Toolbar */}
            <Box sx={{ p: 2, borderBottom: '1px solid #E0E0E0' }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={6}>
                  <SearchToolbar
                    value={searchQuery}
                    onChange={setSearchQuery}
                    placeholder="Search Trips"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Date</InputLabel>
                    <Select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      label="Date"
                    >
                      <MenuItem value="all">All Months</MenuItem>
                      <MenuItem value="current">Current Month</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Trip Status</InputLabel>
                    <Select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      label="Trip Status"
                    >
                      <MenuItem value="all">All Trips</MenuItem>
                      <MenuItem value="active">Active Trips (Not Settled)</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Box>

            <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: '#FAFAFA' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, color: '#6B6C7B' }}>Booking ID</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#6B6C7B' }}>Start Date</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#6B6C7B' }}>LR Number</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#6B6C7B' }}>Party Name</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#6B6C7B' }}>Truck No</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#6B6C7B' }}>Route</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#6B6C7B' }}>Trip Status</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#6B6C7B' }}>Party Balance</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, color: '#6B6C7B' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {getFilteredTrips().map((trip) => {
                  const truckParts = formatTruckNumber(trip.truck_number);
                  return (
                  <TableRow 
                    key={trip.id} 
                    hover 
                    sx={{ cursor: 'pointer' }}
                    onClick={() => router.push(`/trips/${trip.id}`)}
                  >
                    <TableCell sx={{ color: '#2B2D42', fontWeight: 500 }}>
                      #{trip.id}
                    </TableCell>
                    <TableCell sx={{ color: '#2B2D42' }}>
                      {new Date(trip.start_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </TableCell>
                    <TableCell sx={{ color: '#2B2D42', fontWeight: 500 }}>{trip.lr_number || 'N/A'}</TableCell>
                    <TableCell sx={{ color: '#2B2D42' }}>{trip.party_name}</TableCell>
                    <TableCell sx={{ color: '#2B2D42' }}>
                      {truckParts ? (
                        <Box>
                          <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                            {truckParts.map((part, idx) => (
                              <Box
                                key={idx}
                                sx={{
                                  bgcolor: idx === truckParts.length - 1 ? '#E3F2FD' : '#F5F5F5',
                                  px: 0.75,
                                  py: 0.25,
                                  borderRadius: 0.5,
                                  fontSize: '13px',
                                  fontWeight: 500,
                                }}
                              >
                                {part}
                              </Box>
                            ))}
                          </Box>
                          <Typography sx={{ fontSize: '11px', color: '#6B6C7B', mt: 0.5 }}>
                            {trip.truck_ownership_type === 'MY' ? '(Own Vehicle)' : trip.truck_ownership_type === 'MARKET' ? '(Vendor Vehicle)' : ''}
                          </Typography>
                        </Box>
                      ) : 'N/A'}
                    </TableCell>
                    <TableCell sx={{ color: '#2B2D42' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Typography sx={{ fontSize: '14px' }}>{trip.from_location}</Typography>
                        <ArrowForward sx={{ fontSize: 16, color: '#6B6C7B' }} />
                        <Typography sx={{ fontSize: '14px' }}>{trip.to_location}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ color: '#2B2D42' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <CheckCircle sx={{ fontSize: 16, color: '#4CAF50' }} />
                        <Typography sx={{ fontSize: '14px' }}>{trip.status || 'Started'}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ color: '#2B2D42', fontWeight: 500 }}>
                      ₹ {(trip.balance_amount || 0).toLocaleString()}
                    </TableCell>
                    <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                      <IconButton onClick={() => router.push(`/trips/${trip.id}`)} color="info" size="small" title="View Details">
                        <Visibility />
                      </IconButton>
                      <IconButton onClick={() => handleOpen(trip)} color="primary" size="small">
                        <Edit />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(trip.id)} color="error" size="small">
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                  );
                })}
                {getFilteredTrips().length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 6, color: '#6B6C7B' }}>
                      No trips found. Add your first trip!
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          </Paper>

          {/* Add/Edit Trip Dialog */}
          <Dialog 
            open={open} 
            onClose={handleClose} 
            maxWidth="sm" 
            fullWidth
            PaperProps={{ sx: { borderRadius: 2, maxHeight: '90vh' } }}
          >
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
                {editingTrip ? 'Edit Trip' : 'Add Trip'}
              </Typography>
              <IconButton onClick={handleClose} size="small">
                <Close />
              </IconButton>
            </DialogTitle>
            
            <DialogContent dividers sx={{ py: 3 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* Trip Details Section */}
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: '#2B2D42' }}>
                    Trip Details
                  </Typography>
                  <Grid container spacing={2}>
                    {/* Select Party */}
                    <Grid item xs={12}>
                      <Typography variant="body2" sx={{ mb: 0.5, color: '#2B2D42', fontSize: '0.875rem' }}>
                        Select Party *
                      </Typography>
                      <Autocomplete
                        options={parties}
                        getOptionLabel={(option) => option.name || ''}
                        value={parties.find(p => p.id.toString() === formData.party_id) || null}
                        onChange={(e, newValue) => {
                          handleChange('party_id', newValue ? newValue.id.toString() : '');
                        }}
                        size="small"
                        renderInput={(params) => (
                          <TextField 
                            {...params} 
                            placeholder="Select Party"
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                          />
                        )}
                      />
                    </Grid>

                    {/* Select Truck */}
                    <Grid item xs={12}>
                      <Typography variant="body2" sx={{ mb: 0.5, color: '#2B2D42', fontSize: '0.875rem' }}>
                        Select Truck *
                      </Typography>
                      <Autocomplete
                        options={trucks}
                        getOptionLabel={(option) => option.truck_number || ''}
                        value={trucks.find(t => t.id.toString() === formData.truck_id) || null}
                        onChange={(e, newValue) => {
                          handleChange('truck_id', newValue ? newValue.id.toString() : '');
                        }}
                        size="small"
                        renderInput={(params) => (
                          <TextField 
                            {...params} 
                            placeholder="Select Truck"
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                          />
                        )}
                      />
                    </Grid>

                    {/* Select Driver */}
                    <Grid item xs={12}>
                      <Typography variant="body2" sx={{ mb: 0.5, color: '#2B2D42', fontSize: '0.875rem' }}>
                        Select Driver
                      </Typography>
                      <Autocomplete
                        options={drivers}
                        getOptionLabel={(option) => option.name || ''}
                        value={drivers.find(d => d.id.toString() === formData.driver_id) || null}
                        onChange={(e, newValue) => {
                          handleChange('driver_id', newValue ? newValue.id.toString() : '');
                        }}
                        size="small"
                        renderInput={(params) => (
                          <TextField 
                            {...params} 
                            placeholder="Select Driver"
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                          />
                        )}
                      />
                      <Typography variant="caption" sx={{ color: '#9E9E9E', fontSize: '0.75rem', mt: 0.5 }}>
                        Optional
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>

                {/* Billing Information Section */}
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: '#2B2D42' }}>
                    Billing Information
                  </Typography>
                  <Grid container spacing={2}>
                    {/* Party Billing Type */}
                    <Grid item xs={12}>
                      <FormControl component="fieldset" fullWidth>
                        <Typography variant="body2" sx={{ mb: 1, color: '#2B2D42', fontSize: '0.875rem' }}>
                          Party Billing Type *
                        </Typography>
                        <RadioGroup
                          value={formData.billing_type}
                          onChange={(e) => handleChange('billing_type', e.target.value)}
                        >
                          {billingTypes.map((type) => (
                            <FormControlLabel
                              key={type.value}
                              value={type.value}
                              control={<Radio size="small" />}
                              label={
                                <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                                  {type.label}
                                </Typography>
                              }
                              sx={{ mb: 0.5 }}
                            />
                          ))}
                        </RadioGroup>
                      </FormControl>
                    </Grid>

                    {/* Party Freight Amount */}
                    <Grid item xs={12}>
                      <Typography variant="body2" sx={{ mb: 0.5, color: '#2B2D42', fontSize: '0.875rem' }}>
                        Party Freight Amount*
                      </Typography>
                      <TextField
                        placeholder="Enter Amount"
                        type="number"
                        value={formData.freight_amount}
                        onChange={(e) => handleChange('freight_amount', e.target.value)}
                        fullWidth
                        size="small"
                        InputProps={{
                          startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                        }}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                      />
                    </Grid>
                  </Grid>
                </Box>

                {/* Start Date Section */}
                <Box>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Typography variant="body2" sx={{ mb: 0.5, color: '#2B2D42', fontSize: '0.875rem' }}>
                        Start Date*
                      </Typography>
                      <TextField
                        placeholder="Select Start Date"
                        type="date"
                        value={formData.start_date}
                        onChange={(e) => handleChange('start_date', e.target.value)}
                        fullWidth
                        size="small"
                        InputLabelProps={{ shrink: true }}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <CalendarToday fontSize="small" sx={{ color: '#6B6C7B' }} />
                            </InputAdornment>
                          ),
                        }}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                      />
                    </Grid>
                  </Grid>
                </Box>

                {/* More Details Section */}
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: '#2B2D42' }}>
                    More Details
                  </Typography>
                  <Grid container spacing={2}>
                    {/* LR No */}
                    <Grid item xs={6}>
                      <Typography variant="body2" sx={{ mb: 0.5, color: '#2B2D42', fontSize: '0.875rem' }}>
                        LR No
                      </Typography>
                      <TextField
                        placeholder="Enter LR Number"
                        value={formData.lr_number}
                        onChange={(e) => handleChange('lr_number', e.target.value)}
                        fullWidth
                        size="small"
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                      />
                    </Grid>

                    {/* Material */}
                    <Grid item xs={6}>
                      <Typography variant="body2" sx={{ mb: 0.5, color: '#2B2D42', fontSize: '0.875rem' }}>
                        Material
                      </Typography>
                      <TextField
                        placeholder="Enter Material Name"
                        value={formData.material_description}
                        onChange={(e) => handleChange('material_description', e.target.value)}
                        fullWidth
                        size="small"
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                      />
                    </Grid>

                    {/* From Location */}
                    <Grid item xs={6}>
                      <Typography variant="body2" sx={{ mb: 0.5, color: '#2B2D42', fontSize: '0.875rem' }}>
                        From Location*
                      </Typography>
                      <TextField
                        placeholder="Eg. Mumbai"
                        value={formData.from_location}
                        onChange={(e) => handleChange('from_location', e.target.value)}
                        fullWidth
                        size="small"
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                      />
                    </Grid>

                    {/* To Location */}
                    <Grid item xs={6}>
                      <Typography variant="body2" sx={{ mb: 0.5, color: '#2B2D42', fontSize: '0.875rem' }}>
                        To Location*
                      </Typography>
                      <TextField
                        placeholder="Eg. Bangalore"
                        value={formData.to_location}
                        onChange={(e) => handleChange('to_location', e.target.value)}
                        fullWidth
                        size="small"
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                      />
                    </Grid>
                  </Grid>
                </Box>

                {/* Security Badges */}
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-around', 
                  alignItems: 'center', 
                  py: 2, 
                  px: 1,
                  bgcolor: '#F5F5F5',
                  borderRadius: 1,
                  gap: 2
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Lock fontSize="small" sx={{ color: '#6B6C7B' }} />
                    <Typography variant="caption" sx={{ color: '#6B6C7B', fontSize: '0.75rem' }}>
                      100% Safe & Secure
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Security fontSize="small" sx={{ color: '#6B6C7B' }} />
                    <Typography variant="caption" sx={{ color: '#6B6C7B', fontSize: '0.75rem' }}>
                      256-bit Encryption
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 2, gap: 2 }}>
              <Button 
                onClick={handleClose} 
                variant="outlined" 
                fullWidth
                sx={{ 
                  textTransform: 'none',
                  borderColor: '#E0E0E0',
                  color: '#2B2D42',
                  '&:hover': { borderColor: '#BDBDBD' }
                }}
              >
                Close
              </Button>
              <Button 
                onClick={handleSubmit} 
                variant="contained"
                fullWidth
                disabled={!formData.party_id || !formData.from_location || !formData.to_location || !formData.freight_amount}
                sx={{
                  textTransform: 'none',
                  bgcolor: '#6930CA',
                  '&:hover': { bgcolor: '#5225A8' },
                  '&:disabled': { bgcolor: '#E0E0E0', color: '#9E9E9E' }
                }}
              >
                {editingTrip ? 'Update' : 'Start'} Trip
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Container>
    </Layout>
  );
}
