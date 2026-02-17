import React from 'react';
import { Toolbar, TextField, InputAdornment } from '@mui/material';
import { Search } from '@mui/icons-material';

interface SearchToolbarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function SearchToolbar({ value, onChange, placeholder = 'Search...' }: SearchToolbarProps) {
  return (
    <Toolbar
      sx={{
        bgcolor: '#FFFFFF',
        borderBottom: '1px solid #E6E9EE',
        minHeight: 64,
      }}
    >
      <TextField
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        variant="outlined"
        size="small"
        sx={{
          bgcolor: '#FAFAFA',
          '& .MuiOutlinedInput-root': {
            '& fieldset': { border: 'none' },
          },
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search sx={{ color: '#6B6C7B' }} />
            </InputAdornment>
          ),
        }}
      />
    </Toolbar>
  );
}
