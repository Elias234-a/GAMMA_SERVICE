import express from 'express';

const router = express.Router();

// Mock clients database
let clients = [
  {
    id: 1,
    nombre: 'Juan Pérez',
    documento: '1234567890',
    email: 'juan.perez@email.com',
    telefono: '3001234567',
    direccion: 'Calle 123 #45-67',
    ciudad: 'Bogotá',
    fechaRegistro: '2024-01-15'
  },
  {
    id: 2,
    nombre: 'María García',
    documento: '9876543210',
    email: 'maria.garcia@email.com',
    telefono: '3107654321',
    direccion: 'Carrera 45 #12-34',
    ciudad: 'Medellín',
    fechaRegistro: '2024-02-20'
  }
];

// Get all clients
router.get('/', (req, res) => {
  const { search, ciudad } = req.query;
  let filteredClients = [...clients];

  if (search) {
    const searchLower = search.toLowerCase();
    filteredClients = filteredClients.filter(c => 
      c.nombre.toLowerCase().includes(searchLower) ||
      c.documento.includes(search) ||
      c.email.toLowerCase().includes(searchLower)
    );
  }

  if (ciudad) {
    filteredClients = filteredClients.filter(c => c.ciudad === ciudad);
  }

  res.json(filteredClients);
});

// Get single client
router.get('/:id', (req, res) => {
  const client = clients.find(c => c.id === parseInt(req.params.id));
  
  if (!client) {
    return res.status(404).json({ error: 'Cliente no encontrado' });
  }
  
  res.json(client);
});

// Create new client
router.post('/', (req, res) => {
  const newClient = {
    id: clients.length > 0 ? Math.max(...clients.map(c => c.id)) + 1 : 1,
    ...req.body,
    fechaRegistro: new Date().toISOString().split('T')[0]
  };
  
  clients.push(newClient);
  res.status(201).json(newClient);
});

// Update client
router.put('/:id', (req, res) => {
  const index = clients.findIndex(c => c.id === parseInt(req.params.id));
  
  if (index === -1) {
    return res.status(404).json({ error: 'Cliente no encontrado' });
  }
  
  clients[index] = { ...clients[index], ...req.body };
  res.json(clients[index]);
});

// Delete client
router.delete('/:id', (req, res) => {
  const index = clients.findIndex(c => c.id === parseInt(req.params.id));
  
  if (index === -1) {
    return res.status(404).json({ error: 'Cliente no encontrado' });
  }
  
  clients.splice(index, 1);
  res.json({ message: 'Cliente eliminado exitosamente' });
});

export default router;
