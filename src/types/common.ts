// Common types used across the application

export type AlertType = 'success' | 'error' | 'warning' | 'info';

export interface Alert {
  id: string;
  type: AlertType;
  title: string;
  message: string;
}

// Client interface
export interface Client {
  id: number;
  name: string;
  email: string;
  phone: string;
  document: string;
  documentType: 'CC' | 'CE' | 'NIT' | 'PP';
  address: string;
  city: string;
  department: string;
  createdAt: string;
  updatedAt: string;
}

// Vehicle interface
export interface Vehicle {
  id: number;
  brand: string;
  model: string;
  year: number;
  color: string;
  vin: string;
  plate: string;
  engineNumber: string;
  mileage: number;
  price: number;
  cost: number;
  status: 'Disponible' | 'Vendido' | 'Reservado' | 'En Reparación';
  fuelType: string;
  transmission: string;
  engineSize: string;
  doors: number;
  seats: number;
  description: string;
  images: string[];
  createdAt: string;
  updatedAt: string;
}

// Sale interface
export interface Sale {
  id: number;
  clientId: number;
  vehicleId: number;
  clientName: string;
  vehicleInfo: string;
  salePrice: number;
  downPayment: number;
  financingAmount: number;
  financingTerm: number;
  monthlyPayment: number;
  saleDate: string;
  status: 'Pendiente' | 'Completada' | 'Cancelada';
  salesperson: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

// Workshop Order interface
export interface WorkshopOrder {
  id: number;
  clientId: number;
  vehicleId: number;
  clientName: string;
  vehicleInfo: string;
  orderNumber: string;
  serviceType: string;
  description: string;
  estimatedCost: number;
  actualCost: number;
  estimatedDuration: number;
  actualDuration: number;
  status: 'Pendiente' | 'En Proceso' | 'Completada' | 'Cancelada';
  priority: 'Baja' | 'Normal' | 'Alta' | 'Urgente';
  assignedMechanic: string;
  startDate: string;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
}

// Inventory Item interface
export interface InventoryItem {
  id: number;
  name: string;
  category: string;
  sku: string;
  quantity: number;
  minQuantity: number;
  unitPrice: number;
  supplier: string;
  location: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

// Lead interface for CRM
export interface Lead {
  id: number;
  name: string;
  email: string;
  phone: string;
  source: string;
  status: 'Nuevo' | 'Contactado' | 'Calificado' | 'Propuesta' | 'Negociación' | 'Cerrado' | 'Perdido';
  priority: 'Baja' | 'Media' | 'Alta';
  notes: string;
  assignedTo: string;
  createdAt: string;
  updatedAt: string;
}

// Invoice interface for DIAN
export interface Invoice {
  id: number;
  invoiceNumber: string;
  clientId: number;
  clientName: string;
  amount: number;
  tax: number;
  total: number;
  status: 'Borrador' | 'Enviada' | 'Aceptada' | 'Rechazada';
  issueDate: string;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
}

// Employee interface for HR
export interface Employee {
  id: number;
  name: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  salary: number;
  hireDate: string;
  status: 'Activo' | 'Inactivo';
  createdAt: string;
  updatedAt: string;
}

// Purchase Order interface
export interface PurchaseOrder {
  id: number;
  orderNumber: string;
  supplier: string;
  items: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  totalAmount: number;
  status: 'Pendiente' | 'Aprobada' | 'Enviada' | 'Recibida' | 'Cancelada';
  orderDate: string;
  expectedDelivery: string;
  createdAt: string;
  updatedAt: string;
}

// Plate Request interface
export interface PlateRequest {
  id: number;
  requestNumber: string;
  clientId: number;
  clientName: string;
  vehicleId: number;
  vehicleInfo: string;
  requestType: 'Nueva' | 'Renovación' | 'Cambio';
  status: 'Pendiente' | 'En Proceso' | 'Completada' | 'Rechazada';
  requestDate: string;
  completionDate: string | null;
  notes: string;
  createdAt: string;
  updatedAt: string;
}