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

export default function PartyBalanceReportPage() {
  const [parties, setParties] = useState<any[]>([]);

  useEffect(() => {
    fetchParties();
  }, []);

  const fetchParties = async () => {
    try {
      const response = await fetch('/api/parties');
      const data = await response.json();
      setParties(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch parties:', err);
    }
  };

  return (
    <Layout>
      <Container maxWidth="lg">
        <Box sx={{ my: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#0D3B66', mb: 1 }}>
            Party Balance Report
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            View outstanding balances from all parties
          </Typography>

          <Paper elevation={3}>
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: '#FAFAFA' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Party Name</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Phone</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="right">Balance</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {parties.map((party) => (
                    <TableRow key={party.id} hover>
                      <TableCell>{party.name}</TableCell>
                      <TableCell>{party.phone || '-'}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600, color: party.balance > 0 ? '#4CAF50' : '#F44336' }}>
                        ₹{party.balance?.toLocaleString() || 0}
                      </TableCell>
                    </TableRow>
                  ))}
                  {parties.length === 0 && (
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
