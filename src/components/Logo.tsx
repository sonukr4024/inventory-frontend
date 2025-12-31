import React from 'react';
import { Box, Typography } from '@mui/material';
import { Inventory2 } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface LogoProps {
  collapsed?: boolean;
}

const Logo: React.FC<LogoProps> = ({ collapsed = false }) => {
  const navigate = useNavigate();

  return (
    <Box
      onClick={() => navigate('/dashboard')}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        cursor: 'pointer',
        padding: collapsed ? 1 : 2,
        transition: 'all 0.3s ease',
        '&:hover': {
          opacity: 0.8,
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 40,
          height: 40,
          borderRadius: 2,
          background: 'linear-gradient(135deg, #1565C0 0%, #388E3C 100%)',
          boxShadow: '0px 4px 12px rgba(21, 101, 192, 0.3)',
        }}
      >
        <Inventory2 sx={{ color: 'white', fontSize: 24 }} />
      </Box>
      {!collapsed && (
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            background: 'linear-gradient(135deg, #1565C0 0%, #388E3C 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            letterSpacing: '-0.5px',
          }}
        >
          Wholesale Inventory
        </Typography>
      )}
    </Box>
  );
};

export default Logo;
