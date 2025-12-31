import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
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
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import { Add, Edit, Delete, Search, TrendingUp } from '@mui/icons-material';
import { productService } from '../services/productService';
import { categoryService } from '../services/categoryService';
import { Product, CreateProductRequest, Category } from '../types';
import { useAuth } from '../contexts/AuthContext';

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [rateDialogOpen, setRateDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { isAdmin } = useAuth();

  const [formData, setFormData] = useState<CreateProductRequest>({
    productCode: '',
    productName: '',
    description: '',
    categoryId: 0,
    unit: 'KG',
    baseRate: 0,
    currentRate: 0,
    stockQuantity: 0,
    lowStockThreshold: 10,
    hsnCode: '',
    gstPercentage: 5
  });

  const [rateOverride, setRateOverride] = useState({
    rate: 0,
    effectiveDate: '',
    endDate: '',
    remarks: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [productsResponse, categoriesResponse] = await Promise.all([
        productService.getAllProducts(),
        categoryService.getAllCategories()
      ]);
      setProducts(productsResponse.data || []);
      setCategories(categoriesResponse.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load data');
      setProducts([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      loadData();
      return;
    }

    try {
      setLoading(true);
      const response = await productService.searchProducts(searchTerm);
      setProducts(response.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Search failed');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (product?: Product) => {
    if (product) {
      setSelectedProduct(product);
      setFormData({
        productCode: product.productCode,
        productName: product.productName,
        description: product.description || '',
        categoryId: product.categoryId,
        unit: product.unit,
        baseRate: product.baseRate,
        currentRate: product.currentRate,
        stockQuantity: product.stockQuantity,
        lowStockThreshold: product.lowStockThreshold,
        hsnCode: product.hsnCode || '',
        gstPercentage: product.gstPercentage
      });
    } else {
      setSelectedProduct(null);
      setFormData({
        productCode: '',
        productName: '',
        description: '',
        categoryId: categories[0]?.id || 0,
        unit: 'KG',
        baseRate: 0,
        currentRate: 0,
        stockQuantity: 0,
        lowStockThreshold: 10,
        hsnCode: '',
        gstPercentage: 5
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedProduct(null);
  };

  const handleSubmit = async () => {
    try {
      if (selectedProduct) {
        await productService.updateProduct(selectedProduct.id, formData);
      } else {
        await productService.createProduct(formData);
      }
      loadData();
      handleCloseDialog();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productService.deleteProduct(id);
        loadData();
      } catch (err: any) {
        setError(err.response?.data?.message || 'Delete failed');
      }
    }
  };

  const handleOpenRateDialog = (product: Product) => {
    setSelectedProduct(product);
    setRateOverride({
      rate: product.currentRate,
      effectiveDate: new Date().toISOString().split('T')[0],
      endDate: '',
      remarks: ''
    });
    setRateDialogOpen(true);
  };

  const handleRateOverride = async () => {
    if (!selectedProduct) return;

    try {
      await productService.overrideRate(selectedProduct.id, {
        productId: selectedProduct.id,
        rate: rateOverride.rate,
        effectiveDate: rateOverride.effectiveDate,
        endDate: rateOverride.endDate || undefined,
        remarks: rateOverride.remarks || undefined
      });
      loadData();
      setRateDialogOpen(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Rate override failed');
    }
  };

  if (loading && products.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Products</Typography>
        {isAdmin && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
          >
            Add Product
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Card sx={{ mb: 3, p: 2 }}>
        <TextField
          fullWidth
          placeholder="Search products..."
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
      </Card>

      <TableContainer component={Card}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Code</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Unit</TableCell>
              <TableCell>Current Rate</TableCell>
              <TableCell>Stock</TableCell>
              <TableCell>GST %</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>{product.productCode}</TableCell>
                <TableCell>{product.productName}</TableCell>
                <TableCell>{product.categoryName || '-'}</TableCell>
                <TableCell>{product.unit}</TableCell>
                <TableCell>₹{product.currentRate.toFixed(2)}</TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center">
                    {product.stockQuantity.toFixed(2)}
                    {product.stockQuantity <= product.lowStockThreshold && (
                      <Chip
                        label="Low"
                        color="error"
                        size="small"
                        sx={{ ml: 1 }}
                      />
                    )}
                  </Box>
                </TableCell>
                <TableCell>{product.gstPercentage}%</TableCell>
                <TableCell>
                  <Chip
                    label={(product.isActive !== false) ? 'Active' : 'Inactive'}
                    color={(product.isActive !== false) ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {isAdmin && (
                    <>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleOpenRateDialog(product)}
                        title="Override Rate"
                      >
                        <TrendingUp />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleOpenDialog(product)}
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(product.id)}
                      >
                        <Delete />
                      </IconButton>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedProduct ? 'Edit Product' : 'Add Product'}
        </DialogTitle>
        <DialogContent>
          <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
            <TextField
              fullWidth
              label="Product Code"
              value={formData.productCode}
              onChange={(e) => setFormData({ ...formData, productCode: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Product Name"
              value={formData.productName}
              onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
              margin="normal"
              required
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Category</InputLabel>
              <Select
                value={formData.categoryId}
                label="Category"
                onChange={(e) => setFormData({ ...formData, categoryId: Number(e.target.value) })}
              >
                {categories.map((cat) => (
                  <MenuItem key={cat.id} value={cat.id}>
                    {cat.categoryName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal">
              <InputLabel>Unit</InputLabel>
              <Select
                value={formData.unit}
                label="Unit"
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              >
                <MenuItem value="KG">KG</MenuItem>
                <MenuItem value="PCS">PCS</MenuItem>
                <MenuItem value="LITRE">LITRE</MenuItem>
                <MenuItem value="BOX">BOX</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Base Rate"
              type="number"
              value={formData.baseRate}
              onChange={(e) => setFormData({ ...formData, baseRate: parseFloat(e.target.value) || 0 })}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Current Rate"
              type="number"
              value={formData.currentRate}
              onChange={(e) => setFormData({ ...formData, currentRate: parseFloat(e.target.value) || 0 })}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Stock Quantity"
              type="number"
              value={formData.stockQuantity}
              onChange={(e) => setFormData({ ...formData, stockQuantity: parseFloat(e.target.value) || 0 })}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Low Stock Threshold"
              type="number"
              value={formData.lowStockThreshold}
              onChange={(e) => setFormData({ ...formData, lowStockThreshold: parseFloat(e.target.value) || 0 })}
              margin="normal"
            />
            <TextField
              fullWidth
              label="HSN Code"
              value={formData.hsnCode}
              onChange={(e) => setFormData({ ...formData, hsnCode: e.target.value })}
              margin="normal"
            />
            <TextField
              fullWidth
              label="GST Percentage"
              type="number"
              value={formData.gstPercentage}
              onChange={(e) => setFormData({ ...formData, gstPercentage: parseFloat(e.target.value) || 0 })}
              margin="normal"
            />
          </Box>
          <TextField
            fullWidth
            label="Description"
            multiline
            rows={2}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {selectedProduct ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={rateDialogOpen} onClose={() => setRateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Override Product Rate</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Product: {selectedProduct?.productName}
          </Typography>
          <TextField
            fullWidth
            label="New Rate"
            type="number"
            value={rateOverride.rate}
            onChange={(e) => setRateOverride({ ...rateOverride, rate: parseFloat(e.target.value) || 0 })}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Effective Date"
            type="date"
            value={rateOverride.effectiveDate}
            onChange={(e) => setRateOverride({ ...rateOverride, effectiveDate: e.target.value })}
            margin="normal"
            InputLabelProps={{ shrink: true }}
            required
          />
          <TextField
            fullWidth
            label="End Date (Optional)"
            type="date"
            value={rateOverride.endDate}
            onChange={(e) => setRateOverride({ ...rateOverride, endDate: e.target.value })}
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            fullWidth
            label="Remarks"
            multiline
            rows={2}
            value={rateOverride.remarks}
            onChange={(e) => setRateOverride({ ...rateOverride, remarks: e.target.value })}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRateDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleRateOverride} variant="contained">
            Override Rate
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Products;
