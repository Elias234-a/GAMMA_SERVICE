import mongoose from 'mongoose';
import User from './models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const seedUsers = async () => {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/gamma_service');
    console.log('✅ Conectado a MongoDB');

    // Eliminar usuarios existentes (opcional - comentar si no quieres eliminar)
    // await User.deleteMany({});
    // console.log('🗑️  Usuarios anteriores eliminados');

    // Usuarios de prueba
    const testUsers = [
      {
        name: 'Administrador',
        email: 'admin@gammaservice.com',
        password: 'admin123',
        role: 'Administrador',
        phone: '+57 300 123 4567',
        address: 'Calle 123 #45-67, Bogotá'
      },
      {
        name: 'Vendedor Principal',
        email: 'vendedor@gammaservice.com',
        password: 'vendedor123',
        role: 'Vendedor',
        phone: '+57 301 234 5678',
        address: 'Carrera 45 #23-45, Medellín'
      },
      {
        name: 'Cliente Demo',
        email: 'cliente@gammaservice.com',
        password: 'cliente123',
        role: 'Cliente',
        phone: '+57 302 345 6789',
        address: 'Avenida 67 #89-12, Cali'
      },
      {
        name: 'Mecánico Principal',
        email: 'mecanico@gammaservice.com',
        password: 'mecanico123',
        role: 'Mecánico',
        phone: '+57 303 456 7890',
        address: 'Calle 89 #12-34, Barranquilla'
      }
    ];

    // Insertar usuarios
    for (const userData of testUsers) {
      // Verificar si el usuario ya existe
      const existingUser = await User.findOne({ email: userData.email });
      
      if (existingUser) {
        console.log(`ℹ️  Usuario ya existe: ${userData.email}`);
        continue;
      }

      const user = new User(userData);
      await user.save();
      console.log(`✅ Usuario creado: ${userData.email} - ${userData.role}`);
    }

    console.log('\n🎉 Proceso completado!');
    console.log('\n📝 Credenciales de prueba:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Administrador:');
    console.log('  Email: admin@gammaservice.com');
    console.log('  Password: admin123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Vendedor:');
    console.log('  Email: vendedor@gammaservice.com');
    console.log('  Password: vendedor123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Cliente:');
    console.log('  Email: cliente@gammaservice.com');
    console.log('  Password: cliente123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Mecánico:');
    console.log('  Email: mecanico@gammaservice.com');
    console.log('  Password: mecanico123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

seedUsers();
