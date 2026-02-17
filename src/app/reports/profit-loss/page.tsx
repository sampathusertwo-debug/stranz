'use client';

import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
} from '@mui/material';
import { TrendingUp, TrendingDown } from '@mui/icons-material';
import Layout from '@/components/Layout';

export default function ProfitLossReportPage() {
  const [report, setReport] = useState({
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
  });

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      const [tripsRes, expensesRes] = await Promise.all([
        fetch('/api/trips'),
        fetch('/api/expenses'),
      ]);

      const trips = await tripsRes.json();
      const expenses = await expensesRes.json();

      const tripsArray = Array.isArray(trips) ? trips : [];
      const expensesArray = Array.isArray(expenses) ? expenses : [];

      const totalRevenue = tripsArray.reduce((sum: number, t: any) => 
        sum + (t.freight_amount || 0), 0
      );

      const totalExpenses = expensesArray.reduce((sum: number, e: any) => 
        sum + (e.amount || 0), 0
      );

      setReport({
        totalRevenue,
        totalExpenses,
        netProfit: totalRevenue - totalExpenses,
      });
    } catch (err) {
      console.error('Failed to fetch report data:', err);
    }
  };

  return (
    <Layout>
      <Container maxWidth="lg">
        <Box sx={{ my: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#0D3B66', mb: 1 }}>
            Profit & Loss Report
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            Comprehensive financial analysis of your business
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
                <CardContent>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                    Total Revenue
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    ₹{report.totalRevenue.toLocaleString()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
                <CardContent>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                    Total Expenses
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    ₹{report.totalExpenses.toLocaleString()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card sx={{ background: report.netProfit >= 0 ? 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' : 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)', color: '#2B2D42' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        Net Profit/Loss
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        ₹{report.netProfit.toLocaleString()}
                      </Typography>
                    </Box>
                    {report.netProfit >= 0 ? (
                      <TrendingUp sx={{ fontSize: 40 }} />
                    ) : (
                      <TrendingDown sx={{ fontSize: 40 }} />
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Paper sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Detailed Analysis
            </Typography>
            <Typography variant="body2" color="text.secondary">
              More detailed profit and loss analysis will be displayed here.
            </Typography>
          </Paper>
        </Box>
      </Container>
    </Layout>
  );
}
