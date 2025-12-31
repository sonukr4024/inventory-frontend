import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Alert,
  Autocomplete,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Divider
} from '@mui/material';
import { Add, Delete, Save, Receipt } from '@mui/icons-material';
import { customerService } from '../services/customerService';
import { productService } from '../services/productService';
import { billService } from '../services/billService';
import { Customer, Product, BillItem, Bill } from '../types';

interface BillItemRow extends BillItem {
  productName: string;
  amount: number;
  taxAmount: number;
  discountAmount: number;
  netAmount: number;
}

const Billing: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [billItems, setBillItems] = useState<BillItemRow[]>([]);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [paidAmount, setPaidAmount] = useState(0);
  const [paymentMode, setPaymentMode] = useState<'CASH' | 'CARD' | 'UPI' | 'CREDIT'>('CASH');
  const [remarks, setRemarks] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [billSummaryOpen, setBillSummaryOpen] = useState(false);
  const [completedBill, setCompletedBill] = useState<Bill | null>(null);

  const [currentItem, setCurrentItem] = useState({
    product: null as Product | null,
    quantity: 0,
    discountPercentage: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [customersResponse, productsResponse] = await Promise.all([
        customerService.getAllCustomers(),
        productService.getAllProducts()
      ]);
      setCustomers(customersResponse.data || []);
      setProducts((productsResponse.data || []).filter(p => p.isActive !== false));
    } catch (err: any) {
      setError('Failed to load data');
      setCustomers([]);
      setProducts([]);
    }
  };

  const handleAddItem = () => {
    if (!currentItem.product || currentItem.quantity <= 0) {
      setError('Please select a product and enter quantity');
      return;
    }

    const product = currentItem.product;
    const amount = currentItem.quantity * product.currentRate;
    const discAmount = (amount * currentItem.discountPercentage) / 100;
    const taxableAmount = amount - discAmount;
    const taxAmt = (taxableAmount * product.gstPercentage) / 100;
    const netAmt = taxableAmount + taxAmt;

    const newItem: BillItemRow = {
      productId: product.id,
      productName: product.productName,
      quantity: currentItem.quantity,
      rate: product.currentRate,
      taxPercentage: product.gstPercentage,
      discountPercentage: currentItem.discountPercentage,
      amount,
      taxAmount: taxAmt,
      discountAmount: discAmount,
      netAmount: netAmt
    };

    setBillItems([...billItems, newItem]);
    setCurrentItem({ product: null, quantity: 0, discountPercentage: 0 });
    setError('');
  };

  const handleRemoveItem = (index: number) => {
    setBillItems(billItems.filter((_, i) => i !== index));
  };

  const calculateTotals = () => {
    const totalAmount = billItems.reduce((sum, item) => sum + item.amount, 0);
    const totalTax = billItems.reduce((sum, item) => sum + item.taxAmount, 0);
    const totalDiscount = billItems.reduce((sum, item) => sum + item.discountAmount, 0) + discountAmount;
    const netAmount = billItems.reduce((sum, item) => sum + item.netAmount, 0) - discountAmount;
    const balanceAmount = netAmount - paidAmount;

    return { totalAmount, totalTax, totalDiscount, netAmount, balanceAmount };
  };

  const handleSubmitBill = async () => {
    if (!selectedCustomer) {
      setError('Please select a customer');
      return;
    }

    if (billItems.length === 0) {
      setError('Please add at least one item');
      return;
    }

    try {
      const billData = {
        customerId: selectedCustomer.id,
        items: billItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          rate: item.rate,
          taxPercentage: item.taxPercentage,
          discountPercentage: item.discountPercentage
        })),
        discountAmount,
        paidAmount,
        paymentMode,
        remarks
      };

      const response = await billService.createBill(billData);
      setCompletedBill(response.data);
      setBillSummaryOpen(true);
      setSuccess('Bill created successfully');
      
      // Reset form
      setSelectedCustomer(null);
      setBillItems([]);
      setDiscountAmount(0);
      setPaidAmount(0);
      setPaymentMode('CASH');
      setRemarks('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create bill');
    }
  };

  const totals = calculateTotals();

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Billing
      </Typography>

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

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Customer Details
              </Typography>
              <Autocomplete
                options={customers}
                getOptionLabel={(option) => `${option.customerName} (${option.phoneNumber})`}
                value={selectedCustomer}
                onChange={(_, newValue) => setSelectedCustomer(newValue)}
                renderInput={(params) => (
                  <TextField {...params} label="Select Customer" required />
                )}
              />
              {selectedCustomer && (
                <Box mt={2}>
                  <Typography variant="body2">
                    Credit Limit: ₹{selectedCustomer.creditLimit?.toFixed(2)}
                  </Typography>
                  <Typography variant="body2" color={selectedCustomer.outstandingBalance > 0 ? 'error' : 'text.secondary'}>
                    Outstanding: ₹{selectedCustomer.outstandingBalance?.toFixed(2)}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>

          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Add Items
              </Typography>
              <Box display="flex" gap={2} alignItems="flex-start">
                <Autocomplete
                  sx={{ flex: 2 }}
                  options={products}
                  getOptionLabel={(option) => `${option.productName} (₹${option.currentRate}/${option.unit})`}
                  value={currentItem.product}
                  onChange={(_, newValue) => setCurrentItem({ ...currentItem, product: newValue })}
                  renderInput={(params) => (
                    <TextField {...params} label="Select Product" />
                  )}
                />
                <TextField
                  label="Quantity"
                  type="number"
                  value={currentItem.quantity || ''}
                  onChange={(e) => setCurrentItem({ ...currentItem, quantity: parseFloat(e.target.value) || 0 })}
                  inputProps={{ step: 0.01, min: 0 }}
                  sx={{ flex: 1 }}
                />
                <TextField
                  label="Discount %"
                  type="number"
                  value={currentItem.discountPercentage || ''}
                  onChange={(e) => setCurrentItem({ ...currentItem, discountPercentage: parseFloat(e.target.value) || 0 })}
                  inputProps={{ step: 0.1, min: 0, max: 100 }}
                  sx={{ flex: 1 }}
                />
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={handleAddItem}
                >
                  Add
                </Button>
              </Box>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Bill Items
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Product</TableCell>
                      <TableCell align="right">Qty</TableCell>
                      <TableCell align="right">Rate</TableCell>
                      <TableCell align="right">Amount</TableCell>
                      <TableCell align="right">Disc %</TableCell>
                      <TableCell align="right">Tax</TableCell>
                      <TableCell align="right">Net</TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {billItems.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.productName}</TableCell>
                        <TableCell align="right">{item.quantity?.toFixed(2)}</TableCell>
                        <TableCell align="right">₹{item.rate?.toFixed(2)}</TableCell>
                        <TableCell align="right">₹{item.amount?.toFixed(2)}</TableCell>
                        <TableCell align="right">{item.discountPercentage}%</TableCell>
                        <TableCell align="right">₹{item.taxAmount?.toFixed(2)}</TableCell>
                        <TableCell align="right">₹{item.netAmount?.toFixed(2)}</TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleRemoveItem(index)}
                          >
                            <Delete />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Bill Summary
              </Typography>
              <Box mb={2}>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography>Total Amount:</Typography>
                  <Typography>₹{totals.totalAmount?.toFixed(2)}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography>Item Discount:</Typography>
                  <Typography color="error">-₹{(totals.totalDiscount - discountAmount).toFixed(2)}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography>Tax (GST):</Typography>
                  <Typography>₹{totals.totalTax.toFixed(2)}</Typography>
                </Box>
                <TextField
                  fullWidth
                  label="Additional Discount"
                  type="number"
                  value={discountAmount || ''}
                  onChange={(e) => setDiscountAmount(parseFloat(e.target.value) || 0)}
                  inputProps={{ step: 1, min: 0 }}
                  margin="normal"
                  size="small"
                />
                <Divider sx={{ my: 2 }} />
                <Box display="flex" justifyContent="space-between" mb={2}>
                  <Typography variant="h6">Net Amount:</Typography>
                  <Typography variant="h6">₹{totals.netAmount?.toFixed(2)}</Typography>
                </Box>
                <TextField
                  fullWidth
                  label="Paid Amount"
                  type="number"
                  value={paidAmount || ''}
                  onChange={(e) => setPaidAmount(parseFloat(e.target.value) || 0)}
                  inputProps={{ step: 1, min: 0 }}
                  margin="normal"
                />
                <FormControl fullWidth margin="normal">
                  <InputLabel>Payment Mode</InputLabel>
                  <Select
                    value={paymentMode}
                    label="Payment Mode"
                    onChange={(e) => setPaymentMode(e.target.value as any)}
                  >
                    <MenuItem value="CASH">Cash</MenuItem>
                    <MenuItem value="CARD">Card</MenuItem>
                    <MenuItem value="UPI">UPI</MenuItem>
                    <MenuItem value="CREDIT">Credit</MenuItem>
                  </Select>
                </FormControl>
                <Box display="flex" justifyContent="space-between" mt={2} mb={2}>
                  <Typography color={totals.balanceAmount > 0 ? 'error' : 'success'}>
                    Balance:
                  </Typography>
                  <Typography color={totals.balanceAmount > 0 ? 'error' : 'success'} fontWeight="bold">
                    ₹{totals.balanceAmount?.toFixed(2)}
                  </Typography>
                </Box>
                <TextField
                  fullWidth
                  label="Remarks"
                  multiline
                  rows={2}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  margin="normal"
                />
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  startIcon={<Save />}
                  onClick={handleSubmitBill}
                  sx={{ mt: 2 }}
                  disabled={!selectedCustomer || billItems.length === 0}
                >
                  Create Bill
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Dialog
        open={billSummaryOpen}
        onClose={() => setBillSummaryOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <Receipt sx={{ mr: 1 }} />
            Bill Created Successfully
          </Box>
        </DialogTitle>
        <DialogContent>
          {completedBill && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Bill #{completedBill.billNumber}
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography>Customer:</Typography>
                <Typography>{completedBill.customerName}</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography>Net Amount:</Typography>
                <Typography>₹{completedBill.totalAmount?.toFixed(2)}</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography>Paid:</Typography>
                <Typography>₹{completedBill.paidAmount?.toFixed(2)}</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography color={completedBill.balanceAmount > 0 ? 'error' : 'success'}>
                  Balance:
                </Typography>
                <Typography color={completedBill.balanceAmount > 0 ? 'error' : 'success'}>
                  ₹{completedBill.balanceAmount?.toFixed(2)}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBillSummaryOpen(false)} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Billing;
