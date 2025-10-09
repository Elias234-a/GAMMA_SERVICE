/**
 * MongoDB Restore Script
 * Restaura backups de la base de datos MongoDB
 * Soporta restauración desde local o AWS S3
 */

const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const util = require('util');
const readline = require('readline');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const execPromise = util.promisify(exec);

// Configuración
const CONFIG = {
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/gamma_service',
  BACKUP_DIR: path.join(__dirname, '../backups'),
  S3_ENABLED: process.env.BACKUP_S3_ENABLED === 'true',
  S3_BUCKET: process.env.BACKUP_S3_BUCKET || 'gamma-backups',
  S3_REGION: process.env.BACKUP_S3_REGION || 'us-east-1',
  LOG_FILE: path.join(__dirname, '../logs/restore.log'),
};

/**
 * Logger simple
 */
const log = (message, level = 'INFO') => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${level}] ${message}`;
  
  console.log(logMessage);
  
  try {
    const logDir = path.dirname(CONFIG.LOG_FILE);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    fs.appendFileSync(CONFIG.LOG_FILE, logMessage + '\n');
  } catch (error) {
    console.error('Error writing to log file:', error.message);
  }
};

/**
 * Listar backups disponibles localmente
 */
const listLocalBackups = () => {
  if (!fs.existsSync(CONFIG.BACKUP_DIR)) {
    return [];
  }
  
  const files = fs.readdirSync(CONFIG.BACKUP_DIR);
  const backups = files
    .filter(file => {
      const filePath = path.join(CONFIG.BACKUP_DIR, file);
      return fs.statSync(filePath).isDirectory() && file.startsWith('gamma_backup_');
    })
    .map(file => {
      const filePath = path.join(CONFIG.BACKUP_DIR, file);
      const stats = fs.statSync(filePath);
      return {
        name: file,
        path: filePath,
        date: stats.mtime,
        size: getDirectorySizeSync(filePath),
      };
    })
    .sort((a, b) => b.date - a.date); // Más reciente primero
  
  return backups;
};

/**
 * Calcular tamaño de directorio (síncrono)
 */
const getDirectorySizeSync = (dirPath) => {
  let size = 0;
  
  const walk = (dir) => {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stats = fs.statSync(filePath);
      
      if (stats.isDirectory()) {
        walk(filePath);
      } else {
        size += stats.size;
      }
    }
  };
  
  walk(dirPath);
  return size;
};

/**
 * Formatear bytes
 */
const formatBytes = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Preguntar confirmación al usuario
 */
const askConfirmation = (question) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
    });
  });
};

/**
 * Descargar backup desde S3
 */
const downloadFromS3 = async (backupName) => {
  if (!CONFIG.S3_ENABLED) {
    throw new Error('S3 is not enabled');
  }
  
  log(`Downloading backup from S3: ${backupName}`);
  
  try {
    const tarFile = path.join(CONFIG.BACKUP_DIR, `${backupName}.tar.gz`);
    const s3Path = `s3://${CONFIG.S3_BUCKET}/${backupName}.tar.gz`;
    
    // Download desde S3
    await execPromise(`aws s3 cp "${s3Path}" "${tarFile}" --region ${CONFIG.S3_REGION}`);
    log(`Downloaded: ${backupName}.tar.gz`);
    
    // Extraer tar.gz
    await execPromise(`tar -xzf "${tarFile}" -C "${CONFIG.BACKUP_DIR}"`);
    log(`Extracted: ${backupName}`);
    
    // Eliminar archivo tar
    fs.unlinkSync(tarFile);
    
    return path.join(CONFIG.BACKUP_DIR, backupName);
  } catch (error) {
    log(`S3 download failed: ${error.message}`, 'ERROR');
    throw error;
  }
};

/**
 * Restaurar backup con mongorestore
 */
const restoreBackup = async (backupPath, dropBeforeRestore = false) => {
  log(`Starting restore from: ${backupPath}`);
  
  try {
    // Verificar que el backup existe
    if (!fs.existsSync(backupPath)) {
      throw new Error(`Backup not found: ${backupPath}`);
    }
    
    // Construir comando mongorestore
    let command = `mongorestore --uri="${CONFIG.MONGODB_URI}" "${backupPath}"`;
    
    if (dropBeforeRestore) {
      command += ' --drop';
      log('WARNING: --drop flag enabled. Existing data will be deleted!');
    }
    
    // Verificar si el backup está comprimido
    const files = fs.readdirSync(backupPath);
    const hasGzFiles = files.some(file => file.endsWith('.gz'));
    
    if (hasGzFiles) {
      command += ' --gzip';
    }
    
    log(`Executing: mongorestore (URI hidden for security)`);
    
    // Ejecutar mongorestore
    const { stdout, stderr } = await execPromise(command);
    
    if (stderr) {
      log(`Restore output: ${stderr}`, 'INFO');
    }
    
    log('Restore completed successfully');
  } catch (error) {
    log(`Restore failed: ${error.message}`, 'ERROR');
    throw error;
  }
};

/**
 * Función principal
 */
const main = async () => {
  const startTime = Date.now();
  
  log('='.repeat(60));
  log('MongoDB Restore Started');
  log('='.repeat(60));
  
  try {
    // Verificar que mongorestore está disponible
    try {
      await execPromise('mongorestore --version');
    } catch (error) {
      throw new Error('mongorestore not found. Please install MongoDB Database Tools');
    }
    
    // Listar backups disponibles
    const backups = listLocalBackups();
    
    if (backups.length === 0) {
      log('No local backups found', 'WARN');
      
      if (CONFIG.S3_ENABLED) {
        console.log('\nTo restore from S3, provide the backup name as argument:');
        console.log('node restore-mongodb.js gamma_backup_20250109_120000');
      }
      
      process.exit(1);
    }
    
    // Mostrar backups disponibles
    console.log('\nAvailable backups:');
    console.log('-'.repeat(60));
    backups.forEach((backup, index) => {
      console.log(`${index + 1}. ${backup.name}`);
      console.log(`   Date: ${backup.date.toLocaleString()}`);
      console.log(`   Size: ${formatBytes(backup.size)}`);
      console.log();
    });
    
    // Si se proporcionó nombre de backup como argumento
    let selectedBackup;
    if (process.argv[2]) {
      const backupName = process.argv[2];
      selectedBackup = backups.find(b => b.name === backupName);
      
      if (!selectedBackup && CONFIG.S3_ENABLED) {
        // Intentar descargar desde S3
        const backupPath = await downloadFromS3(backupName);
        selectedBackup = { name: backupName, path: backupPath };
      }
      
      if (!selectedBackup) {
        throw new Error(`Backup not found: ${backupName}`);
      }
    } else {
      // Preguntar qué backup restaurar
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });
      
      const answer = await new Promise((resolve) => {
        rl.question('\nSelect backup number to restore (or 0 to cancel): ', resolve);
      });
      
      rl.close();
      
      const selection = parseInt(answer);
      
      if (selection === 0 || isNaN(selection) || selection < 1 || selection > backups.length) {
        log('Restore cancelled by user');
        process.exit(0);
      }
      
      selectedBackup = backups[selection - 1];
    }
    
    // Confirmación final
    console.log(`\nSelected backup: ${selectedBackup.name}`);
    const dropData = await askConfirmation('\nDrop existing data before restore? (y/n): ');
    
    if (dropData) {
      console.log('\n⚠️  WARNING: This will DELETE all existing data!');
      const finalConfirm = await askConfirmation('Are you absolutely sure? Type "yes" to confirm: ');
      
      if (!finalConfirm) {
        log('Restore cancelled by user');
        process.exit(0);
      }
    }
    
    // Realizar restauración
    await restoreBackup(selectedBackup.path, dropData);
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    log('='.repeat(60));
    log(`Restore completed successfully in ${duration}s`);
    log('='.repeat(60));
    
    process.exit(0);
  } catch (error) {
    log('='.repeat(60));
    log(`Restore failed: ${error.message}`, 'ERROR');
    log('='.repeat(60));
    
    process.exit(1);
  }
};

// Ejecutar si se llama directamente
if (require.main === module) {
  main();
}

module.exports = {
  restoreBackup,
  listLocalBackups,
  downloadFromS3,
};
