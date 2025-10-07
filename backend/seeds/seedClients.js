import mongoose from 'mongoose';
import Client from '../models/Client.js';
import connectDB from '../config/db.js';

const firstNames = ['Juan', 'María', 'Carlos', 'Ana', 'Luis', 'Laura', 'Pedro', 'Carmen', 'Jorge', 'Lucía', 'Miguel', 'Isabel', 'Roberto', 'Patricia', 'José', 'Elena', 'Francisco', 'Sofía', 'Antonio', 'Mónica', 'Manuel', 'Andrea', 'David', 'Daniela', 'Ricardo', 'Valentina', 'Fernando', 'Gabriela', 'Andrés', 'Camila'];
const lastNames = ['García', 'Rodríguez', 'Martínez', 'López', 'González', 'Pérez', 'Sánchez', 'Ramírez', 'Torres', 'Flores', 'Rivera', 'Gómez', 'Díaz', 'Cruz', 'Morales', 'Reyes', 'Jiménez', 'Hernández', 'Ruiz', 'Mendoza'];
const cities = ['Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Cartagena', 'Bucaramanga', 'Pereira', 'Manizales', 'Armenia', 'Ibagué'];
const occupations = ['Ingeniero', 'Médico', 'Abogado', 'Contador', 'Arquitecto', 'Empresario', 'Comerciante', 'Profesor', 'Administrador', 'Consultor'];

const generateClient = (index) => {
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  const city = cities[Math.floor(Math.random() * cities.length)];
  const occupation = occupations[Math.floor(Math.random() * occupations.length)];
  
  const idNumber = '10' + String(Math.floor(Math.random() * 90000000) + 10000000);
  const phone = '3' + String(Math.floor(Math.random() * 900000000) + 100000000);
  // Normalizar nombres para email (remover acentos)
  const normalizeText = (text) => {
    return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  };
  
  const email = `${normalizeText(firstName)}.${normalizeText(lastName)}${index}@email.com`;
  
  const hasPurchases = Math.random() > 0.3; // 70% tienen compras
  const totalPurchases = hasPurchases ? Math.floor(Math.random() * 3) + 1 : 0;
  const totalSpent = totalPurchases * (Math.floor(Math.random() * 100000000) + 50000000);
  
  const income = Math.floor(Math.random() * 15000000) + 3000000;
  const creditScore = Math.floor(Math.random() * 500) + 500;
  
  let creditStatus = 'not_evaluated';
  if (creditScore >= 850) creditStatus = 'excellent';
  else if (creditScore >= 750) creditStatus = 'good';
  else if (creditScore >= 650) creditStatus = 'fair';
  else creditStatus = 'poor';
  
  let category = 'new';
  if (totalSpent > 100000000) category = 'vip';
  else if (totalPurchases > 0) category = 'regular';
  
  let status = 'active';
  if (Math.random() > 0.95) status = 'inactive';
  else if (Math.random() > 0.98) status = 'blocked';
  
  return {
    firstName,
    lastName,
    identificationType: 'CC',
    identificationNumber: idNumber,
    email,
    phone,
    mobile: phone,
    address: {
      street: `Calle ${Math.floor(Math.random() * 200)} # ${Math.floor(Math.random() * 100)}-${Math.floor(Math.random() * 100)}`,
      city,
      state: city === 'Bogotá' ? 'Cundinamarca' : (city === 'Medellín' ? 'Antioquia' : 'Valle del Cauca'),
      country: 'Colombia',
      postalCode: String(Math.floor(Math.random() * 90000) + 10000)
    },
    dateOfBirth: new Date(1960 + Math.floor(Math.random() * 40), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
    gender: Math.random() > 0.5 ? 'male' : 'female',
    occupation,
    income,
    creditScore,
    creditStatus,
    lastCreditCheck: hasPurchases ? new Date(Date.now() - Math.floor(Math.random() * 365) * 24 * 60 * 60 * 1000) : undefined,
    status,
    category,
    preferredContactMethod: ['email', 'phone', 'whatsapp'][Math.floor(Math.random() * 3)],
    totalPurchases,
    totalSpent,
    lastPurchaseDate: hasPurchases ? new Date(Date.now() - Math.floor(Math.random() * 180) * 24 * 60 * 60 * 1000) : undefined
  };
};

const seedClients = async () => {
  try {
    console.log('🌱 Conectando a la base de datos...');
    await connectDB();

    console.log('🗑️  Eliminando clientes existentes...');
    await Client.deleteMany({});

    console.log('👥 Creando 100 clientes...');
    const clients = [];
    for (let i = 0; i < 100; i++) {
      clients.push(generateClient(i + 1));
    }

    const createdClients = await Client.insertMany(clients);

    console.log('✅ Seed completado exitosamente!');
    console.log(`   - ${createdClients.length} clientes creados`);
    console.log('\n📊 Resumen:');
    console.log(`   - Activos: ${clients.filter(c => c.status === 'active').length}`);
    console.log(`   - VIP: ${clients.filter(c => c.category === 'vip').length}`);
    console.log(`   - Regular: ${clients.filter(c => c.category === 'regular').length}`);
    console.log(`   - Nuevos: ${clients.filter(c => c.category === 'new').length}`);
    console.log(`   - Con compras: ${clients.filter(c => c.totalPurchases > 0).length}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error en seed:', error);
    process.exit(1);
  }
};

seedClients();
