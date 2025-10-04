import express from 'express';

const router = express.Router();

// Mock vehicles database
let vehicles = [
  {
    id: 1,
    marca: 'Toyota',
    modelo: 'Corolla',
    año: 2023,
    precio: 85000000,
    estado: 'Disponible',
    vin: 'JTD12345678901234',
    color: 'Blanco',
    kilometraje: 0,
    tipo: 'Sedán'
  },
  {
    id: 2,
    marca: 'Mazda',
    modelo: 'CX-5',
    año: 2023,
    precio: 125000000,
    estado: 'Disponible',
    vin: 'JMD23456789012345',
    color: 'Azul',
    kilometraje: 0,
    tipo: 'SUV'
  },
  {
    id: 3,
    marca: 'Chevrolet',
    modelo: 'Spark',
    año: 2022,
    precio: 45000000,
    estado: 'Vendido',
    vin: 'CHV34567890123456',
    color: 'Rojo',
    kilometraje: 5000,
    tipo: 'Hatchback'
  }
];

// Get all vehicles
router.get('/', (req, res) => {
  const { estado, tipo, marca } = req.query;
  let filteredVehicles = [...vehicles];

  if (estado) {
    filteredVehicles = filteredVehicles.filter(v => v.estado === estado);
  }
  if (tipo) {
    filteredVehicles = filteredVehicles.filter(v => v.tipo === tipo);
  }
  if (marca) {
    filteredVehicles = filteredVehicles.filter(v => v.marca.toLowerCase().includes(marca.toLowerCase()));
  }

  res.json(filteredVehicles);
});

// Get single vehicle
router.get('/:id', (req, res) => {
  const vehicle = vehicles.find(v => v.id === parseInt(req.params.id));
  
  if (!vehicle) {
    return res.status(404).json({ error: 'Vehículo no encontrado' });
  }
  
  res.json(vehicle);
});

// Create new vehicle
router.post('/', (req, res) => {
  const newVehicle = {
    id: vehicles.length > 0 ? Math.max(...vehicles.map(v => v.id)) + 1 : 1,
    ...req.body,
    estado: req.body.estado || 'Disponible'
  };
  
  vehicles.push(newVehicle);
  res.status(201).json(newVehicle);
});

// Update vehicle
router.put('/:id', (req, res) => {
  const index = vehicles.findIndex(v => v.id === parseInt(req.params.id));
  
  if (index === -1) {
    return res.status(404).json({ error: 'Vehículo no encontrado' });
  }
  
  vehicles[index] = { ...vehicles[index], ...req.body };
  res.json(vehicles[index]);
});

// Delete vehicle
router.delete('/:id', (req, res) => {
  const index = vehicles.findIndex(v => v.id === parseInt(req.params.id));
  
  if (index === -1) {
    return res.status(404).json({ error: 'Vehículo no encontrado' });
  }
  
  vehicles.splice(index, 1);
  res.json({ message: 'Vehículo eliminado exitosamente' });
});

export default router;
