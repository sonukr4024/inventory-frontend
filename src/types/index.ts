// Enums matching backend
export type Role = 'ROLE_ADMIN' | 'ROLE_STAFF';
export type PaymentMode = 'CASH' | 'CARD' | 'UPI' | 'CREDIT';
export type PaymentStatus = 'PAID' | 'PARTIAL' | 'UNPAID';
export type Unit = 'KG' | 'GRAM' | 'LITRE' | 'ML' | 'PIECE' | 'DOZEN' | 'BOX' | 'CARTON';

// User & Authentication Types
export interface User {
  id: number;
  username: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  role: Role;
  isLocked?: boolean;
  failedLoginAttempts?: number;
  isInvited?: boolean;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  fullName: string;
  email: string;
  role: Role;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface AuthResponse {
  token: string;
  type: string;
  userId: number;
  username: string;
  email: string;
  role: Role;
}

// Deprecated: Use AuthResponse instead
export interface LoginResponseData extends AuthResponse {}

// Customer Types
export interface Customer {
  id: number;
  customerName: string;
  phoneNumber: string;
  email?: string;
  address?: string;
  gstin?: string;
  creditLimit: number;
  outstandingBalance: number;
  faceImageCount?: number;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCustomerRequest {
  customerName: string;
  phoneNumber: string;
  email?: string;
  address?: string;
  gstin?: string;
  creditLimit: number;
}

export interface OutstandingCustomer {
  customerId: number;
  customerName: string;
  phoneNumber: string;
  email?: string;
  creditLimit: number;
  totalOutstanding: number;
  currentOutstanding?: number; // Alias for backward compatibility
  oldestDueDate?: string;
  lastBillDate?: string;
  outstandingBills?: OutstandingBill[];
}

export interface OutstandingBill {
  billId: number;
  billNumber: string;
  billDate: string;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  daysOverdue: number;
}

// Category Types
export interface Category {
  id: number;
  categoryName: string;
  description?: string;
  isActive?: boolean;
}

export interface CreateCategoryRequest {
  categoryName: string;
  description?: string;
}

export interface Product {
  id: number;
  productCode: string;
  productName: string;
  description?: string;
  categoryId: number;
  categoryName?: string;
  unit: Unit | string;
  baseRate: number;
  currentRate: number;
  stockQuantity: number;
  lowStockThreshold: number;
  hsnCode?: string;
  gstPercentage: number;
  lowStock?: boolean;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductRequest {
  productCode: string;
  productName: string;
  description?: string;
  categoryId: number;
  unit: string;
  baseRate: number;
  currentRate: number;
  stockQuantity: number;
  lowStockThreshold: number;
  hsnCode?: string;
  gstPercentage: number;
}

export interface RateOverrideRequest {
  productId: number;
  rate: number;
  effectiveDate: string;
  endDate?: string;
  remarks?: string;
}

export interface LowStockProduct {
  id: number;
  productCode: string;
  productName: string;
  stockQuantity: number;
  lowStockThreshold: number;
  unit: string;
}

// Bill Types
export interface BillItem {
  productId: number;
  quantity: number;
  rate: number;
  taxPercentage: number;
  discountPercentage: number;
}

export interface CreateBillRequest {
  customerId: number;
  items: BillItem[];
  discountAmount: number;
  paidAmount: number;
  paymentMode: PaymentMode;
  remarks?: string;
}

export interface Bill {
  id: number;
  billNumber: string;
  customerId: number;
  customerName: string;
  billDate: string;
  subTotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  paymentStatus: PaymentStatus;
  paymentMode: string;
  remarks?: string;
  createdBy?: string;
  createdAt?: string;
  items: BillItemDetail[];
}

export interface BillItemDetail {
  id: number;
  productId: number;
  productName: string;
  productCode?: string;
  quantity: number;
  unit?: string;
  rate: number;
  taxPercentage: number;
  taxAmount: number;
  discountPercentage: number;
  discountAmount: number;
  lineTotal: number;
}

// Payment Types
export interface PaymentRequest {
  customerId: number;
  amount: number;
  referenceNumber?: string;
  remarks?: string;
}

// Report Types
export interface DailySalesReport {
  title?: string;
  date?: string;
  startDate?: string;
  endDate?: string;
  totalBills: number;
  totalSales: number;
  totalTax: number;
  totalDiscount: number;
  totalPaid?: number;
  totalOutstanding?: number;
  netSales?: number; // Calculated field
  cashSales?: number;
  cardSales?: number;
  upiSales?: number;
  creditSales?: number;
  paymentModeSummary?: {
    CASH?: number;
    CARD?: number;
    UPI?: number;
    CREDIT?: number;
  };
  paymentStatusSummary?: {
    PAID?: number;
    PARTIAL?: number;
    UNPAID?: number;
  };
  productWiseSales?: ProductWiseSale[];
  categoryWiseSales?: CategoryWiseSale[];
}

export interface ProductWiseSale {
  productId: number;
  productCode: string;
  productName: string;
  unit: string;
  quantitySold: number;
  totalRevenue: number;
}

export interface CategoryWiseSale {
  categoryId: number;
  categoryName: string;
  totalRevenue: number;
  itemCount: number;
}

export interface MonthlySalesReport {
  year: number;
  month: number;
  totalBills: number;
  totalSales: number;
  totalTax: number;
  totalDiscount: number;
  netSales: number;
  cashSales: number;
  cardSales: number;
  upiSales: number;
  creditSales: number;
  dailyBreakdown: DailySalesReport[];
}

export interface ProductSalesReport {
  productId: number;
  productName: string;
  totalQuantity: number;
  totalSales: number;
  averageRate: number;
}

export interface InventoryValuation {
  totalProducts: number;
  totalStockValue: number;
  categoryWiseValuation: CategoryValuation[];
}

export interface CategoryValuation {
  categoryId: number;
  categoryName: string;
  totalProducts: number;
  totalStockValue: number;
}

// AI Report Types
export interface AIReportRequest {
  prompt: string;
}

export interface AIReportResponse {
  report: string;
  generatedAt: string;
}

// Dashboard Types
export interface DashboardStats {
  todaySales: number;
  pendingDues: number;
  lowStockCount: number;
  todayBills: number;
}
