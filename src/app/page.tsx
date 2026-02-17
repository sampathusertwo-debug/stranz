'use client';

import { Container, Typography, Button, Box, Paper } from '@mui/material';
import Link from 'next/link';
import Layout from '@/components/Layout';

export default function Home() {
  return (
    <Layout>
      <Container maxWidth="lg">
        <Box sx={{ my: 4 }}>
          <Paper
            elevation={3}
            sx={{
              p: 4,
              textAlign: 'center',
              background: 'linear-gradient(135deg, #6930CA 0%, #8B5CE6 100%)',
              color: 'white',
            }}
          >
            <Typography variant="h2" component="h1" gutterBottom>
              Welcome to TransportBook
            </Typography>
            <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 4 }}>
              India's No. 1 Transport Udhar Khata App
            </Typography>
            <Typography variant="body1" sx={{ mb: 4 }}>
              Manage your transport business efficiently with our comprehensive solution.
              Track drivers, trucks, invoices, expenses, and more!
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                component={Link}
                href="/drivers"
                variant="contained"
                size="large"
                sx={{
                  bgcolor: 'white',
                  color: 'primary.main',
                  '&:hover': { bgcolor: 'grey.100' },
                }}
              >
                Manage Drivers
              </Button>
              <Button
                component={Link}
                href="/trucks"
                variant="contained"
                size="large"
                sx={{
                  bgcolor: 'white',
                  color: 'primary.main',
                  '&:hover': { bgcolor: 'grey.100' },
                }}
              >
                Manage Trucks
              </Button>
              <Button
                component={Link}
                href="/invoices"
                variant="contained"
                size="large"
                sx={{
                  bgcolor: 'white',
                  color: 'primary.main',
                  '&:hover': { bgcolor: 'grey.100' },
                }}
              >
                View Invoices
              </Button>
            </Box>
          </Paper>

          <Box sx={{ mt: 6, display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3 }}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom color="primary">
                Track Everything
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Keep complete records of drivers, trucks, parties, and all transactions
              </Typography>
            </Paper>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom color="primary">
                Manage Finances
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Track invoices, expenses, tips, and outstanding balances easily
              </Typography>
            </Paper>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom color="primary">
                Stay Organized
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Efficient management system designed specifically for transport businesses
              </Typography>
            </Paper>
          </Box>
        </Box>
      </Container>
    </Layout>
  );
}
