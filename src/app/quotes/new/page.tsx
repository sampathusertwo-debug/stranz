'use client';

import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import { Save, CalendarToday, ArrowBack, ExpandMore, ExpandLess, Add } from '@mui/icons-material';
import Layout from '@/components/Layout';
import { useRouter, useSearchParams } from 'next/navigation';

export default function NewQuotePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');
  
  const [parties, setParties] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [vehicleTypes, setVehicleTypes] = useState<any[]>([]);
  const [showAdditionalDetails, setShowAdditionalDetails] = useState(false);
  const [addPartyDialog, setAddPartyDialog] = useState(false);
  const [addDriverDialog, setAddDriverDialog] = useState(false);
  const [newPartyData, setNewPartyData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    gst_number: '',
  });
  const [newDriverData, setNewDriverData] = useState({
    name: '',
    phone: '',
    license_number: '',
    address: '',
  });
  const [formData, setFormData] = useState({
    party_id: '',
    driver_id: '',
    vehicle_type_id: '',
    from_location: '',
    to_location: '',
    quote_date: new Date().toISOString().split('T')[0],
    status: 'pending',
    freight_amount: '',
    material_description: '',
    notes: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchParties();
    fetchDrivers();
    fetchVehicleTypes();
    if (editId) {
      fetchQuote(editId);
    }
  }, [editId]);

  const fetchParties = async () => {
    try {
      const response = await fetch('/api/parties');
      const data = await response.json();
      setParties(data);
    } catch (err) {
      console.error('Failed to fetch parties');
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

  const fetchVehicleTypes = async () => {
    try {
      const response = await fetch('/api/vehicle-types');
      const data = await response.json();
      console.log('Vehicle types data:', data);
      if (Array.isArray(data)) {
        setVehicleTypes(data);
      } else {
        console.error('Vehicle types is not an array:', data);
        setVehicleTypes([]);
      }
    } catch (err) {
      console.error('Failed to fetch vehicle types:', err);
      setVehicleTypes([]);
    }
  };

  const fetchQuote = async (id: string) => {
    try {
      const response = await fetch(`/api/quotes/${id}`);
      const data = await response.json();
      setFormData({
        party_id: String(data.party_id),
        driver_id: String(data.driver_id || ''),
        vehicle_type_id: String(data.vehicle_type_id || ''),
        from_location: data.from_location,
        to_location: data.to_location,
        quote_date: data.quote_date,
        status: data.status,
        freight_amount: String(data.freight_amount || ''),
        material_description: data.material_description || '',
        notes: data.notes || '',
      });
      if (data.material_description || data.notes) {
        setShowAdditionalDetails(true);
      }
    } catch (err) {
      setError('Failed to fetch quote');
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddParty = async () => {
    if (!newPartyData.name || !newPartyData.phone) {
      setError('Party name and phone are required');
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
        await fetchParties(); // Refresh parties list
        setFormData(prev => ({ ...prev, party_id: String(newParty.id) }));
        setAddPartyDialog(false);
        setNewPartyData({ name: '', phone: '', email: '', address: '', gst_number: '' });
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
        await fetchDrivers(); // Refresh drivers list
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.party_id || !formData.vehicle_type_id || !formData.from_location || !formData.to_location || !formData.freight_amount) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        quote_number: `QUO${Date.now()}`, // Generate on submit
        valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
        billing_type: 'fixed', // Default to fixed
        party_id: parseInt(formData.party_id),
        driver_id: formData.driver_id ? parseInt(formData.driver_id) : null,
        vehicle_type_id: parseInt(formData.vehicle_type_id),
        freight_amount: parseFloat(formData.freight_amount),
      };

      const url = editId ? `/api/quotes/${editId}` : '/api/quotes';
      const method = editId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setSuccess(editId ? 'Quote updated successfully' : 'Quote created successfully');
        setTimeout(() => router.push('/quotes'), 1500);
      } else {
        setError('Failed to save quote');
      }
    } catch (err) {
      setError('Failed to save quote');
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
              onClick={() => router.push('/quotes')}
              sx={{ mr: 2 }}
            >
              Back
            </Button>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
              {editId ? 'Edit Quote' : 'Create New Quote'}
            </Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

          {/* Form */}
          <Paper sx={{ p: 4 }}>
            <form onSubmit={handleSubmit}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {/* Quote Details Section */}
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: '#2B2D42' }}>
                    Quote Details
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={3}>
                      <Typography variant="body2" sx={{ mb: 1, color: '#2B2D42', fontWeight: 500 }}>
                        Select Party *
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
                            placeholder="Select Party"
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
                        Add New Party
                      </Button>
                    </Grid>

                    <Grid item xs={12} sm={3}>
                      <Typography variant="body2" sx={{ mb: 1, color: '#2B2D42', fontWeight: 500 }}>
                        Select Driver
                      </Typography>
                      <Autocomplete
                        options={drivers}
                        getOptionLabel={(option) => option.name || ''}
                        value={drivers.find(d => d.id.toString() === formData.driver_id) || null}
                        onChange={(e, newValue) => {
                          handleChange('driver_id', newValue ? newValue.id.toString() : '');
                        }}
                        renderInput={(params) => (
                          <TextField 
                            {...params} 
                            placeholder="Select Driver"
                          />
                        )}
                      />
                      <Button
                        size="small"
                        startIcon={<Add />}
                        onClick={() => setAddDriverDialog(true)}
                        sx={{ mt: 1, textTransform: 'none', color: '#6930CA' }}
                      >
                        Add New Driver
                      </Button>
                    </Grid>

                    <Grid item xs={12} sm={3}>
                      <Typography variant="body2" sx={{ mb: 1, color: '#2B2D42', fontWeight: 500 }}>
                        Quote Date *
                      </Typography>
                      <TextField
                        type="date"
                        value={formData.quote_date}
                        onChange={(e) => handleChange('quote_date', e.target.value)}
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

                    <Grid item xs={12} sm={3}>
                      <Typography variant="body2" sx={{ mb: 1, color: '#2B2D42', fontWeight: 500 }}>
                        Vehicle Type *
                      </Typography>
                      <Autocomplete
                        options={vehicleTypes}
                        getOptionLabel={(option) => option.name || ''}
                        value={vehicleTypes.find(v => v.id.toString() === formData.vehicle_type_id) || null}
                        onChange={(e, newValue) => {
                          handleChange('vehicle_type_id', newValue ? newValue.id.toString() : '');
                        }}
                        renderInput={(params) => (
                          <TextField 
                            {...params} 
                            placeholder="Select Vehicle Type"
                            required
                          />
                        )}
                      />
                    </Grid>
                  </Grid>
                </Box>

                <Divider />

                {/* Route Information & Billing */}
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: '#2B2D42' }}>
                    Route Information & Billing
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={4}>
                      <Box sx={{ mb: 2, borderBottom: '2px solid #E5E7EB', pb: 0.5 }}>
                        <Typography variant="caption" sx={{ color: '#6B7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                          Route
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ mb: 1, color: '#2B2D42', fontWeight: 500 }}>
                        From Location *
                      </Typography>
                      <TextField
                        placeholder="Enter pickup location"
                        value={formData.from_location}
                        onChange={(e) => handleChange('from_location', e.target.value)}
                        fullWidth
                        required
                      />
                    </Grid>

                    <Grid item xs={12} sm={4}>
                      <Box sx={{ mb: 2, borderBottom: '2px solid #E5E7EB', pb: 0.5, visibility: { xs: 'hidden', sm: 'hidden' } }}>
                        <Typography variant="caption" sx={{ color: '#6B7280' }}>
                          -
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ mb: 1, color: '#2B2D42', fontWeight: 500 }}>
                        To Location *
                      </Typography>
                      <TextField
                        placeholder="Enter delivery location"
                        value={formData.to_location}
                        onChange={(e) => handleChange('to_location', e.target.value)}
                        fullWidth
                        required
                      />
                    </Grid>

                    <Grid item xs={12} sm={4}>
                      <Box sx={{ mb: 2, borderBottom: '2px solid #E5E7EB', pb: 0.5 }}>
                        <Typography variant="caption" sx={{ color: '#6B7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                          Billing
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ mb: 1, color: '#2B2D42', fontWeight: 500 }}>
                        Amount *
                      </Typography>
                      <TextField
                        placeholder="Enter amount"
                        type="number"
                        value={formData.freight_amount}
                        onChange={(e) => handleChange('freight_amount', e.target.value)}
                        fullWidth
                        required
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
                      <Grid item xs={12}>
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
                    onClick={() => router.push('/quotes')}
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
                    {loading ? 'Saving...' : (editId ? 'Update Quote' : 'Create Quote')}
                  </Button>
                </Box>
              </Box>
            </form>
          </Paper>

          {/* Add Party Dialog */}
          <Dialog open={addPartyDialog} onClose={() => setAddPartyDialog(false)} maxWidth="sm" fullWidth>
            <DialogTitle>Add New Party</DialogTitle>
            <DialogContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                <TextField
                  label="Party Name"
                  value={newPartyData.name}
                  onChange={(e) => setNewPartyData(prev => ({ ...prev, name: e.target.value }))}
                  required
                  fullWidth
                />
                <TextField
                  label="Phone"
                  value={newPartyData.phone}
                  onChange={(e) => setNewPartyData(prev => ({ ...prev, phone: e.target.value }))}
                  required
                  fullWidth
                />
                <TextField
                  label="Email"
                  type="email"
                  value={newPartyData.email}
                  onChange={(e) => setNewPartyData(prev => ({ ...prev, email: e.target.value }))}
                  fullWidth
                />
                <TextField
                  label="Address"
                  value={newPartyData.address}
                  onChange={(e) => setNewPartyData(prev => ({ ...prev, address: e.target.value }))}
                  multiline
                  rows={2}
                  fullWidth
                />
                <TextField
                  label="GST Number"
                  value={newPartyData.gst_number}
                  onChange={(e) => setNewPartyData(prev => ({ ...prev, gst_number: e.target.value }))}
                  fullWidth
                />
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => {
                setAddPartyDialog(false);
                setNewPartyData({ name: '', phone: '', email: '', address: '', gst_number: '' });
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
        </Box>
      </Container>
    </Layout>
  );
}
