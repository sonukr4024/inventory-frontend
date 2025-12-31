import React from 'react';
import { Breadcrumbs as MuiBreadcrumbs, Link, Typography, Box } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, NavigateNext } from '@mui/icons-material';

const routeLabels: Record<string, string> = {
  dashboard: 'Dashboard',
  customers: 'Customers',
  categories: 'Categories',
  products: 'Products',
  billing: 'Billing',
  credit: 'Credit / Dues',
  reports: 'Reports',
  'ai-reports': 'AI Reports',
};

const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const pathnames = location.pathname.split('/').filter((x) => x);

  if (pathnames.length === 0 || location.pathname === '/') {
    return null;
  }

  return (
    <Box
      sx={{
        py: 1.5,
        px: 3,
        backgroundColor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <MuiBreadcrumbs
        separator={<NavigateNext fontSize="small" />}
        aria-label="breadcrumb"
        sx={{
          '& .MuiBreadcrumbs-separator': {
            mx: 1,
          },
        }}
      >
        <Link
          component="button"
          onClick={() => navigate('/dashboard')}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            color: 'text.secondary',
            textDecoration: 'none',
            cursor: 'pointer',
            fontSize: '0.875rem',
            '&:hover': {
              color: 'primary.main',
              textDecoration: 'underline',
            },
          }}
        >
          <Home sx={{ fontSize: 18 }} />
          Home
        </Link>

        {pathnames.map((value, index) => {
          const last = index === pathnames.length - 1;
          const to = `/${pathnames.slice(0, index + 1).join('/')}`;
          const label = routeLabels[value] || value.charAt(0).toUpperCase() + value.slice(1);

          return last ? (
            <Typography
              key={to}
              sx={{
                color: 'text.primary',
                fontWeight: 600,
                fontSize: '0.875rem',
              }}
            >
              {label}
            </Typography>
          ) : (
            <Link
              key={to}
              component="button"
              onClick={() => navigate(to)}
              sx={{
                color: 'text.secondary',
                textDecoration: 'none',
                cursor: 'pointer',
                fontSize: '0.875rem',
                '&:hover': {
                  color: 'primary.main',
                  textDecoration: 'underline',
                },
              }}
            >
              {label}
            </Link>
          );
        })}
      </MuiBreadcrumbs>
    </Box>
  );
};

export default Breadcrumbs;
