import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  generateSalesReport,
  generateInventoryReport,
  generateClientsReport,
  generateFinancialReport,
  generateInvoice,
  getDashboardData
} from '../controllers/reportsController.js';

const router = express.Router();

// Proteger todas las rutas
router.use(protect);

/**
 * @route   GET /api/reports/dashboard
 * @desc    Obtener datos para dashboard
 * @access  Private
 */
router.get('/dashboard', getDashboardData);

/**
 * @route   GET /api/reports/sales
 * @desc    Generar reporte de ventas (PDF o Excel)
 * @query   format=pdf|excel, startDate, endDate
 * @access  Private
 */
router.get('/sales', generateSalesReport);

/**
 * @route   GET /api/reports/inventory
 * @desc    Generar reporte de inventario
 * @query   format=pdf|excel, status
 * @access  Private
 */
router.get('/inventory', generateInventoryReport);

/**
 * @route   GET /api/reports/clients
 * @desc    Generar reporte de clientes
 * @query   format=excel
 * @access  Private
 */
router.get('/clients', generateClientsReport);

/**
 * @route   GET /api/reports/financial
 * @desc    Generar reporte financiero
 * @query   format=excel, startDate, endDate
 * @access  Private
 */
router.get('/financial', generateFinancialReport);

/**
 * @route   POST /api/reports/invoice
 * @desc    Generar factura para una venta
 * @body    { saleId }
 * @access  Private
 */
router.post('/invoice', generateInvoice);

export default router;
