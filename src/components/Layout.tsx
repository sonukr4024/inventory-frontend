import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  useTheme,
  useMediaQuery,
  Badge,
  ListSubheader
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  People,
  Inventory,
  Receipt,
  CreditCard,
  Assessment,
  Psychology,
  Logout,
  Category
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Logo from './Logo';
import Breadcrumbs from './Breadcrumbs';
import { productService } from '../services/productService';
import { creditService } from '../services/creditService';

const drawerWidth = 240;

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [outstandingCount, setOutstandingCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAdmin, logout } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  interface MenuItem {
    text: string;
    icon: JSX.Element;
    path: string;
    adminOnly?: boolean;
    badge?: number;
  }

  interface MenuSection {
    title: string;
    items: MenuItem[];
  }

  const menuSections: MenuSection[] = [
    {
      title: 'Main',
      items: [
        { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
        { text: 'Customers', icon: <People />, path: '/customers' }
      ]
    },
    {
      title: 'Inventory',
      items: [
        { text: 'Categories', icon: <Category />, path: '/categories', adminOnly: true },
        { text: 'Products', icon: <Inventory />, path: '/products', badge: lowStockCount }
      ]
    },
    {
      title: 'Transactions',
      items: [
        { text: 'Billing', icon: <Receipt />, path: '/billing' },
        { text: 'Credit/Dues', icon: <CreditCard />, path: '/credit', badge: outstandingCount }
      ]
    },
    {
      title: 'Analytics',
      items: [
        { text: 'Reports', icon: <Assessment />, path: '/reports' },
        { text: 'AI Reports', icon: <Psychology />, path: '/ai-reports' }
      ]
    }
  ];

  useEffect(() => {
    const fetchBadgeCounts = async () => {
      try {
        const [productsRes, creditRes] = await Promise.all([
          productService.getAllProducts(),
          creditService.getAllOutstanding()
        ]);

        const lowStock = (productsRes.data || []).filter(
          p => p.stockQuantity <= (p.lowStockThreshold || 0)
        ).length;
        setLowStockCount(lowStock);

        const outstanding = (creditRes.data || []).filter(
          c => c.totalOutstanding > 0
        ).length;
        setOutstandingCount(outstanding);
      } catch (error) {
        console.error('Failed to fetch badge counts:', error);
      }
    };

    fetchBadgeCounts();
    const interval = setInterval(fetchBadgeCounts, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2 }}>
        <Logo />
      </Box>
      <Divider />
      <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
        {menuSections.map((section, sectionIndex) => (
          <List
            key={section.title}
            subheader={
              <ListSubheader
                component="div"
                sx={{
                  bgcolor: 'transparent',
                  color: 'text.secondary',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  lineHeight: '32px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  px: 3,
                  mt: sectionIndex > 0 ? 1 : 0
                }}
              >
                {section.title}
              </ListSubheader>
            }
          >
            {section.items.map((item) => {
              if (item.adminOnly && !isAdmin) return null;

              const isSelected = location.pathname === item.path;

              return (
                <ListItem key={item.text} disablePadding sx={{ px: 1 }}>
                  <ListItemButton
                    selected={isSelected}
                    onClick={() => {
                      navigate(item.path);
                      if (isMobile) setMobileOpen(false);
                    }}
                    sx={{
                      borderRadius: 2,
                      mx: 1,
                      transition: 'all 0.2s ease',
                      '&.Mui-selected': {
                        bgcolor: 'rgba(21, 101, 192, 0.08)',
                        borderLeft: '3px solid',
                        borderColor: 'primary.main',
                        '&:hover': {
                          bgcolor: 'rgba(21, 101, 192, 0.12)',
                        },
                      },
                      '&:hover': {
                        bgcolor: 'rgba(0, 0, 0, 0.04)',
                        transform: 'translateX(4px)',
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        color: isSelected ? 'primary.main' : 'text.secondary',
                        minWidth: 40,
                      }}
                    >
                      {item.badge && item.badge > 0 ? (
                        <Badge
                          badgeContent={item.badge}
                          color="error"
                          max={99}
                        >
                          {item.icon}
                        </Badge>
                      ) : (
                        item.icon
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.text}
                      primaryTypographyProps={{
                        fontSize: '0.875rem',
                        fontWeight: isSelected ? 600 : 500,
                        color: isSelected ? 'primary.main' : 'text.primary',
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        ))}
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        elevation={2}
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          bgcolor: 'background.paper',
          color: 'text.primary',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
              {menuSections
                .flatMap(s => s.items)
                .find(item => item.path === location.pathname)?.text || 'Dashboard'}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ textAlign: 'right', mr: 1, display: { xs: 'none', sm: 'block' } }}>
              <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                {user?.fullName}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1 }}>
                {user?.role === 'ROLE_ADMIN' ? 'Admin' : 'Staff'}
              </Typography>
            </Box>
            <IconButton onClick={handleProfileMenuOpen} sx={{ p: 0.5 }}>
              <Avatar
                sx={{
                  width: 40,
                  height: 40,
                  bgcolor: 'primary.main',
                  fontWeight: 600,
                  fontSize: '1rem',
                }}
              >
                {user?.fullName?.charAt(0).toUpperCase()}
              </Avatar>
            </IconButton>
          </Box>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleProfileMenuClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            PaperProps={{
              elevation: 8,
              sx: {
                mt: 1.5,
                minWidth: 200,
                borderRadius: 2,
              },
            }}
          >
            <MenuItem disabled>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  {user?.fullName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {user?.role === 'ROLE_ADMIN' ? 'Admin' : 'Staff'}
                </Typography>
              </Box>
            </MenuItem>
            <Divider sx={{ my: 1 }} />
            <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
              <ListItemIcon>
                <Logout fontSize="small" color="error" />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          bgcolor: 'background.default',
        }}
      >
        <Toolbar />
        <Breadcrumbs />
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;
