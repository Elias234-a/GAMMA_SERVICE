import mongoose from 'mongoose';
import connectDB from '../config/db.js';

const cleanDatabase = async () => {
  try {
    console.log('🧹 Conectando a la base de datos...');
    await connectDB();

    console.log('🗑️  Limpiando base de datos completa...');
    
    // Obtener todas las colecciones
    const collections = await mongoose.connection.db.collections();
    
    console.log(`   Encontradas ${collections.length} colecciones`);
    
    // Eliminar todas las colecciones excepto las de sistema
    for (const collection of collections) {
      if (!collection.collectionName.startsWith('system.')) {
        await collection.drop();
        console.log(`   ✓ Colección ${collection.collectionName} eliminada`);
      }
    }

    console.log('\n✅ Base de datos limpiada exitosamente!');
    console.log('   Ahora puedes ejecutar: npm run seed\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error limpiando base de datos:', error.message);
    process.exit(1);
  }
};

cleanDatabase();
