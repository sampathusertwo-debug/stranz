'use client';

import { Box, Typography, Paper, Divider, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { forwardRef } from 'react';

interface InvoiceData {
  trip_number: string;
  party_name: string;
  party_address?: string;
  party_phone?: string;
  truck_number: string;
  driver_name: string;
  from_location: string;
  to_location: string;
  start_date: string;
  material_description: string;
  weight_tons: number;
  lr_number: string;
  total_amount: number;
  billing_type: string;
}

interface InvoicePDFProps {
  data: InvoiceData;
}

const InvoicePDF = forwardRef<HTMLDivElement, InvoicePDFProps>(({ data }, ref) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Box
      ref={ref}
      sx={{
        width: '210mm',
        minHeight: '297mm',
        padding: '20mm',
        margin: '0 auto',
        backgroundColor: '#fff',
        boxShadow: '0 0 10px rgba(0,0,0,0.1)',
        '@media print': {
          boxShadow: 'none',
          margin: 0,
        }
      }}
    >
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#EA7847', mb: 1 }}>
          TRANSPORT BOOK
        </Typography>
        <Typography variant="h6" sx={{ fontWeight: 600, color: '#0D3B66', mb: 1 }}>
          FREIGHT INVOICE
        </Typography>
        <Divider sx={{ borderColor: '#EA7847', borderWidth: 2 }} />
      </Box>

      {/* Invoice Info */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={6}>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#666', mb: 1 }}>
              Invoice No:
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#0D3B66' }}>
              {data.trip_number}
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={6} sx={{ textAlign: 'right' }}>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#666', mb: 1 }}>
              Date:
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              {formatDate(data.start_date)}
            </Typography>
          </Box>
        </Grid>
      </Grid>

      {/* Party Details */}
      <Paper sx={{ p: 2, mb: 3, backgroundColor: '#f5f5f5' }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0D3B66', mb: 2 }}>
          Bill To:
        </Typography>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
          {data.party_name}
        </Typography>
        {data.party_address && (
          <Typography variant="body2" color="text.secondary">
            {data.party_address}
          </Typography>
        )}
        {data.party_phone && (
          <Typography variant="body2" color="text.secondary">
            Phone: {data.party_phone}
          </Typography>
        )}
      </Paper>

      {/* Trip Details */}
      <TableContainer component={Paper} sx={{ mb: 3 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#0D3B66' }}>
              <TableCell colSpan={2} sx={{ color: '#fff', fontWeight: 600 }}>
                TRIP DETAILS
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, width: '40%' }}>Truck Number</TableCell>
              <TableCell>{data.truck_number}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Driver Name</TableCell>
              <TableCell>{data.driver_name}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>From Location</TableCell>
              <TableCell>{data.from_location}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>To Location</TableCell>
              <TableCell>{data.to_location}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Material</TableCell>
              <TableCell>{data.material_description || '-'}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Weight (Tons)</TableCell>
              <TableCell>{data.weight_tons || '-'}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>LR Number</TableCell>
              <TableCell>{data.lr_number || '-'}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Start Date</TableCell>
              <TableCell>{formatDate(data.start_date)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Billing Type</TableCell>
              <TableCell sx={{ textTransform: 'uppercase' }}>{data.billing_type}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      {/* Charges */}
      <Box sx={{ mt: 4 }}>
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#EA7847' }}>
              Total Amount:
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#EA7847' }}>
              {formatCurrency(data.total_amount)}
            </Typography>
          </Box>
        </Paper>
      </Box>

      {/* Amount in Words */}
      <Box sx={{ mt: 3, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
        <Typography variant="body2" sx={{ fontWeight: 600, color: '#666' }}>
          Total Amount in Words:
        </Typography>
        <Typography variant="body1" sx={{ fontWeight: 600, color: '#0D3B66', mt: 1 }}>
          {/* You can add number-to-words conversion here */}
          Rupees {data.total_amount.toFixed(0)} Only
        </Typography>
      </Box>

      {/* Footer */}
      <Box sx={{ mt: 6, pt: 3, borderTop: '1px solid #ddd' }}>
        <Grid container spacing={3}>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              Terms & Conditions:
            </Typography>
            <Typography variant="caption" color="text.secondary">
              1. Payment to be made within 30 days
            </Typography>
            <br />
            <Typography variant="caption" color="text.secondary">
              2. Interest @18% p.a. on delayed payments
            </Typography>
          </Grid>
          <Grid item xs={6} sx={{ textAlign: 'right' }}>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 4 }}>
              For TRANSPORT BOOK
            </Typography>
            <Divider sx={{ width: '200px', ml: 'auto', mb: 1 }} />
            <Typography variant="caption" color="text.secondary">
              Authorized Signatory
            </Typography>
          </Grid>
        </Grid>
      </Box>

      {/* Print Info */}
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          This is a computer generated invoice
        </Typography>
      </Box>
    </Box>
  );
});

InvoicePDF.displayName = 'InvoicePDF';

export default InvoicePDF;
