'use client';

import React from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
} from '@mui/material';
import Layout from '@/components/Layout';

export default function SupplierBalanceReportPage() {
  return (
    <Layout>
      <Container maxWidth="lg">
        <Box sx={{ my: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#0D3B66', mb: 1 }}>
            Supplier Balance Report
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            Track outstanding balances with suppliers
          </Typography>

          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              Supplier balance reporting will be available soon.
            </Typography>
          </Paper>
        </Box>
      </Container>
    </Layout>
  );
}
