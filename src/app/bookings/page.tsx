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
  Chip,
  InputAdornment,
} from '@mui/material';
import { Add, Edit, Delete, Close, Visibility, ArrowForward, CheckCircle, CalendarToday, Lock, Security } from '@mui/icons-material';
import Layout from '@/components/Layout';
import SearchToolbar from '@/components/shared/SearchToolbar';
import { useRouter } from 'next/navigation';

interface BookingVehicle {
  id: number;
  vehicle_type_id: number;
  vehicle_type_name: string;
  vehicle_source: string;
  truck_id: number;
  truck_number: string;
  vendor_id: number;
  vendor_name: string;
  vehicle_number: string;
  driver_id: number;
  driver_name: string;
  driver_phone: string;
  amount: number;
}

interface Booking {
  id: number;
  booking_number: string;
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
  status: string;
  total_amount: number;
  billing_type: string;
  material_description: string;
  weight_tons: number;
  lr_number: string;
  notes: string;
  vehicles?: BookingVehicle[];
}

const billingTypes = [
  { value: 'fixed', label: 'Fixed' },
  { value: 'per_tonne', label: 'Per Tonne' },
  { value: 'per_bag', label: 'Per Bag' },
];

export default function BookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [parties, setParties] = useState<any[]>([]);
  const [trucks, setTrucks] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('active');
  const [formData, setFormData] = useState({
    booking_number: '',
    party_id: '',
    truck_id: '',
    driver_id: '',
    from_location: '',
    to_location: '',
    start_date: new Date().toISOString().split('T')[0],
    status: 'booked',
    total_amount: '0',
    billing_type: 'fixed',
    material_description: '',
    weight_tons: '',
    lr_number: '',
    notes: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchBookings();
    fetchParties();
    fetchTrucks();
    fetchDrivers();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await fetch('/api/bookings');
      const data = await response.json();
      
      // Fetch vehicles for each booking
      const bookingsWithVehicles = await Promise.all(
        data.map(async (booking: Booking) => {
          try {
            const vehiclesResponse = await fetch(`/api/booking-vehicles?booking_id=${booking.id}`);
            const vehicles = await vehiclesResponse.json();
            return { ...booking, vehicles: vehicles || [] };
          } catch (err) {
            return { ...booking, vehicles: [] };
          }
        })
      );
      
      setBookings(bookingsWithVehicles);
    } catch (err) {
      setError('Failed to fetch bookings');
    }
  };

  const fetchParties = async () => {
    try {
      const response = await fetch('/api/parties');
      const data = await response.json();
      setParties(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch parties');
    }
  };

  const fetchTrucks = async () => {
    try {
      const response = await fetch('/api/trucks');
      const data = await response.json();
      setTrucks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch trucks');
    }
  };

  const fetchDrivers = async () => {
    try {
      const response = await fetch('/api/drivers');
      const data = await response.json();
      setDrivers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch drivers');
    }
  };

  const handleOpen = (booking?: Booking) => {
    if (booking) {
      setEditingBooking(booking);
      setFormData({
        booking_number: booking.booking_number || '',
        party_id: String(booking.party_id),
        truck_id: String(booking.truck_id || ''),
        driver_id: String(booking.driver_id || ''),
        from_location: booking.from_location,
        to_location: booking.to_location,
        start_date: booking.start_date,
        status: booking.status,
        total_amount: String(booking.total_amount || 0),
        billing_type: booking.billing_type,
        material_description: booking.material_description,
        weight_tons: String(booking.weight_tons || 0),
        lr_number: booking.lr_number,
        notes: booking.notes,
      });
    } else {
      setEditingBooking(null);
      setFormData({
        booking_number: `BKG${Date.now()}`,
        party_id: '',
        truck_id: '',
        driver_id: '',
        from_location: '',
        to_location: '',
        start_date: new Date().toISOString().split('T')[0],
        status: 'booked',
        total_amount: '0',
        billing_type: 'fixed',
        material_description: '',
        weight_tons: '',
        lr_number: '',
        notes: '',
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingBooking(null);
    setError('');
  };

  const handleSubmit = async () => {
    try {
      if (!formData.party_id || !formData.from_location || !formData.to_location) {
        setError('Please fill in all required fields (Customer, Origin, Destination)');
        return;
      }

      const url = editingBooking ? `/api/bookings/${editingBooking.id}` : '/api/bookings';
      const method = editingBooking ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSuccess(editingBooking ? 'Booking updated successfully' : 'Booking created successfully');
        handleClose();
        fetchBookings();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to save booking');
      }
    } catch (err) {
      setError('Failed to save booking');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this booking?')) {
      try {
        const response = await fetch(`/api/bookings/${id}`, { method: 'DELETE' });
        if (response.ok) {
          setSuccess('Booking deleted successfully');
          fetchBookings();
          setTimeout(() => setSuccess(''), 3000);
        }
      } catch (err) {
        setError('Failed to delete booking');
      }
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const formatTruckNumber = (truckNumber: string) => {
    if (!truckNumber) return null;
    const parts = truckNumber.replace(/\s+/g, ' ').trim().split(' ');
    return parts;
  };

  const getFilteredBookings = () => {
    return bookings.filter((booking) => {
      const matchesSearch = !searchQuery || 
        (booking.booking_number && booking.booking_number.toLowerCase().includes(searchQuery.toLowerCase())) ||
        booking.party_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.truck_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.lr_number?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesMonth = selectedMonth === 'all' || (() => {
        const bookingDate = new Date(booking.start_date);
        const now = new Date();
        const bookingMonth = bookingDate.getMonth();
        const bookingYear = bookingDate.getFullYear();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        
        return bookingMonth === currentMonth && bookingYear === currentYear;
      })();

      const matchesStatus = selectedStatus === 'all' || 
        (selectedStatus === 'active' && booking.status !== 'completed' && booking.status !== 'settled');

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
              onClick={() => router.push('/bookings/new')}
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
            <Box sx={{ p: 2, borderBottom: '1px solid #E0E0E0' }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={6}>
                  <SearchToolbar
                    value={searchQuery}
                    onChange={setSearchQuery}
                    placeholder="Search Bookings"
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
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      label="Status"
                    >
                      <MenuItem value="all">All Bookings</MenuItem>
                      <MenuItem value="active">Active Bookings</MenuItem>
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
                    <TableCell sx={{ fontWeight: 600, color: '#6B6C7B' }}>Customer</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#6B6C7B' }}>Truck No</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#6B6C7B' }}>Route</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#6B6C7B' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#6B6C7B' }}>Balance</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, color: '#6B6C7B' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {getFilteredBookings().map((booking) => {
                    const truckParts = formatTruckNumber(booking.truck_number);
                    return (
                      <TableRow 
                        key={booking.id} 
                        hover 
                        sx={{ cursor: 'pointer' }}
                        onClick={() => router.push(`/bookings/${booking.id}`)}
                      >
                        <TableCell sx={{ color: '#2B2D42', fontWeight: 500 }}>
                          {booking.booking_number || `#${booking.id}`}
                        </TableCell>
                        <TableCell sx={{ color: '#2B2D42' }}>
                          {new Date(booking.start_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </TableCell>
                        <TableCell sx={{ color: '#2B2D42', fontWeight: 500 }}>{booking.lr_number || 'N/A'}</TableCell>
                        <TableCell sx={{ color: '#2B2D42' }}>{booking.party_name}</TableCell>
                        <TableCell sx={{ color: '#2B2D42' }}>
                          {booking.vehicles && booking.vehicles.length > 0 ? (
                            <Box>
                              {booking.vehicles.map((vehicle, idx) => {
                                const vehicleNumber = vehicle.vehicle_source === 'own' 
                                  ? vehicle.truck_number 
                                  : vehicle.vehicle_number;
                                const vehicleParts = formatTruckNumber(vehicleNumber || '');
                                return (
                                  <Box key={idx} sx={{ mb: idx < booking.vehicles!.length - 1 ? 1 : 0 }}>
                                    <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', flexWrap: 'wrap' }}>
                                      {vehicleParts?.map((part, partIdx) => (
                                        <Box
                                          key={partIdx}
                                          sx={{
                                            bgcolor: partIdx === vehicleParts.length - 1 ? '#E3F2FD' : '#F5F5F5',
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
                                      <Chip
                                        label={vehicle.vehicle_source === 'own' ? 'Own' : 'Vendor'}
                                        size="small"
                                        sx={{
                                          height: 20,
                                          fontSize: '10px',
                                          bgcolor: vehicle.vehicle_source === 'own' ? '#E0F2FE' : '#FEF3C7',
                                          color: vehicle.vehicle_source === 'own' ? '#0369A1' : '#CA8A04',
                                        }}
                                      />
                                    </Box>
                                    <Typography sx={{ fontSize: '11px', color: '#6B6C7B', mt: 0.25 }}>
                                      {vehicle.vehicle_type_name}
                                    </Typography>
                                  </Box>
                                );
                              })}
                            </Box>
                          ) : (
                            truckParts ? (
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
                                  {booking.truck_ownership_type === 'MY' ? '(Own Vehicle)' : booking.truck_ownership_type === 'MARKET' ? '(Vendor Vehicle)' : ''}
                                </Typography>
                              </Box>
                            ) : 'N/A'
                          )}
                        </TableCell>
                        <TableCell sx={{ color: '#2B2D42' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Typography sx={{ fontSize: '14px' }}>{booking.from_location}</Typography>
                            <ArrowForward sx={{ fontSize: 16, color: '#6B6C7B' }} />
                            <Typography sx={{ fontSize: '14px' }}>{booking.to_location}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ color: '#2B2D42' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <CheckCircle sx={{ fontSize: 16, color: '#4CAF50' }} />
                            <Typography sx={{ fontSize: '14px' }}>{booking.status || 'Booked'}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ color: '#2B2D42', fontWeight: 500 }}>
                          ₹ {(booking.total_amount || 0).toLocaleString()}
                        </TableCell>
                        <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                          <IconButton onClick={() => router.push(`/bookings/${booking.id}`)} color="info" size="small" title="View Details">
                            <Visibility />
                          </IconButton>
                          <IconButton onClick={() => handleOpen(booking)} color="primary" size="small">
                            <Edit />
                          </IconButton>
                          <IconButton onClick={() => handleDelete(booking.id)} color="error" size="small">
                            <Delete />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {getFilteredBookings().length === 0 && (
                    <TableRow>
                      <TableCell colSpan={9} align="center" sx={{ py: 6, color: '#6B6C7B' }}>
                        No bookings found. Add your first booking!
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          {/* Add/Edit Booking Dialog */}
          <Dialog 
            open={open} 
            onClose={handleClose} 
            maxWidth="sm" 
            fullWidth
            PaperProps={{ sx: { borderRadius: 2, maxHeight: '90vh' } }}
          >
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
                {editingBooking ? 'Edit Booking' : 'New Booking'}
              </Typography>
              <IconButton onClick={handleClose} size="small">
                <Close />
              </IconButton>
            </DialogTitle>
            
            <DialogContent dividers sx={{ py: 3 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: '#2B2D42' }}>
                    Booking Details
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Typography variant="body2" sx={{ mb: 0.5, color: '#2B2D42', fontSize: '0.875rem' }}>
                        Start Date *
                      </Typography>
                      <TextField
                        type="date"
                        value={formData.start_date}
                        onChange={(e) => handleChange('start_date', e.target.value)}
                        fullWidth
                        size="small"
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

                    <Grid item xs={12}>
                      <Typography variant="body2" sx={{ mb: 0.5, color: '#2B2D42', fontSize: '0.875rem' }}>
                        Select Customer *
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
                            placeholder="Select Customer"
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                          />
                        )}
                      />
                    </Grid>

                    <Grid item xs={5}>
                      <Typography variant="body2" sx={{ mb: 0.5, color: '#2B2D42', fontSize: '0.875rem' }}>
                        From Location *
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
                    <Grid item xs={2} sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', pb: 0.5 }}>
                      <ArrowForward sx={{ color: '#6B6C7B' }} />
                    </Grid>
                    <Grid item xs={5}>
                      <Typography variant="body2" sx={{ mb: 0.5, color: '#2B2D42', fontSize: '0.875rem' }}>
                        To Location *
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

                    <Grid item xs={12}>
                      <Typography variant="body2" sx={{ mb: 0.5, color: '#2B2D42', fontSize: '0.875rem' }}>
                        Select Truck
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
                    </Grid>
                  </Grid>
                </Box>

                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: '#2B2D42' }}>
                    Billing Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <FormControl component="fieldset" fullWidth>
                        <Typography variant="body2" sx={{ mb: 1, color: '#2B2D42', fontSize: '0.875rem' }}>
                          Billing Type *
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
                    <Grid item xs={12}>
                      <Typography variant="body2" sx={{ mb: 0.5, color: '#2B2D42', fontSize: '0.875rem' }}>
                        Total Amount *
                      </Typography>
                      <TextField
                        placeholder="Enter amount"
                        type="number"
                        value={formData.total_amount}
                        onChange={(e) => handleChange('total_amount', e.target.value)}
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

                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: '#2B2D42' }}>
                    More Details
                  </Typography>
                  <Grid container spacing={2}>
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
                  </Grid>
                </Box>

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
                disabled={!formData.party_id || !formData.from_location || !formData.to_location || !formData.total_amount}
                sx={{
                  textTransform: 'none',
                  bgcolor: '#6930CA',
                  '&:hover': { bgcolor: '#5225A8' },
                  '&:disabled': { bgcolor: '#E0E0E0', color: '#9E9E9E' }
                }}
              >
                {editingBooking ? 'Update' : 'Create'} Booking
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Container>
    </Layout>
  );
}
