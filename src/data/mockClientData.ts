import { Client, Vehicle, ServiceAppointment, Reminder, Activity } from '../types/client.types';

export const mockClientData = {
  client: {
    id: 'client-123',
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    address: '123 Main St, Anytown, USA',
    joinDate: '2023-01-15',
  } as Client,
  
  vehicles: [
    {
      id: 'vehicle-1',
      make: 'Toyota',
      model: 'Camry',
      year: 2020,
      licensePlate: 'ABC-1234',
      vin: '4T1BF1FK5CU123456',
      mileage: 32500,
      lastServiceDate: '2023-10-15',
      nextServiceDue: 5000,
      serviceHistory: [
        { id: 'service-1', date: '2023-10-15', type: 'Oil Change', description: 'Synthetic oil change', cost: 89.99 },
        { id: 'service-2', date: '2023-07-20', type: 'Tire Rotation', description: 'Tire rotation and balance', cost: 39.99 },
      ],
    } as Vehicle,
  ],
  
  appointments: [
    {
      id: 'appt-1',
      date: '2023-11-20T10:00:00',
      type: 'Regular Maintenance',
      status: 'scheduled',
      vehicleId: 'vehicle-1',
      notes: '60,000 mile service',
    } as ServiceAppointment,
  ],
  
  reminders: [
    {
      id: 'reminder-1',
      type: 'maintenance',
      dueDate: '2023-12-01',
      description: 'Next oil change due',
      vehicleId: 'vehicle-1',
      isActive: true,
    } as Reminder,
  ],
  
  recentActivity: [
    {
      id: 'activity-1',
      type: 'appointment',
      date: '2023-10-15T14:30:00',
      description: 'Oil change completed',
      relatedId: 'service-1',
    } as Activity,
    {
      id: 'activity-2',
      type: 'reminder',
      date: '2023-10-10T09:15:00',
      description: 'Service reminder sent',
      relatedId: 'reminder-1',
    } as Activity,
  ],
};
