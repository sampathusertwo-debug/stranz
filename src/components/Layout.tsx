'use client';

import React, { useState } from 'react';
import {
  AppBar,
  Avatar,
  Box,
  Container,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Menu as MenuIcon,
  LocalShipping,
  People,
  Receipt,
  AccountBalance,
  AttachMoney,
  DirectionsCar,
  Assessment,
  LocationOn,
  PersonOutline,
} from '@mui/icons-material';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const drawerWidth = 240;

interface MenuItem {
  text: string;
  icon: React.ReactElement;
  path: string;
}

const menuItems: MenuItem[] = [
  { text: 'Dashboard', icon: <Assessment />, path: '/parties' },
  { text: 'Quotes', icon: <People />, path: '/quotes' },
  { text: 'Bookings', icon: <LocationOn />, path: '/trips' },
  { text: 'Suppliers', icon: <PersonOutline />, path: '/suppliers' },
  { text: 'Drivers', icon: <DirectionsCar />, path: '/drivers' },
  { text: 'Trucks', icon: <LocalShipping />, path: '/trucks' },
  { text: 'Expenses', icon: <AccountBalance />, path: '/expenses' },
  { text: 'Invoices', icon: <Receipt />, path: '/invoices' },
  { text: 'Tips', icon: <AttachMoney />, path: '/tips' },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const pathname = usePathname();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#FAFAFA' }}>
      {/* Logo Section */}
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', borderBottom: '1px solid #E0E0E0' }}>
        <img 
          src="/images/ranz-logo.png" 
          alt="RANZ Logisticz" 
          style={{ width: '180px', height: 'auto' }}
        />
      </Box>
      <List sx={{ pt: 2, px: 1 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              component={Link}
              href={item.path}
              selected={pathname === item.path}
              sx={{
                borderRadius: 1,
                '&.Mui-selected': {
                  backgroundColor: '#FFE8DE',
                  color: '#EA7847',
                  '&:hover': {
                    backgroundColor: '#FFD4C1',
                  },
                  '& .MuiListItemIcon-root': {
                    color: '#EA7847',
                  },
                },
                '&:hover': {
                  backgroundColor: '#F5F5F5',
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 40,
                  color: pathname === item.path ? '#EA7847' : '#6B6C7B',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text}
                primaryTypographyProps={{
                  fontSize: '0.95rem',
                  fontWeight: pathname === item.path ? 600 : 400,
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Box sx={{ mt: 'auto', p: 2, textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          RANZ Logisticz
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', bgcolor: '#FAFAFA', minHeight: '100vh' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        elevation={4}
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          bgcolor: '#0D3B66',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { sm: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            <Avatar
              sx={{
                width: 40,
                height: 40,
                bgcolor: '#EA7847',
              }}
            >
              <PersonOutline />
            </Avatar>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                Test User
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                9087386175
              </Typography>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant={isMobile ? 'temporary' : 'permanent'}
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better mobile performance
          }}
          sx={{
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar />
        <Container maxWidth="lg" sx={{ mt: 3, mb: 4 }}>
          {children}
        </Container>
      </Box>
    </Box>
  );
}
