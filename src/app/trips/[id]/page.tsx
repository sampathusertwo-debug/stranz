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

interface Trip {
  id: number;
  trip_number: string;
  party_id: number;
  party_name: string;
  truck_id: number;
  truck_number: string;
  driver_id: number;
  driver_name: string;
  from_location: string;
  to_location: string;
  start_date: string;
  end_date: string;
  status: string;
  freight_amount: number;
  advance_amount: number;
  balance_amount: number;
  billing_type: string;
  material_description: string;
  weight_tons: number;
  lr_number: string;
  start_odometer_reading: number;
  end_odometer_reading: number;
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

export default function TripDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const tripId = params.id as string;

  const [trip, setTrip] = useState<Trip | null>(null);
  const [party, setParty] = useState<Party | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Dialog states
  const [advanceDialog, setAdvanceDialog] = useState(false);
  const [chargesDialog, setChargesDialog] = useState(false);
  const [paymentDialog, setPaymentDialog] = useState(false);
  const [expenseDialog, setExpenseDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [notesDialog, setNotesDialog] = useState(false);
  const [freightDialog, setFreightDialog] = useState(false);
  const [loadDialog, setLoadDialog] = useState(false);
  const [lrDialog, setLrDialog] = useState(false);
  const [podDialog, setPodDialog] = useState(false);
  const [invoiceDialog, setInvoiceDialog] = useState(false);

  // Refs
  const invoiceRef = useRef<HTMLDivElement>(null);

  // Form states
  const [advanceAmount, setAdvanceAmount] = useState('');
  const [chargesAmount, setChargesAmount] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseDescription, setExpenseDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [freightAmount, setFreightAmount] = useState('');

  useEffect(() => {
    if (tripId) {
      fetchTripDetails();
      fetchExpenses();
    }
  }, [tripId]);

  const fetchTripDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/trips/${tripId}`);
      if (response.ok) {
        const data = await response.json();
        setTrip(data);
        
        // Fetch party details
        if (data.party_id) {
          const partyResponse = await fetch(`/api/parties/${data.party_id}`);
          if (partyResponse.ok) {
            setParty(await partyResponse.json());
          }
        }
      } else {
        setError('Failed to fetch trip details');
      }
    } catch (err) {
      setError('Failed to fetch trip details');
    } finally {
      setLoading(false);
    }
  };

  const fetchExpenses = async () => {
    try {
      const response = await fetch(`/api/expenses?trip_id=${tripId}`);
      if (response.ok) {
        const data = await response.json();
        setExpenses(data.filter((e: any) => e.trip_id === parseInt(tripId)));
      }
    } catch (err) {
      console.error('Failed to fetch expenses');
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/trips/${tripId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSuccess('Trip deleted successfully');
        setTimeout(() => router.push('/trips'), 1500);
      } else {
        setError('Failed to delete trip');
      }
    } catch (err) {
      setError('Failed to delete trip');
    }
    setDeleteDialog(false);
  };

  const handleAddAdvance = async () => {
    if (!advanceAmount) return;
    
    try {
      const newAdvance = (trip?.advance_amount || 0) + parseFloat(advanceAmount);
      const newBalance = (trip?.freight_amount || 0) - newAdvance;
      
      const response = await fetch(`/api/trips/${tripId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...trip,
          advance_amount: newAdvance,
          balance_amount: newBalance,
        }),
      });

      if (response.ok) {
        setSuccess('Advance added successfully');
        fetchTripDetails();
        setAdvanceDialog(false);
        setAdvanceAmount('');
      }
    } catch (err) {
      setError('Failed to add advance');
    }
  };

  const handleAddPayment = async () => {
    if (!paymentAmount) return;
    
    try {
      const newBalance = (trip?.balance_amount || 0) - parseFloat(paymentAmount);
      
      const response = await fetch(`/api/trips/${tripId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...trip,
          balance_amount: newBalance,
        }),
      });

      if (response.ok) {
        setSuccess('Payment added successfully');
        fetchTripDetails();
        setPaymentDialog(false);
        setPaymentAmount('');
      }
    } catch (err) {
      setError('Failed to add payment');
    }
  };

  const handleAddExpense = async () => {
    if (!expenseAmount || !expenseDescription) return;
    
    try {
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trip_id: tripId,
          truck_id: trip?.truck_id,
          expense_type: 'Trip Expense',
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
      const response = await fetch(`/api/trips/${tripId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...trip,
          notes: notes,
        }),
      });

      if (response.ok) {
        setSuccess('Notes saved successfully');
        fetchTripDetails();
        setNotesDialog(false);
      }
    } catch (err) {
      setError('Failed to save notes');
    }
  };

  const handleOpenNotesDialog = () => {
    setNotes(trip?.notes || '');
    setNotesDialog(true);
  };

  const handleOpenFreightDialog = () => {
    setFreightAmount(trip?.freight_amount?.toString() || '');
    setFreightDialog(true);
  };

  const handleUpdateFreight = async () => {
    if (!freightAmount) return;
    
    try {
      const newFreight = parseFloat(freightAmount);
      const response = await fetch(`/api/trips/${tripId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...trip,
          freight_amount: newFreight,
          balance_amount: newFreight - (trip?.advance_amount || 0),
        }),
      });

      if (response.ok) {
        setSuccess('Freight amount updated successfully');
        fetchTripDetails();
        setFreightDialog(false);
      }
    } catch (err) {
      setError('Failed to update freight amount');
    }
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
    if (trip?.driver_id) {
      router.push(`/drivers/${trip.driver_id}`);
    }
  };

  const handlePartyClick = () => {
    if (trip?.party_id) {
      router.push(`/parties/${trip.party_id}`);
    }
  };

  const handleCompleteTrip = async () => {
    try {
      const response = await fetch(`/api/trips/${tripId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...trip,
          status: 'delivered',
          end_date: trip?.end_date || new Date().toISOString().split('T')[0],
        }),
      });

      if (response.ok) {
        setSuccess('Trip marked as completed');
        fetchTripDetails();
      }
    } catch (err) {
      setError('Failed to update trip status');
    }
  };

  const handlePODReceived = async () => {
    try {
      const response = await fetch(`/api/trips/${tripId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...trip,
          status: 'pod_received',
        }),
      });

      if (response.ok) {
        setSuccess('POD marked as received');
        fetchTripDetails();
      }
    } catch (err) {
      setError('Failed to update trip status');
    }
  };

  const handlePODSubmitted = async () => {
    try {
      const response = await fetch(`/api/trips/${tripId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...trip,
          status: 'pod_submitted',
        }),
      });

      if (response.ok) {
        setSuccess('POD marked as submitted');
        fetchTripDetails();
      }
    } catch (err) {
      setError('Failed to update trip status');
    }
  };

  const getTripSteps = () => {
    const isStarted = !!trip?.start_date;
    const isCompleted = trip?.status === 'delivered' || trip?.status === 'completed';
    const isPODReceived = trip?.status === 'pod_received' || trip?.status === 'delivered';
    const isPODSubmitted = trip?.status === 'pod_submitted';
    // Settled only when trip is completed, POD submitted, and balance is 0
    const isSettled = isCompleted && isPODSubmitted && (trip?.balance_amount || 0) === 0;
    
    const steps = [
      { label: 'Started', date: trip?.start_date, completed: isStarted },
      { label: 'Completed', date: trip?.end_date, completed: isCompleted },
      { label: 'POD Received', date: '', completed: isPODReceived },
      { label: 'POD Submitted', date: '', completed: isPODSubmitted },
      { label: 'Settled', date: '', completed: isSettled },
    ];
    return steps;
  };

  const calculateProfit = () => {
    const revenue = trip?.freight_amount || 0;
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

  if (!trip) {
    return (
      <Layout>
        <Container maxWidth="lg">
          <Box sx={{ my: 4 }}>
            <Alert severity="error">Trip not found</Alert>
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
              Trip Details
            </Typography>
            <Box>
              <Button
                variant="outlined"
                startIcon={<Edit />}
                onClick={() => router.push(`/trips?edit=${tripId}`)}
                sx={{ mr: 1 }}
              >
                Edit Trip
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<Delete />}
                onClick={() => setDeleteDialog(true)}
              >
                Delete Trip
              </Button>
            </Box>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

          <Grid container spacing={3}>
            {/* Main Content - Left Side */}
            <Grid item xs={12} md={8}>
              {/* Top Row: Truck, Driver, and Party Cards */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                {/* Truck Card */}
                <Grid item xs={12} sm={6} md={4}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <LocalShipping sx={{ fontSize: 40, color: '#000' }} />
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {trip.truck_number || 'Not Assigned'}
                          </Typography>
                          <Button 
                            size="small" 
                            sx={{ color: '#6930CA', textTransform: 'none', p: 0, minWidth: 'auto', mt: 0.5 }}
                            onClick={() => trip.truck_id && router.push(`/trucks/${trip.truck_id}`)}
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
                  <Card sx={{ height: '100%', cursor: trip.driver_id ? 'pointer' : 'default' }} onClick={handleDriverClick}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Person sx={{ fontSize: 40, color: '#000' }} />
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Driver Name
                            </Typography>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                              {trip.driver_name || 'Not Assigned'}
                            </Typography>
                          </Box>
                        </Box>
                        {trip.driver_id && (
                          <IconButton size="small">
                            <ArrowForward />
                          </IconButton>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

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
                  {trip.party_name}
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

              {/* Combined Trip Details Card */}
              <Paper sx={{ p: 2, mb: 3 }}>
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      Booking ID
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      #{trip.id}
                    </Typography>
                  </Grid>

                  <Grid item xs={6} sm={3}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      Party Name
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#6930CA', fontWeight: 500 }}>
                      {trip.party_name}
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
                      {trip.lr_number || '----'}
                    </Typography>
                  </Grid>

                  <Grid item xs={6} sm={3}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      Material
                    </Typography>
                    <Typography variant="body1">
                      {trip.material_description || '----'}
                    </Typography>
                  </Grid>
                </Grid>

                <Box sx={{ my: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {trip.from_location}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {trip.start_date}
                    </Typography>
                  </Box>
                  <ArrowForward sx={{ color: 'text.secondary' }} />
                  <Box sx={{ flex: 1, textAlign: 'right' }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {trip.to_location}
                    </Typography>
                  </Box>
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      Start KMs Reading
                    </Typography>
                    <Typography variant="body1">
                      {trip.start_odometer_reading || '----'}
                    </Typography>
                  </Grid>

                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      End KMs Reading
                    </Typography>
                    <Typography variant="body1">
                      {trip.end_odometer_reading || '----'}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>

              {/* Trip Status Timeline */}
              <Paper sx={{ p: 3, mb: 3 }}>
                <Stepper activeStep={getTripSteps().filter(s => s.completed).length - 1} alternativeLabel>
                  {getTripSteps().map((step, index) => (
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
                  onClick={handleCompleteTrip}
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
                  Complete Trip
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
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    Freight Amount
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      ₹ {trip.freight_amount?.toLocaleString() || 0}
                    </Typography>
                    <IconButton size="small" onClick={handleOpenFreightDialog}>
                      <Edit fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                  <Typography variant="body2">(-) Advance</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    ₹ {trip.advance_amount?.toLocaleString() || 0}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'right', mb: 2 }}>
                  <Button 
                    size="small" 
                    onClick={() => setAdvanceDialog(true)}
                    sx={{ textTransform: 'none', fontSize: '0.75rem', color: '#6930CA' }}
                  >
                    Add Advance
                  </Button>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                  <Typography variant="body2">(+) Charges</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    ₹ 0
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'right', mb: 2 }}>
                  <Button 
                    size="small" 
                    onClick={() => setChargesDialog(true)}
                    sx={{ textTransform: 'none', fontSize: '0.75rem', color: '#6930CA' }}
                  >
                    Add Charge
                  </Button>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                  <Typography variant="body2">(-) Payments</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    ₹ {((trip.freight_amount || 0) - (trip.balance_amount || 0) - (trip.advance_amount || 0))?.toLocaleString() || 0}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'right', mb: 2 }}>
                  <Button 
                    size="small" 
                    onClick={() => setPaymentDialog(true)}
                    sx={{ textTransform: 'none', fontSize: '0.75rem', color: '#6930CA' }}
                  >
                    Add Payment
                  </Button>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Pending Party Balance
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    ₹ {trip.balance_amount?.toLocaleString() || 0}
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
                    {trip.notes ? <Edit /> : <Add />}
                  </IconButton>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
                  {trip.notes || 'No notes added.'}
                </Typography>
              </Paper>
            </Grid>

            {/* Sidebar - Right Side */}
            <Grid item xs={12} md={4}>
              {/* Trip Profit Card */}
              <Paper sx={{ p: 3, mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>Trip Profit</Typography>
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
                    ₹ {trip.freight_amount?.toLocaleString() || 0}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }} onClick={handlePartyClick}>
                    <Typography variant="body2">
                      {trip.party_name}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Typography variant="body2">
                        ₹ {trip.freight_amount?.toLocaleString() || 0}
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
                  {trip.party_name}
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

          {/* Add Advance Dialog */}
          <Dialog open={advanceDialog} onClose={() => setAdvanceDialog(false)}>
            <DialogTitle>Add Advance</DialogTitle>
            <DialogContent>
              <TextField
                autoFocus
                margin="dense"
                label="Advance Amount"
                type="number"
                fullWidth
                value={advanceAmount}
                onChange={(e) => setAdvanceAmount(e.target.value)}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setAdvanceDialog(false)}>Cancel</Button>
              <Button onClick={handleAddAdvance} variant="contained">
                Add
              </Button>
            </DialogActions>
          </Dialog>

          {/* Add Payment Dialog */}
          <Dialog open={paymentDialog} onClose={() => setPaymentDialog(false)}>
            <DialogTitle>Add Payment</DialogTitle>
            <DialogContent>
              <TextField
                autoFocus
                margin="dense"
                label="Payment Amount"
                type="number"
                fullWidth
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setPaymentDialog(false)}>Cancel</Button>
              <Button onClick={handleAddPayment} variant="contained">
                Add
              </Button>
            </DialogActions>
          </Dialog>

          {/* Add Expense Dialog */}
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

          {/* Delete Confirmation Dialog */}
          <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
            <DialogTitle>Delete Trip</DialogTitle>
            <DialogContent>
              <Typography>
                Are you sure you want to delete this trip? This action cannot be undone.
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDeleteDialog(false)}>Cancel</Button>
              <Button onClick={handleDelete} color="error" variant="contained">
                Delete
              </Button>
            </DialogActions>
          </Dialog>

          {/* Notes Dialog */}
          <Dialog open={notesDialog} onClose={() => setNotesDialog(false)} maxWidth="sm" fullWidth>
            <DialogTitle>Trip Notes</DialogTitle>
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
                placeholder="Add trip notes, instructions, or important details..."
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setNotesDialog(false)}>Cancel</Button>
              <Button onClick={handleSaveNotes} variant="contained">
                Save Notes
              </Button>
            </DialogActions>
          </Dialog>

          {/* Edit Freight Amount Dialog */}
          <Dialog open={freightDialog} onClose={() => setFreightDialog(false)}>
            <DialogTitle>Edit Freight Amount</DialogTitle>
            <DialogContent>
              <TextField
                autoFocus
                margin="dense"
                label="Freight Amount"
                type="number"
                fullWidth
                value={freightAmount}
                onChange={(e) => setFreightAmount(e.target.value)}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setFreightDialog(false)}>Cancel</Button>
              <Button onClick={handleUpdateFreight} variant="contained">
                Update
              </Button>
            </DialogActions>
          </Dialog>

          {/* Add Charges Dialog */}
          <Dialog open={chargesDialog} onClose={() => setChargesDialog(false)}>
            <DialogTitle>Add Charges</DialogTitle>
            <DialogContent>
              <TextField
                autoFocus
                margin="dense"
                label="Charges Amount"
                type="number"
                fullWidth
                value={chargesAmount}
                onChange={(e) => setChargesAmount(e.target.value)}
                helperText="Additional charges to be added to freight amount"
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setChargesDialog(false)}>Cancel</Button>
              <Button onClick={() => {
                setChargesDialog(false);
                setSuccess('Charges feature coming soon!');
              }} variant="contained">
                Add
              </Button>
            </DialogActions>
          </Dialog>

          {/* Add Load Dialog */}
          <Dialog open={loadDialog} onClose={() => setLoadDialog(false)}>
            <DialogTitle>Add Load</DialogTitle>
            <DialogContent>
              <Alert severity="info" sx={{ mt: 1 }}>
                Add Load functionality allows you to add multiple shipments to a single trip. This feature is coming soon!
              </Alert>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setLoadDialog(false)} variant="contained">
                OK
              </Button>
            </DialogActions>
          </Dialog>

          {/* Create LR Dialog */}
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

          {/* Add POD Dialog */}
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

          {/* Invoice PDF Dialog */}
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
              <Typography variant="h6">Freight Invoice - {trip?.trip_number}</Typography>
              <Button
                variant="contained"
                onClick={() => {
                  if (invoiceRef.current) {
                    const printWindow = window.open('', '_blank');
                    if (printWindow) {
                      printWindow.document.write(`
                        <html>
                          <head>
                            <title>Invoice - ${trip?.trip_number}</title>
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
              {trip && (
                <InvoicePDF 
                  ref={invoiceRef}
                  data={{
                    trip_number: trip.trip_number,
                    party_name: trip.party_name,
                    truck_number: trip.truck_number,
                    driver_name: trip.driver_name,
                    from_location: trip.from_location,
                    to_location: trip.to_location,
                    start_date: trip.start_date,
                    end_date: trip.end_date,
                    material_description: trip.material_description,
                    weight_tons: trip.weight_tons,
                    lr_number: trip.lr_number,
                    freight_amount: trip.freight_amount,
                    advance_amount: trip.advance_amount,
                    balance_amount: trip.balance_amount,
                    billing_type: trip.billing_type,
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
