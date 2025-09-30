import { ReactNode } from 'react';

export type AlertType = 'success' | 'error' | 'warning' | 'info';

export interface ClientAccount {
  id: string;
  name: string;
  identification: string;
  email: string;
  phone: string;
  address: string;
  registrationDate: string;
  status: 'active' | 'inactive' | 'pending';
  loyaltyPoints: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  avatar?: string;
  preferences: {
    notifications: boolean;
    emailUpdates: boolean;
    smsAlerts: boolean;
    language: 'es' | 'en';
    theme: 'light' | 'dark' | 'system';
  };
  vehicles: Vehicle[];
  purchases: Purchase[];
  appointments: Appointment[];
  serviceHistory: ServiceRecord[];
  notifications: Notification[];
  documents: Document[];
  messages: Message[];
  payments: Payment[];
  servicePackages: ServicePackage[];
  reminders: Reminder[];
  recentActivity: Activity[];
}

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  vin: string;
  licensePlate: string;
  color: string;
  mileage: number;
  lastServiceDate: string;
  nextServiceDue: string;
  serviceInterval: number;
  fuelType: 'gasoline' | 'diesel' | 'hybrid' | 'electric' | 'other';
  transmission: 'manual' | 'automatic' | 'semi-automatic' | 'cvt';
  engineSize: string;
  fuelEfficiency: {
    city: number;
    highway: number;
    combined: number;
  };
  healthMetrics: {
    engine: number;
    battery: number;
    tires: number;
    brakes: number;
    transmission: number;
    overall: number;
  };
  serviceHistory: string[];
  reminders: Reminder[];
  documents: string[];
  images: string[];
  notes: string;
}

export interface Purchase {
  id: string;
  date: string;
  invoiceNumber: string;
  vehicle: Vehicle;
  amount: number;
  paymentStatus: 'paid' | 'pending' | 'overdue' | 'partially_paid';
  paymentMethod: 'cash' | 'credit_card' | 'financing' | 'bank_transfer' | 'other';
  items: PurchaseItem[];
  warranty: {
    type: string;
    startDate: string;
    endDate: string;
    coverage: string[];
    terms: string;
    isTransferable: boolean;
  };
  documents: string[];
  notes: string;
  salesPerson: string;
  location: string;
  tradeIn?: {
    vehicle: string;
    amount: number;
  };
  financing?: {
    provider: string;
    interestRate: number;
    termMonths: number;
    monthlyPayment: number;
    downPayment: number;
    totalInterest: number;
    totalCost: number;
    startDate: string;
    endDate: string;
    status: 'active' | 'paid_off' | 'defaulted' | 'refinanced';
  };
}

export interface PurchaseItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  tax: number;
  discount: number;
  isTaxable: boolean;
  isDiscountable: boolean;
  isRefundable: boolean;
  isReturnable: boolean;
  returnPolicy: string;
  warranty?: {
    type: string;
    period: number;
    unit: 'days' | 'weeks' | 'months' | 'years';
    notes: string;
  };
  metadata: Record<string, any>;
}

export interface Appointment {
  id: string;
  date: string;
  time: string;
  endTime: string;
  service: string;
  serviceType: 'maintenance' | 'repair' | 'inspection' | 'recall' | 'warranty' | 'other';
  serviceDetails: string[];
  vehicle: Vehicle;
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'ready_for_pickup' | 'completed' | 'cancelled' | 'no_show';
  priority: 'low' | 'medium' | 'high';
  estimatedDuration: number;
  estimatedCost: {
    min: number;
    max: number;
    currency: string;
  };
  actualCost: number | null;
  technician: string;
  serviceAdvisor: string;
  dropOffTime: string | null;
  pickupTime: string | null;
  loanerVehicle?: {
    provided: boolean;
    vehicleInfo: string;
    startDate: string | null;
    endDate: string | null;
    condition: string | null;
  };
  notes: string;
  customerNotes: string;
  internalNotes: string;
  checklist: {
    interior: boolean;
    exterior: boolean;
    tires: boolean;
    fluids: boolean;
    battery: boolean;
    brakes: boolean;
    lights: boolean;
    diagnostic: boolean;
    testDrive: boolean;
  };
  photos: string[];
  documents: string[];
  followUpDate: string | null;
  rating: number | null;
  review: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceRecord {
  id: string;
  date: string;
  service: string;
  serviceType: 'maintenance' | 'repair' | 'inspection' | 'recall' | 'warranty' | 'other';
  vehicle: Vehicle;
  cost: number;
  laborHours: number;
  parts: {
    id: string;
    name: string;
    partNumber: string;
    quantity: number;
    unitPrice: number;
    total: number;
    warranty: {
      covered: boolean;
      endDate: string | null;
      notes: string;
    };
  }[];
  technician: string;
  serviceAdvisor: string;
  mileage: number;
  nextService?: {
    type: string;
    dueDate: string;
    dueMileage: number;
    description: string;
  };
  notes: string;
  customerNotes: string;
  internalNotes: string;
  checklist: {
    interior: boolean;
    exterior: boolean;
    tires: boolean;
    fluids: boolean;
    battery: boolean;
    brakes: boolean;
    lights: boolean;
    diagnostic: boolean;
    testDrive: boolean;
  };
  photos: string[];
  documents: string[];
  warranty: {
    covered: boolean;
    type: string;
    notes: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  date: string;
  type: 'info' | 'warning' | 'success' | 'error' | 'reminder' | 'promotion' | 'appointment' | 'service' | 'payment' | 'vehicle' | 'security';
  read: boolean;
  action?: {
    type: string;
    url: string;
    label: string;
  };
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: 'system' | 'marketing' | 'service' | 'appointment' | 'payment' | 'security' | 'other';
  expiresAt: string | null;
  metadata: Record<string, any>;
}

export interface Document {
  id: string;
  title: string;
  type: 'invoice' | 'receipt' | 'warranty' | 'manual' | 'contract' | 'insurance' | 'other';
  fileType: 'pdf' | 'doc' | 'docx' | 'xls' | 'xlsx' | 'jpg' | 'png' | 'txt' | 'other';
  url: string;
  size: number;
  uploadDate: string;
  expirationDate: string | null;
  tags: string[];
  description: string;
  sharedWith: string[];
  accessLevel: 'private' | 'shared' | 'public';
  vehicleId: string | null;
  serviceId: string | null;
  purchaseId: string | null;
  appointmentId: string | null;
  isSigned: boolean;
  signatureRequired: boolean;
  metadata: Record<string, any>;
}

export interface Message {
  id: string;
  threadId: string;
  subject: string;
  content: string;
  from: {
    id: string;
    name: string;
    role: 'customer' | 'advisor' | 'technician' | 'system' | 'other';
    avatar: string | null;
  };
  to: Array<{
    id: string;
    name: string;
    role: 'customer' | 'advisor' | 'technician' | 'system' | 'other';
    avatar: string | null;
  }>;
  cc?: Array<{
    id: string;
    name: string;
    role: 'customer' | 'advisor' | 'technician' | 'system' | 'other';
    avatar: string | null;
  }>;
  bcc?: Array<{
    id: string;
    name: string;
    role: 'customer' | 'advisor' | 'technician' | 'system' | 'other';
    avatar: string | null;
  }>;
  sentAt: string;
  readAt: string | null;
  isRead: boolean;
  isStarred: boolean;
  isArchived: boolean;
  isDeleted: boolean;
  labels: string[];
  attachments: Array<{
    id: string;
    name: string;
    type: string;
    size: number;
    url: string;
  }>;
  relatedTo?: {
    type: 'appointment' | 'service' | 'vehicle' | 'purchase' | 'other';
    id: string;
    reference: string;
  };
  metadata: Record<string, any>;
}

export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  currency: string;
  paymentMethod: 'credit_card' | 'debit_card' | 'bank_transfer' | 'cash' | 'check' | 'financing' | 'other';
  paymentDate: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded' | 'partially_refunded' | 'disputed' | 'cancelled';
  referenceNumber: string;
  notes: string;
  receiptUrl: string | null;
  relatedTo?: {
    type: 'service' | 'purchase' | 'appointment' | 'other';
    id: string;
    reference: string;
  };
  metadata: Record<string, any>;
}

export interface ServicePackage {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  validity: number;
  includedServices: string[];
  benefits: string[];
  terms: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Reminder {
  id: string;
  type: 'service' | 'inspection' | 'insurance' | 'registration' | 'payment' | 'other';
  title: string;
  description: string;
  dueDate: string;
  dueMileage: number | null;
  isRecurring: boolean;
  recurrence?: {
    type: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
    interval: number;
    daysOfWeek: number[];
    dayOfMonth: number | null;
    month: number | null;
    endDate: string | null;
    occurrences: number | null;
  };
  status: 'pending' | 'snoozed' | 'completed' | 'overdue' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  vehicleId: string;
  serviceId: string | null;
  appointmentId: string | null;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface Activity {
  id: string;
  type: 'login' | 'appointment' | 'service' | 'purchase' | 'payment' | 'document' | 'message' | 'other';
  title: string;
  description: string;
  timestamp: string;
  icon: ReactNode;
  metadata: Record<string, any>;
}

export interface ClientPortalModuleProps {
  showAlert: (type: AlertType, title: string, message: string) => void;
  showConfirmDialog: (title: string, message: string, onConfirm: () => void, onCancel?: () => void) => void;
}

export interface Tab {
  id: string;
  label: string;
  icon: ReactNode;
  component: ReactNode;
  badge?: number | string;
}

export interface DashboardMetrics {
  activeVehicles: number;
  upcomingAppointments: number;
  pendingPayments: number;
  loyaltyPoints: number;
  recentActivity: Activity[];
  serviceReminders: Reminder[];
  recentDocuments: Document[];
  notifications: Notification[];
}
