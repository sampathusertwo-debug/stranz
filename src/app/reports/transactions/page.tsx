'use client';

import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import Layout from '@/components/Layout';

export default function TransactionReportPage() {
  const [trips, setTrips] = useState<any[]>([]);

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      const response = await fetch('/api/trips');
      const data = await response.json();
      setTrips(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch trips:', err);
    }
  };

  return (
    <Layout>
      <Container maxWidth="lg">
        <Box sx={{ my: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#0D3B66', mb: 1 }}>
            Transaction Report
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            Complete history of all transactions
          </Typography>

          <Paper elevation={3}>
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: '#FAFAFA' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Party</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Truck</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Route</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="right">Amount</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {trips.map((trip) => (
                    <TableRow key={trip.id} hover>
                      <TableCell>
                        {new Date(trip.start_date).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </TableCell>
                      <TableCell>{trip.party_name}</TableCell>
                      <TableCell>{trip.truck_number}</TableCell>
                      <TableCell>
                        {trip.from_location} → {trip.to_location}
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>
                        ₹{trip.freight_amount?.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={trip.status || 'active'} 
                          size="small"
                          color={trip.status === 'completed' ? 'success' : 'primary'}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                  {trips.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                        No transactions found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>
      </Container>
    </Layout>
  );
}
