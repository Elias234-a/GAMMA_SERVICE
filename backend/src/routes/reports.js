import express from 'express';

const router = express.Router();

// Mock data for reports
const mockSalesData = [
  { month: 'Enero', sales: 125000000, vehicles: 15 },
  { month: 'Febrero', sales: 98000000, vehicles: 12 },
  { month: 'Marzo', sales: 156000000, vehicles: 18 },
  { month: 'Abril', sales: 134000000, vehicles: 16 },
  { month: 'Mayo', sales: 178000000, vehicles: 21 },
  { month: 'Junio', sales: 145000000, vehicles: 17 }
];

const mockInventoryData = [
  { category: 'Lubricantes', quantity: 150, value: 6750000 },
  { category: 'Filtros', quantity: 75, value: 1875000 },
  { category: 'Repuestos', quantity: 200, value: 12000000 },
  { category: 'Herramientas', quantity: 50, value: 2500000 }
];

const mockWorkshopData = [
  { status: 'Completada', count: 45 },
  { status: 'En Proceso', count: 12 },
  { status: 'Pendiente', count: 8 },
  { status: 'Cancelada', count: 3 }
];

// Get sales report
router.get('/sales', (req, res) => {
  try {
    const { period = 'monthly', startDate = '', endDate = '' } = req.query;
    
    let reportData = mockSalesData;
    
    if (startDate && endDate) {
      // En producción, aquí se filtrarían los datos por fecha
      reportData = mockSalesData;
    }
    
    const totalSales = reportData.reduce((sum, item) => sum + item.sales, 0);
    const totalVehicles = reportData.reduce((sum, item) => sum + item.vehicles, 0);
    const averageSale = totalSales / totalVehicles;
    
    res.json({
      success: true,
      data: {
        period,
        summary: {
          totalSales,
          totalVehicles,
          averageSale
        },
        chartData: reportData,
        generatedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Get sales report error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to generate sales report'
    });
  }
});

// Get inventory report
router.get('/inventory', (req, res) => {
  try {
    const { lowStock = false } = req.query;
    
    let reportData = mockInventoryData;
    
    if (lowStock === 'true') {
      // En producción, aquí se filtrarían los items con stock bajo
      reportData = mockInventoryData.filter(item => item.quantity < 20);
    }
    
    const totalItems = reportData.reduce((sum, item) => sum + item.quantity, 0);
    const totalValue = reportData.reduce((sum, item) => sum + item.value, 0);
    
    res.json({
      success: true,
      data: {
        summary: {
          totalItems,
          totalValue,
          categories: reportData.length
        },
        chartData: reportData,
        generatedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Get inventory report error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to generate inventory report'
    });
  }
});

// Get workshop report
router.get('/workshop', (req, res) => {
  try {
    const { period = 'monthly', startDate = '', endDate = '' } = req.query;
    
    let reportData = mockWorkshopData;
    
    if (startDate && endDate) {
      // En producción, aquí se filtrarían los datos por fecha
      reportData = mockWorkshopData;
    }
    
    const totalOrders = reportData.reduce((sum, item) => sum + item.count, 0);
    const completedOrders = reportData.find(item => item.status === 'Completada')?.count || 0;
    const completionRate = (completedOrders / totalOrders) * 100;
    
    res.json({
      success: true,
      data: {
        period,
        summary: {
          totalOrders,
          completedOrders,
          completionRate: Math.round(completionRate * 100) / 100
        },
        chartData: reportData,
        generatedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Get workshop report error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to generate workshop report'
    });
  }
});

// Get dashboard summary
router.get('/dashboard', (req, res) => {
  try {
    const salesData = mockSalesData[mockSalesData.length - 1]; // Último mes
    const inventoryData = mockInventoryData;
    const workshopData = mockWorkshopData;
    
    const dashboardData = {
      sales: {
        currentMonth: salesData.sales,
        vehiclesSold: salesData.vehicles,
        growth: 12.5 // Porcentaje de crecimiento
      },
      inventory: {
        totalItems: inventoryData.reduce((sum, item) => sum + item.quantity, 0),
        totalValue: inventoryData.reduce((sum, item) => sum + item.value, 0),
        lowStockItems: 3
      },
      workshop: {
        totalOrders: workshopData.reduce((sum, item) => sum + item.count, 0),
        completedOrders: workshopData.find(item => item.status === 'Completada')?.count || 0,
        pendingOrders: workshopData.find(item => item.status === 'Pendiente')?.count || 0
      },
      clients: {
        total: 1234,
        newThisMonth: 45,
        active: 1189
      }
    };
    
    res.json({
      success: true,
      data: dashboardData,
      generatedAt: new Date()
    });
  } catch (error) {
    console.error('Get dashboard report error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to generate dashboard report'
    });
  }
});

export default router;