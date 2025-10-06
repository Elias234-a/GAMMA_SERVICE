import React, { useState } from 'react';
import { Download, Calendar, BarChart, FileText, TrendingUp, DollarSign, Loader2 } from 'lucide-react';
import { AlertType, Sale, Client, Vehicle } from '../App';
import reportService from '../services/reportService';

interface ReportsModuleProps {
  showAlert: (type: AlertType, title: string, message: string) => void;
  sales: Sale[];
  clients: Client[];
  vehicles: Vehicle[];
}

export const ReportsModule: React.FC<ReportsModuleProps> = ({ 
  showAlert, 
  sales,
  clients,
  vehicles
}) => {
  const [reportType, setReportType] = useState('sales');
  const [dateFrom, setDateFrom] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
  const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0]);
  const [format, setFormat] = useState('pdf');
  const [selectedClient, setSelectedClient] = useState('all');
  const [selectedVehicle, setSelectedVehicle] = useState('all');
  const [isGenerating, setIsGenerating] = useState(false);

  const reportTypes = [
    { value: 'sales', label: 'Reporte de Ventas', icon: BarChart },
    { value: 'clients', label: 'Reporte de Clientes', icon: FileText },
    { value: 'vehicles', label: 'Inventario de Vehículos', icon: FileText },
    { value: 'financial', label: 'Reporte Financiero', icon: DollarSign }
  ];

  const formats = [
    { value: 'pdf', label: 'PDF' },
    { value: 'excel', label: 'Excel' },
    { value: 'csv', label: 'CSV' }
  ];

  // Filter data based on date range
  const filteredSales = sales.filter(sale => {
    const saleDate = new Date(sale.saleDate);
    const fromDate = new Date(dateFrom);
    const toDate = new Date(dateTo);
    return saleDate >= fromDate && saleDate <= toDate;
  });

  const filteredClients = clients.filter(client => {
    const registrationDate = new Date(client.registrationDate);
    const fromDate = new Date(dateFrom);
    const toDate = new Date(dateTo);
    return registrationDate >= fromDate && registrationDate <= toDate;
  });

  // Calculate statistics
  const salesStats = {
    totalSales: filteredSales.length,
    completedSales: filteredSales.filter(s => s.status === 'completed').length,
    totalRevenue: filteredSales.filter(s => s.status === 'completed').reduce((sum, s) => sum + s.totalPrice, 0),
    averageSale: filteredSales.length > 0 ? filteredSales.reduce((sum, s) => sum + s.totalPrice, 0) / filteredSales.length : 0
  };

  const clientsStats = {
    totalClients: clients.length,
    activeClients: clients.filter(c => c.status === 'active').length,
    newClients: filteredClients.length,
    clientsWithPurchases: [...new Set(sales.map(s => s.clientId))].length
  };

  const vehiclesStats = {
    totalVehicles: vehicles.length,
    availableVehicles: vehicles.filter(v => v.status === 'available').length,
    soldVehicles: vehicles.filter(v => v.status === 'sold').length,
    totalInventoryValue: vehicles.filter(v => v.status === 'available').reduce((sum, v) => sum + v.price, 0)
  };

  const handleGenerateReport = async () => {
    // Validate inputs
    if (!dateFrom || !dateTo) {
      showAlert('error', 'Fechas requeridas', 'Por favor seleccione el rango de fechas para el reporte');
      return;
    }

    if (new Date(dateFrom) > new Date(dateTo)) {
      showAlert('error', 'Fechas inválidas', 'La fecha inicial no puede ser mayor que la fecha final');
      return;
    }

    setIsGenerating(true);

    try {
      // Generate report based on type and format
      switch (reportType) {
        case 'sales':
          if (format === 'pdf') {
            reportService.generateSalesPDF(filteredSales, clients, vehicles, dateFrom, dateTo);
          } else if (format === 'excel') {
            reportService.generateSalesExcel(filteredSales, clients, vehicles, dateFrom, dateTo);
          } else if (format === 'csv') {
            reportService.generateSalesCSV(filteredSales, clients, vehicles, dateFrom, dateTo);
          }
          break;

        case 'clients':
          if (format === 'pdf') {
            reportService.generateClientsPDF(clients, sales, dateFrom, dateTo);
          } else if (format === 'excel') {
            reportService.generateClientsExcel(clients, sales, dateFrom, dateTo);
          }
          break;

        case 'vehicles':
          if (format === 'pdf') {
            reportService.generateVehiclesPDF(vehicles, clients, dateFrom, dateTo);
          } else if (format === 'excel') {
            reportService.generateVehiclesExcel(vehicles, clients);
          }
          break;

        case 'financial':
          if (format === 'pdf') {
            reportService.generateFinancialPDF(filteredSales, dateFrom, dateTo);
          }
          break;
      }

      const reportTypeLabel = reportTypes.find(t => t.value === reportType)?.label || 'Reporte';
      const formatLabel = formats.find(f => f.value === format)?.label || 'PDF';
      
      showAlert('success', 'Reporte generado', `${reportTypeLabel} en formato ${formatLabel} ha sido descargado exitosamente`);
    } catch (error) {
      console.error('Error generating report:', error);
      showAlert('error', 'Error', 'Hubo un error al generar el reporte. Por favor intente nuevamente.');
    } finally {
      setIsGenerating(false);
    }
  };

  const renderReportPreview = () => {
    switch (reportType) {
      case 'sales':
        return (
          <div className="space-y-6">
            <h4 className="text-lg font-semibold text-theme-primary">Vista Previa - Reporte de Ventas</h4>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="glass-card p-4 rounded-lg glass-hover">
                <p className="text-sm font-medium text-blue-400 mb-1">Total Ventas</p>
                <p className="text-3xl font-bold text-theme-primary">{salesStats.totalSales}</p>
              </div>
              <div className="glass-card p-4 rounded-lg glass-hover">
                <p className="text-sm font-medium text-green-400 mb-1">Completadas</p>
                <p className="text-3xl font-bold text-theme-primary">{salesStats.completedSales}</p>
              </div>
              <div className="glass-card p-4 rounded-lg glass-hover">
                <p className="text-sm font-medium text-purple-400 mb-1">Ingresos Totales</p>
                <p className="text-xl font-bold text-theme-primary">${salesStats.totalRevenue.toLocaleString('es-CO')}</p>
              </div>
              <div className="glass-card p-4 rounded-lg glass-hover">
                <p className="text-sm font-medium text-orange-400 mb-1">Venta Promedio</p>
                <p className="text-xl font-bold text-theme-primary">${salesStats.averageSale.toLocaleString('es-CO')}</p>
              </div>
            </div>

            <div className="overflow-x-auto glass-card rounded-lg">
              <table className="w-full">
                <thead className="glass-content">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-theme-secondary uppercase tracking-wider border-b border-white/10">Venta</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-theme-secondary uppercase tracking-wider border-b border-white/10">Cliente</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-theme-secondary uppercase tracking-wider border-b border-white/10">Fecha</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-theme-secondary uppercase tracking-wider border-b border-white/10">Total</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-theme-secondary uppercase tracking-wider border-b border-white/10">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSales.slice(0, 5).map((sale) => {
                    const client = clients.find(c => c.id === sale.clientId);
                    return (
                      <tr key={sale.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3 text-sm text-theme-primary font-medium">{sale.saleNumber}</td>
                        <td className="px-4 py-3 text-sm text-theme-primary">{client?.name || 'N/A'}</td>
                        <td className="px-4 py-3 text-sm text-theme-secondary">{new Date(sale.saleDate).toLocaleDateString('es-CO')}</td>
                        <td className="px-4 py-3 text-sm text-theme-primary font-semibold">${sale.totalPrice.toLocaleString('es-CO')}</td>
                        <td className="px-4 py-3 text-sm text-theme-secondary">{sale.status}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filteredSales.length > 5 && (
                <p className="text-theme-secondary text-sm p-3">... y {filteredSales.length - 5} registros más</p>
              )}
            </div>
          </div>
        );

      case 'clients':
        return (
          <div className="space-y-4">
            <h4 className="text-white">Vista Previa - Reporte de Clientes</h4>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="glass-content p-4 rounded-lg">
                <p className="text-blue-300">Total Clientes</p>
                <p className="text-white">{clientsStats.totalClients}</p>
              </div>
              <div className="glass-content p-4 rounded-lg">
                <p className="text-green-300">Activos</p>
                <p className="text-white">{clientsStats.activeClients}</p>
              </div>
              <div className="glass-content p-4 rounded-lg">
                <p className="text-purple-300">Nuevos (Período)</p>
                <p className="text-white">{clientsStats.newClients}</p>
              </div>
              <div className="glass-content p-4 rounded-lg">
                <p className="text-orange-300">Con Compras</p>
                <p className="text-white">{clientsStats.clientsWithPurchases}</p>
              </div>
            </div>

            <div className="overflow-x-auto glass-content rounded-lg">
              <table className="w-full">
                <thead className="bg-white/10">
                  <tr>
                    <th className="px-4 py-2 text-left text-white/80 uppercase border-b border-white/20">Cliente</th>
                    <th className="px-4 py-2 text-left text-white/80 uppercase border-b border-white/20">Identificación</th>
                    <th className="px-4 py-2 text-left text-white/80 uppercase border-b border-white/20">Registro</th>
                    <th className="px-4 py-2 text-left text-white/80 uppercase border-b border-white/20">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.slice(0, 5).map((client) => (
                    <tr key={client.id} className="border-b border-white/10">
                      <td className="px-4 py-2 text-white">{client.name}</td>
                      <td className="px-4 py-2 text-white">{client.identification}</td>
                      <td className="px-4 py-2 text-white">{new Date(client.registrationDate).toLocaleDateString('es-CO')}</td>
                      <td className="px-4 py-2 text-white">{client.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {clients.length > 5 && (
                <p className="text-white/60 mt-2">... y {clients.length - 5} registros más</p>
              )}
            </div>
          </div>
        );

      case 'vehicles':
        return (
          <div className="space-y-4">
            <h4 className="text-white">Vista Previa - Inventario de Vehículos</h4>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="glass-content p-4 rounded-lg">
                <p className="text-blue-300">Total Vehículos</p>
                <p className="text-white">{vehiclesStats.totalVehicles}</p>
              </div>
              <div className="glass-content p-4 rounded-lg">
                <p className="text-green-300">Disponibles</p>
                <p className="text-white">{vehiclesStats.availableVehicles}</p>
              </div>
              <div className="glass-content p-4 rounded-lg">
                <p className="text-red-300">Vendidos</p>
                <p className="text-white">{vehiclesStats.soldVehicles}</p>
              </div>
              <div className="glass-content p-4 rounded-lg">
                <p className="text-purple-300">Valor Inventario</p>
                <p className="text-white">${vehiclesStats.totalInventoryValue.toLocaleString('es-CO')} COP</p>
              </div>
            </div>

            <div className="overflow-x-auto glass-content rounded-lg">
              <table className="w-full">
                <thead className="bg-white/10">
                  <tr>
                    <th className="px-4 py-2 text-left text-white/80 uppercase border-b border-white/20">Vehículo</th>
                    <th className="px-4 py-2 text-left text-white/80 uppercase border-b border-white/20">Año</th>
                    <th className="px-4 py-2 text-left text-white/80 uppercase border-b border-white/20">Precio</th>
                    <th className="px-4 py-2 text-left text-white/80 uppercase border-b border-white/20">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {vehicles.slice(0, 5).map((vehicle) => (
                    <tr key={vehicle.id} className="border-b border-white/10">
                      <td className="px-4 py-2 text-white">{vehicle.brand} {vehicle.model}</td>
                      <td className="px-4 py-2 text-white">{vehicle.year}</td>
                      <td className="px-4 py-2 text-white">${vehicle.price.toLocaleString('es-CO')} COP</td>
                      <td className="px-4 py-2 text-white">{vehicle.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {vehicles.length > 5 && (
                <p className="text-white/60 mt-2">... y {vehicles.length - 5} registros más</p>
              )}
            </div>
          </div>
        );

      case 'financial':
        const totalIncome = salesStats.totalRevenue;
        const pendingIncome = sales.filter(s => s.status === 'pending').reduce((sum, s) => sum + s.totalPrice, 0);
        
        return (
          <div className="space-y-4">
            <h4 className="text-white">Vista Previa - Reporte Financiero</h4>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="glass-content p-4 rounded-lg">
                <p className="text-green-300">Ingresos Confirmados</p>
                <p className="text-white">${totalIncome.toLocaleString('es-CO')} COP</p>
              </div>
              <div className="glass-content p-4 rounded-lg">
                <p className="text-yellow-300">Ingresos Pendientes</p>
                <p className="text-white">${pendingIncome.toLocaleString('es-CO')} COP</p>
              </div>
              <div className="glass-content p-4 rounded-lg">
                <p className="text-blue-300">Valor Inventario</p>
                <p className="text-white">${vehiclesStats.totalInventoryValue.toLocaleString('es-CO')} COP</p>
              </div>
              <div className="glass-content p-4 rounded-lg">
                <p className="text-purple-300">Total Patrimonio</p>
                <p className="text-white">${(totalIncome + vehiclesStats.totalInventoryValue).toLocaleString('es-CO')} COP</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-content rounded-lg p-4">
                <h5 className="text-white mb-3">Ingresos por Método de Pago</h5>
                <div className="space-y-2">
                  {['cash', 'credit', 'financing', 'mixed'].map(method => {
                    const methodSales = sales.filter(s => s.paymentMethod === method && s.status === 'completed');
                    const methodTotal = methodSales.reduce((sum, s) => sum + s.totalPrice, 0);
                    const methodLabels = {
                      cash: 'Contado',
                      credit: 'Crédito',
                      financing: 'Financiación',
                      mixed: 'Mixto'
                    };
                    
                    return (
                      <div key={method} className="flex justify-between">
                        <span className="text-white/80">{methodLabels[method as keyof typeof methodLabels]}:</span>
                        <span className="text-white">${methodTotal.toLocaleString('es-CO')} COP</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="glass-content rounded-lg p-4">
                <h5 className="text-white mb-3">Ventas por Vendedor</h5>
                <div className="space-y-2">
                  {['Juan Pérez', 'María García', 'Carlos López'].map(salesperson => {
                    const salespersonSales = sales.filter(s => s.salesperson === salesperson);
                    const salespersonTotal = salespersonSales.reduce((sum, s) => sum + s.totalPrice, 0);
                    
                    return (
                      <div key={salesperson} className="flex justify-between">
                        <span className="text-white/80">{salesperson}:</span>
                        <span className="text-white">${salespersonTotal.toLocaleString('es-CO')} COP</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card-strong p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-theme-primary">Reportes y Análisis</h1>
            <p className="text-theme-secondary mt-1">Genere reportes detallados del sistema</p>
          </div>
          <TrendingUp className="h-8 w-8 text-theme-accent icon-enhanced" />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Report Configuration */}
        <div className="lg:w-1/3 space-y-6">
          <div className="glass-card-strong p-6">
            <h2 className="text-xl font-semibold text-theme-primary mb-4">Configuración del Reporte</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-theme-secondary mb-2 font-medium">
                  Tipo de Reporte
                </label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="form-input w-full px-4 py-3 rounded-lg text-theme-primary focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
                >
                  {reportTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-theme-secondary mb-2 font-medium">
                  Fecha Desde
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-theme-secondary" />
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="form-input w-full pl-10 pr-3 py-2.5 rounded-lg text-theme-primary focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-theme-secondary mb-2 font-medium">
                  Fecha Hasta
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-theme-secondary" />
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="form-input w-full pl-10 pr-3 py-2.5 rounded-lg text-theme-primary focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-theme-secondary mb-2 font-medium">
                  Formato de Exportación
                </label>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                  className="form-input w-full px-3 py-2.5 rounded-lg text-theme-primary focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {formats.map(fmt => (
                    <option key={fmt.value} value={fmt.value}>{fmt.label}</option>
                  ))}
                </select>
              </div>

              {reportType === 'sales' && (
                <>
                  <div>
                    <label className="block text-white/90 mb-2">
                      Cliente Específico (Opcional)
                    </label>
                    <select
                      value={selectedClient}
                      onChange={(e) => setSelectedClient(e.target.value)}
                      className="dropdown-menu w-full px-4 py-3 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 cursor-pointer"
                    >
                      <option value="all">Todos los clientes</option>
                      {clients.map(client => (
                        <option key={client.id} value={client.id}>{client.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-white/90 mb-2">
                      Vehículo Específico (Opcional)
                    </label>
                    <select
                      value={selectedVehicle}
                      onChange={(e) => setSelectedVehicle(e.target.value)}
                      className="dropdown-menu w-full px-4 py-3 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 cursor-pointer"
                    >
                      <option value="all">Todos los vehículos</option>
                      {vehicles.map(vehicle => (
                        <option key={vehicle.id} value={vehicle.id}>
                          {vehicle.brand} {vehicle.model} {vehicle.year}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              <button
                onClick={handleGenerateReport}
                disabled={isGenerating}
                className="w-full btn-primary text-white py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Generando...</span>
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    <span>Generar Reporte</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Reports */}
          <div className="glass-card-strong p-6">
            <h3 className="text-xl font-semibold text-theme-primary mb-4">Reportes Rápidos</h3>
            <div className="space-y-2">
              <button
                onClick={() => showAlert('success', 'Reporte generado', 'Reporte de ventas del mes actual generado')}
                className="w-full text-left px-3 py-2.5 text-theme-secondary hover:text-theme-primary hover:bg-white/10 rounded-lg transition-all glass-hover"
              >
                📊 Ventas del mes actual
              </button>
              <button
                onClick={() => showAlert('success', 'Reporte generado', 'Reporte de clientes nuevos generado')}
                className="w-full text-left px-3 py-2.5 text-theme-secondary hover:text-theme-primary hover:bg-white/10 rounded-lg transition-all glass-hover"
              >
                👥 Clientes nuevos (últimos 30 días)
              </button>
              <button
                onClick={() => showAlert('success', 'Reporte generado', 'Reporte de inventario actual generado')}
                className="w-full text-left px-3 py-2.5 text-theme-secondary hover:text-theme-primary hover:bg-white/10 rounded-lg transition-all glass-hover"
              >
                🚗 Inventario actual
              </button>
              <button
                onClick={() => showAlert('success', 'Reporte generado', 'Reporte financiero del trimestre generado')}
                className="w-full text-left px-3 py-2.5 text-theme-secondary hover:text-theme-primary hover:bg-white/10 rounded-lg transition-all glass-hover"
              >
                💰 Financiero del trimestre
              </button>
            </div>
          </div>
        </div>

        {/* Report Preview */}
        <div className="lg:w-2/3 flex-1">
          <div className="glass-card-strong p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-theme-primary">Vista Previa del Reporte</h2>
              <div className="flex items-center space-x-2 text-theme-secondary glass-content px-3 py-1.5 rounded-lg">
                <Calendar className="h-4 w-4" />
                <span className="text-sm font-medium">{dateFrom} a {dateTo}</span>
              </div>
            </div>
            
            {renderReportPreview()}
          </div>
        </div>
      </div>
    </div>
  );
};