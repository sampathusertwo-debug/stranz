'use client';

import React, { useState, useEffect, Suspense } from 'react';
import {
  Container,
  Typography,
  Button,
  Box,
  Paper,
  TextField,
  Grid,
  Autocomplete,
  InputAdornment,
  Divider,
  Alert,
  Collapse,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
} from '@mui/material';
import { Save, CalendarToday, ArrowBack, ArrowForward, ExpandMore, ExpandLess, Add, Delete, DirectionsCar } from '@mui/icons-material';
import Layout from '@/components/Layout';
import { useRouter, useSearchParams } from 'next/navigation';

function NewBookingPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');
  
  const [parties, setParties] = useState<any[]>([]);
  const [trucks, setTrucks] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [vehicleTypes, setVehicleTypes] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [bookingVehicles, setBookingVehicles] = useState<any[]>([]);
  const [showAdditionalDetails, setShowAdditionalDetails] = useState(false);
  const [addPartyDialog, setAddPartyDialog] = useState(false);
  const [addDriverDialog, setAddDriverDialog] = useState(false);
  const [addVehicleDialog, setAddVehicleDialog] = useState(false);
  const [newPartyData, setNewPartyData] = useState({
    name: '',
    phone: '',
  });
  const [newDriverData, setNewDriverData] = useState({
    name: '',
    phone: '',
    license_number: '',
    address: '',
  });
  const [vehicleFormData, setVehicleFormData] = useState({
    vehicle_type_id: '',
    vehicle_source: 'own',
    truck_id: '',
    vendor_id: '',
    vehicle_number: '',
    driver_id: '',
    driver_name: '',
    driver_phone: '',
    amount: '',
    notes: '',
  });
  const [formData, setFormData] = useState({
    booking_number: `BKG${Date.now()}`,
    party_id: '',
    from_location: '',
    to_location: '',
    start_date: new Date().toISOString().split('T')[0],
    status: 'booked',
    total_amount: '',
    material_description: '',
    weight_tons: '',
    lr_number: '',
    notes: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchParties();
    fetchTrucks();
    fetchDrivers();
    fetchVehicleTypes();
    fetchVendors();
    if (editId) {
      fetchBooking(editId);
    }
  }, [editId]);

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

  const fetchVehicleTypes = async () => {
    try {
      const response = await fetch('/api/vehicle-types');
      const data = await response.json();
      setVehicleTypes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch vehicle types:', err);
      setVehicleTypes([]);
    }
  };

  const fetchVendors = async () => {
    try {
      const response = await fetch('/api/vendors');
      const data = await response.json();
      setVendors(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch vendors');
    }
  };

  const fetchBooking = async (id: string) => {
    try {
      const response = await fetch(`/api/bookings/${id}`);
      const data = await response.json();
      setFormData({
        booking_number: data.booking_number,
        party_id: String(data.party_id),
        from_location: data.from_location,
        to_location: data.to_location,
        start_date: data.start_date,
        status: data.status,
        total_amount: String(data.total_amount || ''),
        material_description: data.material_description || '',
        weight_tons: String(data.weight_tons || ''),
        lr_number: data.lr_number || '',
        notes: data.notes || '',
      });
      if (data.material_description || data.notes || data.lr_number || data.weight_tons) {
        setShowAdditionalDetails(true);
      }

      // Fetch booking vehicles
      const vehiclesResponse = await fetch(`/api/booking-vehicles?booking_id=${id}`);
      const vehiclesData = await vehiclesResponse.json();
      setBookingVehicles(vehiclesData || []);
    } catch (err) {
      setError('Failed to fetch booking');
    }
  };

  const handleAddParty = async () => {
    if (!newPartyData.name || !newPartyData.phone) {
      setError('Customer name and phone are required');
      return;
    }

    try {
      const response = await fetch('/api/parties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPartyData),
      });

      if (response.ok) {
        const newParty = await response.json();
        await fetchParties();
        setFormData(prev => ({ ...prev, party_id: String(newParty.id) }));
        setAddPartyDialog(false);
        setNewPartyData({ name: '', phone: '' });
        setSuccess('Party added successfully');
      } else {
        setError('Failed to add party');
      }
    } catch (err) {
      setError('Failed to add party');
    }
  };

  const handleAddDriver = async () => {
    if (!newDriverData.name || !newDriverData.phone) {
      setError('Driver name and phone are required');
      return;
    }

    try {
      const response = await fetch('/api/drivers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDriverData),
      });

      if (response.ok) {
        const newDriver = await response.json();
        await fetchDrivers();
        setFormData(prev => ({ ...prev, driver_id: String(newDriver.id) }));
        setAddDriverDialog(false);
        setNewDriverData({ name: '', phone: '', license_number: '', address: '' });
        setSuccess('Driver added successfully');
      } else {
        setError('Failed to add driver');
      }
    } catch (err) {
      setError('Failed to add driver');
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleVehicleChange = (field: string, value: any) => {
    setVehicleFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddVehicle = () => {
    if (!vehicleFormData.vehicle_type_id) {
      setError('Please select a vehicle type');
      return;
    }

    if (vehicleFormData.vehicle_source === 'own') {
      if (!vehicleFormData.truck_id) {
        setError('Please select a truck');
        return;
      }
    } else {
      if (!vehicleFormData.vendor_id || !vehicleFormData.vehicle_number) {
        setError('Please select vendor and enter vehicle number');
        return;
      }
    }

    const newVehicle = {
      ...vehicleFormData,
      id: Date.now(), // temporary ID for display
      vehicle_type_name: vehicleTypes.find(v => v.id.toString() === vehicleFormData.vehicle_type_id)?.name || '',
      truck_number: trucks.find(t => t.id.toString() === vehicleFormData.truck_id)?.truck_number || '',
      vendor_name: vendors.find(v => v.id.toString() === vehicleFormData.vendor_id)?.name || '',
      driver_name_display: vehicleFormData.vehicle_source === 'own' 
        ? drivers.find(d => d.id.toString() === vehicleFormData.driver_id)?.name || ''
        : vehicleFormData.driver_name,
      driver_phone_display: vehicleFormData.vehicle_source === 'own'
        ? drivers.find(d => d.id.toString() === vehicleFormData.driver_id)?.phone || ''
        : vehicleFormData.driver_phone,
    };

    setBookingVehicles([...bookingVehicles, newVehicle]);
    setAddVehicleDialog(false);
    setVehicleFormData({
      vehicle_type_id: '',
      vehicle_source: 'own',
      truck_id: '',
      vendor_id: '',
      vehicle_number: '',
      driver_id: '',
      driver_name: '',
      driver_phone: '',
      amount: '',
      notes: '',
    });
    setSuccess('Vehicle added successfully');
  };

  const handleRemoveVehicle = (index: number) => {
    setBookingVehicles(bookingVehicles.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.party_id || !formData.from_location || !formData.to_location) {
      setError('Please fill in all required fields (Party, From Location, To Location)');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        party_id: parseInt(formData.party_id),
        truck_id: null, // Not used anymore since we have booking_vehicles
        driver_id: null,
        vehicle_type_id: null,
        total_amount: formData.total_amount ? parseFloat(formData.total_amount) : 0,
        weight_tons: formData.weight_tons ? parseFloat(formData.weight_tons) : null,
      };

      const url = editId ? `/api/bookings/${editId}` : '/api/bookings';
      const method = editId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const savedBooking = await response.json();
        const bookingId = savedBooking.id || editId;

        // Save booking vehicles
        if (bookingVehicles.length > 0) {
          for (const vehicle of bookingVehicles) {
            const vehiclePayload = {
              booking_id: bookingId,
              vehicle_type_id: parseInt(vehicle.vehicle_type_id),
              vehicle_source: vehicle.vehicle_source,
              truck_id: vehicle.truck_id ? parseInt(vehicle.truck_id) : null,
              vendor_id: vehicle.vendor_id ? parseInt(vehicle.vendor_id) : null,
              vehicle_number: vehicle.vehicle_number || null,
              driver_id: vehicle.driver_id ? parseInt(vehicle.driver_id) : null,
              driver_name: vehicle.driver_name || null,
              driver_phone: vehicle.driver_phone || null,
              amount: vehicle.amount ? parseFloat(vehicle.amount) : null,
              notes: vehicle.notes || null,
            };

            await fetch('/api/booking-vehicles', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(vehiclePayload),
            });
          }
        }

        setSuccess(editId ? 'Booking updated successfully' : 'Booking created successfully');
        setTimeout(() => router.push('/bookings'), 1500);
      } else {
        const errorData = await response.json();
        setError(`Failed to save booking: ${errorData.error || 'Unknown error'}`);
        console.error('Error creating booking:', errorData);
      }
    } catch (err: any) {
      setError(`Failed to save booking: ${err.message}`);
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Container maxWidth="md">
        <Box sx={{ my: 4 }}>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Button
              startIcon={<ArrowBack />}
              onClick={() => router.push('/bookings')}
              sx={{ mr: 2 }}
            >
              Back
            </Button>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
              {editId ? 'Edit Booking' : 'Create New Booking'}
            </Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

          {/* Form */}
          <Paper sx={{ p: 4 }}>
            <form onSubmit={handleSubmit}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {/* Booking Details Section */}
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: '#2B2D42' }}>
                    Booking Details
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <Typography variant="body2" sx={{ mb: 1, color: '#2B2D42', fontWeight: 500 }}>
                        Start Date *
                      </Typography>
                      <TextField
                        type="date"
                        value={formData.start_date}
                        onChange={(e) => handleChange('start_date', e.target.value)}
                        fullWidth
                        required
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <CalendarToday fontSize="small" sx={{ color: '#6B6C7B' }} />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>

                    <Grid item xs={4}>
                      <Typography variant="body2" sx={{ mb: 1, color: '#2B2D42', fontWeight: 500 }}>
                        Select Customer *
                      </Typography>
                      <Autocomplete
                        options={parties}
                        getOptionLabel={(option) => option.name || ''}
                        value={parties.find(p => p.id.toString() === formData.party_id) || null}
                        onChange={(e, newValue) => {
                          handleChange('party_id', newValue ? newValue.id.toString() : '');
                        }}
                        renderInput={(params) => (
                          <TextField 
                            {...params} 
                            placeholder="Select Customer"
                            required
                          />
                        )}
                      />
                      <Button
                        size="small"
                        startIcon={<Add />}
                        onClick={() => setAddPartyDialog(true)}
                        sx={{ mt: 1, textTransform: 'none', color: '#6930CA' }}
                      >
                        Add New Customer
                      </Button>
                    </Grid>

                    <Grid item xs={3}>
                      <Typography variant="body2" sx={{ mb: 1, color: '#2B2D42', fontWeight: 500 }}>
                        From Location *
                      </Typography>
                      <TextField
                        placeholder="Eg. Mumbai"
                        value={formData.from_location}
                        onChange={(e) => handleChange('from_location', e.target.value)}
                        fullWidth
                        required
                      />
                    </Grid>
                    <Grid item xs={1} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', pt: '30px' }}>
                      <ArrowForward sx={{ color: '#6B6C7B' }} />
                    </Grid>
                    <Grid item xs={4}>
                      <Typography variant="body2" sx={{ mb: 1, color: '#2B2D42', fontWeight: 500 }}>
                        To Location *
                      </Typography>
                      <TextField
                        placeholder="Eg. Bangalore"
                        value={formData.to_location}
                        onChange={(e) => handleChange('to_location', e.target.value)}
                        fullWidth
                        required
                      />
                    </Grid>
                  </Grid>
                </Box>

                <Divider />

                {/* Vehicles Section */}
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#2B2D42' }}>
                      Vehicles & Drivers
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<DirectionsCar />}
                      onClick={() => setAddVehicleDialog(true)}
                      sx={{ 
                        bgcolor: '#6930CA',
                        '&:hover': { bgcolor: '#5A28AA' }
                      }}
                    >
                      Add Vehicle
                    </Button>
                  </Box>

                  {bookingVehicles.length === 0 ? (
                    <Paper sx={{ p: 3, textAlign: 'center', bgcolor: '#F9FAFB' }}>
                      <Typography variant="body2" color="text.secondary">
                        No vehicles added yet. Click "Add Vehicle" to add trucks/vehicles to this booking.
                      </Typography>
                    </Paper>
                  ) : (
                    <TableContainer component={Paper} sx={{ border: '1px solid #E5E7EB' }}>
                      <Table>
                        <TableHead>
                          <TableRow sx={{ bgcolor: '#F9FAFB' }}>
                            <TableCell sx={{ fontWeight: 600 }}>Vehicle Type</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Source</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Vehicle No.</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Driver</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Phone</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Amount</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Action</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {bookingVehicles.map((vehicle, index) => (
                            <TableRow key={index}>
                              <TableCell>{vehicle.vehicle_type_name}</TableCell>
                              <TableCell>
                                <Box sx={{
                                  display: 'inline-block',
                                  px: 1.5,
                                  py: 0.5,
                                  borderRadius: 1,
                                  bgcolor: vehicle.vehicle_source === 'own' ? '#E0F2FE' : '#FEF3C7',
                                  color: vehicle.vehicle_source === 'own' ? '#0369A1' : '#CA8A04',
                                  fontSize: '0.75rem',
                                  fontWeight: 600,
                                }}>
                                  {vehicle.vehicle_source === 'own' ? 'Own' : 'Vendor'}
                                </Box>
                              </TableCell>
                              <TableCell>
                                {vehicle.vehicle_source === 'own' ? vehicle.truck_number : vehicle.vehicle_number}
                              </TableCell>
                              <TableCell>{vehicle.driver_name_display || '----'}</TableCell>
                              <TableCell>{vehicle.driver_phone_display || '----'}</TableCell>
                              <TableCell>
                                {vehicle.amount ? `₹${parseFloat(vehicle.amount).toLocaleString()}` : '----'}
                              </TableCell>
                              <TableCell>
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleRemoveVehicle(index)}
                                >
                                  <Delete />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </Box>

                <Divider />

                {/* Billing */}
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: '#2B2D42' }}>
                    Billing
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" sx={{ mb: 1, color: '#2B2D42', fontWeight: 500 }}>
                        Total Amount (Optional)
                      </Typography>
                      <TextField
                        placeholder="Enter total amount"
                        type="number"
                        value={formData.total_amount}
                        onChange={(e) => handleChange('total_amount', e.target.value)}
                        fullWidth
                        InputProps={{
                          startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                        }}
                      />
                    </Grid>
                  </Grid>
                </Box>

                <Divider />

                {/* Additional Details */}
                <Box>
                  <Button
                    onClick={() => setShowAdditionalDetails(!showAdditionalDetails)}
                    endIcon={showAdditionalDetails ? <ExpandLess /> : <ExpandMore />}
                    sx={{ mb: 2, textTransform: 'none', color: '#6930CA' }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#2B2D42' }}>
                      Additional Details
                    </Typography>
                  </Button>
                  
                  <Collapse in={showAdditionalDetails}>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" sx={{ mb: 1, color: '#2B2D42', fontWeight: 500 }}>
                          LR Number
                        </Typography>
                        <TextField
                          placeholder="Enter LR number"
                          value={formData.lr_number}
                          onChange={(e) => handleChange('lr_number', e.target.value)}
                          fullWidth
                        />
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" sx={{ mb: 1, color: '#2B2D42', fontWeight: 500 }}>
                          Weight (Tonnes)
                        </Typography>
                        <TextField
                          placeholder="Enter weight"
                          type="number"
                          value={formData.weight_tons}
                          onChange={(e) => handleChange('weight_tons', e.target.value)}
                          fullWidth
                        />
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" sx={{ mb: 1, color: '#2B2D42', fontWeight: 500 }}>
                          Material Description
                        </Typography>
                        <TextField
                          placeholder="Enter material description"
                          value={formData.material_description}
                          onChange={(e) => handleChange('material_description', e.target.value)}
                          fullWidth
                          multiline
                          rows={2}
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <Typography variant="body2" sx={{ mb: 1, color: '#2B2D42', fontWeight: 500 }}>
                          Notes
                        </Typography>
                        <TextField
                          placeholder="Enter any additional notes"
                          value={formData.notes}
                          onChange={(e) => handleChange('notes', e.target.value)}
                          fullWidth
                          multiline
                          rows={3}
                        />
                      </Grid>
                    </Grid>
                  </Collapse>
                </Box>

                {/* Action Buttons */}
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', pt: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={() => router.push('/bookings')}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<Save />}
                    disabled={loading}
                    sx={{ 
                      bgcolor: '#6930CA',
                      '&:hover': {
                        bgcolor: '#5a28b0'
                      }
                    }}
                  >
                    {loading ? 'Saving...' : (editId ? 'Update Booking' : 'Create Booking')}
                  </Button>
                </Box>
              </Box>
            </form>
          </Paper>

          {/* Add Customer Dialog */}
          <Dialog open={addPartyDialog} onClose={() => setAddPartyDialog(false)} maxWidth="sm" fullWidth>
            <DialogTitle>Add New Customer</DialogTitle>
            <DialogContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                <TextField
                  label="Customer Name"
                  value={newPartyData.name}
                  onChange={(e) => setNewPartyData(prev => ({ ...prev, name: e.target.value }))}
                  required
                  fullWidth
                  autoFocus
                />
                <TextField
                  label="Mobile Number"
                  value={newPartyData.phone}
                  onChange={(e) => setNewPartyData(prev => ({ ...prev, phone: e.target.value }))}
                  required
                  fullWidth
                />
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => {
                setAddPartyDialog(false);
                setNewPartyData({ name: '', phone: '' });
              }}>
                Cancel
              </Button>
              <Button
                onClick={handleAddParty}
                variant="contained"
                sx={{ bgcolor: '#6930CA', '&:hover': { bgcolor: '#5a28b0' } }}
              >
                Add Party
              </Button>
            </DialogActions>
          </Dialog>

          {/* Add Driver Dialog */}
          <Dialog open={addDriverDialog} onClose={() => setAddDriverDialog(false)} maxWidth="sm" fullWidth>
            <DialogTitle>Add New Driver</DialogTitle>
            <DialogContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                <TextField
                  label="Driver Name"
                  value={newDriverData.name}
                  onChange={(e) => setNewDriverData(prev => ({ ...prev, name: e.target.value }))}
                  required
                  fullWidth
                />
                <TextField
                  label="Phone"
                  value={newDriverData.phone}
                  onChange={(e) => setNewDriverData(prev => ({ ...prev, phone: e.target.value }))}
                  required
                  fullWidth
                />
                <TextField
                  label="License Number"
                  value={newDriverData.license_number}
                  onChange={(e) => setNewDriverData(prev => ({ ...prev, license_number: e.target.value }))}
                  fullWidth
                />
                <TextField
                  label="Address"
                  value={newDriverData.address}
                  onChange={(e) => setNewDriverData(prev => ({ ...prev, address: e.target.value }))}
                  multiline
                  rows={2}
                  fullWidth
                />
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => {
                setAddDriverDialog(false);
                setNewDriverData({ name: '', phone: '', license_number: '', address: '' });
              }}>
                Cancel
              </Button>
              <Button
                onClick={handleAddDriver}
                variant="contained"
                sx={{ bgcolor: '#6930CA', '&:hover': { bgcolor: '#5a28b0' } }}
              >
                Add Driver
              </Button>
            </DialogActions>
          </Dialog>

          {/* Add Vehicle Dialog */}
          <Dialog open={addVehicleDialog} onClose={() => setAddVehicleDialog(false)} maxWidth="md" fullWidth>
            <DialogTitle>Add Vehicle to Booking</DialogTitle>
            <DialogContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
                {/* Vehicle Type */}
                <Autocomplete
                  options={vehicleTypes}
                  getOptionLabel={(option) => option.name || ''}
                  value={vehicleTypes.find(v => v.id.toString() === vehicleFormData.vehicle_type_id) || null}
                  onChange={(e, newValue) => {
                    handleVehicleChange('vehicle_type_id', newValue ? newValue.id.toString() : '');
                  }}
                  renderInput={(params) => (
                    <TextField 
                      {...params} 
                      label="Vehicle Type *"
                      placeholder="Select Vehicle Type"
                      required
                    />
                  )}
                />

                {/* Vehicle Source */}
                <FormControl component="fieldset">
                  <FormLabel component="legend">Vehicle Source *</FormLabel>
                  <RadioGroup
                    row
                    value={vehicleFormData.vehicle_source}
                    onChange={(e) => {
                      handleVehicleChange('vehicle_source', e.target.value);
                      // Clear relevant fields when switching
                      setVehicleFormData(prev => ({
                        ...prev,
                        vehicle_source: e.target.value,
                        truck_id: '',
                        vendor_id: '',
                        vehicle_number: '',
                        driver_id: '',
                        driver_name: '',
                        driver_phone: '',
                      }));
                    }}
                  >
                    <FormControlLabel value="own" control={<Radio />} label="Own Truck" />
                    <FormControlLabel value="vendor" control={<Radio />} label="Vendor Vehicle" />
                  </RadioGroup>
                </FormControl>

                {vehicleFormData.vehicle_source === 'own' ? (
                  <>
                    {/* Own Truck Selection */}
                    <Autocomplete
                      options={trucks}
                      getOptionLabel={(option) => option.truck_number || ''}
                      value={trucks.find(t => t.id.toString() === vehicleFormData.truck_id) || null}
                      onChange={(e, newValue) => {
                        handleVehicleChange('truck_id', newValue ? newValue.id.toString() : '');
                      }}
                      renderInput={(params) => (
                        <TextField 
                          {...params} 
                          label="Select Truck *"
                          placeholder="Choose from your trucks"
                          required
                        />
                      )}
                    />

                    {/* Own Driver Selection */}
                    <Autocomplete
                      options={drivers}
                      getOptionLabel={(option) => `${option.name || ''} ${option.phone ? `(${option.phone})` : ''}`}
                      value={drivers.find(d => d.id.toString() === vehicleFormData.driver_id) || null}
                      onChange={(e, newValue) => {
                        handleVehicleChange('driver_id', newValue ? newValue.id.toString() : '');
                      }}
                      renderInput={(params) => (
                        <TextField 
                          {...params} 
                          label="Select Driver"
                          placeholder="Choose driver (optional)"
                        />
                      )}
                    />
                  </>
                ) : (
                  <>
                    {/* Vendor Selection */}
                    <Autocomplete
                      options={vendors}
                      getOptionLabel={(option) => option.name || ''}
                      value={vendors.find(v => v.id.toString() === vehicleFormData.vendor_id) || null}
                      onChange={(e, newValue) => {
                        handleVehicleChange('vendor_id', newValue ? newValue.id.toString() : '');
                      }}
                      renderInput={(params) => (
                        <TextField 
                          {...params} 
                          label="Select Vendor *"
                          placeholder="Choose vendor"
                          required
                        />
                      )}
                    />

                    {/* Vehicle Number for Vendor */}
                    <TextField
                      label="Vehicle Number *"
                      value={vehicleFormData.vehicle_number}
                      onChange={(e) => handleVehicleChange('vehicle_number', e.target.value.toUpperCase())}
                      placeholder="e.g., TN99AF3025"
                      required
                      fullWidth
                    />

                    {/* Vendor Driver Name */}
                    <TextField
                      label="Driver Name"
                      value={vehicleFormData.driver_name}
                      onChange={(e) => handleVehicleChange('driver_name', e.target.value)}
                      placeholder="Enter driver name (optional)"
                      fullWidth
                    />

                    {/* Vendor Driver Phone */}
                    <TextField
                      label="Driver Phone"
                      value={vehicleFormData.driver_phone}
                      onChange={(e) => handleVehicleChange('driver_phone', e.target.value)}
                      placeholder="Enter driver phone (optional)"
                      fullWidth
                    />
                  </>
                )}

                {/* Amount (Optional) */}
                <TextField
                  label="Amount (Optional)"
                  type="number"
                  value={vehicleFormData.amount}
                  onChange={(e) => handleVehicleChange('amount', e.target.value)}
                  placeholder="Enter amount for this vehicle"
                  fullWidth
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                  }}
                />

                {/* Notes */}
                <TextField
                  label="Notes"
                  value={vehicleFormData.notes}
                  onChange={(e) => handleVehicleChange('notes', e.target.value)}
                  placeholder="Additional notes about this vehicle"
                  multiline
                  rows={2}
                  fullWidth
                />
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => {
                setAddVehicleDialog(false);
                setVehicleFormData({
                  vehicle_type_id: '',
                  vehicle_source: 'own',
                  truck_id: '',
                  vendor_id: '',
                  vehicle_number: '',
                  driver_id: '',
                  driver_name: '',
                  driver_phone: '',
                  amount: '',
                  notes: '',
                });
              }}>
                Cancel
              </Button>
              <Button
                onClick={handleAddVehicle}
                variant="contained"
                sx={{ bgcolor: '#6930CA', '&:hover': { bgcolor: '#5a28b0' } }}
              >
                Add Vehicle
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Container>
    </Layout>
  );
}

export default function NewBookingPage() {
  return (
    <Suspense fallback={null}>
      <NewBookingPageInner />
    </Suspense>
  );
}
