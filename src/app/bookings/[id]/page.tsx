'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  Paper,
  Chip,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import {
  Edit,
  Delete,
  LocalShipping,
  Person,
  ArrowForward,
  CheckCircle,
  RadioButtonUnchecked,
  Add,
  AttachMoney,
  Receipt,
  Description,
  TrendingUp,
  TrendingDown,
} from '@mui/icons-material';
import Layout from '@/components/Layout';
import InvoicePDF from '@/components/InvoicePDF';

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
}

interface Party {
  id: number;
  name: string;
  balance: number;
}

interface Expense {
  id: number;
  amount: number;
  description: string;
  expense_type: string;
  expense_date: string;
}

export default function BookingDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const bookingId = params.id as string;

  const [booking, setBooking] = useState<Booking | null>(null);
  const [bookingVehicles, setBookingVehicles] = useState<BookingVehicle[]>([]);
  const [party, setParty] = useState<Party | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Dialog states
  const [expenseDialog, setExpenseDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [notesDialog, setNotesDialog] = useState(false);
  const [loadDialog, setLoadDialog] = useState(false);
  const [lrDialog, setLrDialog] = useState(false);
  const [podDialog, setPodDialog] = useState(false);
  const [invoiceDialog, setInvoiceDialog] = useState(false);

  // Refs
  const invoiceRef = useRef<HTMLDivElement>(null);

  // Form states
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseDescription, setExpenseDescription] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (bookingId) {
      fetchBookingDetails();
      fetchExpenses();
    }
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/bookings/${bookingId}`);
      if (response.ok) {
        const data = await response.json();
        setBooking(data);
        
        // Fetch booking vehicles
        const vehiclesResponse = await fetch(`/api/booking-vehicles?booking_id=${bookingId}`);
        if (vehiclesResponse.ok) {
          const vehiclesData = await vehiclesResponse.json();
          setBookingVehicles(vehiclesData || []);
        }
        
        // Fetch party details
        if (data.party_id) {
          const partyResponse = await fetch(`/api/parties/${data.party_id}`);
          if (partyResponse.ok) {
            setParty(await partyResponse.json());
          }
        }
      } else {
        setError('Failed to fetch booking details');
      }
    } catch (err) {
      setError('Failed to fetch booking details');
    } finally {
      setLoading(false);
    }
  };

  const fetchExpenses = async () => {
    try {
      const response = await fetch(`/api/expenses?booking_id=${bookingId}`);
      if (response.ok) {
        const data = await response.json();
        setExpenses(data.filter((e: any) => e.booking_id === parseInt(bookingId)));
      }
    } catch (err) {
      console.error('Failed to fetch expenses');
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSuccess('Booking deleted successfully');
        setTimeout(() => router.push('/bookings'), 1500);
      } else {
        setError('Failed to delete booking');
      }
    } catch (err) {
      setError('Failed to delete booking');
    }
    setDeleteDialog(false);
  };

  const handleAddExpense = async () => {
    if (!expenseAmount || !expenseDescription) return;
    
    try {
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          booking_id: bookingId,
          truck_id: booking?.truck_id,
          expense_type: 'Booking Expense',
          amount: parseFloat(expenseAmount),
          description: expenseDescription,
          expense_date: new Date().toISOString().split('T')[0],
        }),
      });

      if (response.ok) {
        setSuccess('Expense added successfully');
        fetchExpenses();
        setExpenseDialog(false);
        setExpenseAmount('');
        setExpenseDescription('');
      }
    } catch (err) {
      setError('Failed to add expense');
    }
  };

  const handleSaveNotes = async () => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...booking,
          notes: notes,
        }),
      });

      if (response.ok) {
        setSuccess('Notes saved successfully');
        fetchBookingDetails();
        setNotesDialog(false);
      }
    } catch (err) {
      setError('Failed to save notes');
    }
  };

  const handleOpenNotesDialog = () => {
    setNotes(booking?.notes || '');
    setNotesDialog(true);
  };

  const handleAddLoad = () => {
    setLoadDialog(true);
  };

  const handleCreateLR = () => {
    setLrDialog(true);
  };

  const handleAddPOD = () => {
    setPodDialog(true);
  };

  const handleDriverClick = () => {
    if (booking?.driver_id) {
      router.push(`/drivers/${booking.driver_id}`);
    }
  };

  const handlePartyClick = () => {
    if (booking?.party_id) {
      router.push(`/parties/${booking.party_id}`);
    }
  };

  const handleCompleteBooking = async () => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...booking,
          status: 'delivered',
        }),
      });

      if (response.ok) {
        setSuccess('Booking marked as completed');
        fetchBookingDetails();
      }
    } catch (err) {
      setError('Failed to update booking status');
    }
  };

  const handlePODReceived = async () => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...booking,
          status: 'pod_received',
        }),
      });

      if (response.ok) {
        setSuccess('POD marked as received');
        fetchBookingDetails();
      }
    } catch (err) {
      setError('Failed to update booking status');
    }
  };

  const handlePODSubmitted = async () => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...booking,
          status: 'pod_submitted',
        }),
      });

      if (response.ok) {
        setSuccess('POD marked as submitted');
        fetchBookingDetails();
      }
    } catch (err) {
      setError('Failed to update booking status');
    }
  };

  const getBookingSteps = () => {
    const isStarted = !!booking?.start_date;
    const isCompleted = booking?.status === 'delivered' || booking?.status === 'completed';
    const isPODReceived = booking?.status === 'pod_received' || booking?.status === 'delivered';
    const isPODSubmitted = booking?.status === 'pod_submitted';
    // Settled only when booking is completed, POD submitted, and balance is 0
    const isSettled = isCompleted && isPODSubmitted && (booking?.total_amount || 0) === 0;
    
    const steps = [
      { label: 'Started', date: booking?.start_date, completed: isStarted },
      { label: 'Completed', completed: isCompleted },
      { label: 'POD Received', date: '', completed: isPODReceived },
      { label: 'POD Submitted', date: '', completed: isPODSubmitted },
      { label: 'Settled', date: '', completed: isSettled },
    ];
    return steps;
  };

  const calculateProfit = () => {
    const revenue = booking?.total_amount || 0;
    const totalExpenses = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
    return revenue - totalExpenses;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'booked': return 'info';
      case 'in_transit': return 'warning';
      case 'delivered': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Layout>
        <Container maxWidth="lg">
          <Box sx={{ my: 4, textAlign: 'center' }}>
            <Typography>Loading...</Typography>
          </Box>
        </Container>
      </Layout>
    );
  }

  if (!booking) {
    return (
      <Layout>
        <Container maxWidth="lg">
          <Box sx={{ my: 4 }}>
            <Alert severity="error">Booking not found</Alert>
          </Box>
        </Container>
      </Layout>
    );
  }

  const profit = calculateProfit();
  const totalExpenses = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);

  return (
    <Layout>
      <Container maxWidth="lg">
        <Box sx={{ my: 4 }}>
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
            <Typography variant="h4" component="h1">
              Booking Details
            </Typography>
            <Box>
              <Button
                variant="outlined"
                startIcon={<Edit />}
                onClick={() => router.push(`/bookings/new?edit=${bookingId}`)}
                sx={{ mr: 1 }}
              >
                Edit Booking
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<Delete />}
                onClick={() => setDeleteDialog(true)}
              >
                Delete Booking
              </Button>
            </Box>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

          <Grid container spacing={3}>
            {/* Main Content - Left Side */}
            <Grid item xs={12} md={8}>
              {/* Vehicles Section */}
              {bookingVehicles.length > 0 && (
                <Paper sx={{ p: 3, mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#2B2D42' }}>
                    Vehicles & Drivers
                  </Typography>
                  <Grid container spacing={2}>
                    {bookingVehicles.map((vehicle, index) => (
                      <Grid item xs={12} key={vehicle.id}>
                        <Card variant="outlined" sx={{ p: 2 }}>
                          <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <LocalShipping sx={{ fontSize: 32, color: '#6930CA' }} />
                                <Box>
                                  <Typography variant="caption" color="text.secondary">
                                    Vehicle {index + 1}
                                  </Typography>
                                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                    {vehicle.vehicle_source === 'own' ? vehicle.truck_number : vehicle.vehicle_number}
                                  </Typography>
                                  <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
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
                                    <Chip
                                      label={vehicle.vehicle_type_name}
                                      size="small"
                                      sx={{ height: 20, fontSize: '10px' }}
                                    />
                                  </Box>
                                  {vehicle.vehicle_source === 'vendor' && vehicle.vendor_name && (
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                      Vendor: {vehicle.vendor_name}
                                    </Typography>
                                  )}
                                </Box>
                              </Box>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Person sx={{ fontSize: 32, color: '#6930CA' }} />
                                <Box>
                                  <Typography variant="caption" color="text.secondary">
                                    Driver
                                  </Typography>
                                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                    {vehicle.driver_name || 'Not Assigned'}
                                  </Typography>
                                  {vehicle.driver_phone && (
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                      {vehicle.driver_phone}
                                    </Typography>
                                  )}
                                  {vehicle.amount && (
                                    <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: '#10B981', fontWeight: 600 }}>
                                      ₹{vehicle.amount.toLocaleString()}
                                    </Typography>
                                  )}
                                </Box>
                              </Box>
                            </Grid>
                          </Grid>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Paper>
              )}

              {/* Legacy Truck & Driver Cards (if no vehicles in booking_vehicles) */}
              {bookingVehicles.length === 0 && (
              <Grid container spacing={2} sx={{ mb: 3 }}>
                {/* Truck Card */}
                <Grid item xs={12} sm={6} md={4}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <LocalShipping sx={{ fontSize: 40, color: '#000' }} />
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {booking.truck_number || 'Not Assigned'}
                          </Typography>
                          <Button 
                            size="small" 
                            sx={{ color: '#6930CA', textTransform: 'none', p: 0, minWidth: 'auto', mt: 0.5 }}
                            onClick={() => booking.truck_id && router.push(`/trucks/${booking.truck_id}`)}
                            endIcon={<ArrowForward sx={{ fontSize: 16 }} />}
                          >
                            View Truck
                          </Button>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Driver Card */}
                <Grid item xs={12} sm={6} md={4}>
                  <Card sx={{ height: '100%', cursor: booking.driver_id ? 'pointer' : 'default' }} onClick={handleDriverClick}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Person sx={{ fontSize: 40, color: '#000' }} />
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Driver Name
                            </Typography>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                              {booking.driver_name || 'Not Assigned'}
                            </Typography>
                          </Box>
                        </Box>
                        {booking.driver_id && (
                          <IconButton size="small">
                            <ArrowForward />
                          </IconButton>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
              )}

              {/* Party Banner with Add Load Button */}
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                mb: 2,
                p: 2,
                bgcolor: '#f5f5f5',
                borderRadius: 1
              }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {booking.party_name}
                </Typography>
                <Button 
                  variant="outlined" 
                  startIcon={<Add />}
                  size="small"
                  sx={{ textTransform: 'none' }}
                  onClick={handleAddLoad}
                >
                  Add Load
                </Button>
              </Box>

              {/* Combined Booking Details Card */}
              <Paper sx={{ p: 2, mb: 3 }}>
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      Booking ID
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {booking.booking_number || `#${booking.id}`}
                    </Typography>
                  </Grid>

                  <Grid item xs={6} sm={3}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      Party Name
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#6930CA', fontWeight: 500 }}>
                      {booking.party_name}
                    </Typography>
                  </Grid>

                  <Grid item xs={6} sm={3}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      Party Balance
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'success.main', fontWeight: 500 }}>
                      ₹ {party?.balance?.toLocaleString() || '0'}
                    </Typography>
                  </Grid>

                  <Grid item xs={6} sm={3}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      LR Number
                    </Typography>
                    <Typography variant="body1">
                      {booking.lr_number || '----'}
                    </Typography>
                  </Grid>

                  <Grid item xs={6} sm={3}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      Material
                    </Typography>
                    <Typography variant="body1">
                      {booking.material_description || '----'}
                    </Typography>
                  </Grid>
                </Grid>

                <Box sx={{ my: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {booking.from_location}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {booking.start_date}
                    </Typography>
                  </Box>
                  <ArrowForward sx={{ color: 'text.secondary' }} />
                  <Box sx={{ flex: 1, textAlign: 'right' }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {booking.to_location}
                    </Typography>
                  </Box>
                </Box>

              </Paper>

              {/* Booking Status Timeline */}
              <Paper sx={{ p: 3, mb: 3 }}>
                <Stepper activeStep={getBookingSteps().filter(s => s.completed).length - 1} alternativeLabel>
                  {getBookingSteps().map((step, index) => (
                    <Step key={step.label} completed={step.completed}>
                      <StepLabel
                        StepIconComponent={({ active, completed }) =>
                          completed ? (
                            <CheckCircle sx={{ fontSize: 28, color: '#4caf50' }} />
                          ) : (
                            <RadioButtonUnchecked sx={{ fontSize: 28, color: 'rgba(0, 0, 0, 0.26)' }} />
                          )
                        }
                      >
                        <Typography variant="body2" sx={{ fontWeight: step.completed ? 600 : 400, fontSize: '0.875rem' }}>
                          {step.label}
                        </Typography>
                        {step.date && step.label === 'Started' && (
                          <Typography variant="caption" color="text.secondary" display="block">
                            {step.date}
                          </Typography>
                        )}
                      </StepLabel>
                    </Step>
                  ))}
                </Stepper>
              </Paper>

              {/* Action Buttons */}
              <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <Button
                  variant="outlined"
                  onClick={handleCompleteBooking}
                  fullWidth
                  sx={{ 
                    textTransform: 'none',
                    borderColor: '#4caf50',
                    color: '#4caf50',
                    '&:hover': {
                      borderColor: '#4caf50',
                      bgcolor: 'rgba(76, 175, 80, 0.04)'
                    }
                  }}
                >
                  Complete Booking
                </Button>
                <Button
                  variant="contained"
                  fullWidth
                  sx={{ 
                    textTransform: 'none',
                    bgcolor: '#2196f3',
                    '&:hover': {
                      bgcolor: '#1976d2'
                    }
                  }}
                  onClick={() => setInvoiceDialog(true)}
                >
                  View Bill
                </Button>
              </Box>

              {/* Financial Details */}
              <Paper sx={{ p: 3, mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Total Amount
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    ₹ {booking.total_amount?.toLocaleString() || 0}
                  </Typography>
                </Box>
              </Paper>

              {/* Notes */}
              <Paper sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    Notes
                  </Typography>
                  <IconButton onClick={handleOpenNotesDialog} size="small" color="primary">
                    {booking.notes ? <Edit /> : <Add />}
                  </IconButton>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
                  {booking.notes || 'No notes added.'}
                </Typography>
              </Paper>
            </Grid>

            {/* Sidebar - Right Side */}
            <Grid item xs={12} md={4}>
              {/* Booking Profit Card */}
              <Paper sx={{ p: 3, mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>Booking Profit</Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<Add />}
                    onClick={() => setExpenseDialog(true)}
                    sx={{ textTransform: 'none' }}
                  >
                    Add Expense
                  </Button>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    (+) Revenue
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    ₹ {booking.total_amount?.toLocaleString() || 0}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }} onClick={handlePartyClick}>
                    <Typography variant="body2">
                      {booking.party_name}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Typography variant="body2">
                        ₹ {booking.total_amount?.toLocaleString() || 0}
                      </Typography>
                      <ArrowForward sx={{ fontSize: 16 }} />
                    </Box>
                  </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    (-) Expense
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: expenses.length > 0 ? 'error.main' : 'inherit' }}>
                    ₹ {totalExpenses?.toLocaleString() || 0}
                  </Typography>
                  {expenses.length === 0 && (
                    <Typography variant="body2" color="text.secondary">
                      No expenses added
                    </Typography>
                  )}
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>Profit</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: profit >= 0 ? 'success.main' : 'error.main' }}>
                    ₹ {profit?.toLocaleString() || 0}
                  </Typography>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Typography variant="body1" sx={{ textAlign: 'center' }}>
                  {booking.party_name}
                </Typography>
              </Paper>

              {/* Documents Section */}
              <Paper sx={{ p: 3, mb: 3 }}>
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Receipt sx={{ color: '#4caf50' }} />
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>Online Bilty/LR</Typography>
                  </Box>
                  <Button 
                    variant="contained" 
                    fullWidth 
                    size="medium"
                    onClick={handleCreateLR}
                    sx={{ 
                      bgcolor: '#4caf50',
                      textTransform: 'none',
                      '&:hover': {
                        bgcolor: '#45a049'
                      }
                    }}
                  >
                    Create LR
                  </Button>
                </Box>

                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Description sx={{ color: '#2196f3' }} />
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>POD Challan</Typography>
                  </Box>
                  <Button 
                    variant="contained" 
                    fullWidth 
                    size="medium"
                    startIcon={<Add />}
                    onClick={handleAddPOD}
                    sx={{ 
                      bgcolor: '#2196f3',
                      textTransform: 'none',
                      '&:hover': {
                        bgcolor: '#1976d2'
                      }
                    }}
                  >
                    Add POD
                  </Button>
                </Box>
              </Paper>
            </Grid>
          </Grid>

          {/* Dialogs */}
          <Dialog open={expenseDialog} onClose={() => setExpenseDialog(false)}>
            <DialogTitle>Add Expense</DialogTitle>
            <DialogContent>
              <TextField
                autoFocus
                margin="dense"
                label="Description"
                fullWidth
                value={expenseDescription}
                onChange={(e) => setExpenseDescription(e.target.value)}
                sx={{ mb: 2 }}
              />
              <TextField
                margin="dense"
                label="Amount"
                type="number"
                fullWidth
                value={expenseAmount}
                onChange={(e) => setExpenseAmount(e.target.value)}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setExpenseDialog(false)}>Cancel</Button>
              <Button onClick={handleAddExpense} variant="contained">
                Add
              </Button>
            </DialogActions>
          </Dialog>

          <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
            <DialogTitle>Delete Booking</DialogTitle>
            <DialogContent>
              <Typography>
                Are you sure you want to delete this booking? This action cannot be undone.
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDeleteDialog(false)}>Cancel</Button>
              <Button onClick={handleDelete} color="error" variant="contained">
                Delete
              </Button>
            </DialogActions>
          </Dialog>

          <Dialog open={notesDialog} onClose={() => setNotesDialog(false)} maxWidth="sm" fullWidth>
            <DialogTitle>Booking Notes</DialogTitle>
            <DialogContent>
              <TextField
                autoFocus
                margin="dense"
                label="Notes"
                multiline
                rows={6}
                fullWidth
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add booking notes, instructions, or important details..."
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setNotesDialog(false)}>Cancel</Button>
              <Button onClick={handleSaveNotes} variant="contained">
                Save Notes
              </Button>
            </DialogActions>
          </Dialog>

          <Dialog open={loadDialog} onClose={() => setLoadDialog(false)}>
            <DialogTitle>Add Load</DialogTitle>
            <DialogContent>
              <Alert severity="info" sx={{ mt: 1 }}>
                Add Load functionality allows you to add multiple shipments to a single booking. This feature is coming soon!
              </Alert>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setLoadDialog(false)} variant="contained">
                OK
              </Button>
            </DialogActions>
          </Dialog>

          <Dialog open={lrDialog} onClose={() => setLrDialog(false)}>
            <DialogTitle>Create Lorry Receipt (LR)</DialogTitle>
            <DialogContent>
              <Alert severity="info" sx={{ mt: 1 }}>
                Online LR generation feature is coming soon! This will allow you to create and download digital lorry receipts.
              </Alert>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setLrDialog(false)} variant="contained">
                OK
              </Button>
            </DialogActions>
          </Dialog>

          <Dialog open={podDialog} onClose={() => setPodDialog(false)}>
            <DialogTitle>Add Proof of Delivery (POD)</DialogTitle>
            <DialogContent>
              <Alert severity="info" sx={{ mt: 1 }}>
                POD upload feature is coming soon! This will allow you to upload delivery documents and photos.
              </Alert>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setPodDialog(false)} variant="contained">
                OK
              </Button>
            </DialogActions>
          </Dialog>

          <Dialog 
            open={invoiceDialog} 
            onClose={() => setInvoiceDialog(false)}
            maxWidth={false}
            PaperProps={{
              sx: {
                width: '90vw',
                height: '90vh',
                maxWidth: '1200px',
              }
            }}
          >
            <DialogTitle sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              borderBottom: '1px solid #ddd'
            }}>
              <Typography variant="h6">Freight Invoice - {booking?.booking_number || `#${booking?.id}`}</Typography>
              <Button
                variant="contained"
                onClick={() => {
                  if (invoiceRef.current) {
                    const printWindow = window.open('', '_blank');
                    if (printWindow) {
                      printWindow.document.write(`
                        <html>
                          <head>
                            <title>Invoice - ${booking?.booking_number || booking?.id}</title>
                            <style>
                              @media print {
                                body { margin: 0; }
                                @page { size: A4; margin: 0; }
                              }
                              body { font-family: Arial, sans-serif; }
                            </style>
                          </head>
                          <body>
                            ${invoiceRef.current.innerHTML}
                          </body>
                        </html>
                      `);
                      printWindow.document.close();
                      setTimeout(() => {
                        printWindow.print();
                      }, 250);
                    }
                  }
                }}
                sx={{ mr: 2 }}
              >
                Print / Save as PDF
              </Button>
            </DialogTitle>
            <DialogContent 
              sx={{ 
                p: 3, 
                overflow: 'auto',
                backgroundColor: '#f5f5f5'
              }}
            >
              {booking && (
                <InvoicePDF 
                  ref={invoiceRef}
                  data={{
                    trip_number: booking.booking_number || `#${booking.id}`,
                    party_name: booking.party_name,
                    truck_number: booking.truck_number,
                    driver_name: booking.driver_name,
                    from_location: booking.from_location,
                    to_location: booking.to_location,
                    start_date: booking.start_date,
                    material_description: booking.material_description,
                    weight_tons: booking.weight_tons,
                    lr_number: booking.lr_number,
                    total_amount: booking.total_amount,
                    billing_type: booking.billing_type,
                  }}
                />
              )}
            </DialogContent>
            <DialogActions sx={{ borderTop: '1px solid #ddd', p: 2 }}>
              <Button onClick={() => setInvoiceDialog(false)}>
                Close
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Container>
    </Layout>
  );
}
