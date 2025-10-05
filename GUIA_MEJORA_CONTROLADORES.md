# 🔧 Guía para Mejorar Controladores Backend

## 📋 Controladores Actuales

### ✅ Completamente Implementados
- **userController.js** - Autenticación y usuarios
- **notificationController.js** - Sistema de notificaciones
- **orderController.js** - Gestión de órdenes (1193 líneas, muy robusto)

### ⚠️ Básicos pero Funcionales (Pueden Mejorarse)
- **technicianController.js** - Gestión de técnicos
- **dianController.js** - Integración con DIAN
- **datacreditoController.js** - Consultas a Datacrédito
- **transitoController.js** - Gestión de tránsito

---

## 🎯 Patrón de Mejora Recomendado

### Estructura Estándar de un Controlador Robusto

```javascript
import Model from '../models/Model.js';
import { validationResult } from 'express-validator';
import logger from '../config/logger.js';
import { createNotification } from '../utils/notifications.js';
import mongoose from 'mongoose';

/**
 * Crear un nuevo registro
 * @route POST /api/resource
 * @access private
 */
export const create = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    // 1. Validar entrada
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    // 2. Verificar permisos
    if (req.user.role !== 'admin' && req.user.role !== 'allowed_role') {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({
        success: false,
        message: 'No autorizado'
      });
    }

    // 3. Crear registro
    const data = {
      ...req.body,
      createdBy: req.user._id
    };

    const record = new Model(data);
    await record.save({ session });

    // 4. Crear notificación
    await createNotification(
      req.user._id,
      'success',
      'Registro Creado',
      `El registro ha sido creado exitosamente`,
      { recordId: record._id }
    );

    // 5. Commit y respuesta
    await session.commitTransaction();
    session.endSession();

    logger.info(`Record created: ${record._id} by user ${req.user._id}`);

    res.status(201).json({
      success: true,
      data: record,
      message: 'Registro creado exitosamente'
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    logger.error('Error creating record:', error);
    next(error);
  }
};

/**
 * Obtener todos los registros con filtros
 * @route GET /api/resource
 * @access private
 */
export const getAll = async (req, res, next) => {
  try {
    const {
      search,
      status,
      startDate,
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 10
    } = req.query;

    // 1. Construir query
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (status) {
      query.status = status;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    // 2. Filtrar por rol
    if (req.user.role !== 'admin') {
      query.createdBy = req.user._id;
    }

    // 3. Ejecutar query con paginación
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const [records, count] = await Promise.all([
      Model.find(query)
        .populate('createdBy', 'name email')
        .sort(sort)
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit))
        .lean(),
      Model.countDocuments(query)
    ]);

    // 4. Respuesta con paginación
    res.status(200).json({
      success: true,
      data: records,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / parseInt(limit))
      }
    });

  } catch (error) {
    logger.error('Error getting records:', error);
    next(error);
  }
};

/**
 * Obtener un registro por ID
 * @route GET /api/resource/:id
 * @access private
 */
export const getById = async (req, res, next) => {
  try {
    const record = await Model.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .lean();

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Registro no encontrado'
      });
    }

    // Verificar permisos
    if (req.user.role !== 'admin' && 
        record.createdBy._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'No autorizado para ver este registro'
      });
    }

    res.status(200).json({
      success: true,
      data: record
    });

  } catch (error) {
    logger.error(`Error getting record ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Actualizar un registro
 * @route PUT /api/resource/:id
 * @access private
 */
export const update = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const record = await Model.findById(req.params.id).session(session);

    if (!record) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: 'Registro no encontrado'
      });
    }

    // Verificar permisos
    if (req.user.role !== 'admin' && 
        record.createdBy.toString() !== req.user._id.toString()) {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({
        success: false,
        message: 'No autorizado para actualizar este registro'
      });
    }

    // Actualizar campos permitidos
    const allowedUpdates = ['name', 'description', 'status'];
    const updates = req.body;

    allowedUpdates.forEach(field => {
      if (updates[field] !== undefined) {
        record[field] = updates[field];
      }
    });

    record.updatedBy = req.user._id;
    record.updatedAt = new Date();

    await record.save({ session });
    await session.commitTransaction();
    session.endSession();

    logger.info(`Record ${record._id} updated by user ${req.user._id}`);

    res.status(200).json({
      success: true,
      data: record,
      message: 'Registro actualizado exitosamente'
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    logger.error('Error updating record:', error);
    next(error);
  }
};

/**
 * Eliminar un registro (soft delete)
 * @route DELETE /api/resource/:id
 * @access private/admin
 */
export const deleteRecord = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const record = await Model.findById(req.params.id).session(session);

    if (!record) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: 'Registro no encontrado'
      });
    }

    // Soft delete
    record.deleted = true;
    record.deletedAt = new Date();
    record.deletedBy = req.user._id;

    await record.save({ session });
    await session.commitTransaction();
    session.endSession();

    logger.info(`Record ${record._id} soft-deleted by user ${req.user._id}`);

    res.status(200).json({
      success: true,
      message: 'Registro eliminado correctamente'
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    logger.error('Error deleting record:', error);
    next(error);
  }
};
```

---

## 🔧 Mejoras Específicas por Controlador

### 1. technicianController.js

**Mejoras Recomendadas:**

```javascript
// Agregar validación de disponibilidad
export const checkAvailability = async (req, res, next) => {
  try {
    const { technicianId, date, duration } = req.query;
    
    const technician = await Technician.findById(technicianId);
    if (!technician) {
      return res.status(404).json({
        success: false,
        message: 'Técnico no encontrado'
      });
    }

    const isAvailable = await technician.isAvailableForJob(
      new Date(date),
      parseInt(duration)
    );

    res.status(200).json({
      success: true,
      available: isAvailable,
      technician: {
        id: technician._id,
        name: technician.name,
        specialty: technician.specialty
      }
    });

  } catch (error) {
    next(error);
  }
};

// Agregar estadísticas de técnico
export const getTechnicianStats = async (req, res, next) => {
  try {
    const { technicianId } = req.params;
    const { startDate, endDate } = req.query;

    const stats = await Order.aggregate([
      {
        $match: {
          technician: mongoose.Types.ObjectId(technicianId),
          createdAt: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
          }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalRevenue: { $sum: '$total' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: stats
    });

  } catch (error) {
    next(error);
  }
};
```

### 2. dianController.js

**Mejoras Recomendadas:**

```javascript
// Validar RUT
export const validateRUT = async (req, res, next) => {
  try {
    const { nit } = req.body;

    // Validación básica de formato
    if (!/^\d{9,10}-\d$/.test(nit)) {
      return res.status(400).json({
        success: false,
        message: 'Formato de NIT inválido'
      });
    }

    // Aquí iría la integración real con DIAN
    // Por ahora, simulamos la respuesta
    const isValid = true; // Simular validación

    res.status(200).json({
      success: true,
      valid: isValid,
      nit,
      message: isValid ? 'NIT válido' : 'NIT inválido'
    });

  } catch (error) {
    next(error);
  }
};

// Generar factura electrónica
export const generateInvoice = async (req, res, next) => {
  try {
    const { orderId, invoiceData } = req.body;

    // Validar que la orden existe
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Orden no encontrada'
      });
    }

    // Crear registro de factura
    const invoice = new Dian({
      order: orderId,
      ...invoiceData,
      status: 'pending',
      createdBy: req.user._id
    });

    await invoice.save();

    // Aquí iría la integración real con DIAN
    // Por ahora, simulamos el envío
    invoice.status = 'sent';
    invoice.cufe = `CUFE-${Date.now()}`; // Simular CUFE
    await invoice.save();

    res.status(201).json({
      success: true,
      data: invoice,
      message: 'Factura generada exitosamente'
    });

  } catch (error) {
    next(error);
  }
};
```

### 3. datacreditoController.js

**Mejoras Recomendadas:**

```javascript
// Consultar historial crediticio
export const checkCreditHistory = async (req, res, next) => {
  try {
    const { identification, identificationType } = req.body;

    // Validar datos
    if (!identification || !identificationType) {
      return res.status(400).json({
        success: false,
        message: 'Identificación y tipo son requeridos'
      });
    }

    // Crear registro de consulta
    const query = new Datacredito({
      identification,
      identificationType,
      queriedBy: req.user._id,
      status: 'pending'
    });

    await query.save();

    // Aquí iría la integración real con Datacrédito
    // Por ahora, simulamos la respuesta
    const creditScore = Math.floor(Math.random() * (850 - 300) + 300);
    
    query.status = 'completed';
    query.score = creditScore;
    query.risk = creditScore > 700 ? 'low' : creditScore > 500 ? 'medium' : 'high';
    query.completedAt = new Date();

    await query.save();

    res.status(200).json({
      success: true,
      data: {
        score: creditScore,
        risk: query.risk,
        identification,
        queriedAt: query.createdAt
      }
    });

  } catch (error) {
    next(error);
  }
};

// Obtener historial de consultas
export const getQueryHistory = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const [queries, count] = await Promise.all([
      Datacredito.find({ queriedBy: req.user._id })
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit))
        .lean(),
      Datacredito.countDocuments({ queriedBy: req.user._id })
    ]);

    res.status(200).json({
      success: true,
      data: queries,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / parseInt(limit))
      }
    });

  } catch (error) {
    next(error);
  }
};
```

### 4. transitoController.js

**Mejoras Recomendadas:**

```javascript
// Consultar placa
export const queryPlate = async (req, res, next) => {
  try {
    const { plate } = req.params;

    // Validar formato de placa
    if (!/^[A-Z]{3}\d{3}$/.test(plate)) {
      return res.status(400).json({
        success: false,
        message: 'Formato de placa inválido (debe ser ABC123)'
      });
    }

    // Crear registro de consulta
    const query = new Transito({
      plate,
      queryType: 'plate_info',
      queriedBy: req.user._id,
      status: 'pending'
    });

    await query.save();

    // Aquí iría la integración real con RUNT/Tránsito
    // Por ahora, simulamos la respuesta
    const vehicleInfo = {
      plate,
      brand: 'Toyota',
      model: 'Corolla',
      year: 2020,
      color: 'Blanco',
      owner: 'Juan Pérez',
      status: 'active',
      hasDebts: false
    };

    query.status = 'completed';
    query.result = vehicleInfo;
    query.completedAt = new Date();

    await query.save();

    res.status(200).json({
      success: true,
      data: vehicleInfo
    });

  } catch (error) {
    next(error);
  }
};

// Consultar multas
export const checkFines = async (req, res, next) => {
  try {
    const { plate } = req.params;

    const query = new Transito({
      plate,
      queryType: 'fines',
      queriedBy: req.user._id,
      status: 'pending'
    });

    await query.save();

    // Simular consulta de multas
    const fines = [
      {
        code: 'C01',
        description: 'Exceso de velocidad',
        amount: 234000,
        date: '2024-01-15',
        status: 'pending'
      }
    ];

    query.status = 'completed';
    query.result = { fines, total: fines.length };
    query.completedAt = new Date();

    await query.save();

    res.status(200).json({
      success: true,
      data: {
        plate,
        fines,
        totalFines: fines.length,
        totalAmount: fines.reduce((sum, f) => sum + f.amount, 0)
      }
    });

  } catch (error) {
    next(error);
  }
};
```

---

## 📝 Checklist de Mejoras

### Para Cada Controlador

- [ ] **Validaciones completas**
  - Validar entrada con express-validator
  - Verificar permisos por rol
  - Validar formato de datos

- [ ] **Transacciones**
  - Usar sesiones de MongoDB
  - Commit/rollback apropiado
  - Manejo de errores en transacciones

- [ ] **Logging**
  - Registrar operaciones importantes
  - Incluir información de usuario
  - Niveles apropiados (info, warn, error)

- [ ] **Notificaciones**
  - Crear notificaciones para usuarios
  - Notificar cambios importantes
  - Incluir metadata relevante

- [ ] **Paginación**
  - Implementar en listados
  - Límites razonables
  - Metadata de paginación

- [ ] **Filtros y Búsqueda**
  - Búsqueda por texto
  - Filtros por fecha
  - Filtros por estado
  - Ordenamiento

- [ ] **Soft Delete**
  - No eliminar físicamente
  - Marcar como eliminado
  - Registrar quién y cuándo

- [ ] **Audit Trail**
  - Registrar cambios
  - Guardar valores anteriores
  - Timestamp de operaciones

- [ ] **Manejo de Errores**
  - Try-catch en todas las funciones
  - Mensajes descriptivos
  - Códigos HTTP apropiados
  - Pasar al middleware de errores

- [ ] **Documentación**
  - Comentarios JSDoc
  - Descripción de parámetros
  - Ejemplos de uso
  - Swagger/OpenAPI

---

## 🚀 Prioridades de Mejora

### Alta Prioridad
1. **Validaciones**: Asegurar que los datos sean correctos
2. **Permisos**: Verificar autorización en cada operación
3. **Logging**: Registrar operaciones importantes
4. **Manejo de errores**: Respuestas apropiadas

### Media Prioridad
1. **Transacciones**: Para operaciones críticas
2. **Notificaciones**: Informar a usuarios
3. **Paginación**: Para listados grandes
4. **Filtros**: Mejorar búsqueda

### Baja Prioridad
1. **Audit trail**: Historial detallado
2. **Estadísticas**: Reportes avanzados
3. **Cache**: Optimización de performance
4. **Webhooks**: Integraciones externas

---

## 💡 Consejos Finales

1. **Usa el orderController.js como referencia**: Es el más completo y robusto
2. **Implementa mejoras incrementalmente**: No intentes hacerlo todo a la vez
3. **Prueba cada mejora**: Asegúrate de que funciona antes de continuar
4. **Documenta los cambios**: Actualiza el CHANGELOG.md
5. **Mantén consistencia**: Usa el mismo patrón en todos los controladores

---

**Última actualización**: 2025-10-04  
**Versión**: 1.0.0
