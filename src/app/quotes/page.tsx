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
  IconButton,
  Chip,
} from '@mui/material';
import { Add, Edit, Delete, Visibility, ArrowForward } from '@mui/icons-material';
import Layout from '@/components/Layout';
import SearchToolbar from '@/components/shared/SearchToolbar';
import { useRouter } from 'next/navigation';

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
  material_description: string;
}

export default function QuotesPage() {
  const router = useRouter();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchQuotes();
  }, []);

  const fetchQuotes = async () => {
    try {
      const response = await fetch('/api/quotes');
      const data = await response.json();
      
      // Ensure data is an array
      if (Array.isArray(data)) {
        setQuotes(data);
      } else {
        console.error('Expected array but got:', data);
        setQuotes([]);
        setError(data.error || 'Failed to fetch quotes');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setQuotes([]);
      setError('Failed to fetch quotes');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this quote?')) return;
    
    try {
      const response = await fetch(`/api/quotes/${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        fetchQuotes();
      }
    } catch (err) {
      setError('Failed to delete quote');
    }
  };

  const getFilteredQuotes = () => {
    if (!Array.isArray(quotes)) {
      return [];
    }
    return quotes.filter(quote =>
      quote.party_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quote.quote_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quote.from_location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quote.to_location?.toLowerCase().includes(searchQuery.toLowerCase())
    );
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

  return (
    <Layout>
      <Container maxWidth="xl">
        <Box sx={{ my: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
              Quotes
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => router.push('/quotes/new')}
              sx={{ 
                bgcolor: '#6930CA',
                '&:hover': {
                  bgcolor: '#5a28b0'
                }
              }}
            >
              New Quote
            </Button>
          </Box>

          <SearchToolbar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search quotes..."
          />

          <TableContainer component={Paper} sx={{ mt: 3 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Quote Date</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Quote Number</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Party</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Vehicle Type</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Route</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Valid Until</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Amount</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {getFilteredQuotes().map((quote) => (
                  <TableRow 
                    key={quote.id} 
                    hover 
                    sx={{ cursor: 'pointer' }}
                    onClick={() => router.push(`/quotes/${quote.id}`)}
                  >
                    <TableCell>
                      {new Date(quote.quote_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 500 }}>{quote.quote_number}</TableCell>
                    <TableCell>{quote.party_name}</TableCell>
                    <TableCell>{quote.vehicle_type_name || '----'}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Typography sx={{ fontSize: '14px' }}>{quote.from_location}</Typography>
                        <ArrowForward sx={{ fontSize: 16, color: '#6B6C7B' }} />
                        <Typography sx={{ fontSize: '14px' }}>{quote.to_location}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {new Date(quote.valid_until).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 500 }}>
                      ₹ {quote.freight_amount?.toLocaleString() || 0}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={quote.status} 
                        color={getStatusColor(quote.status)} 
                        size="small"
                        sx={{ textTransform: 'capitalize' }}
                      />
                    </TableCell>
                    <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                      <IconButton onClick={() => router.push(`/quotes/${quote.id}`)} color="info" size="small">
                        <Visibility />
                      </IconButton>
                      <IconButton onClick={() => router.push(`/quotes/new?edit=${quote.id}`)} color="primary" size="small">
                        <Edit />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(quote.id)} color="error" size="small">
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {getFilteredQuotes().length === 0 && (
            <Box sx={{ textAlign: 'center', mt: 4, py: 8 }}>
              <Typography variant="h6" color="text.secondary">
                No quotes found
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => router.push('/quotes/new')}
                sx={{ mt: 2, bgcolor: '#6930CA' }}
              >
                Create Your First Quote
              </Button>
            </Box>
          )}
        </Box>
      </Container>
    </Layout>
  );
}
