import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Grid
} from '@mui/material';
import { Search } from '@mui/icons-material';
import { reportService } from '../services/reportService';
import { format } from 'date-fns';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Reports: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [dailyDate, setDailyDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [monthlyYear, setMonthlyYear] = useState(new Date().getFullYear());
  const [monthlyMonth, setMonthlyMonth] = useState(new Date().getMonth() + 1);
  const [customStartDate, setCustomStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [customEndDate, setCustomEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const [dailyReport, setDailyReport] = useState<any>(null);
  const [monthlyReport, setMonthlyReport] = useState<any>(null);
  const [customReport, setCustomReport] = useState<any>(null);
  const [outstandingReport, setOutstandingReport] = useState<any[]>([]);
  const [lowStockReport, setLowStockReport] = useState<any[]>([]);

  const handleDailyReport = async () => {
    try {
      setLoading(true);
      const response = await reportService.getDailySalesReport(dailyDate);
      setDailyReport(response.data || null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load report');
      setDailyReport(null);
    } finally {
      setLoading(false);
    }
  };

  const handleMonthlyReport = async () => {
    try {
      setLoading(true);
      const response = await reportService.getMonthlySalesReport(monthlyYear, monthlyMonth);
      setMonthlyReport(response.data || null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load report');
      setMonthlyReport(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomReport = async () => {
    try {
      setLoading(true);
      const response = await reportService.getCustomSalesReport(
        `${customStartDate}T00:00:00`,
        `${customEndDate}T23:59:59`
      );
      setCustomReport(response.data || null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load report');
      setCustomReport(null);
    } finally {
      setLoading(false);
    }
  };

  const handleOutstandingReport = async () => {
    try {
      setLoading(true);
      const response = await reportService.getOutstandingReport();
      setOutstandingReport(response.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load report');
      setOutstandingReport([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLowStockReport = async () => {
    try {
      setLoading(true);
      const response = await reportService.getLowStockReport();
      setLowStockReport(response.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load report');
      setLowStockReport([]);
    } finally {
      setLoading(false);
    }
  };

  const renderSalesCard = (data: any) => {
    if (!data) return null;

    return (
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" variant="body2">
                Total Bills
              </Typography>
              <Typography variant="h6">{data.totalBills}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" variant="body2">
                Total Sales
              </Typography>
              <Typography variant="h6">₹{data.totalSales?.toFixed(2)}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" variant="body2">
                Total Tax
              </Typography>
              <Typography variant="h6">₹{data.totalTax?.toFixed(2)}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" variant="body2">
                Net Sales
              </Typography>
              <Typography variant="h6" color="success.main">
                ₹{(data.netSales || data.totalSales || 0).toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  const renderPaymentModeChart = (data: any) => {
    if (!data) return null;

    // Handle both old and new API structures
    const paymentData = data.paymentModeSummary || {};

    const chartData = {
      labels: ['Cash', 'Card', 'UPI', 'Credit'],
      datasets: [
        {
          label: 'Sales by Payment Mode',
          data: [
            paymentData.CASH || data.cashSales || 0,
            paymentData.CARD || data.cardSales || 0,
            paymentData.UPI || data.upiSales || 0,
            paymentData.CREDIT || data.creditSales || 0
          ],
          backgroundColor: ['#4caf50', '#2196f3', '#ff9800', '#f44336']
        }
      ]
    };

    return (
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Payment Mode Distribution
          </Typography>
          <Box sx={{ height: 300 }}>
            <Bar
              data={chartData}
              options={{
                responsive: true,
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
    );
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Reports
      </Typography>

      {error && (
        <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
        <Tab label="Daily Sales" />
        <Tab label="Monthly Sales" />
        <Tab label="Custom Range" />
        <Tab label="Outstanding" />
        <Tab label="Low Stock" />
      </Tabs>

      {activeTab === 0 && (
        <Box>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box display="flex" gap={2} alignItems="center">
                <TextField
                  label="Date"
                  type="date"
                  value={dailyDate}
                  onChange={(e) => setDailyDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
                <Button
                  variant="contained"
                  startIcon={<Search />}
                  onClick={handleDailyReport}
                  disabled={loading}
                >
                  Generate Report
                </Button>
              </Box>
            </CardContent>
          </Card>

          {loading && <CircularProgress />}
          {renderSalesCard(dailyReport)}
          {renderPaymentModeChart(dailyReport)}
        </Box>
      )}

      {activeTab === 1 && (
        <Box>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box display="flex" gap={2} alignItems="center">
                <TextField
                  label="Year"
                  type="number"
                  value={monthlyYear}
                  onChange={(e) => setMonthlyYear(parseInt(e.target.value))}
                  inputProps={{ min: 2020, max: 2030 }}
                />
                <TextField
                  label="Month"
                  type="number"
                  value={monthlyMonth}
                  onChange={(e) => setMonthlyMonth(parseInt(e.target.value))}
                  inputProps={{ min: 1, max: 12 }}
                />
                <Button
                  variant="contained"
                  startIcon={<Search />}
                  onClick={handleMonthlyReport}
                  disabled={loading}
                >
                  Generate Report
                </Button>
              </Box>
            </CardContent>
          </Card>

          {loading && <CircularProgress />}
          {renderSalesCard(monthlyReport)}
          {renderPaymentModeChart(monthlyReport)}

          {monthlyReport?.dailyBreakdown && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Daily Breakdown
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell align="right">Bills</TableCell>
                        <TableCell align="right">Sales</TableCell>
                        <TableCell align="right">Tax</TableCell>
                        <TableCell align="right">Net</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {monthlyReport.dailyBreakdown.map((day: any, index: number) => (
                        <TableRow key={index}>
                          <TableCell>{day.date}</TableCell>
                          <TableCell align="right">{day.totalBills}</TableCell>
                          <TableCell align="right">₹{day.totalSales?.toFixed(2)}</TableCell>
                          <TableCell align="right">₹{day.totalTax?.toFixed(2)}</TableCell>
                          <TableCell align="right">₹{day.netSales?.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          )}
        </Box>
      )}

      {activeTab === 2 && (
        <Box>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box display="flex" gap={2} alignItems="center">
                <TextField
                  label="Start Date"
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  label="End Date"
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
                <Button
                  variant="contained"
                  startIcon={<Search />}
                  onClick={handleCustomReport}
                  disabled={loading}
                >
                  Generate Report
                </Button>
              </Box>
            </CardContent>
          </Card>

          {loading && <CircularProgress />}
          {renderSalesCard(customReport)}
          {renderPaymentModeChart(customReport)}
        </Box>
      )}

      {activeTab === 3 && (
        <Box>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Button
                variant="contained"
                startIcon={<Search />}
                onClick={handleOutstandingReport}
                disabled={loading}
              >
                Load Outstanding Report
              </Button>
            </CardContent>
          </Card>

          {loading && <CircularProgress />}

          {outstandingReport.length > 0 && (
            <TableContainer component={Card}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Customer</TableCell>
                    <TableCell>Phone</TableCell>
                    <TableCell align="right">Credit Limit</TableCell>
                    <TableCell align="right">Outstanding</TableCell>
                    <TableCell>Last Bill</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {outstandingReport.map((customer: any) => (
                    <TableRow key={customer.customerId}>
                      <TableCell>{customer.customerName}</TableCell>
                      <TableCell>{customer.phoneNumber}</TableCell>
                      <TableCell align="right">₹{customer.creditLimit?.toFixed(2)}</TableCell>
                      <TableCell align="right">
                        <Typography color="error">
                          ₹{customer.totalOutstanding?.toFixed(2)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {customer.lastBillDate || customer.oldestDueDate
                          ? new Date(customer.lastBillDate || customer.oldestDueDate).toLocaleDateString()
                          : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      )}

      {activeTab === 4 && (
        <Box>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Button
                variant="contained"
                startIcon={<Search />}
                onClick={handleLowStockReport}
                disabled={loading}
              >
                Load Low Stock Report
              </Button>
            </CardContent>
          </Card>

          {loading && <CircularProgress />}

          {lowStockReport.length > 0 && (
            <TableContainer component={Card}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Product Code</TableCell>
                    <TableCell>Product Name</TableCell>
                    <TableCell align="right">Current Stock</TableCell>
                    <TableCell align="right">Threshold</TableCell>
                    <TableCell>Unit</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {lowStockReport.map((product: any) => (
                    <TableRow key={product.id}>
                      <TableCell>{product.productCode}</TableCell>
                      <TableCell>{product.productName}</TableCell>
                      <TableCell align="right">
                        <Typography color="error">
                          {product.stockQuantity?.toFixed(2)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">{product.lowStockThreshold?.toFixed(2)}</TableCell>
                      <TableCell>{product.unit}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      )}
    </Box>
  );
};

export default Reports;
