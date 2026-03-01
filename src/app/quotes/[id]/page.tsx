'use client';

import { useState, useEffect } from 'react';
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
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
} from '@mui/material';
import {
  Edit,
  Delete,
  ArrowForward,
  CheckCircle,
  Close,
} from '@mui/icons-material';
import Layout from '@/components/Layout';

interface Quote {
  id: number;
  quote_number: string;
  party_id: number;
  party_name: string;
  vehicle_type_id?: number;
  vehicle_type_name?: string;
  from_location: string;
  to_location: string;
  quote_date: string;
  valid_until: string;
  status: string;
  freight_amount: number;
  billing_type: string;
  material_description: string;
  weight_tons: number;
  notes: string;
}

interface Party {
  id: number;
  name: string;
  balance: number;
}

export default function QuoteDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const quoteId = params.id as string;

  const [quote, setQuote] = useState<Quote | null>(null);
  const [party, setParty] = useState<Party | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [convertDialog, setConvertDialog] = useState(false);

  useEffect(() => {
    if (quoteId) {
      fetchQuoteDetails();
    }
  }, [quoteId]);

  const fetchQuoteDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/quotes/${quoteId}`);
      if (response.ok) {
        const data = await response.json();
        setQuote(data);
        
        if (data.party_id) {
          const partyResponse = await fetch(`/api/parties/${data.party_id}`);
          if (partyResponse.ok) {
            setParty(await partyResponse.json());
          }
        }
      } else {
        setError('Failed to fetch quote details');
      }
    } catch (err) {
      setError('Failed to fetch quote details');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/quotes/${quoteId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSuccess('Quote deleted successfully');
        setTimeout(() => router.push('/quotes'), 1500);
      } else {
        setError('Failed to delete quote');
      }
    } catch (err) {
      setError('Failed to delete quote');
    }
    setDeleteDialog(false);
  };

  const handleConvertToBooking = async () => {
    try {
      // Create a new trip/booking from quote data
      const tripData = {
        trip_number: `TRP${Date.now()}`,
        party_id: quote?.party_id,
        vehicle_type_id: quote?.vehicle_type_id,
        truck_id: null,
        driver_id: null,
        from_location: quote?.from_location,
        to_location: quote?.to_location,
        start_date: new Date().toISOString().split('T')[0],
        status: 'booked',
        freight_amount: quote?.freight_amount,
        advance_amount: 0,
        balance_amount: quote?.freight_amount,
        billing_type: 'fixed',
        material_description: quote?.material_description,
        notes: quote?.notes,
      };

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tripData),
      });

      if (response.ok) {
        const newTrip = await response.json();
        
        // Update quote status to 'accepted'
        await fetch(`/api/quotes/${quoteId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...quote, status: 'accepted' }),
        });
        
        setSuccess('Quote converted to booking successfully');
        setTimeout(() => router.push(`/trips/${newTrip.id}`), 1500);
      } else {
        setError('Failed to convert quote to booking');
      }
    } catch (err) {
      setError('Failed to convert quote to booking');
    }
    setConvertDialog(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'accepted': return 'success';
      case 'rejected': return 'error';
      case 'expired': return 'default';
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

  if (!quote) {
    return (
      <Layout>
        <Container maxWidth="lg">
          <Box sx={{ my: 4 }}>
            <Alert severity="error">Quote not found</Alert>
          </Box>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container maxWidth="lg">
        <Box sx={{ my: 4 }}>
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
            <Typography variant="h4" component="h1">
              Quote Details
            </Typography>
            <Box>
              <Button
                variant="outlined"
                startIcon={<Edit />}
                onClick={() => router.push(`/quotes/new?edit=${quoteId}`)}
                sx={{ mr: 1 }}
              >
                Edit Quote
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<Delete />}
                onClick={() => setDeleteDialog(true)}
              >
                Delete Quote
              </Button>
            </Box>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

          <Grid container spacing={3}>
            {/* Main Content */}
            <Grid item xs={12} md={8}>
              {/* Quote Information */}
              <Paper sx={{ p: 3, mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Quote Information
                  </Typography>
                  <Chip 
                    label={quote.status} 
                    color={getStatusColor(quote.status)}
                    sx={{ textTransform: 'capitalize' }}
                  />
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      Quote Number
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {quote.quote_number}
                    </Typography>
                  </Grid>

                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      Party Name
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#6930CA', fontWeight: 500, cursor: 'pointer' }} 
                      onClick={() => router.push(`/parties/${quote.party_id}`)}>
                      {quote.party_name}
                    </Typography>
                  </Grid>

                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      Quote Date
                    </Typography>
                    <Typography variant="body1">
                      {new Date(quote.quote_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </Typography>
                  </Grid>

                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      Valid Until
                    </Typography>
                    <Typography variant="body1">
                      {new Date(quote.valid_until).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </Typography>
                  </Grid>

                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      Party Balance
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'success.main', fontWeight: 500 }}>
                      ₹ {party?.balance?.toLocaleString() || '0'}
                    </Typography>
                  </Grid>

                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      Vehicle Type
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {quote.vehicle_type_name || '----'}
                    </Typography>
                  </Grid>

                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      Material
                    </Typography>
                    <Typography variant="body1">
                      {quote.material_description || '----'}
                    </Typography>
                  </Grid>
                </Grid>

                <Box sx={{ my: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {quote.from_location}
                    </Typography>
                  </Box>
                  <ArrowForward sx={{ color: 'text.secondary' }} />
                  <Box sx={{ flex: 1, textAlign: 'right' }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {quote.to_location}
                    </Typography>
                  </Box>
                </Box>
              </Paper>

              {/* Billing Details */}
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Billing Details
                </Typography>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="body1">
                    Billing Type
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500, textTransform: 'capitalize' }}>
                    {quote.billing_type.replace('_', ' ')}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="body1">
                    Weight
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {quote.weight_tons ? `${quote.weight_tons} Tonnes` : '----'}
                  </Typography>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Freight Amount
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    ₹ {quote.freight_amount?.toLocaleString() || 0}
                  </Typography>
                </Box>
              </Paper>

              {/* Notes */}
              {quote.notes && (
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Notes
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
                    {quote.notes}
                  </Typography>
                </Paper>
              )}
            </Grid>

            {/* Sidebar */}
            <Grid item xs={12} md={4}>
              {/* Action Card */}
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Actions
                </Typography>
                {quote.status === 'pending' && (
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => setConvertDialog(true)}
                    sx={{ 
                      bgcolor: '#6930CA',
                      mb: 2,
                      '&:hover': {
                        bgcolor: '#5a28b0'
                      }
                    }}
                  >
                    Convert to Booking
                  </Button>
                )}
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => router.push('/quotes')}
                >
                  Back to Quotes
                </Button>
              </Paper>
            </Grid>
          </Grid>

          {/* Delete Confirmation Dialog */}
          <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
            <DialogTitle>Delete Quote</DialogTitle>
            <DialogContent>
              <Typography>
                Are you sure you want to delete this quote? This action cannot be undone.
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDeleteDialog(false)}>Cancel</Button>
              <Button onClick={handleDelete} color="error" variant="contained">
                Delete
              </Button>
            </DialogActions>
          </Dialog>

          {/* Convert to Booking Dialog */}
          <Dialog open={convertDialog} onClose={() => setConvertDialog(false)}>
            <DialogTitle>Convert Quote to Booking</DialogTitle>
            <DialogContent>
              <Typography>
                This will create a new booking from this quote. The quote will be marked as accepted. Continue?
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setConvertDialog(false)}>Cancel</Button>
              <Button onClick={handleConvertToBooking} variant="contained" sx={{ bgcolor: '#6930CA' }}>
                Convert
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Container>
    </Layout>
  );
}
