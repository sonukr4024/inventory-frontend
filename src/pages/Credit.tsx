import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Alert,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip
} from '@mui/material';
import { Payment } from '@mui/icons-material';
import { creditService } from '../services/creditService';
import { OutstandingCustomer } from '../types';

const Credit: React.FC = () => {
  const [customers, setCustomers] = useState<OutstandingCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<OutstandingCustomer | null>(null);

  const [paymentData, setPaymentData] = useState({
    amount: 0,
    referenceNumber: '',
    remarks: ''
  });

  useEffect(() => {
    loadOutstanding();
  }, []);

  const loadOutstanding = async () => {
    try {
      setLoading(true);
      const response = await creditService.getAllOutstanding();
      setCustomers((response.data || []).filter(c => c.totalOutstanding > 0));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load outstanding data');
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPaymentDialog = (customer: OutstandingCustomer) => {
    setSelectedCustomer(customer);
    setPaymentData({
      amount: customer.totalOutstanding,
      referenceNumber: '',
      remarks: ''
    });
    setPaymentDialogOpen(true);
  };

  const handlePayment = async () => {
    if (!selectedCustomer) return;

    try {
      await creditService.recordPayment({
        customerId: selectedCustomer.customerId,
        amount: paymentData.amount,
        referenceNumber: paymentData.referenceNumber || undefined,
        remarks: paymentData.remarks || undefined
      });
      setSuccess('Payment recorded successfully');
      setPaymentDialogOpen(false);
      loadOutstanding();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to record payment');
    }
  };

  const totalOutstanding = customers.reduce((sum, c) => sum + c.totalOutstanding, 0);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Credit / Dues Management</Typography>
        <Card sx={{ px: 3, py: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Total Outstanding
          </Typography>
          <Typography variant="h5" color="error">
            ₹{totalOutstanding.toFixed(2)}
          </Typography>
        </Card>
      </Box>

      {error && (
        <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" onClose={() => setSuccess('')} sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <TableContainer component={Card}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Customer Name</TableCell>
              <TableCell>Phone Number</TableCell>
              <TableCell align="right">Credit Limit</TableCell>
              <TableCell align="right">Outstanding</TableCell>
              <TableCell>Last Bill Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {customers.map((customer) => {
              const utilizationPercent = (customer.totalOutstanding / customer.creditLimit) * 100;
              const isOverLimit = customer.totalOutstanding > customer.creditLimit;

              return (
                <TableRow key={customer.customerId}>
                  <TableCell>{customer.customerName}</TableCell>
                  <TableCell>{customer.phoneNumber}</TableCell>
                  <TableCell align="right">₹{customer.creditLimit.toFixed(2)}</TableCell>
                  <TableCell align="right">
                    <Typography color={isOverLimit ? 'error' : 'text.primary'} fontWeight={isOverLimit ? 'bold' : 'normal'}>
                      ₹{customer.totalOutstanding.toFixed(2)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {customer.lastBillDate
                      ? new Date(customer.lastBillDate).toLocaleDateString()
                      : '-'}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={
                        isOverLimit
                          ? 'Over Limit'
                          : utilizationPercent > 80
                          ? 'High Risk'
                          : 'Normal'
                      }
                      color={
                        isOverLimit
                          ? 'error'
                          : utilizationPercent > 80
                          ? 'warning'
                          : 'default'
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<Payment />}
                      onClick={() => handleOpenPaymentDialog(customer)}
                    >
                      Record Payment
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={paymentDialogOpen}
        onClose={() => setPaymentDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Record Payment</DialogTitle>
        <DialogContent>
          {selectedCustomer && (
            <>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Customer: {selectedCustomer.customerName}
              </Typography>
              <Typography variant="body2" color="error" gutterBottom mb={2}>
                Outstanding: ₹{selectedCustomer.totalOutstanding.toFixed(2)}
              </Typography>
              <TextField
                fullWidth
                label="Payment Amount"
                type="number"
                value={paymentData.amount || ''}
                onChange={(e) =>
                  setPaymentData({ ...paymentData, amount: parseFloat(e.target.value) || 0 })
                }
                margin="normal"
                required
                inputProps={{ step: 1, min: 0 }}
              />
              <TextField
                fullWidth
                label="Reference Number"
                value={paymentData.referenceNumber}
                onChange={(e) =>
                  setPaymentData({ ...paymentData, referenceNumber: e.target.value })
                }
                margin="normal"
                placeholder="Receipt/Transaction number"
              />
              <TextField
                fullWidth
                label="Remarks"
                multiline
                rows={2}
                value={paymentData.remarks}
                onChange={(e) =>
                  setPaymentData({ ...paymentData, remarks: e.target.value })
                }
                margin="normal"
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPaymentDialogOpen(false)}>Cancel</Button>
          <Button onClick={handlePayment} variant="contained">
            Record Payment
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Credit;
