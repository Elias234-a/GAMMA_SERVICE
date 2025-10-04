import express from 'express';

const router = express.Router();

// Mock workshop orders database
let orders = [
  {
    id: 1,
    vehiculoId: 2,
    clienteId: 2,
    descripcion: 'Mantenimiento preventivo de 10,000 km',
    estado: 'En Progreso',
    fechaIngreso: '2024-10-01',
    fechaEstimada: '2024-10-05',
    costo: 350000
  }
];

// Get all workshop orders
router.get('/', (req, res) => {
  const { estado } = req.query;
  let filteredOrders = [...orders];

  if (estado) {
    filteredOrders = filteredOrders.filter(o => o.estado === estado);
  }

  res.json(filteredOrders);
});

// Get single order
router.get('/:id', (req, res) => {
  const order = orders.find(o => o.id === parseInt(req.params.id));
  
  if (!order) {
    return res.status(404).json({ error: 'Orden no encontrada' });
  }
  
  res.json(order);
});

// Create new order
router.post('/', (req, res) => {
  const newOrder = {
    id: orders.length > 0 ? Math.max(...orders.map(o => o.id)) + 1 : 1,
    ...req.body,
    fechaIngreso: new Date().toISOString().split('T')[0],
    estado: req.body.estado || 'Pendiente'
  };
  
  orders.push(newOrder);
  res.status(201).json(newOrder);
});

// Update order
router.put('/:id', (req, res) => {
  const index = orders.findIndex(o => o.id === parseInt(req.params.id));
  
  if (index === -1) {
    return res.status(404).json({ error: 'Orden no encontrada' });
  }
  
  orders[index] = { ...orders[index], ...req.body };
  res.json(orders[index]);
});

// Delete order
router.delete('/:id', (req, res) => {
  const index = orders.findIndex(o => o.id === parseInt(req.params.id));
  
  if (index === -1) {
    return res.status(404).json({ error: 'Orden no encontrada' });
  }
  
  orders.splice(index, 1);
  res.json({ message: 'Orden eliminada exitosamente' });
});

export default router;
