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
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  InputAdornment,
} from '@mui/material';
import { Add, Edit, Delete, Remove, LocalShipping, ArrowUpward, ArrowDownward, Close, Lock, Security, AddCircleOutline } from '@mui/icons-material';
import Layout from '@/components/Layout';
import SearchToolbar from '@/components/shared/SearchToolbar';
import SummaryCard from '@/components/shared/SummaryCard';

interface Driver {
  id: number;
  name: string;
  phone: string;
  license_number: string;
  address: string;
  balance?: number;
  status?: string;
}

type SortDirection = 'asc' | 'desc' | null;

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [open, setOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    license_number: '',
    address: '',
  });
  const [showOpeningBalance, setShowOpeningBalance] = useState(false);
  const [balanceType, setBalanceType] = useState<'pay' | 'get'>('pay');
  const [balanceAmount, setBalanceAmount] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [transactionDialog, setTransactionDialog] = useState(false);
  const [transactionType, setTransactionType] = useState<'gave' | 'got'>('gave');
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [transactionAmount, setTransactionAmount] = useState('');

  const totalBalance = drivers.reduce((sum, driver) => sum + (driver.balance || 0), 0);

  const handleSort = () => {
    if (sortDirection === null || sortDirection === 'desc') {
      setSortDirection('asc');
    } else {
      setSortDirection('desc');
    }
  };

  const getSortedDrivers = () => {
    let filteredDrivers = drivers.filter((driver) =>
      driver.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      driver.phone.includes(searchQuery)
    );

    if (sortDirection) {
      filteredDrivers = [...filteredDrivers].sort((a, b) => {
        if (sortDirection === 'asc') {
          return a.name.localeCompare(b.name);
        } else {
          return b.name.localeCompare(a.name);
        }
      });
    }

    return filteredDrivers;
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      const response = await fetch('/api/drivers');
      const data = await response.json();
      setDrivers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Failed to fetch drivers');
      setDrivers([]);
    }
  };

  const handleOpen = (driver?: Driver) => {
    if (driver) {
      setEditingDriver(driver);
      setFormData({
        name: driver.name,
        phone: driver.phone,
        license_number: driver.license_number,
        address: driver.address,
      });
      if (driver.balance !== undefined && driver.balance !== 0) {
        setShowOpeningBalance(true);
        setBalanceType(driver.balance < 0 ? 'pay' : 'get');
        setBalanceAmount(Math.abs(driver.balance).toString());
      } else {
        setShowOpeningBalance(false);
        setBalanceAmount('');
      }
    } else {
      setEditingDriver(null);
      setFormData({ name: '', phone: '', license_number: '', address: '' });
      setShowOpeningBalance(false);
      setBalanceType('pay');
      setBalanceAmount('');
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingDriver(null);
    setFormData({ name: '', phone: '', license_number: '', address: '' });
    setShowOpeningBalance(false);
    setBalanceType('pay');
    setBalanceAmount('');
  };

  const handleSubmit = async () => {
    try {
      const url = editingDriver ? `/api/drivers/${editingDriver.id}` : '/api/drivers';
      const method = editingDriver ? 'PUT' : 'POST';

      // Calculate balance: negative for "Driver has to pay", positive for "Driver has to get"
      let balance = 0;
      if (showOpeningBalance && balanceAmount) {
        const amount = parseFloat(balanceAmount);
        balance = balanceType === 'pay' ? -amount : amount;
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, balance }),
      });

      if (response.ok) {
        setSuccess(editingDriver ? 'Driver updated successfully' : 'Driver added successfully');
        handleClose();
        fetchDrivers();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('Failed to save driver');
      }
    } catch (err) {
      setError('Failed to save driver');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this driver?')) {
      try {
        const response = await fetch(`/api/drivers/${id}`, { method: 'DELETE' });
        if (response.ok) {
          setSuccess('Driver deleted successfully');
          fetchDrivers();
          setTimeout(() => setSuccess(''), 3000);
        } else {
          setError('Failed to delete driver');
        }
      } catch (err) {
        setError('Failed to delete driver');
      }
    }
  };

  const handleOpenTransaction = (type: 'gave' | 'got', driver?: Driver) => {
    setTransactionType(type);
    setSelectedDriver(driver || null);
    setTransactionAmount('');
    setTransactionDialog(true);
  };

  const handleCloseTransaction = () => {
    setTransactionDialog(false);
    setSelectedDriver(null);
    setTransactionAmount('');
  };

  const handleSubmitTransaction = async () => {
    if (!transactionAmount || parseFloat(transactionAmount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    try {
      // In a real app, this would call an API to record the transaction
      // For now, we'll just show success message
      setSuccess(`Driver ${transactionType === 'gave' ? 'payment received' : 'payment made'} successfully`);
      handleCloseTransaction();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to record transaction');
    }
  };

  const handleRowClick = (driverId: number) => {
    // Navigate to driver details page
    // router.push(`/drivers/${driverId}`);
    console.log('Navigate to driver:', driverId);
  };

  return (
    <Layout>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, color: '#2B2D42', flexGrow: 1 }}>
          Drivers
        </Typography>
        <Button
          variant="contained"
          startIcon={<Remove />}
          onClick={() => handleOpenTransaction('gave')}
          sx={{
            bgcolor: '#F27F36',
            '&:hover': { bgcolor: '#E06D25' },
            textTransform: 'none',
            fontWeight: 500,
          }}
        >
          Driver Gave
        </Button>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenTransaction('got')}
          sx={{
            bgcolor: '#00875A',
            '&:hover': { bgcolor: '#006644' },
            textTransform: 'none',
            fontWeight: 500,
          }}
        >
          Driver Got
        </Button>
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
          Add Driver
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      {/* Summary Card */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={4}>
          <SummaryCard title="Total Driver Balance" value={`₹ ${totalBalance}`} />
        </Grid>
      </Grid>

      {/* Table with Search */}
      <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <SearchToolbar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search drivers..."
        />

        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: '#FAFAFA' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, color: '#6B6C7B' }}>
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 0.5,
                      cursor: 'pointer',
                      '&:hover': { opacity: 0.7 }
                    }}
                    onClick={handleSort}
                  >
                    Driver Name
                    {sortDirection && (
                      sortDirection === 'asc' ? <ArrowUpward fontSize="small" /> : <ArrowDownward fontSize="small" />
                    )}
                  </Box>
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#6B6C7B' }}>Phone Number</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#6B6C7B' }}>Status</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, color: '#6B6C7B' }}>Balance</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, color: '#6B6C7B' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {getSortedDrivers().map((driver) => {
                  const balance = driver.balance || 0;
                  return (
                  <TableRow 
                    key={driver.id} 
                    hover
                    onClick={() => handleRowClick(driver.id)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell sx={{ color: '#2B2D42', fontWeight: 500 }}>{driver.name}</TableCell>
                    <TableCell sx={{ color: '#2B2D42' }}>
                      {driver.phone ? `+91 ${driver.phone}` : '-'}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <LocalShipping sx={{ fontSize: 16, color: '#4CAF50' }} />
                        <Typography sx={{ fontSize: '14px', color: '#2B2D42' }}>
                          {driver.status === 'active' ? 'On Trip' : 'Available'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="right" sx={{ color: '#2B2D42', fontWeight: 500 }}>
                      ₹ {balance.toLocaleString()}
                    </TableCell>
                    <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                      <IconButton onClick={() => handleOpen(driver)} size="small" sx={{ color: '#6930CA' }}>
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(driver.id)} size="small" sx={{ color: '#ff253a' }}>
                        <Delete fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                  );
                })}
              {drivers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6, color: '#6B6C7B' }}>
                    No drivers found. Add your first driver!
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
        maxWidth="xs" 
        fullWidth 
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
            {editingDriver ? 'Edit Driver Details' : 'Add Driver Details'}
          </Typography>
          <IconButton onClick={handleClose} size="small">
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ py: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {/* Driver Name */}
            <Box>
              <Typography variant="body2" sx={{ mb: 0.5, color: '#2B2D42', fontSize: '0.875rem' }}>
                Driver Name*
              </Typography>
              <TextField
                placeholder="Enter Driver Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                fullWidth
                size="small"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
              />
            </Box>

            {/* Mobile Number */}
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                <Typography variant="body2" sx={{ color: '#2B2D42', fontSize: '0.875rem' }}>
                  Mobile Number
                </Typography>
              </Box>
              <TextField
                placeholder="Enter Mobile Number"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                fullWidth
                size="small"
                InputProps={{
                  startAdornment: <InputAdornment position="start">+91</InputAdornment>,
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
              />
              <Typography variant="caption" sx={{ color: '#9E9E9E', fontSize: '0.75rem', mt: 0.5 }}>
                Optional
              </Typography>
            </Box>

            {/* Add Opening Balance Button */}
            {!showOpeningBalance && (
              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1, 
                  cursor: 'pointer',
                  color: '#6930CA',
                  '&:hover': { opacity: 0.8 }
                }}
                onClick={() => setShowOpeningBalance(true)}
              >
                <AddCircleOutline fontSize="small" />
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  Add Opening Balance
                </Typography>
              </Box>
            )}

            {/* Opening Balance Section */}
            {showOpeningBalance && (
              <Box sx={{ borderTop: '1px dashed #E0E0E0', pt: 2 }}>
                <Typography variant="body2" sx={{ mb: 1.5, color: '#2B2D42', fontSize: '0.875rem' }}>
                  Opening Balance
                </Typography>
                <FormControl component="fieldset" fullWidth>
                  <RadioGroup
                    value={balanceType}
                    onChange={(e) => setBalanceType(e.target.value as 'pay' | 'get')}
                  >
                    <FormControlLabel
                      value="pay"
                      control={<Radio size="small" />}
                      label={
                        <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                          Driver has to pay
                        </Typography>
                      }
                      sx={{ mb: 1 }}
                    />
                    <FormControlLabel
                      value="get"
                      control={<Radio size="small" />}
                      label={
                        <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                          Driver has to get
                        </Typography>
                      }
                    />
                  </RadioGroup>
                </FormControl>

                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" sx={{ mb: 0.5, color: '#2B2D42', fontSize: '0.875rem' }}>
                    Amount
                  </Typography>
                  <TextField
                    placeholder="Enter Amount"
                    value={balanceAmount}
                    onChange={(e) => setBalanceAmount(e.target.value)}
                    fullWidth
                    size="small"
                    type="number"
                    InputProps={{
                      startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                    }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                  />
                  <Typography variant="caption" sx={{ color: '#9E9E9E', fontSize: '0.75rem', mt: 0.5 }}>
                    Optional
                  </Typography>
                </Box>
              </Box>
            )}

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
            disabled={!formData.name.trim()}
            sx={{
              textTransform: 'none',
              bgcolor: '#6930CA',
              '&:hover': { bgcolor: '#5225A8' },
              '&:disabled': { bgcolor: '#E0E0E0', color: '#9E9E9E' }
            }}
          >
            Save changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Transaction Dialog */}
      <Dialog open={transactionDialog} onClose={handleCloseTransaction} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
        <DialogTitle sx={{ fontWeight: 600, fontSize: '18px' }}>
          {transactionType === 'gave' ? 'Driver Gave Money' : 'Driver Got Money'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Typography sx={{ fontSize: '14px', color: '#6B6C7B' }}>
              {transactionType === 'gave' 
                ? 'Record money received from driver' 
                : 'Record money given to driver'}
            </Typography>
            <TextField
              label="Amount"
              type="number"
              value={transactionAmount}
              onChange={(e) => setTransactionAmount(e.target.value)}
              placeholder="Enter amount"
              fullWidth
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Typography sx={{ color: '#2B2D42' }}>₹</Typography>
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button 
            onClick={handleCloseTransaction}
            sx={{ 
              color: '#6B6C7B',
              textTransform: 'none',
              px: 3,
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmitTransaction}
            variant="contained"
            sx={{ 
              bgcolor: transactionType === 'gave' ? '#F27F36' : '#00875A',
              '&:hover': { bgcolor: transactionType === 'gave' ? '#E06D25' : '#006644' },
              textTransform: 'none',
              px: 3,
            }}
          >
            Record Transaction
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
}
