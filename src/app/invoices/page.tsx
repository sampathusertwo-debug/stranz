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
  Chip,
} from '@mui/material';
import { Add, Edit, Delete, ArrowForward, CheckCircle, AccessTime, Cancel } from '@mui/icons-material';
import Layout from '@/components/Layout';
import SearchToolbar from '@/components/shared/SearchToolbar';

interface Invoice {
  id: number;
  invoice_number: string;
  party_id: number;
  party_name: string;
  truck_id: number;
  truck_number: string;
  driver_id: number;
  driver_name: string;
  from_location: string;
  to_location: string;
  material: string;
  weight: number;
  freight_amount: number;
  advance_paid: number;
  balance_amount: number;
  status: string;
  invoice_date: string;
  delivery_date: string;
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [parties, setParties] = useState<any[]>([]);
  const [trucks, setTrucks] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    invoice_number: '',
    party_id: '',
    truck_id: '',
    driver_id: '',
    from_location: '',
    to_location: '',
    material: '',
    weight: '',
    freight_amount: '',
    advance_paid: '',
    balance_amount: '',
    status: 'pending',
    invoice_date: new Date().toISOString().split('T')[0],
    delivery_date: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchInvoices();
    fetchParties();
    fetchTrucks();
    fetchDrivers();
  }, []);

  const fetchInvoices = async () => {
    try {
      const response = await fetch('/api/invoices');
      const data = await response.json();
      setInvoices(data);
    } catch (err) {
      setError('Failed to fetch invoices');
    }
  };

  const fetchParties = async () => {
    const response = await fetch('/api/parties');
    const data = await response.json();
    setParties(data);
  };

  const fetchTrucks = async () => {
    const response = await fetch('/api/trucks');
    const data = await response.json();
    setTrucks(data);
  };

  const fetchDrivers = async () => {
    const response = await fetch('/api/drivers');
    const data = await response.json();
    setDrivers(data);
  };

  const handleOpen = (invoice?: Invoice) => {
    if (invoice) {
      setEditingInvoice(invoice);
      setFormData({
        invoice_number: invoice.invoice_number,
        party_id: String(invoice.party_id),
        truck_id: String(invoice.truck_id || ''),
        driver_id: String(invoice.driver_id || ''),
        from_location: invoice.from_location,
        to_location: invoice.to_location,
        material: invoice.material,
        weight: String(invoice.weight || 0),
        freight_amount: String(invoice.freight_amount || 0),
        advance_paid: String(invoice.advance_paid || 0),
        balance_amount: String(invoice.balance_amount || 0),
        status: invoice.status,
        invoice_date: invoice.invoice_date,
        delivery_date: invoice.delivery_date,
      });
    } else {
      setEditingInvoice(null);
      setFormData({
        invoice_number: `INV-${Date.now()}`,
        party_id: '',
        truck_id: '',
        driver_id: '',
        from_location: '',
        to_location: '',
        material: '',
        weight: '',
        freight_amount: '',
        advance_paid: '0',
        balance_amount: '',
        status: 'pending',
        invoice_date: new Date().toISOString().split('T')[0],
        delivery_date: '',
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingInvoice(null);
  };

  const handleSubmit = async () => {
    try {
      const url = editingInvoice ? `/api/invoices/${editingInvoice.id}` : '/api/invoices';
      const method = editingInvoice ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          party_id: parseInt(formData.party_id),
          truck_id: formData.truck_id ? parseInt(formData.truck_id) : null,
          driver_id: formData.driver_id ? parseInt(formData.driver_id) : null,
          weight: parseFloat(formData.weight) || 0,
          freight_amount: parseFloat(formData.freight_amount) || 0,
          advance_paid: parseFloat(formData.advance_paid) || 0,
          balance_amount: parseFloat(formData.balance_amount) || 0,
        }),
      });

      if (response.ok) {
        setSuccess(editingInvoice ? 'Invoice updated successfully' : 'Invoice added successfully');
        handleClose();
        fetchInvoices();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('Failed to save invoice');
      }
    } catch (err) {
      setError('Failed to save invoice');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this invoice?')) {
      try {
        const response = await fetch(`/api/invoices/${id}`, { method: 'DELETE' });
        if (response.ok) {
          setSuccess('Invoice deleted successfully');
          fetchInvoices();
          setTimeout(() => setSuccess(''), 3000);
        }
      } catch (err) {
        setError('Failed to delete invoice');
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <AccessTime sx={{ fontSize: 16 }} />;
      case 'completed': return <CheckCircle sx={{ fontSize: 16 }} />;
      case 'cancelled': return <Cancel sx={{ fontSize: 16 }} />;
      default: return null;
    }
  };

  const getFilteredInvoices = () => {
    return invoices.filter((invoice) =>
      invoice.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.party_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.truck_number?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const handleRowClick = (invoiceId: number) => {
    // Navigate to invoice details page
    // router.push(`/invoices/${invoiceId}`);
    console.log('Navigate to invoice:', invoiceId);
  };

  return (
    <Layout>
      <Container maxWidth="xl">
        <Box sx={{ my: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#2B2D42' }}>
              Invoices
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
              Add Invoice
            </Button>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

          <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
            <SearchToolbar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search Invoices"
            />

            <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: '#FAFAFA' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, color: '#6B6C7B' }}>Invoice #</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#6B6C7B' }}>Party</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#6B6C7B' }}>Route</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#6B6C7B' }}>Material</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#6B6C7B' }}>Freight</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#6B6C7B' }}>Balance</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#6B6C7B' }}>Status</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, color: '#6B6C7B' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {getFilteredInvoices().map((invoice) => (
                  <TableRow 
                    key={invoice.id} 
                    hover
                    onClick={() => handleRowClick(invoice.id)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell sx={{ color: '#2B2D42', fontWeight: 500 }}>{invoice.invoice_number}</TableCell>
                    <TableCell sx={{ color: '#2B2D42' }}>{invoice.party_name}</TableCell>
                    <TableCell sx={{ color: '#2B2D42' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Typography sx={{ fontSize: '14px' }}>{invoice.from_location}</Typography>
                        <ArrowForward sx={{ fontSize: 16, color: '#6B6C7B' }} />
                        <Typography sx={{ fontSize: '14px' }}>{invoice.to_location}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ color: '#2B2D42' }}>{invoice.material}</TableCell>
                    <TableCell sx={{ color: '#2B2D42', fontWeight: 500 }}>
                      ₹ {(invoice.freight_amount || 0).toLocaleString()}
                    </TableCell>
                    <TableCell sx={{ color: '#2B2D42', fontWeight: 500 }}>
                      ₹ {(invoice.balance_amount || 0).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {getStatusIcon(invoice.status)}
                        <Chip 
                          label={invoice.status} 
                          color={getStatusColor(invoice.status)} 
                          size="small" 
                          sx={{ textTransform: 'capitalize' }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                      <IconButton onClick={() => handleOpen(invoice)} size="small" sx={{ color: '#6930CA' }}>
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(invoice.id)} size="small" sx={{ color: '#ff253a' }}>
                        <Delete fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {getFilteredInvoices().length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 6, color: '#6B6C7B' }}>
                      No invoices found. Add your first invoice!
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          </Paper>
        </Box>

        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
          <DialogTitle>{editingInvoice ? 'Edit Invoice' : 'Add Invoice'}</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 2 }}>
              <TextField
                label="Invoice Number"
                value={formData.invoice_number}
                onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })}
                required
                fullWidth
              />
              <FormControl fullWidth required>
                <InputLabel>Party</InputLabel>
                <Select
                  value={formData.party_id}
                  label="Party"
                  onChange={(e) => setFormData({ ...formData, party_id: e.target.value })}
                >
                  {parties.map((party) => (
                    <MenuItem key={party.id} value={party.id}>{party.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Truck</InputLabel>
                <Select
                  value={formData.truck_id}
                  label="Truck"
                  onChange={(e) => setFormData({ ...formData, truck_id: e.target.value })}
                >
                  <MenuItem value="">None</MenuItem>
                  {trucks.map((truck) => (
                    <MenuItem key={truck.id} value={truck.id}>{truck.truck_number}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Driver</InputLabel>
                <Select
                  value={formData.driver_id}
                  label="Driver"
                  onChange={(e) => setFormData({ ...formData, driver_id: e.target.value })}
                >
                  <MenuItem value="">None</MenuItem>
                  {drivers.map((driver) => (
                    <MenuItem key={driver.id} value={driver.id}>{driver.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="From Location"
                value={formData.from_location}
                onChange={(e) => setFormData({ ...formData, from_location: e.target.value })}
                fullWidth
              />
              <TextField
                label="To Location"
                value={formData.to_location}
                onChange={(e) => setFormData({ ...formData, to_location: e.target.value })}
                fullWidth
              />
              <TextField
                label="Material"
                value={formData.material}
                onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                fullWidth
              />
              <TextField
                label="Weight (tons)"
                type="number"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                fullWidth
              />
              <TextField
                label="Freight Amount"
                type="number"
                value={formData.freight_amount}
                onChange={(e) => setFormData({ ...formData, freight_amount: e.target.value })}
                fullWidth
              />
              <TextField
                label="Advance Paid"
                type="number"
                value={formData.advance_paid}
                onChange={(e) => setFormData({ ...formData, advance_paid: e.target.value })}
                fullWidth
              />
              <TextField
                label="Balance Amount"
                type="number"
                value={formData.balance_amount}
                onChange={(e) => setFormData({ ...formData, balance_amount: e.target.value })}
                fullWidth
              />
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  label="Status"
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="Invoice Date"
                type="date"
                value={formData.invoice_date}
                onChange={(e) => setFormData({ ...formData, invoice_date: e.target.value })}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
              <TextField
                label="Delivery Date"
                type="date"
                value={formData.delivery_date}
                onChange={(e) => setFormData({ ...formData, delivery_date: e.target.value })}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button onClick={handleSubmit} variant="contained">
              {editingInvoice ? 'Update' : 'Add'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Layout>
  );
}
