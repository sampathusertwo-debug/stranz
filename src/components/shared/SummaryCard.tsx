import React from 'react';
import { Card, CardContent, Box, Typography } from '@mui/material';
import { InfoOutlined } from '@mui/icons-material';

interface SummaryCardProps {
  title: string;
  value: string | number;
  showInfo?: boolean;
}

export default function SummaryCard({ title, value, showInfo = true }: SummaryCardProps) {
  return (
    <Card elevation={1} sx={{ borderRadius: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography 
              variant="caption" 
              color="text.secondary" 
              sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
            >
              {title}
              {showInfo && <InfoOutlined sx={{ fontSize: 16 }} />}
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 600, color: '#0B1323', mt: 0.5 }}>
              {value}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
