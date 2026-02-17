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
  MenuItem,
  Select,
  FormControl,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Radio,
  RadioGroup,
  FormControlLabel,
  InputAdornment,
  IconButton,
  Collapse,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import {
  LocalShipping,
  Circle,
  Add,
  Edit,
  Delete,
  Assessment,
  LocalGasStation,
  Receipt,
  Description,
  Build,
  DriveEta,
  CreditCard,
} from '@mui/icons-material';

interface Truck {
  id: number;
  truck_number: string;
  vehicle_type_id: number;
  ownership: 'Own' | 'Market';
  capacity_in_tons?: number;
  driver_id?: number;
  rc_number?: string;
  rc_expiry_date?: string;
  insurance_number?: string;
  insurance_expiry_date?: string;
  fitness_expiry_date?: string;
  permit_expiry_date?: string;
  pollution_expiry_date?: string;
  status_id: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

interface VehicleType {
  id: number;
  name: string;
  icon: string;
}

interface Driver {
  id: number;
  name: string;
  phone: string;
}

interface Status {
  id: number;
  name: string;
  color: string;
}

interface BookCard {
  title: string;
  icon: React.ReactNode;
  color: string;
  onClick: () => void;
}

export default function TruckDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const truckId = params.id as string;

  const [truck, setTruck] = useState<Truck | null>(null);
  const [vehicleType, setVehicleType] = useState<VehicleType | null>(null);
  const [driver, setDriver] = useState<Driver | null>(null);
  const [status, setStatus] = useState<Status | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [showMoreDetails, setShowMoreDetails] = useState(false);
  const [allVehicleTypes, setAllVehicleTypes] = useState<VehicleType[]>([]);
  const [allDrivers, setAllDrivers] = useState<Driver[]>([]);
  const [updateFormData, setUpdateFormData] = useState({
    truck_number: '',
    vehicle_type_id: 0,
    ownership_type: 'MY',
    driver_id: 0,
    capacity_tons: '',
  });

  useEffect(() => {
    fetchTruckDetails();
    fetchVehicleTypes();
    fetchDrivers();
  }, [truckId]);

  const fetchVehicleTypes = async () => {
    try {
      const res = await fetch('/api/vehicle-types');
      const data = await res.json();
      setAllVehicleTypes(data);
    } catch (error) {
      console.error('Error fetching vehicle types:', error);
    }
  };

  const fetchDrivers = async () => {
    try {
      const res = await fetch('/api/drivers');
      const data = await res.json();
      setAllDrivers(data);
    } catch (error) {
      console.error('Error fetching drivers:', error);
    }
  };

  const fetchTruckDetails = async () => {
    try {
      // Fetch truck details
      const truckRes = await fetch(`/api/trucks/${truckId}`);
      const truckData = await truckRes.json();
      setTruck(truckData);
      
      // Set form data for update dialog
      setUpdateFormData({
        truck_number: truckData.truck_number || '',
        vehicle_type_id: truckData.vehicle_type_id || 0,
        ownership_type: truckData.ownership_type || 'MY',
        driver_id: truckData.driver_id || 0,
        capacity_tons: truckData.capacity_tons?.toString() || '',
      });

      // Fetch vehicle type
      const vehicleTypeRes = await fetch('/api/vehicle-types');
      const vehicleTypes = await vehicleTypeRes.json();
      const vType = vehicleTypes.find((vt: VehicleType) => vt.id === truckData.vehicle_type_id);
      setVehicleType(vType);

      // Fetch status
      const statusRes = await fetch('/api/status-types');
      const statuses = await statusRes.json();
      const truckStatus = statuses.find((s: Status) => s.id === truckData.status_id);
      setStatus(truckStatus);

      // Fetch driver if assigned
      if (truckData.driver_id) {
        const driverRes = await fetch(`/api/drivers/${truckData.driver_id}`);
        const driverData = await driverRes.json();
        setDriver(driverData);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching truck details:', error);
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this truck?')) {
      try {
        await fetch(`/api/trucks/${truckId}`, { method: 'DELETE' });
        router.push('/trucks');
      } catch (error) {
        console.error('Error deleting truck:', error);
      }
    }
  };

  const handleAddExpense = () => {
    router.push(`/expenses?truck=${truckId}`);
  };

  const handleAddTrip = () => {
    router.push(`/trips?truck=${truckId}`);
  };

  const handleOpenUpdateDialog = () => {
    setUpdateDialogOpen(true);
  };

  const handleCloseUpdateDialog = () => {
    setUpdateDialogOpen(false);
    setShowMoreDetails(false);
  };

  const handleUpdateTruck = async () => {
    try {
      const response = await fetch(`/api/trucks/${truckId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...updateFormData,
          capacity_tons: parseFloat(updateFormData.capacity_tons) || 0,
        }),
      });
      
      if (response.ok) {
        handleCloseUpdateDialog();
        fetchTruckDetails();
      }
    } catch (error) {
      console.error('Error updating truck:', error);
    }
  };

  const getVehicleTypeIcon = (name: string) => {
    // Return truck icon SVG or Material-UI icon based on vehicle type
    const iconStyle = { fontSize: 40, color: '#6B6C7B' };
    return <LocalShipping sx={iconStyle} />;
  };

  const bookCards: BookCard[] = [
    {
      title: 'Trip Book',
      icon: <LocalShipping sx={{ fontSize: 40, color: '#2196F3' }} />,
      color: '#E3F2FD',
      onClick: () => router.push(`/trips?truck=${truckId}`),
    },
    {
      title: 'Fuel Book',
      icon: <LocalGasStation sx={{ fontSize: 40, color: '#FF9800' }} />,
      color: '#FFF3E0',
      onClick: () => router.push(`/expenses?truck=${truckId}&category=fuel`),
    },
    {
      title: 'EMI Book',
      icon: <Receipt sx={{ fontSize: 40, color: '#F44336' }} />,
      color: '#FFEBEE',
      onClick: () => router.push(`/expenses?truck=${truckId}&category=emi`),
    },
    {
      title: 'Documents',
      icon: <Description sx={{ fontSize: 40, color: '#009688' }} />,
      color: '#E0F2F1',
      onClick: () => {}, // TODO: Implement documents page
    },
    {
      title: 'Maintenance Book',
      icon: <Build sx={{ fontSize: 40, color: '#FF9800' }} />,
      color: '#FFF3E0',
      onClick: () => router.push(`/expenses?truck=${truckId}&category=maintenance`),
    },
    {
      title: 'Driver & Other expenses',
      icon: <DriveEta sx={{ fontSize: 40, color: '#9C27B0' }} />,
      color: '#F3E5F5',
      onClick: () => router.push(`/expenses?truck=${truckId}&category=driver`),
    },
    {
      title: 'Diesel Card',
      icon: <CreditCard sx={{ fontSize: 40, color: '#4CAF50' }} />,
      color: '#E8F5E9',
      onClick: () => {}, // TODO: Implement diesel card page
    },
  ];

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4 }}>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  if (!truck) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4 }}>
        <Typography>Truck not found</Typography>
        <Button onClick={() => router.push('/trucks')} sx={{ mt: 2 }}>
          Back to Trucks
        </Button>
      </Container>
    );
  }

  // Split truck number into parts (e.g., "TN23T3546" -> "TN23T" and "3546")
  const truckNumMatch = truck.truck_number.match(/^([A-Z]+\d+[A-Z]*?)(\d+)$/);
  const truckPrefix = truckNumMatch ? truckNumMatch[1] : truck.truck_number;
  const truckSuffix = truckNumMatch ? truckNumMatch[2] : '';

  return (
    <Box sx={{ bgcolor: '#F5F5F5', minHeight: '100vh', pb: 4 }}>
      {/* Header Section */}
      <Box
        sx={{
          bgcolor: 'white',
          borderBottom: '1px solid #E0E0E0',
          py: 2,
          px: 3,
        }}
      >
        <Container maxWidth="xl">
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#2B2D42' }}>
                {truckPrefix}{' '}
                <span style={{ color: '#4CAF50', fontWeight: 700 }}>{truckSuffix}</span>
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Circle sx={{ fontSize: 10, mr: 0.5, color: '#9E9E9E' }} />
                  <Typography variant="body2" color="text.secondary">
                    {vehicleType?.name || 'Unknown Type'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Circle sx={{ fontSize: 10, mr: 0.5, color: status?.color || '#4CAF50' }} />
                  <Typography variant="body2" color="text.secondary">
                    {status?.name || 'Unknown Status'}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    bgcolor: '#1976D2',
                    color: 'white',
                    px: 2,
                    py: 0.5,
                    borderRadius: 1,
                    fontSize: '0.875rem',
                    fontWeight: 600,
                  }}
                >
                  {truck.ownership}
                </Box>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleAddExpense}
                sx={{
                  bgcolor: '#F44336',
                  '&:hover': { bgcolor: '#D32F2F' },
                  textTransform: 'none',
                  fontWeight: 600,
                }}
              >
                Add Expense
              </Button>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleAddTrip}
                sx={{
                  bgcolor: '#4CAF50',
                  '&:hover': { bgcolor: '#388E3C' },
                  textTransform: 'none',
                  fontWeight: 600,
                }}
              >
                Add Trip
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ mt: 3 }}>
        {/* Driver and Truck Details Section */}
        <Paper
          sx={{
            bgcolor: '#E3F2FD',
            p: 3,
            mb: 3,
            borderRadius: 2,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Typography variant="caption" sx={{ color: '#90A4AE', mb: 0.5 }}>
              Driver Name
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#2B2D42' }}>
              {driver ? driver.name : 'Not Assigned'}
            </Typography>
          </Box>
          <Box sx={{ flex: 1, textAlign: 'center' }}>
            <Typography variant="caption" sx={{ color: '#90A4AE', mb: 0.5 }}>
              Truck Details
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#2B2D42' }}>
              {truck.notes || 'N/A'}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<Edit />}
              onClick={handleOpenUpdateDialog}
              sx={{
                borderColor: '#2196F3',
                color: '#2196F3',
                textTransform: 'none',
                fontWeight: 600,
                '&:hover': { borderColor: '#1976D2', bgcolor: '#E3F2FD' },
              }}
            >
              Edit
            </Button>
            <Button
              variant="outlined"
              startIcon={<Delete />}
              onClick={handleDelete}
              sx={{
                borderColor: '#F44336',
                color: '#F44336',
                textTransform: 'none',
                fontWeight: 600,
                '&:hover': { borderColor: '#D32F2F', bgcolor: '#FFEBEE' },
              }}
            >
              Delete Truck
            </Button>
          </Box>
        </Paper>

        {/* Filters Section */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Box>
              <Typography variant="caption" sx={{ color: '#90A4AE', mb: 0.5, display: 'block' }}>
                Date
              </Typography>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <Select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  sx={{ bgcolor: 'white' }}
                >
                  <MenuItem value="all">All Months</MenuItem>
                  <MenuItem value="current">Current Month</MenuItem>
                  <MenuItem value="last">Last Month</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: '#90A4AE', mb: 0.5, display: 'block' }}>
                Filter
              </Typography>
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <Select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  sx={{ bgcolor: 'white' }}
                >
                  <MenuItem value="all">All Trips & Expenses</MenuItem>
                  <MenuItem value="trips">Trips Only</MenuItem>
                  <MenuItem value="expenses">Expenses Only</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>
          <Button
            variant="contained"
            startIcon={<Assessment />}
            sx={{
              bgcolor: '#1976D2',
              textTransform: 'none',
              fontWeight: 600,
              alignSelf: 'flex-end',
            }}
          >
            Monthly Reports
          </Button>
        </Box>

        {/* Statistics Section */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="caption" sx={{ color: '#90A4AE', textTransform: 'uppercase' }}>
                Trip Revenue
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#2B2D42', mt: 1 }}>
                ₹ 0
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="caption" sx={{ color: '#90A4AE', textTransform: 'uppercase' }}>
                Total Expenses
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#2B2D42', mt: 1 }}>
                ₹ 0
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="caption" sx={{ color: '#90A4AE', textTransform: 'uppercase' }}>
                Total Profit
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#F44336', mt: 1 }}>
                ₹ 0
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Book Cards Section */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {bookCards.map((card, index) => (
            <Grid item xs={12} sm={6} md={3} lg={12 / 7} key={index}>
              <Paper
                sx={{
                  p: 3,
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 3,
                  },
                }}
                onClick={card.onClick}
              >
                <Box
                  sx={{
                    bgcolor: card.color,
                    width: 80,
                    height: 80,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto',
                    mb: 2,
                  }}
                >
                  {card.icon}
                </Box>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#2B2D42' }}>
                  {card.title}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Transactions Table */}
        <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: '#E8EAF6' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, color: '#2B2D42' }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#2B2D42' }}>Reason</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#2B2D42' }}>Expenses</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#2B2D42' }}>Revenue</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#2B2D42' }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                    <Typography variant="body1" color="text.secondary">
                      Sorry, no transactions found
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Container>

      {/* Update Truck Dialog */}
      <Dialog 
        open={updateDialogOpen} 
        onClose={handleCloseUpdateDialog} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle sx={{ fontWeight: 600, fontSize: '20px', pb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Update Truck
          <IconButton onClick={handleCloseUpdateDialog} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {/* Truck Number */}
            <TextField
              label="Truck Registration Number"
              value={updateFormData.truck_number}
              onChange={(e) => setUpdateFormData({ ...updateFormData, truck_number: e.target.value })}
              fullWidth
              variant="outlined"
              size="small"
            />

            {/* Truck Type */}
            <Box>
              <Typography sx={{ fontSize: '12px', color: '#6B6C7B', mb: 1 }}>
                Truck Type
              </Typography>
              <Grid container spacing={1.5}>
                {allVehicleTypes.slice(0, 7).map((vType) => (
                  <Grid item xs={4} sm={3} key={vType.id}>
                    <Box
                      onClick={() => setUpdateFormData({ ...updateFormData, vehicle_type_id: vType.id })}
                      sx={{
                        border: updateFormData.vehicle_type_id === vType.id ? '2px solid #1976D2' : '1px solid #E0E0E0',
                        borderRadius: 2,
                        p: 1.5,
                        textAlign: 'center',
                        cursor: 'pointer',
                        bgcolor: updateFormData.vehicle_type_id === vType.id ? '#E3F2FD' : 'white',
                        transition: 'all 0.2s',
                        '&:hover': {
                          borderColor: '#1976D2',
                          bgcolor: '#F5F5F5',
                        },
                      }}
                    >
                      <Box sx={{ fontSize: '32px', mb: 0.5 }}>
                        {getVehicleTypeIcon(vType.name)}
                      </Box>
                      <Typography 
                        sx={{ 
                          fontSize: '11px', 
                          color: updateFormData.vehicle_type_id === vType.id ? '#1976D2' : '#2B2D42',
                          fontWeight: updateFormData.vehicle_type_id === vType.id ? 600 : 400,
                        }}
                      >
                        {vType.name === 'LCV' ? 'Mini Truck / LCV' : vType.name.replace('Truck', 'Body Truck')}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>

            {/* Add More Details Button */}
            {!showMoreDetails && (
              <Box sx={{ borderTop: '1px dashed #E0E0E0', pt: 2 }}>
                <Button
                  onClick={() => setShowMoreDetails(true)}
                  sx={{
                    color: '#1976d2',
                    textTransform: 'none',
                    fontSize: '14px',
                    fontWeight: 500,
                    p: 0,
                    '&:hover': {
                      bgcolor: 'transparent',
                      textDecoration: 'underline',
                    },
                  }}
                >
                  Add More Details
                </Button>
              </Box>
            )}

            {/* More Details Section */}
            <Collapse in={showMoreDetails}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, borderTop: '1px dashed #E0E0E0', pt: 2 }}>
                {/* Capacity */}
                <TextField
                  placeholder="Capacity"
                  value={updateFormData.capacity_tons}
                  onChange={(e) => setUpdateFormData({ ...updateFormData, capacity_tons: e.target.value })}
                  fullWidth
                  variant="outlined"
                  size="small"
                  type="number"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Typography sx={{ color: '#6B6C7B', fontSize: '14px' }}>Tonne</Typography>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
            </Collapse>

            {/* Ownership */}
            <Box>
              <Typography sx={{ fontSize: '12px', color: '#6B6C7B', mb: 1 }}>
                Ownership
              </Typography>
              <RadioGroup
                row
                value={updateFormData.ownership_type}
                onChange={(e) => setUpdateFormData({ ...updateFormData, ownership_type: e.target.value })}
              >
                <FormControlLabel
                  value="MARKET"
                  control={<Radio size="small" />}
                  label="Market Truck"
                  sx={{ mr: 4 }}
                />
                <FormControlLabel
                  value="MY"
                  control={<Radio size="small" />}
                  label="My Truck"
                />
              </RadioGroup>
            </Box>

            {/* Select Driver */}
            <FormControl fullWidth size="small">
              <Select
                value={updateFormData.driver_id}
                onChange={(e) => setUpdateFormData({ ...updateFormData, driver_id: Number(e.target.value) })}
                displayEmpty
              >
                <MenuItem value={0}>Select a Driver</MenuItem>
                {allDrivers.map((driver) => (
                  <MenuItem key={driver.id} value={driver.id}>
                    {driver.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, pt: 2 }}>
          <Button 
            onClick={handleCloseUpdateDialog} 
            sx={{ 
              color: '#6B6C7B',
              textTransform: 'none',
              px: 3,
              border: '1px solid #E0E0E0',
            }}
          >
            Close
          </Button>
          <Button 
            onClick={handleUpdateTruck} 
            variant="contained" 
            sx={{ 
              bgcolor: '#2B2D42', 
              '&:hover': { bgcolor: '#1a1b28' },
              textTransform: 'none',
              px: 3,
            }}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
