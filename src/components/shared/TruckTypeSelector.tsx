import React from 'react';
import { Grid, Box, Typography } from '@mui/material';

export const TRUCK_TYPES = [
  { id: 'mini-truck', label: 'Mini Truck / LCV', icon: '/images/trucks/lcv.png' },
  { id: 'open-body', label: 'Open Body Truck', icon: '/images/trucks/open_truck.png' },
  { id: 'closed-container', label: 'Closed Container', icon: '/images/trucks/closed_truck.png' },
  { id: 'trailer', label: 'Trailer', icon: '/images/trucks/trailer.png' },
  { id: 'tanker', label: 'Tanker', icon: '/images/trucks/tanker.png' },
  { id: 'tipper', label: 'Tipper', icon: '/images/trucks/tipper.png' },
  { id: 'other', label: 'Other', icon: '/images/trucks/bus.png' },
];

interface TruckTypeSelectorProps {
  value: string;
  onChange: (type: string) => void;
}

export default function TruckTypeSelector({ value, onChange }: TruckTypeSelectorProps) {
  return (
    <Box>
      <Typography variant="body2" sx={{ mb: 2, fontWeight: 600, color: '#2B2D42' }}>
        Truck Type
      </Typography>
      <Grid container spacing={2} justifyContent="center">
        {TRUCK_TYPES.map((type) => (
          <Grid item xs={3} key={type.id}>
            <Box
              onClick={() => onChange(type.label)}
              sx={{
                cursor: 'pointer',
                textAlign: 'center',
                p: 2,
                borderRadius: 2,
                border: '2px solid',
                borderColor: value === type.label ? '#6930CA' : '#E6E9EE',
                bgcolor: value === type.label ? '#F3EEFF' : '#FFFFFF',
                transition: 'all 0.2s',
                '&:hover': {
                  borderColor: '#6930CA',
                  bgcolor: '#F3EEFF',
                },
              }}
            >
              <Box
                sx={{
                  width: 60,
                  height: 60,
                  mx: 'auto',
                  mb: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundImage: `url(${type.icon})`,
                  backgroundSize: 'contain',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center',
                }}
              />
              <Typography
                variant="caption"
                sx={{
                  display: 'block',
                  color: value === type.label ? '#6930CA' : '#6B6C7B',
                  fontWeight: value === type.label ? 600 : 400,
                  fontSize: '0.7rem',
                }}
              >
                {type.label}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
