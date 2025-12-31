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
      icon: <TrendingUp sx={{ fontSize: 32, color: 'white' }} />,
      gradient: 'linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)',
      bgColor: 'rgba(76, 175, 80, 0.08)'
    },
    {
      title: 'Pending Dues',
      value: `₹${stats?.pendingDues.toFixed(2) || 0}`,
      icon: <CreditCard sx={{ fontSize: 32, color: 'white' }} />,
      gradient: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
      bgColor: 'rgba(255, 152, 0, 0.08)'
    },
    {
      title: 'Low Stock Items',
      value: stats?.lowStockCount || 0,
      icon: <Warning sx={{ fontSize: 32, color: 'white' }} />,
      gradient: 'linear-gradient(135deg, #F44336 0%, #D32F2F 100%)',
      bgColor: 'rgba(244, 67, 54, 0.08)'
    },
    {
      title: 'Today\'s Bills',
      value: stats?.todayBills || 0,
      icon: <Receipt sx={{ fontSize: 32, color: 'white' }} />,
      gradient: 'linear-gradient(135deg, #1565C0 0%, #0D47A1 100%)',
      bgColor: 'rgba(21, 101, 192, 0.08)'
    }
  ];

  const doughnutData = {
    labels: ['Today Sales', 'Pending Dues'],
    datasets: [
      {
        data: [stats?.todaySales || 0, stats?.pendingDues || 0],
        backgroundColor: ['#4CAF50', '#FF9800'],
        borderColor: ['#388E3C', '#F57C00'],
        borderWidth: 2,
        hoverOffset: 4
      }
    ]
  };

  const barData = {
    labels: ['Sales', 'Bills', 'Low Stock'],
    datasets: [
      {
        label: 'Today\'s Metrics',
        data: [stats?.todaySales || 0, stats?.todayBills || 0, stats?.lowStockCount || 0],
        backgroundColor: ['#4CAF50', '#1565C0', '#F44336'],
        borderRadius: 8
      }
    ]
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
        Dashboard
      </Typography>

      <Grid container spacing={3}>
        {statCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card
              elevation={2}
              sx={{
                height: '100%',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.12)',
                },
              }}
            >
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      color="text.secondary"
                      gutterBottom
                      variant="body2"
                      sx={{ fontWeight: 500, fontSize: '0.875rem', mb: 1 }}
                    >
                      {card.title}
                    </Typography>
                    <Typography variant="h5" component="div" sx={{ fontWeight: 700, mb: 0.5 }}>
                      {card.value}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      background: card.gradient,
                      p: 1.5,
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
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
          <Card
            elevation={2}
            sx={{
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.12)',
              },
            }}
          >
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                Sales vs Dues
              </Typography>
              <Box sx={{ height: 300, display: 'flex', justifyContent: 'center' }}>
                <Doughnut
                  data={doughnutData}
                  options={{
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom',
                        labels: {
                          padding: 20,
                          font: {
                            size: 12,
                            weight: 500
                          }
                        }
                      }
                    }
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card
            elevation={2}
            sx={{
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.12)',
              },
            }}
          >
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                Today's Metrics
              </Typography>
              <Box sx={{ height: 300 }}>
                <Bar
                  data={barData}
                  options={{
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        grid: {
                          color: 'rgba(0, 0, 0, 0.05)'
                        }
                      },
                      x: {
                        grid: {
                          display: false
                        }
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
