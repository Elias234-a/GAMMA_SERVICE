import express from 'express';

const router = express.Router();

// Mock sales database
let sales = [
  {
    id: 1,
    vehiculoId: 3,
    clienteId: 1,
    fecha: '2024-03-15',
    precio: 45000000,
    metodoPago: 'Contado',
    estado: 'Completada'
  }
];

// Get all sales
router.get('/', (req, res) => {
  const { estado, fechaInicio, fechaFin } = req.query;
  let filteredSales = [...sales];

  if (estado) {
    filteredSales = filteredSales.filter(s => s.estado === estado);
  }

  if (fechaInicio) {
    filteredSales = filteredSales.filter(s => s.fecha >= fechaInicio);
  }

  if (fechaFin) {
    filteredSales = filteredSales.filter(s => s.fecha <= fechaFin);
  }

  res.json(filteredSales);
});

// Get single sale
router.get('/:id', (req, res) => {
  const sale = sales.find(s => s.id === parseInt(req.params.id));
  
  if (!sale) {
    return res.status(404).json({ error: 'Venta no encontrada' });
  }
  
  res.json(sale);
});

// Create new sale
router.post('/', (req, res) => {
  const newSale = {
    id: sales.length > 0 ? Math.max(...sales.map(s => s.id)) + 1 : 1,
    ...req.body,
    fecha: new Date().toISOString().split('T')[0],
    estado: req.body.estado || 'Pendiente'
  };
  
  sales.push(newSale);
  res.status(201).json(newSale);
});

// Update sale
router.put('/:id', (req, res) => {
  const index = sales.findIndex(s => s.id === parseInt(req.params.id));
  
  if (index === -1) {
    return res.status(404).json({ error: 'Venta no encontrada' });
  }
  
  sales[index] = { ...sales[index], ...req.body };
  res.json(sales[index]);
});

// Delete sale
router.delete('/:id', (req, res) => {
  const index = sales.findIndex(s => s.id === parseInt(req.params.id));
  
  if (index === -1) {
    return res.status(404).json({ error: 'Venta no encontrada' });
  }
  
  sales.splice(index, 1);
  res.json({ message: 'Venta eliminada exitosamente' });
});

export default router;
