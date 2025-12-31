import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Typography,
  Alert,
  CircularProgress,
  Chip,
  InputAdornment
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  CameraAlt,
  FaceRetouchingNatural,
  Search
} from '@mui/icons-material';
import { customerService } from '../services/customerService';
import { Customer, CreateCustomerRequest } from '../types';
import WebcamCapture from '../components/WebcamCapture';
import { useAuth } from '../contexts/AuthContext';

const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [webcamOpen, setWebcamOpen] = useState(false);
  const [recognizeDialogOpen, setRecognizeDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { isAdmin } = useAuth();

  const [formData, setFormData] = useState<CreateCustomerRequest>({
    customerName: '',
    phoneNumber: '',
    email: '',
    address: '',
    gstin: '',
    creditLimit: 0
  });

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const response = await customerService.getAllCustomers();
      setCustomers(response.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load customers');
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      loadCustomers();
      return;
    }

    try {
      setLoading(true);
      const response = await customerService.searchCustomers(searchTerm);
      setCustomers(response.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Search failed');
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (customer?: Customer) => {
    if (customer) {
      setSelectedCustomer(customer);
      setFormData({
        customerName: customer.customerName,
        phoneNumber: customer.phoneNumber,
        email: customer.email || '',
        address: customer.address || '',
        gstin: customer.gstin || '',
        creditLimit: customer.creditLimit
      });
    } else {
      setSelectedCustomer(null);
      setFormData({
        customerName: '',
        phoneNumber: '',
        email: '',
        address: '',
        gstin: '',
        creditLimit: 0
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedCustomer(null);
  };

  const handleSubmit = async () => {
    try {
      if (selectedCustomer) {
        await customerService.updateCustomer(selectedCustomer.id, formData);
      } else {
        await customerService.createCustomer(formData);
      }
      loadCustomers();
      handleCloseDialog();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        await customerService.deleteCustomer(id);
        loadCustomers();
      } catch (err: any) {
        setError(err.response?.data?.message || 'Delete failed');
      }
    }
  };

  const handleCaptureFace = (customer: Customer) => {
    setSelectedCustomer(customer);
    setWebcamOpen(true);
  };

  const handleFaceCapture = async (file: File) => {
    if (selectedCustomer) {
      try {
        await customerService.uploadFaceImage(selectedCustomer.id, file);
        setError('');
        alert('Face image uploaded successfully');
        loadCustomers();
      } catch (err: any) {
        setError(err.response?.data?.message || 'Face upload failed');
      }
    }
  };

  const handleRecognizeFace = async (file: File) => {
    try {
      const response = await customerService.recognizeFace(file);
      alert(`Customer recognized: ${response.data.customerName}`);
      setRecognizeDialogOpen(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Face recognition failed');
    }
  };

  if (loading && customers.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Customers</Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<FaceRetouchingNatural />}
            onClick={() => setRecognizeDialogOpen(true)}
            sx={{ mr: 1 }}
          >
            Recognize Face
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
          >
            Add Customer
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <TextField
            fullWidth
            placeholder="Search by name or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={handleSearch}>
                    <Search />
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
        </CardContent>
      </Card>

      <TableContainer component={Card}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Credit Limit</TableCell>
              <TableCell>Outstanding</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {customers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell>{customer.customerName}</TableCell>
                <TableCell>{customer.phoneNumber}</TableCell>
                <TableCell>{customer.email || '-'}</TableCell>
                <TableCell>₹{customer.creditLimit.toFixed(2)}</TableCell>
                <TableCell>₹{customer.outstandingBalance.toFixed(2)}</TableCell>
                <TableCell>
                  <Chip
                    label={(customer.isActive !== false) ? 'Active' : 'Inactive'}
                    color={(customer.isActive !== false) ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => handleCaptureFace(customer)}
                    title="Capture Face"
                  >
                    <CameraAlt />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => handleOpenDialog(customer)}
                  >
                    <Edit />
                  </IconButton>
                  {isAdmin && (
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(customer.id)}
                    >
                      <Delete />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedCustomer ? 'Edit Customer' : 'Add Customer'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Customer Name"
            value={formData.customerName}
            onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Phone Number"
            value={formData.phoneNumber}
            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Address"
            multiline
            rows={2}
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="GSTIN"
            value={formData.gstin}
            onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Credit Limit"
            type="number"
            value={formData.creditLimit}
            onChange={(e) => setFormData({ ...formData, creditLimit: parseFloat(e.target.value) || 0 })}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {selectedCustomer ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      <WebcamCapture
        open={webcamOpen}
        onClose={() => setWebcamOpen(false)}
        onCapture={handleFaceCapture}
      />

      <WebcamCapture
        open={recognizeDialogOpen}
        onClose={() => setRecognizeDialogOpen(false)}
        onCapture={handleRecognizeFace}
      />
    </Box>
  );
};

export default Customers;
