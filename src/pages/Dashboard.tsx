import React, { useEffect, useState } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  TrendingUp,
  CreditCard,
  Warning,
  Receipt
} from '@mui/icons-material';
import { dashboardService } from '../services/dashboardService';
import { DashboardStats } from '../types';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      const data = await dashboardService.getDashboardStats();
      setStats(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  const statCards = [
    {
      title: 'Today\'s Sales',
      value: `₹${stats?.todaySales.toFixed(2) || 0}`,
      icon: <TrendingUp sx={{ fontSize: 40, color: 'success.main' }} />,
      color: 'success.light'
    },
    {
      title: 'Pending Dues',
      value: `₹${stats?.pendingDues.toFixed(2) || 0}`,
      icon: <CreditCard sx={{ fontSize: 40, color: 'warning.main' }} />,
      color: 'warning.light'
    },
    {
      title: 'Low Stock Items',
      value: stats?.lowStockCount || 0,
      icon: <Warning sx={{ fontSize: 40, color: 'error.main' }} />,
      color: 'error.light'
    },
    {
      title: 'Today\'s Bills',
      value: stats?.todayBills || 0,
      icon: <Receipt sx={{ fontSize: 40, color: 'info.main' }} />,
      color: 'info.light'
    }
  ];

  const doughnutData = {
    labels: ['Today Sales', 'Pending Dues'],
    datasets: [
      {
        data: [stats?.todaySales || 0, stats?.pendingDues || 0],
        backgroundColor: ['#4caf50', '#ff9800'],
        borderWidth: 2
      }
    ]
  };

  const barData = {
    labels: ['Sales', 'Bills', 'Low Stock'],
    datasets: [
      {
        label: 'Today\'s Metrics',
        data: [stats?.todaySales || 0, stats?.todayBills || 0, stats?.lowStockCount || 0],
        backgroundColor: ['#4caf50', '#2196f3', '#f44336']
      }
    ]
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      <Grid container spacing={3}>
        {statCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography color="text.secondary" gutterBottom variant="body2">
                      {card.title}
                    </Typography>
                    <Typography variant="h5" component="div">
                      {card.value}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      bgcolor: card.color,
                      p: 1,
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    {card.icon}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Sales vs Dues
              </Typography>
              <Box sx={{ height: 300, display: 'flex', justifyContent: 'center' }}>
                <Doughnut data={doughnutData} options={{ maintainAspectRatio: false }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Today's Metrics
              </Typography>
              <Box sx={{ height: 300 }}>
                <Bar
                  data={barData}
                  options={{
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true
                      }
                    }
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
