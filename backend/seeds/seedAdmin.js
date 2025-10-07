import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import connectDB from '../config/db.js';
import User from '../models/User.js';

const seedAdmin = async () => {
  try {
    console.log('\n╔════════════════════════════════════════╗');
    console.log('║   🔐 Creando Usuario Administrador    ║');
    console.log('╚════════════════════════════════════════╝\n');

    // Conectar a la base de datos
    await connectDB();

    // Verificar si ya existe un admin
    const existingAdmin = await User.findOne({ role: 'admin' });
    
    if (existingAdmin) {
      console.log('⚠️  Ya existe un usuario administrador:');
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Nombre: ${existingAdmin.name}`);
      console.log('\n💡 Si deseas recrearlo, elimínalo primero de la base de datos.\n');
      process.exit(0);
    }

    // Hashear contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    // Crear usuario administrador
    const admin = await User.create({
      name: 'Administrador',
      email: 'admin@gammaservice.com',
      password: hashedPassword,
      role: 'admin',
      phone: '+57 300 123 4567',
      address: 'Oficina Principal GAMMA Service',
      isActive: true
    });

    console.log('✅ Usuario administrador creado exitosamente!\n');
    console.log('╔════════════════════════════════════════╗');
    console.log('║       📋 CREDENCIALES DE ACCESO       ║');
    console.log('╠════════════════════════════════════════╣');
    console.log('║ Email:    admin@gammaservice.com       ║');
    console.log('║ Password: admin123                     ║');
    console.log('║ Rol:      Administrador                ║');
    console.log('╚════════════════════════════════════════╝\n');

    console.log('🎉 ¡Ahora puedes iniciar sesión en el sistema!\n');
    console.log('📝 Otros usuarios de prueba:\n');
    console.log('   Vendedor:');
    console.log('   - Email: vendedor@gammaservice.com');
    console.log('   - Password: vendedor123\n');
    console.log('   Cliente:');
    console.log('   - Email: cliente@gammaservice.com');
    console.log('   - Password: cliente123\n');
    console.log('   Mecánico:');
    console.log('   - Email: mecanico@gammaservice.com');
    console.log('   - Password: mecanico123\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creando usuario administrador:', error.message);
    process.exit(1);
  }
};

seedAdmin();
