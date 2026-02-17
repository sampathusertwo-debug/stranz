'use client';

import React, { useState, useEffect } from 'react';
import {
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
  Chip,
  Grid,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormLabel,
  Autocomplete,
} from '@mui/material';
import { Add, Edit, Delete, Visibility, Close } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import SearchToolbar from '@/components/shared/SearchToolbar';
import SummaryCard from '@/components/shared/SummaryCard';
import TruckTypeSelector from '@/components/shared/TruckTypeSelector';

interface Truck {
  id: number;
  truck_number: string;
  truck_type: string;
  capacity: number;
  driver_id: number;
  status: string;
}

interface Driver {
  id: number;
  name: string;
}

export default function TrucksPage() {
  const router = useRouter();
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [open, setOpen] = useState(false);
  const [editingTruck, setEditingTruck] = useState<Truck | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    truck_number: '',
    truck_type: '',
    capacity: '',
    driver_id: '',
    status: 'available',
    ownership_type: 'MY', // MY or MARKET
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchTrucks();
    fetchDrivers();
  }, []);

  const fetchTrucks = async () => {
    try {
      const response = await fetch('/api/trucks');
      const data = await response.json();
      setTrucks(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Failed to fetch trucks');
      setTrucks([]);
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

  const handleOpen = (truck?: Truck) => {
    if (truck) {
      setEditingTruck(truck);
      setFormData({
        truck_number: truck.truck_number,
        truck_type: truck.truck_type,
        capacity: String(truck.capacity || 0),
        driver_id: String(truck.driver_id || ''),
        status: truck.status,
        ownership_type: 'MY',
      });
    } else {
      setEditingTruck(null);
      setFormData({ 
        truck_number: '', 
        truck_type: '', 
        capacity: '', 
        driver_id: '', 
        status: 'available',
        ownership_type: 'MY',
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingTruck(null);
  };

  const handleSubmit = async () => {
    try {
      const url = editingTruck ? `/api/trucks/${editingTruck.id}` : '/api/trucks';
      const method = editingTruck ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          capacity: parseFloat(formData.capacity) || 0,
          driver_id: formData.driver_id ? parseInt(formData.driver_id) : null,
        }),
      });

      if (response.ok) {
        setSuccess(editingTruck ? 'Truck updated successfully' : 'Truck added successfully');
        handleClose();
        fetchTrucks();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('Failed to save truck');
      }
    } catch (err) {
      setError('Failed to save truck');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this truck?')) {
      try {
        const response = await fetch(`/api/trucks/${id}`, { method: 'DELETE' });
        if (response.ok) {
          setSuccess('Truck deleted successfully');
          fetchTrucks();
          setTimeout(() => setSuccess(''), 3000);
        }
      } catch (err) {
        setError('Failed to delete truck');
      }
    }
  };

  const handleViewDetails = (id: number) => {
    router.push(`/trucks/${id}`);
  };

  const getDriverName = (driverId: number) => {
    const driver = drivers.find(d => d.id === driverId);
    return driver ? driver.name : 'Not Assigned';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'success';
      case 'in-transit': return 'warning';
      case 'maintenance': return 'error';
      default: return 'default';
    }
  };

  return (
    <Layout>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, color: '#2B2D42', flexGrow: 1 }}>
          Trucks
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpen()}
          sx={{
            bgcolor: '#6930CA',
            '&:hover': { bgcolor: '#5225A8' },
            textTransform: 'none',
            fontWeight: 500,
          }}
        >
          Add Truck
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={4}>
          <SummaryCard title="All Trucks" value={trucks.length} />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <SummaryCard 
            title="My Trucks" 
            value={trucks.filter(t => t.status === 'available').length} 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <SummaryCard 
            title="Market Trucks" 
            value={trucks.filter(t => t.status === 'in-transit').length} 
          />
        </Grid>
      </Grid>

      {/* Table with Search */}
      <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <SearchToolbar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search trucks..."
        />

        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: '#FAFAFA' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, color: '#6B6C7B' }}>Truck Number</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#6B6C7B' }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#6B6C7B' }}>Capacity (tons)</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#6B6C7B' }}>Driver</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#6B6C7B' }}>Status</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, color: '#6B6C7B' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {trucks
                .filter((truck) =>
                  truck.truck_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  truck.truck_type.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((truck) => (
                  <TableRow key={truck.id} hover>
                    <TableCell sx={{ color: '#2B2D42' }}>{truck.truck_number}</TableCell>
                    <TableCell sx={{ color: '#2B2D42' }}>{truck.truck_type}</TableCell>
                    <TableCell sx={{ color: '#6B6C7B' }}>{truck.capacity || 0}</TableCell>
                    <TableCell sx={{ color: '#6B6C7B' }}>{getDriverName(truck.driver_id)}</TableCell>
                    <TableCell>
                      <Chip label={truck.status} color={getStatusColor(truck.status)} size="small" />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton onClick={() => handleViewDetails(truck.id)} size="small" sx={{ color: '#2196F3' }} title="View Details">
                        <Visibility fontSize="small" />
                      </IconButton>
                      <IconButton onClick={() => handleOpen(truck)} size="small" sx={{ color: '#6930CA' }} title="Edit">
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(truck.id)} size="small" sx={{ color: '#ff253a' }} title="Delete">
                        <Delete fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              {trucks.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6, color: '#6B6C7B' }}>
                    No trucks found. Add your first truck!
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Dialog */}
      <Dialog 
        open={open} 
        onClose={handleClose} 
        maxWidth="sm" 
        fullWidth 
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
            {editingTruck ? 'Edit Truck Details' : 'Add Truck Details'}
          </Typography>
          <IconButton onClick={handleClose} size="small">
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ py: 3 }}>
          <Grid container spacing={3}>
            {/* Truck Registration Number */}
            <Grid item xs={12}>
              <Typography variant="body2" sx={{ mb: 0.5, color: '#2B2D42', fontSize: '0.875rem' }}>
                Truck Registration Number*
              </Typography>
              <TextField
                placeholder="e.g., TN 23 T 3546"
                value={formData.truck_number}
                onChange={(e) => setFormData({ ...formData, truck_number: e.target.value })}
                required
                fullWidth
                size="small"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
              />
            </Grid>

            {/* Truck Type Selector */}
            <Grid item xs={12}>
              <Typography variant="body2" sx={{ mb: 0.5, color: '#2B2D42', fontSize: '0.875rem' }}>
                Truck Type*
              </Typography>
              <TruckTypeSelector
                value={formData.truck_type}
                onChange={(type) => setFormData({ ...formData, truck_type: type })}
              />
            </Grid>

            {/* Ownership */}
            <Grid item xs={12}>
              <FormControl component="fieldset" fullWidth>
                <Typography variant="body2" sx={{ mb: 1, color: '#2B2D42', fontSize: '0.875rem' }}>
                  Ownership*
                </Typography>
                <RadioGroup
                  value={formData.ownership_type}
                  onChange={(e) => setFormData({ ...formData, ownership_type: e.target.value })}
                >
                  <FormControlLabel 
                    value="MARKET" 
                    control={<Radio size="small" />} 
                    label={
                      <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                        Market Truck
                      </Typography>
                    }
                    sx={{ mb: 1 }}
                  />
                  <FormControlLabel 
                    value="MY" 
                    control={<Radio size="small" />} 
                    label={
                      <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                        My Truck
                      </Typography>
                    }
                  />
                </RadioGroup>
              </FormControl>
            </Grid>

            {/* Driver Selection */}
            <Grid item xs={12}>
              <Typography variant="body2" sx={{ mb: 0.5, color: '#2B2D42', fontSize: '0.875rem' }}>
                Assign Driver
              </Typography>
              <Autocomplete
                options={drivers}
                getOptionLabel={(option) => option.name}
                value={drivers.find(d => d.id.toString() === formData.driver_id) || null}
                onChange={(e, newValue) => {
                  setFormData({ ...formData, driver_id: newValue ? newValue.id.toString() : '' });
                }}
                size="small"
                renderInput={(params) => (
                  <TextField 
                    {...params} 
                    placeholder="Select a Driver" 
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                  />
                )}
              />
              <Typography variant="caption" sx={{ color: '#9E9E9E', fontSize: '0.75rem', mt: 0.5 }}>
                Optional
              </Typography>
            </Grid>

            {/* Capacity and Status */}
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" sx={{ mb: 0.5, color: '#2B2D42', fontSize: '0.875rem' }}>
                Capacity (tons)
              </Typography>
              <TextField
                placeholder="Capacity"
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                fullWidth
                size="small"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="body2" sx={{ mb: 0.5, color: '#2B2D42', fontSize: '0.875rem' }}>
                Status
              </Typography>
              <FormControl fullWidth size="small">
                <Select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  sx={{ borderRadius: 1 }}
                >
                  <MenuItem value="available">Available</MenuItem>
                  <MenuItem value="in-transit">In Transit</MenuItem>
                  <MenuItem value="maintenance">Maintenance</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
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
            disabled={!formData.truck_number.trim() || !formData.truck_type}
            sx={{
              textTransform: 'none',
              bgcolor: '#6930CA',
              '&:hover': { bgcolor: '#5225A8' },
              '&:disabled': { bgcolor: '#E0E0E0', color: '#9E9E9E' }
            }}
          >
            {editingTruck ? 'Update' : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
}
