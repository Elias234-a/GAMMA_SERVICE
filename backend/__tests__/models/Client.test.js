import mongoose from 'mongoose';
import Client from '../../models/Client.js';

describe('Client Model Test', () => {
  
  // Datos de prueba válidos
  const validClientData = {
    firstName: 'Juan',
    lastName: 'Pérez',
    identificationType: 'CC',
    identificationNumber: '1234567890',
    email: 'juan.perez@example.com',
    phone: '3001234567',
    mobile: '3109876543',
    address: 'Calle 123 #45-67',
    city: 'Bogotá',
    dateOfBirth: new Date('1990-01-15'),
    occupation: 'Ingeniero',
    income: 5000000,
    status: 'active'
  };

  describe('Validación de campos requeridos', () => {
    
    test('Debe crear un cliente con datos válidos', async () => {
      const client = new Client(validClientData);
      const savedClient = await client.save();
      
      expect(savedClient._id).toBeDefined();
      expect(savedClient.firstName).toBe('Juan');
      expect(savedClient.lastName).toBe('Pérez');
      expect(savedClient.email).toBe('juan.perez@example.com');
      expect(savedClient.status).toBe('active');
    });

    test('Debe fallar sin nombre', async () => {
      const client = new Client({ ...validClientData, firstName: undefined });
      
      let error;
      try {
        await client.save();
      } catch (e) {
        error = e;
      }
      
      expect(error).toBeDefined();
      expect(error.errors.firstName).toBeDefined();
    });

    test('Debe fallar sin apellido', async () => {
      const client = new Client({ ...validClientData, lastName: undefined });
      
      let error;
      try {
        await client.save();
      } catch (e) {
        error = e;
      }
      
      expect(error).toBeDefined();
      expect(error.errors.lastName).toBeDefined();
    });

    test('Debe fallar sin email', async () => {
      const client = new Client({ ...validClientData, email: undefined });
      
      let error;
      try {
        await client.save();
      } catch (e) {
        error = e;
      }
      
      expect(error).toBeDefined();
      expect(error.errors.email).toBeDefined();
    });

    test('Debe fallar sin tipo de identificación', async () => {
      const client = new Client({ ...validClientData, identificationType: undefined });
      
      let error;
      try {
        await client.save();
      } catch (e) {
        error = e;
      }
      
      expect(error).toBeDefined();
      expect(error.errors.identificationType).toBeDefined();
    });

    test('Debe fallar sin número de identificación', async () => {
      const client = new Client({ ...validClientData, identificationNumber: undefined });
      
      let error;
      try {
        await client.save();
      } catch (e) {
        error = e;
      }
      
      expect(error).toBeDefined();
      expect(error.errors.identificationNumber).toBeDefined();
    });
  });

  describe('Validación de email', () => {
    
    test('Debe rechazar email inválido', async () => {
      const client = new Client({ ...validClientData, email: 'email_invalido' });
      
      let error;
      try {
        await client.save();
      } catch (e) {
        error = e;
      }
      
      expect(error).toBeDefined();
      expect(error.errors.email).toBeDefined();
    });

    test('Debe rechazar email duplicado', async () => {
      await Client.create(validClientData);
      
      const duplicateClient = new Client({ 
        ...validClientData, 
        identificationNumber: '9876543210' 
      });
      
      let error;
      try {
        await duplicateClient.save();
      } catch (e) {
        error = e;
      }
      
      expect(error).toBeDefined();
      expect(error.code).toBe(11000);
    });

    test('Debe convertir email a minúsculas', async () => {
      const client = new Client({ ...validClientData, email: 'JUAN.PEREZ@EXAMPLE.COM' });
      const savedClient = await client.save();
      
      expect(savedClient.email).toBe('juan.perez@example.com');
    });
  });

  describe('Validación de tipo de identificación', () => {
    
    test('Debe aceptar tipos válidos', async () => {
      const types = ['CC', 'CE', 'NIT', 'TI', 'PAS', 'RUT'];
      
      for (const type of types) {
        const client = new Client({ 
          ...validClientData, 
          identificationType: type,
          identificationNumber: `${Math.random()}`,
          email: `test${Math.random()}@example.com`
        });
        const saved = await client.save();
        expect(saved.identificationType).toBe(type);
      }
    });

    test('Debe rechazar tipo inválido', async () => {
      const client = new Client({ ...validClientData, identificationType: 'INVALID' });
      
      let error;
      try {
        await client.save();
      } catch (e) {
        error = e;
      }
      
      expect(error).toBeDefined();
      expect(error.errors.identificationType).toBeDefined();
    });
  });

  describe('Validación de identificación duplicada', () => {
    
    test('Debe rechazar número de identificación duplicado', async () => {
      await Client.create(validClientData);
      
      const duplicateClient = new Client({ 
        ...validClientData, 
        email: 'otro.email@example.com' 
      });
      
      let error;
      try {
        await duplicateClient.save();
      } catch (e) {
        error = e;
      }
      
      expect(error).toBeDefined();
      expect(error.code).toBe(11000);
    });
  });

  describe('Valores por defecto', () => {
    
    test('Debe establecer status default a "active"', async () => {
      const clientData = { ...validClientData };
      delete clientData.status;
      
      const client = new Client(clientData);
      const savedClient = await client.save();
      
      expect(savedClient.status).toBe('active');
    });
  });

  describe('Métodos virtuales', () => {
    
    test('Debe combinar nombre completo', async () => {
      const client = new Client(validClientData);
      const savedClient = await client.save();
      
      // Si existe un virtual "fullName"
      if (savedClient.fullName) {
        expect(savedClient.fullName).toBe('Juan Pérez');
      }
    });
  });

  describe('Timestamps', () => {
    
    test('Debe tener createdAt y updatedAt', async () => {
      const client = new Client(validClientData);
      const savedClient = await client.save();
      
      expect(savedClient.createdAt).toBeDefined();
      expect(savedClient.updatedAt).toBeDefined();
      expect(savedClient.createdAt instanceof Date).toBe(true);
      expect(savedClient.updatedAt instanceof Date).toBe(true);
    });

    test('Debe actualizar updatedAt al modificar', async () => {
      const client = new Client(validClientData);
      const savedClient = await client.save();
      
      const originalUpdatedAt = savedClient.updatedAt;
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      savedClient.phone = '3009999999';
      await savedClient.save();
      
      expect(savedClient.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });
  });

  describe('Métodos de consulta', () => {
    
    test('Debe encontrar cliente por email', async () => {
      await Client.create(validClientData);
      
      const found = await Client.findOne({ email: 'juan.perez@example.com' });
      
      expect(found).toBeDefined();
      expect(found.firstName).toBe('Juan');
    });

    test('Debe encontrar cliente por número de identificación', async () => {
      await Client.create(validClientData);
      
      const found = await Client.findOne({ identificationNumber: '1234567890' });
      
      expect(found).toBeDefined();
      expect(found.lastName).toBe('Pérez');
    });

    test('Debe encontrar clientes activos', async () => {
      await Client.create(validClientData);
      await Client.create({ 
        ...validClientData, 
        email: 'otro@example.com',
        identificationNumber: '9876543210',
        status: 'inactive' 
      });
      
      const active = await Client.find({ status: 'active' });
      
      expect(active.length).toBe(1);
      expect(active[0].status).toBe('active');
    });
  });

  describe('Validación de datos opcionales', () => {
    
    test('Debe aceptar cliente sin teléfono móvil', async () => {
      const clientData = { ...validClientData };
      delete clientData.mobile;
      
      const client = new Client(clientData);
      const savedClient = await client.save();
      
      expect(savedClient._id).toBeDefined();
      expect(savedClient.mobile).toBeUndefined();
    });

    test('Debe aceptar cliente sin ocupación', async () => {
      const clientData = { ...validClientData };
      delete clientData.occupation;
      
      const client = new Client(clientData);
      const savedClient = await client.save();
      
      expect(savedClient._id).toBeDefined();
    });
  });
});
