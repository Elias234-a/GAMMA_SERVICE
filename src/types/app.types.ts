export type VehicleStatus = 'available' | 'sold' | 'reserved';

export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  year: number;
  plate: string;
  vin: string;
  color: string;
  price: number;
  clientId: string;
  status: VehicleStatus;
}

export type PaymentMethod = 'cash' | 'credit' | 'financing' | 'mixed';
export type SaleStatus = 'pending' | 'completed' | 'cancelled';

export interface Sale {
  id: string;
  saleNumber: string;
  clientId: string;
  vehicleId: string;
  totalPrice: number;
  paymentMethod: PaymentMethod;
  salesperson: string;
  downPayment?: number;
  financingAmount?: number;
  installments?: number;
  saleDate: string;
  status: SaleStatus;
  contractGenerated: boolean;
}
