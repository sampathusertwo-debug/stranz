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
} from '@mui/material';
import Layout from '@/components/Layout';

export default function PartyRevenueReportPage() {
  const [partyRevenue, setPartyRevenue] = useState<any[]>([]);

  useEffect(() => {
    fetchPartyRevenue();
  }, []);

  const fetchPartyRevenue = async () => {
    try {
      const [tripsRes, partiesRes] = await Promise.all([
        fetch('/api/trips'),
        fetch('/api/parties'),
      ]);

      const trips = await tripsRes.json();
      const parties = await partiesRes.json();

      const tripsArray = Array.isArray(trips) ? trips : [];
      const partiesArray = Array.isArray(parties) ? parties : [];

      // Calculate revenue per party
      const revenueByParty = partiesArray.map((party: any) => {
        const partyTrips = tripsArray.filter((t: any) => t.party_id === party.id);
        const revenue = partyTrips.reduce((sum: number, t: any) => sum + (t.freight_amount || 0), 0);
        return {
          party_name: party.name,
          tripCount: partyTrips.length,
          revenue,
        };
      });

      setPartyRevenue(revenueByParty.sort((a, b) => b.revenue - a.revenue));
    } catch (err) {
      console.error('Failed to fetch party revenue:', err);
    }
  };

  return (
    <Layout>
      <Container maxWidth="lg">
        <Box sx={{ my: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#0D3B66', mb: 1 }}>
            Party Revenue Report
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            Monitor revenue generated from each party
          </Typography>

          <Paper elevation={3}>
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: '#FAFAFA' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Party Name</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="right">Total Trips</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="right">Total Revenue</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {partyRevenue.map((party, index) => (
                    <TableRow key={index} hover>
                      <TableCell>{party.party_name}</TableCell>
                      <TableCell align="right">{party.tripCount}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600, color: '#EA7847' }}>
                        ₹{party.revenue.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                  {partyRevenue.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                        No data available
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
