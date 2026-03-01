'use client';

import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Button,
  Box,
  Paper,
  TextField,
  IconButton,
  Alert,
  Grid,
  InputAdornment,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Add, ChevronLeft, Search, AttachMoney, Assessment, TrendingUp, LocalShipping, DirectionsCar, BusinessCenter } from '@mui/icons-material';
import Layout from '@/components/Layout';

interface Expense {
  id: number;
  expense_category_id: number;
  category_name: string;
  amount: number;
  description: string;
  expense_date: string;
  truck_id?: number;
  booking_id?: number;
}

const getMonthYear = () => {
  const date = new Date();
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
};

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [truckExpenseSearch, setTruckExpenseSearch] = useState('');
  const [bookingExpenseSearch, setBookingExpenseSearch] = useState('');
  const [officeExpenseSearch, setOfficeExpenseSearch] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentMonth] = useState(getMonthYear());
  const [expenseDialog, setExpenseDialog] = useState(false);
  const [expenseCategory, setExpenseCategory] = useState<'truck' | 'booking' | 'office'>('truck');

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const response = await fetch('/api/expenses');
      const data = await response.json();
      setExpenses(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Failed to fetch expenses');
    }
  };

  // Calculate totals for current month
  const getMonthExpenses = () => {
    const now = new Date();
    const currentMonthExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.expense_date);
      return expenseDate.getMonth() === now.getMonth() && 
             expenseDate.getFullYear() === now.getFullYear();
    });
    return currentMonthExpenses;
  };

  const monthExpenses = getMonthExpenses();
  const totalMonthExpense = monthExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
  
  // Categorize expenses
  const truckExpenses = monthExpenses.filter(exp => exp.truck_id);
  const bookingExpenses = monthExpenses.filter(exp => exp.booking_id);
  const officeExpenses = monthExpenses.filter(exp => !exp.truck_id && !exp.booking_id);
  
  const totalTruckExpense = truckExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
  const totalBookingExpense = bookingExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
  const totalOfficeExpense = officeExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);

  const handleOpenExpense = (category: 'truck' | 'booking' | 'office') => {
    setExpenseCategory(category);
    setExpenseDialog(true);
  };

  const handleCloseExpense = () => {
    setExpenseDialog(false);
  };

  return (
    <Layout>
      <Container maxWidth="lg">
        <Box sx={{ my: 4 }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

          {/* Month Selector and Summary */}
          <Paper elevation={3} sx={{ borderRadius: 2, p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconButton size="small">
                  <ChevronLeft />
                </IconButton>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#2B2D42' }}>
                  {currentMonth}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography sx={{ fontSize: '12px', color: '#6B6C7B', mb: 0.5 }}>
                TOTAL MONTH EXPENSE
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#2B2D42' }}>
                ₹ {totalMonthExpense.toLocaleString()}
              </Typography>
            </Box>

            {/* Metrics Cards */}
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{ 
                    bgcolor: '#E8F5E9', 
                    p: 1.5, 
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <AttachMoney sx={{ color: '#4CAF50', fontSize: 28 }} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: '12px', color: '#6B6C7B' }}>
                      Month Revenue
                    </Typography>
                    <Typography sx={{ fontSize: '16px', fontWeight: 600, color: '#2B2D42' }}>
                      ₹ 0
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{ 
                    bgcolor: '#FFEBEE', 
                    p: 1.5, 
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <TrendingUp sx={{ color: '#F44336', fontSize: 28 }} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: '12px', color: '#6B6C7B' }}>
                      Month Expense
                    </Typography>
                    <Typography sx={{ fontSize: '16px', fontWeight: 600, color: '#2B2D42' }}>
                      ₹ {totalMonthExpense.toLocaleString()}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{ 
                    bgcolor: '#E3F2FD', 
                    p: 1.5, 
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Assessment sx={{ color: '#2196F3', fontSize: 28 }} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: '12px', color: '#6B6C7B' }}>
                      Month Profit
                    </Typography>
                    <Typography sx={{ fontSize: '16px', fontWeight: 600, color: '#2B2D42' }}>
                      ₹ 0
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>

            <Button
              variant="outlined"
              startIcon={<Assessment />}
              sx={{ mt: 3, textTransform: 'none', fontWeight: 500 }}
            >
              View Report
            </Button>
          </Paper>

          {/* Expense Categories */}
          <Grid container spacing={3}>
            {/* Truck Expenses */}
            <Grid item xs={12} md={4}>
              <Card elevation={2} sx={{ borderRadius: 2, height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <LocalShipping sx={{ color: '#FF9800', fontSize: 24 }} />
                    <Typography sx={{ fontSize: '16px', fontWeight: 600, color: '#2B2D42' }}>
                      Truck Expenses
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography sx={{ fontSize: '12px', color: '#6B6C7B' }}>
                      {currentMonth.split(' ')[0]} Truck Expenses
                    </Typography>
                    <Typography sx={{ fontSize: '18px', fontWeight: 600, color: '#2B2D42' }}>
                      ₹ {totalTruckExpense.toLocaleString()}
                    </Typography>
                  </Box>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => handleOpenExpense('truck')}
                    sx={{ 
                      mb: 2, 
                      bgcolor: '#FF9800',
                      '&:hover': { bgcolor: '#F57C00' },
                      textTransform: 'none',
                      fontWeight: 500
                    }}
                  >
                    Add Truck Expense
                  </Button>
                  <TextField
                    placeholder="Search Truck Expense"
                    size="small"
                    fullWidth
                    value={truckExpenseSearch}
                    onChange={(e) => setTruckExpenseSearch(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </CardContent>
              </Card>
            </Grid>

            {/* Trip Expenses */}
            <Grid item xs={12} md={4}>
              <Card elevation={2} sx={{ borderRadius: 2, height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <DirectionsCar sx={{ color: '#2196F3', fontSize: 24 }} />
                    <Typography sx={{ fontSize: '16px', fontWeight: 600, color: '#2B2D42' }}>
                      Trip Expenses
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography sx={{ fontSize: '12px', color: '#6B6C7B' }}>
                      {currentMonth.split(' ')[0]} Trip Expenses
                    </Typography>
                    <Typography sx={{ fontSize: '18px', fontWeight: 600, color: '#2B2D42' }}>
                      ₹ {totalTruckExpense.toLocaleString()}
                    </Typography>
                  </Box>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => handleOpenExpense('booking')}
                    sx={{ 
                      mb: 2, 
                      bgcolor: '#2196F3',
                      '&:hover': { bgcolor: '#1976D2' },
                      textTransform: 'none',
                      fontWeight: 500
                    }}
                  >
                    Add Trip Expense
                  </Button>
                  <TextField
                    placeholder="Search Trip Expense"
                    size="small"
                    fullWidth
                    value={bookingExpenseSearch}
                    onChange={(e) => setBookingExpenseSearch(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </CardContent>
              </Card>
            </Grid>

            {/* Office Expenses */}
            <Grid item xs={12} md={4}>
              <Card elevation={2} sx={{ borderRadius: 2, height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <BusinessCenter sx={{ color: '#9C27B0', fontSize: 24 }} />
                    <Typography sx={{ fontSize: '16px', fontWeight: 600, color: '#2B2D42' }}>
                      Office Expenses
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography sx={{ fontSize: '12px', color: '#6B6C7B' }}>
                      {currentMonth.split(' ')[0]} Office Expenses
                    </Typography>
                    <Typography sx={{ fontSize: '18px', fontWeight: 600, color: '#2B2D42' }}>
                      ₹ {totalOfficeExpense.toLocaleString()}
                    </Typography>
                  </Box>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => handleOpenExpense('office')}
                    sx={{ 
                      mb: 2, 
                      bgcolor: '#9C27B0',
                      '&:hover': { bgcolor: '#7B1FA2' },
                      textTransform: 'none',
                      fontWeight: 500
                    }}
                  >
                    Add Office Expense
                  </Button>
                  <TextField
                    placeholder="Search Office Expense"
                    size="small"
                    fullWidth
                    value={officeExpenseSearch}
                    onChange={(e) => setOfficeExpenseSearch(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Container>

      {/* Add Expense Dialog */}
      <Dialog open={expenseDialog} onClose={handleCloseExpense} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
        <DialogTitle sx={{ fontWeight: 600, fontSize: '18px' }}>
          Add {expenseCategory.charAt(0).toUpperCase() + expenseCategory.slice(1)} Expense
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Typography sx={{ fontSize: '14px', color: '#6B6C7B' }}>
              Add expense form would go here
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button 
            onClick={handleCloseExpense}
            sx={{ 
              color: '#6B6C7B',
              textTransform: 'none',
              px: 3,
            }}
          >
            Cancel
          </Button>
          <Button 
            variant="contained"
            sx={{ 
              bgcolor: '#2B2D42',
              '&:hover': { bgcolor: '#1a1b28' },
              textTransform: 'none',
              px: 3,
            }}
          >
            Save Expense
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
}
