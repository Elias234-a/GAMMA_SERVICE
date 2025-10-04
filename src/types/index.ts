import { UserRole } from './auth.types';

// Alert types
export type AlertType = 'success' | 'error' | 'warning' | 'info';

export interface Alert {
  id: string;
  type: AlertType;
  title: string;
  message: string;
  timestamp: Date;
}

// Vehicle interface
export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  color: string;
  licensePlate: string;
  vin: string;
  mileage: number;
  fuelType: string;
  transmission: string;
  engineType: string;
  serviceInterval: number;
  lastServiceDate: string;
  nextServiceDue: number;
  ownerId: string;
  registrationDate: string;
  insuranceProvider?: string;
  insuranceExpiry?: string;
  technicalReviewExpiry?: string;
  serviceHistory: ServiceRecord[];
  status: 'active' | 'inactive' | 'maintenance' | 'sold';
}

// Client interface
export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  idNumber: string;
  idType: 'CC' | 'CE' | 'NIT' | 'PP';
  dateOfBirth?: string;
  registrationDate: string;
  status: 'active' | 'inactive';
  vehicles: Vehicle[];
  totalPurchases: number;
  lastPurchaseDate?: string;
  creditLimit?: number;
  paymentTerms?: string;
  contactPreference: 'email' | 'phone' | 'sms';
  notes?: string;
}

// Sale interface
export interface Sale {
  id: string;
  clientId: string;
  vehicleId?: string;
  salespersonId: string;
  items: SaleItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: 'cash' | 'credit' | 'financing' | 'bank_transfer';
  status: 'pending' | 'completed' | 'cancelled' | 'refunded';
  saleDate: string;
  deliveryDate?: string;
  notes?: string;
  financingDetails?: FinancingDetails;
}

export interface SaleItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  subtotal: number;
}

export interface FinancingDetails {
  financingCompany: string;
  loanAmount: number;
  downPayment: number;
  interestRate: number;
  termMonths: number;
  monthlyPayment: number;
  approvalStatus: 'pending' | 'approved' | 'denied';
}

// Service and workshop types
export interface ServiceRecord {
  id: string;
  vehicleId: string;
  serviceType: string;
  description: string;
  date: string;
  mileage: number;
  cost: number;
  technicianId: string;
  partsUsed: PartUsed[];
  laborHours: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
}

export interface PartUsed {
  partId: string;
  partName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

// Inventory types
export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  category: string;
  brand: string;
  partNumber: string;
  barcode?: string;
  quantity: number;
  minStock: number;
  maxStock: number;
  unitPrice: number;
  costPrice: number;
  supplierId: string;
  location: string;
  status: 'available' | 'out_of_stock' | 'discontinued';
  lastUpdated: string;
}

// Employee and HR types
export interface Employee {
  id: string;
  employeeNumber: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  hireDate: string;
  salary: number;
  status: 'active' | 'inactive' | 'terminated';
  role: UserRole;
  address: string;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
}

// CRM and lead types
export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  source: string;
  interestedVehicle?: string;
  budget?: number;
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'closed' | 'lost';
  assignedTo?: string;
  notes: string[];
  createdDate: string;
  lastContact?: string;
  priority: 'low' | 'medium' | 'high';
}

// Appointment types
export interface Appointment {
  id: string;
  clientId: string;
  vehicleId: string;
  appointmentType: 'maintenance' | 'repair' | 'inspection' | 'consultation';
  scheduledDate: string;
  estimatedDuration: number;
  assignedTechnician?: string;
  description: string;
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  reminderSent: boolean;
  cost?: number;
  notes?: string;
}

// Notification and reminder types
export interface Reminder {
  id: string;
  title: string;
  type: 'maintenance' | 'insurance' | 'registration' | 'payment' | 'follow_up';
  dueDate: string;
  dueMileage?: number;
  description: string;
  relatedId: string; // Can be vehicleId, clientId, etc.
  isRecurring: boolean;
  recurringInterval?: number;
  status: 'active' | 'completed' | 'dismissed';
  priority: 'low' | 'medium' | 'high';
  createdDate: string;
  completedDate?: string;
}

export interface Activity {
  id: string;
  title: string;
  type: 'sale' | 'service' | 'appointment' | 'reminder' | 'payment' | 'contact';
  description: string;
  timestamp: string;
  relatedId: string;
  userId: string;
  icon: string;
  metadata?: Record<string, any>;
}

// DIAN and billing types
export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  saleId?: string;
  issueDate: string;
  dueDate: string;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  paymentMethod?: string;
  paymentDate?: string;
  notes?: string;
  dianData?: {
    cufe: string;
    qrCode: string;
    xmlPath: string;
    pdfPath: string;
  };
}

// Report types
export interface ReportData {
  id: string;
  name: string;
  type: 'sales' | 'inventory' | 'financial' | 'service' | 'customer';
  dateRange: {
    start: string;
    end: string;
  };
  data: any[];
  generatedDate: string;
  generatedBy: string;
}

// Settings and configuration
export interface SystemSettings {
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  taxId: string;
  currency: string;
  timezone: string;
  dateFormat: string;
  language: string;
  emailSettings: {
    smtpServer: string;
    smtpPort: number;
    smtpUser: string;
    smtpPassword: string;
    senderEmail: string;
  };
  dianSettings: {
    testMode: boolean;
    certificatePath: string;
    certificatePassword: string;
    technicalKey: string;
    softwareId: string;
  };
}

// Dashboard and analytics types
export interface DashboardMetrics {
  totalSales: number;
  totalRevenue: number;
  totalClients: number;
  totalVehicles: number;
  pendingAppointments: number;
  lowStockItems: number;
  monthlyGrowth: number;
  averageSaleValue: number;
}

export interface ChartData {
  label: string;
  value: number;
  date?: string;
  category?: string;
}

// Filter and search types
export interface FilterOptions {
  dateRange?: {
    start: string;
    end: string;
  };
  status?: string[];
  category?: string[];
  priceRange?: {
    min: number;
    max: number;
  };
  searchTerm?: string;
}

export interface PaginationOptions {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}