/**
 * MongoDB Backup Script
 * Realiza backups automáticos de la base de datos MongoDB
 * Soporta almacenamiento local y upload a AWS S3
 */

const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const util = require('util');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const execPromise = util.promisify(exec);

// Configuración
const CONFIG = {
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/gamma_service',
  BACKUP_DIR: path.join(__dirname, '../backups'),
  RETENTION_DAYS: parseInt(process.env.BACKUP_RETENTION_DAYS) || 30,
  S3_ENABLED: process.env.BACKUP_S3_ENABLED === 'true',
  S3_BUCKET: process.env.BACKUP_S3_BUCKET || 'gamma-backups',
  S3_REGION: process.env.BACKUP_S3_REGION || 'us-east-1',
  COMPRESS: true,
  LOG_FILE: path.join(__dirname, '../logs/backup.log'),
};

/**
 * Logger simple
 */
const log = (message, level = 'INFO') => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${level}] ${message}`;
  
  console.log(logMessage);
  
  // Append to log file
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
 * Crear directorio de backups si no existe
 */
const ensureBackupDir = () => {
  if (!fs.existsSync(CONFIG.BACKUP_DIR)) {
    fs.mkdirSync(CONFIG.BACKUP_DIR, { recursive: true });
    log(`Created backup directory: ${CONFIG.BACKUP_DIR}`);
  }
};

/**
 * Generar nombre de backup con timestamp
 */
const getBackupName = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hour = String(now.getHours()).padStart(2, '0');
  const minute = String(now.getMinutes()).padStart(2, '0');
  const second = String(now.getSeconds()).padStart(2, '0');
  
  return `gamma_backup_${year}${month}${day}_${hour}${minute}${second}`;
};

/**
 * Realizar backup con mongodump
 */
const performBackup = async () => {
  const backupName = getBackupName();
  const backupPath = path.join(CONFIG.BACKUP_DIR, backupName);
  
  log(`Starting backup: ${backupName}`);
  
  try {
    // Construir comando mongodump
    let command = `mongodump --uri="${CONFIG.MONGODB_URI}" --out="${backupPath}"`;
    
    if (CONFIG.COMPRESS) {
      command += ' --gzip';
    }
    
    log(`Executing: mongodump (URI hidden for security)`);
    
    // Ejecutar mongodump
    const { stdout, stderr } = await execPromise(command);
    
    if (stderr && !stderr.includes('done dumping')) {
      log(`Backup warning: ${stderr}`, 'WARN');
    }
    
    // Verificar que el backup se creó
    if (!fs.existsSync(backupPath)) {
      throw new Error('Backup directory not created');
    }
    
    // Calcular tamaño del backup
    const backupSize = await getDirectorySize(backupPath);
    log(`Backup completed successfully: ${backupName} (${formatBytes(backupSize)})`);
    
    return { backupName, backupPath, backupSize };
  } catch (error) {
    log(`Backup failed: ${error.message}`, 'ERROR');
    throw error;
  }
};

/**
 * Calcular tamaño de directorio
 */
const getDirectorySize = async (dirPath) => {
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
 * Formatear bytes a formato legible
 */
const formatBytes = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Upload backup a AWS S3
 */
const uploadToS3 = async (backupPath, backupName) => {
  if (!CONFIG.S3_ENABLED) {
    log('S3 upload disabled, skipping');
    return;
  }
  
  log(`Uploading backup to S3: ${CONFIG.S3_BUCKET}`);
  
  try {
    // Crear archivo tar.gz del backup
    const tarFile = `${backupPath}.tar.gz`;
    await execPromise(`tar -czf "${tarFile}" -C "${CONFIG.BACKUP_DIR}" "${backupName}"`);
    
    log(`Created tar.gz: ${path.basename(tarFile)}`);
    
    // Upload a S3 usando AWS CLI
    const s3Path = `s3://${CONFIG.S3_BUCKET}/${backupName}.tar.gz`;
    await execPromise(`aws s3 cp "${tarFile}" "${s3Path}" --region ${CONFIG.S3_REGION}`);
    
    log(`Successfully uploaded to S3: ${s3Path}`);
    
    // Eliminar archivo tar local
    fs.unlinkSync(tarFile);
    log(`Removed local tar file: ${path.basename(tarFile)}`);
  } catch (error) {
    log(`S3 upload failed: ${error.message}`, 'ERROR');
    log('Backup will be kept locally only', 'WARN');
  }
};

/**
 * Limpiar backups antiguos
 */
const cleanOldBackups = () => {
  log(`Cleaning backups older than ${CONFIG.RETENTION_DAYS} days`);
  
  try {
    const now = Date.now();
    const retentionMs = CONFIG.RETENTION_DAYS * 24 * 60 * 60 * 1000;
    
    const files = fs.readdirSync(CONFIG.BACKUP_DIR);
    let deletedCount = 0;
    let freedSpace = 0;
    
    for (const file of files) {
      const filePath = path.join(CONFIG.BACKUP_DIR, file);
      const stats = fs.statSync(filePath);
      
      // Verificar edad del backup
      if (now - stats.mtimeMs > retentionMs) {
        const size = stats.isDirectory() 
          ? getDirectorySizeSync(filePath) 
          : stats.size;
        
        // Eliminar backup antiguo
        if (stats.isDirectory()) {
          fs.rmSync(filePath, { recursive: true, force: true });
        } else {
          fs.unlinkSync(filePath);
        }
        
        deletedCount++;
        freedSpace += size;
        log(`Deleted old backup: ${file}`);
      }
    }
    
    if (deletedCount > 0) {
      log(`Cleanup completed: ${deletedCount} backups deleted, ${formatBytes(freedSpace)} freed`);
    } else {
      log('No old backups to clean');
    }
  } catch (error) {
    log(`Cleanup failed: ${error.message}`, 'ERROR');
  }
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
 * Enviar notificación de backup (email, webhook, etc.)
 */
const sendNotification = async (success, backupName, error = null) => {
  // TODO: Implementar notificaciones
  // Opciones:
  // - Email via Nodemailer
  // - Slack webhook
  // - Discord webhook
  // - SMS via Twilio
  
  const status = success ? 'SUCCESS' : 'FAILED';
  log(`Notification: Backup ${status} - ${backupName}${error ? `: ${error}` : ''}`);
};

/**
 * Función principal
 */
const main = async () => {
  const startTime = Date.now();
  
  log('='.repeat(60));
  log('MongoDB Backup Started');
  log('='.repeat(60));
  
  try {
    // Verificar que mongodump está disponible
    try {
      await execPromise('mongodump --version');
    } catch (error) {
      throw new Error('mongodump not found. Please install MongoDB Database Tools: https://www.mongodb.com/try/download/database-tools');
    }
    
    // Crear directorio de backups
    ensureBackupDir();
    
    // Realizar backup
    const { backupName, backupPath, backupSize } = await performBackup();
    
    // Upload a S3 (si está habilitado)
    await uploadToS3(backupPath, backupName);
    
    // Limpiar backups antiguos
    cleanOldBackups();
    
    // Calcular tiempo total
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    log('='.repeat(60));
    log(`Backup completed successfully in ${duration}s`);
    log('='.repeat(60));
    
    // Enviar notificación de éxito
    await sendNotification(true, backupName);
    
    process.exit(0);
  } catch (error) {
    log('='.repeat(60));
    log(`Backup failed: ${error.message}`, 'ERROR');
    log('='.repeat(60));
    
    // Enviar notificación de error
    await sendNotification(false, 'N/A', error.message);
    
    process.exit(1);
  }
};

// Ejecutar si se llama directamente
if (require.main === module) {
  main();
}

module.exports = {
  performBackup,
  cleanOldBackups,
  uploadToS3,
};
