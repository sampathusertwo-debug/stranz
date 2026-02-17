'use client';

import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Button,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  List,
  ListItem,
  ListItemText,
  Divider,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  FormControl,
} from '@mui/material';
import {
  TrendingUp,
  LocalShipping,
  People,
  AccountBalance,
  Receipt,
  DirectionsCar,
  Assessment,
  ShowChart,
  AttachMoney,
  Description,
  ArrowForward,
  Add,
  Close,
  GetApp,
  PictureAsPdf,
} from '@mui/icons-material';
import Layout from '@/components/Layout';
import { useRouter } from 'next/navigation';

interface DashboardStats {
  totalBookings: number;
  activeTrips: number;
  totalRevenue: number;
  pendingBalance: number;
  trucksCount: number;
  driversCount: number;
  partiesCount: number;
  expensesTotal: number;
}

interface RecentActivity {
  id: number;
  type: string;
  description: string;
  amount?: number;
  date: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalBookings: 0,
    activeTrips: 0,
    totalRevenue: 0,
    pendingBalance: 0,
    trucksCount: 0,
    driversCount: 0,
    partiesCount: 0,
    expensesTotal: 0,
  });
  const [recentTrips, setRecentTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Dialog states
  const [profitLossOpen, setProfitLossOpen] = useState(false);
  const [truckRevenueOpen, setTruckRevenueOpen] = useState(false);
  const [partyRevenueOpen, setPartyRevenueOpen] = useState(false);
  const [partyBalanceOpen, setPartyBalanceOpen] = useState(false);
  const [transactionsOpen, setTransactionsOpen] = useState(false);
  
  // Report data states
  const [selectedMonth, setSelectedMonth] = useState('current');
  const [allTrips, setAllTrips] = useState<any[]>([]);
  const [allTrucks, setAllTrucks] = useState<any[]>([]);
  const [allParties, setAllParties] = useState<any[]>([]);
  const [allExpenses, setAllExpenses] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch all data in parallel
      const [tripsRes, partiesRes, trucksRes, driversRes, expensesRes] = await Promise.all([
        fetch('/api/trips'),
        fetch('/api/parties'),
        fetch('/api/trucks'),
        fetch('/api/drivers'),
        fetch('/api/expenses'),
      ]);

      const trips = await tripsRes.json();
      const parties = await partiesRes.json();
      const trucks = await trucksRes.json();
      const drivers = await driversRes.json();
      const expenses = await expensesRes.json();

      const tripsArray = Array.isArray(trips) ? trips : [];
      const partiesArray = Array.isArray(parties) ? parties : [];
      const trucksArray = Array.isArray(trucks) ? trucks : [];
      const driversArray = Array.isArray(drivers) ? drivers : [];
      const expensesArray = Array.isArray(expenses) ? expenses : [];
      
      // Store all data for reports
      setAllTrips(tripsArray);
      setAllTrucks(trucksArray);
      setAllParties(partiesArray);
      setAllExpenses(expensesArray);

      const activeTrips = tripsArray.filter((t: any) => 
        t.status !== 'completed' && t.status !== 'settled'
      ).length;

      const totalRevenue = tripsArray.reduce((sum: number, t: any) => 
        sum + (t.freight_amount || 0), 0
      );

      const pendingBalance = partiesArray.reduce((sum: number, p: any) => 
        sum + (p.balance || 0), 0
      );

      const expensesTotal = expensesArray.reduce((sum: number, e: any) => 
        sum + (e.amount || 0), 0
      );

      setStats({
        totalBookings: tripsArray.length,
        activeTrips,
        totalRevenue,
        pendingBalance,
        trucksCount: trucksArray.length,
        driversCount: driversArray.length,
        partiesCount: partiesArray.length,
        expensesTotal,
      });

      // Get 5 most recent trips
      setRecentTrips(tripsArray.slice(0, 5));
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      setLoading(false);
    }
  };

  const reports = [
    {
      title: 'Profit & Loss Report',
      description: 'View detailed profit and loss analysis',
      icon: <TrendingUp sx={{ fontSize: 40 }} />,
      color: '#4CAF50',
      action: () => setProfitLossOpen(true),
    },
    {
      title: 'Truck Revenue Report',
      description: 'Track income by each truck',
      icon: <LocalShipping sx={{ fontSize: 40 }} />,
      color: '#2196F3',
      action: () => setTruckRevenueOpen(true),
    },
    {
      title: 'Party Revenue Report',
      description: 'Monitor revenue from each party',
      icon: <People sx={{ fontSize: 40 }} />,
      color: '#FF9800',
      action: () => setPartyRevenueOpen(true),
    },
    {
      title: 'Supplier Balance Report',
      description: 'Track balances with suppliers',
      icon: <AccountBalance sx={{ fontSize: 40 }} />,
      color: '#9C27B0',
      action: () => router.push('/reports/supplier-balance'),
    },
    {
      title: 'Party Balance Report',
      description: 'View outstanding party balances',
      icon: <Receipt sx={{ fontSize: 40 }} />,
      color: '#F44336',
      action: () => setPartyBalanceOpen(true),
    },
    {
      title: 'Transaction Report',
      description: 'Complete transaction history',
      icon: <Description sx={{ fontSize: 40 }} />,
      color: '#00BCD4',
      action: () => setTransactionsOpen(true),
    },
  ];

  const getActiveTripsCount = (partyId: number) => {
    return 0;
  };

  return (
    <Layout>
      <Container maxWidth="xl">
        <Box sx={{ my: 4 }}>
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#0D3B66', mb: 1 }}>
              Dashboard
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Overview of your transport business
            </Typography>
          </Box>

          {/* Key Metrics */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                height: '100%'
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                        Total Bookings
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        {stats.totalBookings}
                      </Typography>
                    </Box>
                    <LocalShipping sx={{ fontSize: 40, opacity: 0.8 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                color: 'white',
                height: '100%'
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                        Active Trips
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        {stats.activeTrips}
                      </Typography>
                    </Box>
                    <DirectionsCar sx={{ fontSize: 40, opacity: 0.8 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                color: 'white',
                height: '100%'
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                        Total Revenue
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        ₹{(stats.totalRevenue / 1000).toFixed(0)}K
                      </Typography>
                    </Box>
                    <ShowChart sx={{ fontSize: 40, opacity: 0.8 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                color: 'white',
                height: '100%'
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                        Pending Balance
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        ₹{(stats.pendingBalance / 1000).toFixed(0)}K
                      </Typography>
                    </Box>
                    <AttachMoney sx={{ fontSize: 40, opacity: 0.8 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Secondary Stats */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: '#EA7847', width: 56, height: 56 }}>
                      <LocalShipping />
                    </Avatar>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Total Trucks
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 600 }}>
                        {stats.trucksCount}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: '#0D3B66', width: 56, height: 56 }}>
                      <DirectionsCar />
                    </Avatar>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Total Drivers
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 600 }}>
                        {stats.driversCount}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: '#4CAF50', width: 56, height: 56 }}>
                      <People />
                    </Avatar>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Total Parties
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 600 }}>
                        {stats.partiesCount}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: '#F44336', width: 56, height: 56 }}>
                      <Receipt />
                    </Avatar>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Total Expenses
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 600 }}>
                        ₹{(stats.expensesTotal / 1000).toFixed(0)}K
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Reports Section */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 3, color: '#0D3B66' }}>
              Reports & Analytics
            </Typography>
            <Grid container spacing={3}>
              {reports.map((report, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card 
                    sx={{ 
                      height: '100%',
                      transition: 'all 0.3s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 4,
                      }
                    }}
                  >
                    <CardActionArea 
                      onClick={report.action}
                      sx={{ height: '100%', p: 2 }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                        <Avatar 
                          sx={{ 
                            bgcolor: `${report.color}15`,
                            color: report.color,
                            width: 56,
                            height: 56
                          }}
                        >
                          {report.icon}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                            {report.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {report.description}
                          </Typography>
                        </Box>
                        <ArrowForward sx={{ color: 'text.secondary' }} />
                      </Box>
                    </CardActionArea>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Recent Activity */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Recent Bookings
                </Typography>
                <List>
                  {recentTrips.length > 0 ? (
                    recentTrips.map((trip, index) => (
                      <React.Fragment key={trip.id}>
                        <ListItem 
                          sx={{ 
                            cursor: 'pointer',
                            '&:hover': { bgcolor: '#f5f5f5' },
                            borderRadius: 1
                          }}
                          onClick={() => router.push(`/trips/${trip.id}`)}
                        >
                          <ListItemText
                            primary={
                              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                {trip.party_name} - {trip.truck_number}
                              </Typography>
                            }
                            secondary={
                              <Typography variant="body2" color="text.secondary">
                                {trip.from_location} → {trip.to_location}
                              </Typography>
                            }
                          />
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#EA7847' }}>
                            ₹{trip.freight_amount?.toLocaleString()}
                          </Typography>
                        </ListItem>
                        {index < recentTrips.length - 1 && <Divider />}
                      </React.Fragment>
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 3 }}>
                      No recent bookings
                    </Typography>
                  )}
                </List>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Quick Actions
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<Add />}
                      onClick={() => router.push('/trips/new')}
                      sx={{ 
                        bgcolor: '#EA7847',
                        '&:hover': { bgcolor: '#D96432' },
                        textTransform: 'none',
                        py: 1.5
                      }}
                    >
                      Create New Booking
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={() => router.push('/trucks')}
                      sx={{ textTransform: 'none', py: 1.5 }}
                    >
                      Manage Trucks
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={() => router.push('/drivers')}
                      sx={{ textTransform: 'none', py: 1.5 }}
                    >
                      Manage Drivers
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={() => router.push('/expenses')}
                      sx={{ textTransform: 'none', py: 1.5 }}
                    >
                      Add Expense
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={() => router.push('/invoices')}
                      sx={{ textTransform: 'none', py: 1.5 }}
                    >
                      Create Invoice
                    </Button>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Container>

      {/* Profit & Loss Report Dialog */}
      <Dialog open={profitLossOpen} onClose={() => setProfitLossOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Profit and Loss Report
          </Typography>
          <IconButton onClick={() => setProfitLossOpen(false)}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <Select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
                <MenuItem value="current">Current Month</MenuItem>
                <MenuItem value="last">Last Month</MenuItem>
                <MenuItem value="all">All Time</MenuItem>
              </Select>
            </FormControl>
          </Box>
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Card sx={{ bgcolor: '#E3F2FD' }}>
                <CardContent>
                  <Typography variant="body2" color="text.secondary">Overall Profit</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    ₹{(stats.totalRevenue - stats.expensesTotal).toLocaleString()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ bgcolor: '#E8F5E9' }}>
                <CardContent>
                  <Typography variant="body2" color="text.secondary">Overall Revenue</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    ₹{stats.totalRevenue.toLocaleString()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ bgcolor: '#FFF3E0' }}>
                <CardContent>
                  <Typography variant="body2" color="text.secondary">Overall Cost</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    ₹{stats.expensesTotal.toLocaleString()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="body2" color="text.secondary">Number of Trips</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {stats.totalBookings}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button variant="outlined" onClick={() => setProfitLossOpen(false)}>
            Close
          </Button>
          <Button variant="contained" startIcon={<PictureAsPdf />} sx={{ bgcolor: '#EA7847' }}>
            View PDF
          </Button>
        </DialogActions>
      </Dialog>

      {/* Truck Revenue Report Dialog */}
      <Dialog open={truckRevenueOpen} onClose={() => setTruckRevenueOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Truck Revenue Report
          </Typography>
          <IconButton onClick={() => setTruckRevenueOpen(false)}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <Select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
                <MenuItem value="current">Current Month</MenuItem>
                <MenuItem value="last">Last Month</MenuItem>
                <MenuItem value="all">All Time</MenuItem>
              </Select>
            </FormControl>
          </Box>
          
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={4}>
              <Card>
                <CardContent>
                  <Typography variant="body2" color="text.secondary">Total Revenue</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    ₹{stats.totalRevenue.toLocaleString()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={4}>
              <Card>
                <CardContent>
                  <Typography variant="body2" color="text.secondary">Total Expenses</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    ₹{stats.expensesTotal.toLocaleString()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={4}>
              <Card>
                <CardContent>
                  <Typography variant="body2" color="text.secondary">Total Profit</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#4CAF50' }}>
                    ₹{(stats.totalRevenue - stats.expensesTotal).toLocaleString()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
            My Trucks
          </Typography>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead sx={{ bgcolor: '#FAFAFA' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Truck No</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Revenue</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Expenses</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Profit</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {allTrucks.filter(t => t.ownership_type === 'MY').map((truck) => {
                  const truckTrips = allTrips.filter(t => t.truck_id === truck.id);
                  const revenue = truckTrips.reduce((sum, t) => sum + (t.freight_amount || 0), 0);
                  return (
                    <TableRow key={truck.id}>
                      <TableCell>{truck.truck_number}</TableCell>
                      <TableCell align="right">₹{revenue.toLocaleString()}</TableCell>
                      <TableCell align="right">0</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>₹{revenue.toLocaleString()}</TableCell>
                    </TableRow>
                  );
                })}
                {allTrucks.filter(t => t.ownership_type === 'MY').length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 3 }}>No trucks found</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button variant="outlined" onClick={() => setTruckRevenueOpen(false)}>
            Close
          </Button>
          <Button variant="contained" startIcon={<GetApp />} sx={{ bgcolor: '#EA7847' }}>
            Download Excel
          </Button>
        </DialogActions>
      </Dialog>

      {/* Party Revenue Report Dialog */}
      <Dialog open={partyRevenueOpen} onClose={() => setPartyRevenueOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Party Revenue Report
          </Typography>
          <IconButton onClick={() => setPartyRevenueOpen(false)}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <Select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
                <MenuItem value="current">Current Month</MenuItem>
                <MenuItem value="last">Last Month</MenuItem>
                <MenuItem value="all">All Time</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead sx={{ bgcolor: '#FAFAFA' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Party Name</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Trips</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Month's Income</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {allParties.map((party) => {
                  const partyTrips = allTrips.filter(t => t.party_id === party.id);
                  const revenue = partyTrips.reduce((sum, t) => sum + (t.freight_amount || 0), 0);
                  return (
                    <TableRow key={party.id}>
                      <TableCell>{party.name}</TableCell>
                      <TableCell align="right">{partyTrips.length}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>₹{revenue.toLocaleString()}</TableCell>
                    </TableRow>
                  );
                })}
                <TableRow sx={{ bgcolor: '#F5F5F5' }}>
                  <TableCell sx={{ fontWeight: 700 }}>Total</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>{allTrips.length}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>₹{stats.totalRevenue.toLocaleString()}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button variant="outlined" onClick={() => setPartyRevenueOpen(false)}>
            Close
          </Button>
          <Button variant="contained" startIcon={<GetApp />} sx={{ bgcolor: '#EA7847' }}>
            Download Excel
          </Button>
        </DialogActions>
      </Dialog>

      {/* Party Balance Report Dialog */}
      <Dialog open={partyBalanceOpen} onClose={() => setPartyBalanceOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Party Balance Report
          </Typography>
          <IconButton onClick={() => setPartyBalanceOpen(false)}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead sx={{ bgcolor: '#FAFAFA' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Party Name</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Phone</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Balance</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {allParties.map((party) => (
                  <TableRow key={party.id}>
                    <TableCell>{party.name}</TableCell>
                    <TableCell>{party.phone || '-'}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, color: party.balance > 0 ? '#4CAF50' : '#F44336' }}>
                      ₹{(party.balance || 0).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button variant="outlined" onClick={() => setPartyBalanceOpen(false)}>
            Close
          </Button>
          <Button variant="contained" startIcon={<GetApp />} sx={{ bgcolor: '#EA7847' }}>
            Download Excel
          </Button>
        </DialogActions>
      </Dialog>

      {/* Transaction Report Dialog */}
      <Dialog open={transactionsOpen} onClose={() => setTransactionsOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Transaction Report
          </Typography>
          <IconButton onClick={() => setTransactionsOpen(false)}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <Select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
                <MenuItem value="current">Current Month</MenuItem>
                <MenuItem value="last">Last Month</MenuItem>
                <MenuItem value="all">All Time</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead sx={{ bgcolor: '#FAFAFA' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Party</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Truck</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Route</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Amount</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {allTrips.slice(0, 50).map((trip) => (
                  <TableRow key={trip.id}>
                    <TableCell>
                      {new Date(trip.start_date).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </TableCell>
                    <TableCell>{trip.party_name}</TableCell>
                    <TableCell>{trip.truck_number}</TableCell>
                    <TableCell>{trip.from_location} → {trip.to_location}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      ₹{(trip.freight_amount || 0).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button variant="outlined" onClick={() => setTransactionsOpen(false)}>
            Close
          </Button>
          <Button variant="contained" startIcon={<GetApp />} sx={{ bgcolor: '#EA7847' }}>
            Download Excel
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
}
