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
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import Layout from '@/components/Layout';

interface Tip {
  id: number;
  driver_id: number;
  driver_name: string;
  amount: number;
  description: string;
  tip_date: string;
}

export default function TipsPage() {
  const [tips, setTips] = useState<Tip[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editingTip, setEditingTip] = useState<Tip | null>(null);
  const [formData, setFormData] = useState({
    driver_id: '',
    amount: '',
    description: '',
    tip_date: new Date().toISOString().split('T')[0],
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchTips();
    fetchDrivers();
  }, []);

  const fetchTips = async () => {
    try {
      const response = await fetch('/api/tips');
      const data = await response.json();
      setTips(data);
    } catch (err) {
      setError('Failed to fetch tips');
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

  const handleOpen = (tip?: Tip) => {
    if (tip) {
      setEditingTip(tip);
      setFormData({
        driver_id: String(tip.driver_id),
        amount: String(tip.amount || 0),
        description: tip.description,
        tip_date: tip.tip_date,
      });
    } else {
      setEditingTip(null);
      setFormData({
        driver_id: '',
        amount: '',
        description: '',
        tip_date: new Date().toISOString().split('T')[0],
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingTip(null);
  };

  const handleSubmit = async () => {
    try {
      const url = editingTip ? `/api/tips/${editingTip.id}` : '/api/tips';
      const method = editingTip ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          driver_id: parseInt(formData.driver_id),
          amount: parseFloat(formData.amount) || 0,
        }),
      });

      if (response.ok) {
        setSuccess(editingTip ? 'Tip updated successfully' : 'Tip added successfully');
        handleClose();
        fetchTips();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('Failed to save tip');
      }
    } catch (err) {
      setError('Failed to save tip');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this tip?')) {
      try {
        const response = await fetch(`/api/tips/${id}`, { method: 'DELETE' });
        if (response.ok) {
          setSuccess('Tip deleted successfully');
          fetchTips();
          setTimeout(() => setSuccess(''), 3000);
        }
      } catch (err) {
        setError('Failed to delete tip');
      }
    }
  };

  return (
    <Layout>
      <Container maxWidth="lg">
        <Box sx={{ my: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h4" component="h1">
              Tips (Incentives)
            </Typography>
            <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()}>
              Add Tip
            </Button>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Driver</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tips.map((tip) => (
                  <TableRow key={tip.id}>
                    <TableCell>{tip.tip_date}</TableCell>
                    <TableCell>{tip.driver_name}</TableCell>
                    <TableCell>₹{tip.amount || 0}</TableCell>
                    <TableCell>{tip.description}</TableCell>
                    <TableCell align="right">
                      <IconButton onClick={() => handleOpen(tip)} color="primary">
                        <Edit />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(tip.id)} color="error">
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {tips.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      No tips found. Add your first tip!
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
          <DialogTitle>{editingTip ? 'Edit Tip' : 'Add Tip'}</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              <FormControl fullWidth required>
                <InputLabel>Driver</InputLabel>
                <Select
                  value={formData.driver_id}
                  label="Driver"
                  onChange={(e) => setFormData({ ...formData, driver_id: e.target.value })}
                >
                  {drivers.map((driver) => (
                    <MenuItem key={driver.id} value={driver.id}>
                      {driver.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="Amount"
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
                fullWidth
              />
              <TextField
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                multiline
                rows={3}
                fullWidth
                placeholder="e.g., Bonus for on-time delivery"
              />
              <TextField
                label="Tip Date"
                type="date"
                value={formData.tip_date}
                onChange={(e) => setFormData({ ...formData, tip_date: e.target.value })}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button onClick={handleSubmit} variant="contained">
              {editingTip ? 'Update' : 'Add'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Layout>
  );
}
