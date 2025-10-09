import request from 'supertest';
import app from '../../server.js';
import Vehicle from '../../models/Vehicle.js';
import User from '../../models/User.js';
import jwt from 'jsonwebtoken';

describe('Vehicle API Integration Tests', () => {
  let authToken;
  let testUser;

  // Crear usuario de prueba y token antes de los tests
  beforeAll(async () => {
    // Crear usuario administrador
    testUser = await User.create({
      name: 'Test Admin',
      email: 'admin@test.com',
      password: 'Test123!',
      role: 'admin'
    });

    // Generar token JWT
    authToken = jwt.sign(
      { id: testUser._id, email: testUser.email, role: testUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
  });

  const validVehicle = {
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
    fuel: 'gasoline'
  };

  describe('POST /api/vehicles', () => {
    
    test('Debe crear un vehículo con datos válidos', async () => {
      const response = await request(app)
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${authToken}`)
        .send(validVehicle)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.brand).toBe('Toyota');
      expect(response.body.data.vin).toBe('1HGBH41JXMN109186');
    });

    test('Debe rechazar sin autenticación', async () => {
      await request(app)
        .post('/api/vehicles')
        .send(validVehicle)
        .expect(401);
    });

    test('Debe rechazar datos inválidos', async () => {
      const invalidVehicle = { ...validVehicle, brand: '' };
      
      await request(app)
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidVehicle)
        .expect(400);
    });

    test('Debe rechazar VIN duplicado', async () => {
      await Vehicle.create(validVehicle);
      
      await request(app)
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${authToken}`)
        .send(validVehicle)
        .expect(400);
    });
  });

  describe('GET /api/vehicles', () => {
    
    beforeEach(async () => {
      // Limpiar y crear datos de prueba
      await Vehicle.deleteMany({});
      await Vehicle.create([
        { ...validVehicle, vin: '1HGBH41JXMN109186' },
        { ...validVehicle, vin: '2HGBH41JXMN109187', brand: 'Honda', status: 'sold' },
        { ...validVehicle, vin: '3HGBH41JXMN109188', brand: 'Mazda' }
      ]);
    });

    test('Debe obtener todos los vehículos', async () => {
      const response = await request(app)
        .get('/api/vehicles')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(3);
    });

    test('Debe filtrar vehículos por status', async () => {
      const response = await request(app)
        .get('/api/vehicles?status=available')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data.length).toBe(2);
      response.body.data.forEach(vehicle => {
        expect(vehicle.status).toBe('available');
      });
    });

    test('Debe filtrar vehículos por marca', async () => {
      const response = await request(app)
        .get('/api/vehicles?brand=Toyota')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data.length).toBeGreaterThan(0);
      response.body.data.forEach(vehicle => {
        expect(vehicle.brand).toBe('Toyota');
      });
    });
  });

  describe('GET /api/vehicles/:id', () => {
    
    test('Debe obtener un vehículo por ID', async () => {
      const vehicle = await Vehicle.create(validVehicle);
      
      const response = await request(app)
        .get(`/api/vehicles/${vehicle._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data._id).toBe(vehicle._id.toString());
      expect(response.body.data.brand).toBe('Toyota');
    });

    test('Debe retornar 404 para ID inexistente', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      
      await request(app)
        .get(`/api/vehicles/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    test('Debe retornar 400 para ID inválido', async () => {
      await request(app)
        .get('/api/vehicles/invalid-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });
  });

  describe('PUT /api/vehicles/:id', () => {
    
    test('Debe actualizar un vehículo', async () => {
      const vehicle = await Vehicle.create(validVehicle);
      
      const updates = {
        color: 'Negro',
        price: 85000000
      };

      const response = await request(app)
        .put(`/api/vehicles/${vehicle._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updates)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.color).toBe('Negro');
      expect(response.body.data.price).toBe(85000000);
    });

    test('Debe rechazar actualización con datos inválidos', async () => {
      const vehicle = await Vehicle.create(validVehicle);
      
      const invalidUpdates = {
        price: -1000
      };

      await request(app)
        .put(`/api/vehicles/${vehicle._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidUpdates)
        .expect(400);
    });
  });

  describe('DELETE /api/vehicles/:id', () => {
    
    test('Debe eliminar un vehículo (soft delete)', async () => {
      const vehicle = await Vehicle.create(validVehicle);
      
      const response = await request(app)
        .delete(`/api/vehicles/${vehicle._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      
      // Verificar que el vehículo se marcó como eliminado
      const deletedVehicle = await Vehicle.findById(vehicle._id);
      if (deletedVehicle && deletedVehicle.deleted) {
        expect(deletedVehicle.deleted).toBe(true);
      } else {
        // Si no hay soft delete, el vehículo debe ser null
        expect(deletedVehicle).toBeNull();
      }
    });

    test('Debe retornar 404 para ID inexistente', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      
      await request(app)
        .delete(`/api/vehicles/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('Permisos y autorización', () => {
    
    test('Debe rechazar acceso sin token', async () => {
      await request(app)
        .get('/api/vehicles')
        .expect(401);
    });

    test('Debe rechazar token inválido', async () => {
      await request(app)
        .get('/api/vehicles')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });

    test('Debe rechazar token expirado', async () => {
      const expiredToken = jwt.sign(
        { id: testUser._id },
        process.env.JWT_SECRET,
        { expiresIn: '-1h' }
      );

      await request(app)
        .get('/api/vehicles')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);
    });
  });
});
