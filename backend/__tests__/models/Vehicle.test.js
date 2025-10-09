import mongoose from 'mongoose';
import Vehicle from '../../models/Vehicle.js';

describe('Vehicle Model Test', () => {
  
  // Datos de prueba válidos
  const validVehicleData = {
    brand: 'Toyota',
    model: 'Corolla',
    year: 2023,
    vin: '1HGBH41JXMN109186',
    color: 'Blanco',
    price: 80000000,
    cost: 70000000,
    status: 'available',
    category: 'sedan',
    type: 'passenger',
    transmission: 'automatic',
    fuel: 'gasoline',
    mileage: 0
  };

  describe('Validación de campos requeridos', () => {
    
    test('Debe crear un vehículo con datos válidos', async () => {
      const vehicle = new Vehicle(validVehicleData);
      const savedVehicle = await vehicle.save();
      
      expect(savedVehicle._id).toBeDefined();
      expect(savedVehicle.brand).toBe('Toyota');
      expect(savedVehicle.model).toBe('Corolla');
      expect(savedVehicle.year).toBe(2023);
      expect(savedVehicle.vin).toBe('1HGBH41JXMN109186');
      expect(savedVehicle.status).toBe('available');
    });

    test('Debe fallar sin marca', async () => {
      const vehicle = new Vehicle({ ...validVehicleData, brand: undefined });
      
      let error;
      try {
        await vehicle.save();
      } catch (e) {
        error = e;
      }
      
      expect(error).toBeDefined();
      expect(error.errors.brand).toBeDefined();
    });

    test('Debe fallar sin modelo', async () => {
      const vehicle = new Vehicle({ ...validVehicleData, model: undefined });
      
      let error;
      try {
        await vehicle.save();
      } catch (e) {
        error = e;
      }
      
      expect(error).toBeDefined();
      expect(error.errors.model).toBeDefined();
    });

    test('Debe fallar sin VIN', async () => {
      const vehicle = new Vehicle({ ...validVehicleData, vin: undefined });
      
      let error;
      try {
        await vehicle.save();
      } catch (e) {
        error = e;
      }
      
      expect(error).toBeDefined();
      expect(error.errors.vin).toBeDefined();
    });

    test('Debe fallar sin precio', async () => {
      const vehicle = new Vehicle({ ...validVehicleData, price: undefined });
      
      let error;
      try {
        await vehicle.save();
      } catch (e) {
        error = e;
      }
      
      expect(error).toBeDefined();
      expect(error.errors.price).toBeDefined();
    });
  });

  describe('Validación de VIN', () => {
    
    test('Debe rechazar VIN con menos de 17 caracteres', async () => {
      const vehicle = new Vehicle({ ...validVehicleData, vin: '1HGBH41JX' });
      
      let error;
      try {
        await vehicle.save();
      } catch (e) {
        error = e;
      }
      
      expect(error).toBeDefined();
      expect(error.errors.vin).toBeDefined();
    });

    test('Debe rechazar VIN con más de 17 caracteres', async () => {
      const vehicle = new Vehicle({ ...validVehicleData, vin: '1HGBH41JXMN109186XXX' });
      
      let error;
      try {
        await vehicle.save();
      } catch (e) {
        error = e;
      }
      
      expect(error).toBeDefined();
      expect(error.errors.vin).toBeDefined();
    });

    test('Debe rechazar VIN duplicado', async () => {
      await Vehicle.create(validVehicleData);
      
      const duplicateVehicle = new Vehicle(validVehicleData);
      
      let error;
      try {
        await duplicateVehicle.save();
      } catch (e) {
        error = e;
      }
      
      expect(error).toBeDefined();
      expect(error.code).toBe(11000); // Código de error de duplicado en MongoDB
    });

    test('Debe convertir VIN a mayúsculas', async () => {
      const vehicle = new Vehicle({ ...validVehicleData, vin: '1hgbh41jxmn109186' });
      const savedVehicle = await vehicle.save();
      
      expect(savedVehicle.vin).toBe('1HGBH41JXMN109186');
    });
  });

  describe('Validación de año', () => {
    
    test('Debe rechazar año menor a 1900', async () => {
      const vehicle = new Vehicle({ ...validVehicleData, year: 1899 });
      
      let error;
      try {
        await vehicle.save();
      } catch (e) {
        error = e;
      }
      
      expect(error).toBeDefined();
      expect(error.errors.year).toBeDefined();
    });

    test('Debe rechazar año futuro (más de 1 año adelante)', async () => {
      const futureYear = new Date().getFullYear() + 2;
      const vehicle = new Vehicle({ ...validVehicleData, year: futureYear });
      
      let error;
      try {
        await vehicle.save();
      } catch (e) {
        error = e;
      }
      
      expect(error).toBeDefined();
      expect(error.errors.year).toBeDefined();
    });
  });

  describe('Validación de precio', () => {
    
    test('Debe rechazar precio negativo', async () => {
      const vehicle = new Vehicle({ ...validVehicleData, price: -1000 });
      
      let error;
      try {
        await vehicle.save();
      } catch (e) {
        error = e;
      }
      
      expect(error).toBeDefined();
      expect(error.errors.price).toBeDefined();
    });

    test('Debe aceptar precio de 0', async () => {
      const vehicle = new Vehicle({ ...validVehicleData, price: 0 });
      const savedVehicle = await vehicle.save();
      
      expect(savedVehicle.price).toBe(0);
    });
  });

  describe('Valores por defecto', () => {
    
    test('Debe establecer status default a "available"', async () => {
      const vehicleData = { ...validVehicleData };
      delete vehicleData.status;
      
      const vehicle = new Vehicle(vehicleData);
      const savedVehicle = await vehicle.save();
      
      expect(savedVehicle.status).toBe('available');
    });

    test('Debe establecer mileage default a 0', async () => {
      const vehicleData = { ...validVehicleData };
      delete vehicleData.mileage;
      
      const vehicle = new Vehicle(vehicleData);
      const savedVehicle = await vehicle.save();
      
      expect(savedVehicle.mileage).toBe(0);
    });
  });

  describe('Timestamps', () => {
    
    test('Debe tener createdAt y updatedAt', async () => {
      const vehicle = new Vehicle(validVehicleData);
      const savedVehicle = await vehicle.save();
      
      expect(savedVehicle.createdAt).toBeDefined();
      expect(savedVehicle.updatedAt).toBeDefined();
      expect(savedVehicle.createdAt instanceof Date).toBe(true);
      expect(savedVehicle.updatedAt instanceof Date).toBe(true);
    });

    test('Debe actualizar updatedAt al modificar', async () => {
      const vehicle = new Vehicle(validVehicleData);
      const savedVehicle = await vehicle.save();
      
      const originalUpdatedAt = savedVehicle.updatedAt;
      
      // Esperar un momento
      await new Promise(resolve => setTimeout(resolve, 100));
      
      savedVehicle.color = 'Negro';
      await savedVehicle.save();
      
      expect(savedVehicle.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });
  });

  describe('Métodos de consulta', () => {
    
    test('Debe encontrar vehículo por VIN', async () => {
      await Vehicle.create(validVehicleData);
      
      const found = await Vehicle.findOne({ vin: '1HGBH41JXMN109186' });
      
      expect(found).toBeDefined();
      expect(found.brand).toBe('Toyota');
    });

    test('Debe encontrar vehículos disponibles', async () => {
      await Vehicle.create(validVehicleData);
      await Vehicle.create({ ...validVehicleData, vin: '2HGBH41JXMN109187', status: 'sold' });
      
      const available = await Vehicle.find({ status: 'available' });
      
      expect(available.length).toBe(1);
      expect(available[0].status).toBe('available');
    });
  });
});
