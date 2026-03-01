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
  Grid,
  Chip,
} from '@mui/material';
import { Add, Edit, Delete, Close } from '@mui/icons-material';
import Layout from '@/components/Layout';
import SearchToolbar from '@/components/shared/SearchToolbar';
import SummaryCard from '@/components/shared/SummaryCard';

interface Customer {
  id: number;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  gst_number?: string;
  pan_number?: string;
  contact_person?: string;
  balance?: number;
  created_at?: string;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [open, setOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await fetch('/api/parties');
      const data = await res.json();
      setCustomers(Array.isArray(data) ? data : []);
    } catch {
      setError('Failed to load customers');
    }
  };

  const handleOpen = (customer?: Customer) => {
    setError('');
    setSuccess('');
    if (customer) {
      setEditingCustomer(customer);
      setFormData({
        name: customer.name || '',
        phone: customer.phone || '',
      });
    } else {
      setEditingCustomer(null);
      setFormData({
        name: '',
        phone: '',
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingCustomer(null);
  };

  const handleSubmit = async () => {
    setError('');
    if (!formData.name || !formData.phone) {
      setError('Customer name and phone are required');
      return;
    }

    try {
      const url = editingCustomer ? `/api/parties/${editingCustomer.id}` : '/api/parties';
      const method = editingCustomer ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Failed to save customer');

      setSuccess(editingCustomer ? 'Customer updated successfully' : 'Customer added successfully');
      handleClose();
      fetchCustomers();
    } catch {
      setError('Failed to save customer');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`/api/parties/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setDeleteConfirmId(null);
      setSuccess('Customer deleted successfully');
      fetchCustomers();
    } catch {
      setError('Failed to delete customer');
    }
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone?.includes(searchQuery) ||
      c.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.city?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalBalance = customers.reduce((sum, c) => sum + (c.balance || 0), 0);

  return (
    <Layout>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#2B2D42' }}>
            Customers
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpen()}
            sx={{ bgcolor: '#EA7847', '&:hover': { bgcolor: '#D4623A' }, textTransform: 'none', borderRadius: 2 }}
          >
            Add Customer
          </Button>
        </Box>

        {/* Alerts */}
        {error && (
          <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" onClose={() => setSuccess('')} sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        {/* Summary Cards */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={4}>
            <SummaryCard title="Total Customers" value={customers.length} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <SummaryCard title="Total Balance" value={`₹${totalBalance.toLocaleString()}`} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <SummaryCard title="With Balance" value={customers.filter(c => (c.balance || 0) > 0).length} />
          </Grid>
        </Grid>

        {/* Search */}
        <SearchToolbar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by name, phone, email or city..."
        />

        {/* Table */}
        <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
          <Table>
            <TableHead sx={{ bgcolor: '#FAFAFA' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, color: '#6B6C7B' }}>#</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#6B6C7B' }}>Customer Name</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#6B6C7B' }}>Phone</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, color: '#6B6C7B' }}>Balance</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, color: '#6B6C7B' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCustomers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4, color: '#6B6C7B' }}>
                    {searchQuery ? 'No customers match your search' : 'No customers found. Add your first customer!'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredCustomers.map((customer, index) => (
                  <TableRow key={customer.id} hover>
                    <TableCell sx={{ color: '#6B6C7B' }}>{index + 1}</TableCell>
                    <TableCell sx={{ fontWeight: 500, color: '#2B2D42' }}>{customer.name}</TableCell>
                    <TableCell sx={{ color: '#2B2D42' }}>{customer.phone}</TableCell>
                    <TableCell align="right">
                      <Chip
                        label={`₹${(customer.balance || 0).toLocaleString()}`}
                        size="small"
                        sx={{
                          bgcolor: (customer.balance || 0) > 0 ? '#E8F5E9' : '#F5F5F5',
                          color: (customer.balance || 0) > 0 ? '#4CAF50' : '#6B6C7B',
                          fontWeight: 600,
                        }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton size="small" onClick={() => handleOpen(customer)} sx={{ color: '#6930CA' }}>
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => setDeleteConfirmId(customer.id)} sx={{ color: '#F44336' }}>
                        <Delete fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Add / Edit Dialog */}
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
            </Typography>
            <IconButton onClick={handleClose} size="small">
              <Close />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              {error && <Alert severity="error">{error}</Alert>}
              <TextField
                label="Customer Name *"
                value={formData.name}
                onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                fullWidth
                size="small"
                autoFocus
              />
              <TextField
                label="Mobile Number *"
                value={formData.phone}
                onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                fullWidth
                size="small"
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2, gap: 1 }}>
            <Button variant="outlined" onClick={handleClose} sx={{ textTransform: 'none' }}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              sx={{ bgcolor: '#EA7847', '&:hover': { bgcolor: '#D4623A' }, textTransform: 'none' }}
            >
              {editingCustomer ? 'Save Changes' : 'Add Customer'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirm Dialog */}
        <Dialog open={deleteConfirmId !== null} onClose={() => setDeleteConfirmId(null)} maxWidth="xs" fullWidth>
          <DialogTitle>Delete Customer</DialogTitle>
          <DialogContent>
            <Typography>Are you sure you want to delete this customer? This action cannot be undone.</Typography>
          </DialogContent>
          <DialogActions sx={{ p: 2, gap: 1 }}>
            <Button variant="outlined" onClick={() => setDeleteConfirmId(null)} sx={{ textTransform: 'none' }}>
              Cancel
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
              sx={{ textTransform: 'none' }}
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Layout>
  );
}
