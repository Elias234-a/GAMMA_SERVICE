import mongoose from 'mongoose';
import logger from './logger.js';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/gamma_service', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
    });
    
    logger.info(`✅ MongoDB conectado: ${conn.connection.host}`);
    
    // Manejo de eventos de conexión
    mongoose.connection.on('error', (err) => {
      logger.error(`❌ Error de conexión a MongoDB: ${err.message}`);
    });
    
    mongoose.connection.on('disconnected', () => {
      logger.warn('🔌 Desconectado de MongoDB');
    });
    
    // Configuración adicional
    mongoose.set('autoIndex', true);
    
  } catch (err) {
    logger.error(`❌ Error al conectar a MongoDB: ${err.message}`);
    process.exit(1);
  }
};

export default connectDB;
