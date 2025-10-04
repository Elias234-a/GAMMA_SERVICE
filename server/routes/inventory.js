import express from 'express';

const router = express.Router();

// Mock inventory items database
let inventory = [
  {
    id: 1,
    nombre: 'Aceite Motor 5W-30',
    categoria: 'Lubricantes',
    cantidad: 150,
    precioUnitario: 35000,
    ubicacion: 'Bodega A-1',
    proveedor: 'Mobil'
  },
  {
    id: 2,
    nombre: 'Filtro de Aire',
    categoria: 'Filtros',
    cantidad: 75,
    precioUnitario: 25000,
    ubicacion: 'Bodega B-2',
    proveedor: 'Mann Filter'
  },
  {
    id: 3,
    nombre: 'Pastillas de Freno',
    categoria: 'Sistema de Frenos',
    cantidad: 50,
    precioUnitario: 120000,
    ubicacion: 'Bodega C-1',
    proveedor: 'Brembo'
  }
];

// Get all inventory items
router.get('/', (req, res) => {
  const { categoria, search } = req.query;
  let filteredInventory = [...inventory];

  if (categoria) {
    filteredInventory = filteredInventory.filter(i => i.categoria === categoria);
  }

  if (search) {
    const searchLower = search.toLowerCase();
    filteredInventory = filteredInventory.filter(i => 
      i.nombre.toLowerCase().includes(searchLower) ||
      i.proveedor.toLowerCase().includes(searchLower)
    );
  }

  res.json(filteredInventory);
});

// Get single inventory item
router.get('/:id', (req, res) => {
  const item = inventory.find(i => i.id === parseInt(req.params.id));
  
  if (!item) {
    return res.status(404).json({ error: 'Item no encontrado' });
  }
  
  res.json(item);
});

// Create new inventory item
router.post('/', (req, res) => {
  const newItem = {
    id: inventory.length > 0 ? Math.max(...inventory.map(i => i.id)) + 1 : 1,
    ...req.body
  };
  
  inventory.push(newItem);
  res.status(201).json(newItem);
});

// Update inventory item
router.put('/:id', (req, res) => {
  const index = inventory.findIndex(i => i.id === parseInt(req.params.id));
  
  if (index === -1) {
    return res.status(404).json({ error: 'Item no encontrado' });
  }
  
  inventory[index] = { ...inventory[index], ...req.body };
  res.json(inventory[index]);
});

// Delete inventory item
router.delete('/:id', (req, res) => {
  const index = inventory.findIndex(i => i.id === parseInt(req.params.id));
  
  if (index === -1) {
    return res.status(404).json({ error: 'Item no encontrado' });
  }
  
  inventory.splice(index, 1);
  res.json({ message: 'Item eliminado exitosamente' });
});

export default router;
