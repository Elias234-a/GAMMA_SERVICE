import React from 'react';
import { Dashboard } from '@/components/Dashboard';
import { Client, Vehicle, Sale, AlertType } from '@/types';

// Mock data for demonstration
const mockClients: Client[] = [
  {
    id: '1',
    name: 'Juan Pérez',
    email: 'juan@ejemplo.com',
    phone: '123456789',
    address: 'Calle 123 #45-67',
    city: 'Bogotá',
    state: 'Cundinamarca',
    zipCode: '110111',
    idNumber: '12345678',
    idType: 'CC',
    registrationDate: '2024-01-15',
    status: 'active',
    vehicles: [],
    totalPurchases: 1,
    contactPreference: 'email'
  }
];

const mockVehicles: Vehicle[] = [
  {
    id: '1',
    make: 'Toyota',
    model: 'Corolla',
    year: 2023,
    color: 'Blanco',
    licensePlate: 'ABC-123',
    vin: '1234567890',
    mileage: 15000,
    fuelType: 'Gasolina',
    transmission: 'Automática',
    engineType: '1.8L',
    serviceInterval: 10000,
    lastServiceDate: '2024-08-01',
    nextServiceDue: 25000,
    ownerId: '1',
    registrationDate: '2024-01-20',
    serviceHistory: [],
    status: 'active'
  }
];

const mockSales: Sale[] = [
  {
    id: '1',
    clientId: '1',
    vehicleId: '1',
    salespersonId: 'emp1',
    items: [],
    subtotal: 85000000,
    tax: 16150000,
    discount: 0,
    total: 101150000,
    paymentMethod: 'financing',
    status: 'completed',
    saleDate: '2024-01-20',
    deliveryDate: '2024-01-25'
  }
];

const Home: React.FC = () => {
  const handleShowAlert = (type: AlertType, title: string, message: string) => {
    console.log(`Alert: ${type} - ${title}: ${message}`);
  };

  return (
    <Dashboard 
      showAlert={handleShowAlert}
      clients={mockClients}
      vehicles={mockVehicles}
      sales={mockSales}
    />
  );
};

export default Home;