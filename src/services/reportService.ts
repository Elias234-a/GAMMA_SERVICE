import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Sale, Client, Vehicle } from '../App';

// Configuración de logo (base64 o URL)
const LOGO_URL = '/logo_claro.png'; // Ajustar según tu logo

/**
 * Servicio de generación de reportes
 * Soporta PDF, Excel y CSV
 */
class ReportService {
  
  /**
   * Genera reporte de ventas en PDF
   */
  generateSalesPDF(sales: Sale[], clients: Client[], vehicles: Vehicle[], dateFrom: string, dateTo: string): void {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(234, 88, 12); // Orange
    doc.text('GAMMA Service ERP', 105, 20, { align: 'center' });
    
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text('Reporte de Ventas', 105, 30, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Período: ${this.formatDate(dateFrom)} - ${this.formatDate(dateTo)}`, 105, 37, { align: 'center' });
    doc.text(`Generado: ${this.formatDate(new Date().toISOString())}`, 105, 42, { align: 'center' });
    
    // Statistics
    const completedSales = sales.filter(s => s.status === 'completed');
    const totalRevenue = completedSales.reduce((sum, s) => sum + s.totalPrice, 0);
    const averageSale = completedSales.length > 0 ? totalRevenue / completedSales.length : 0;
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('Resumen Ejecutivo', 14, 52);
    
    doc.setFontSize(10);
    const stats = [
      `Total de Ventas: ${sales.length}`,
      `Ventas Completadas: ${completedSales.length}`,
      `Ventas Pendientes: ${sales.filter(s => s.status === 'pending').length}`,
      `Ventas Canceladas: ${sales.filter(s => s.status === 'cancelled').length}`,
      `Ingresos Totales: ${this.formatCurrency(totalRevenue)}`,
      `Venta Promedio: ${this.formatCurrency(averageSale)}`
    ];
    
    let yPos = 60;
    stats.forEach(stat => {
      doc.text(stat, 14, yPos);
      yPos += 6;
    });
    
    // Sales Table
    const tableData = sales.map(sale => {
      const client = clients.find(c => c.id === sale.clientId);
      const vehicle = vehicles.find(v => v.id === sale.vehicleId);
      return [
        sale.saleNumber,
        client?.name || 'N/A',
        vehicle ? `${vehicle.brand} ${vehicle.model}` : 'N/A',
        this.formatDate(sale.saleDate),
        this.formatCurrency(sale.totalPrice),
        this.translateStatus(sale.status)
      ];
    });
    
    autoTable(doc, {
      head: [['# Venta', 'Cliente', 'Vehículo', 'Fecha', 'Monto', 'Estado']],
      body: tableData,
      startY: yPos + 5,
      styles: {
        fontSize: 9,
        cellPadding: 3
      },
      headStyles: {
        fillColor: [234, 88, 12], // Orange
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      columnStyles: {
        4: { halign: 'right' },
        5: { halign: 'center' }
      }
    });
    
    // Footer
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Página ${i} de ${pageCount}`,
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }
    
    // Save
    doc.save(`reporte-ventas-${dateFrom}-${dateTo}.pdf`);
  }
  
  /**
   * Genera reporte de clientes en PDF
   */
  generateClientsPDF(clients: Client[], sales: Sale[], dateFrom: string, dateTo: string): void {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(234, 88, 12);
    doc.text('GAMMA Service ERP', 105, 20, { align: 'center' });
    
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text('Reporte de Clientes', 105, 30, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Período: ${this.formatDate(dateFrom)} - ${this.formatDate(dateTo)}`, 105, 37, { align: 'center' });
    
    // Statistics
    const activeClients = clients.filter(c => c.status === 'active');
    const clientsWithPurchases = [...new Set(sales.map(s => s.clientId))].length;
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('Resumen Ejecutivo', 14, 50);
    
    doc.setFontSize(10);
    const stats = [
      `Total de Clientes: ${clients.length}`,
      `Clientes Activos: ${activeClients.length}`,
      `Clientes Inactivos: ${clients.filter(c => c.status === 'inactive').length}`,
      `Clientes con Compras: ${clientsWithPurchases}`
    ];
    
    let yPos = 58;
    stats.forEach(stat => {
      doc.text(stat, 14, yPos);
      yPos += 6;
    });
    
    // Clients Table
    const tableData = clients.map(client => {
      const clientSales = sales.filter(s => s.clientId === client.id);
      const totalSpent = clientSales.reduce((sum, s) => sum + s.totalPrice, 0);
      return [
        client.name,
        client.identification,
        client.phone,
        client.email,
        clientSales.length.toString(),
        this.formatCurrency(totalSpent),
        client.status === 'active' ? 'Activo' : 'Inactivo'
      ];
    });
    
    autoTable(doc, {
      head: [['Nombre', 'Identificación', 'Teléfono', 'Email', 'Compras', 'Total Gastado', 'Estado']],
      body: tableData,
      startY: yPos + 5,
      styles: {
        fontSize: 8,
        cellPadding: 2
      },
      headStyles: {
        fillColor: [234, 88, 12],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      columnStyles: {
        4: { halign: 'center' },
        5: { halign: 'right' },
        6: { halign: 'center' }
      }
    });
    
    // Footer
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Página ${i} de ${pageCount}`,
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }
    
    doc.save(`reporte-clientes-${dateFrom}-${dateTo}.pdf`);
  }
  
  /**
   * Genera reporte de vehículos en PDF
   */
  generateVehiclesPDF(vehicles: Vehicle[], clients: Client[], dateFrom: string, dateTo: string): void {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(234, 88, 12);
    doc.text('GAMMA Service ERP', 105, 20, { align: 'center' });
    
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text('Inventario de Vehículos', 105, 30, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generado: ${this.formatDate(new Date().toISOString())}`, 105, 37, { align: 'center' });
    
    // Statistics
    const available = vehicles.filter(v => v.status === 'available');
    const sold = vehicles.filter(v => v.status === 'sold');
    const reserved = vehicles.filter(v => v.status === 'reserved');
    const totalValue = available.reduce((sum, v) => sum + v.price, 0);
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('Resumen de Inventario', 14, 50);
    
    doc.setFontSize(10);
    const stats = [
      `Total de Vehículos: ${vehicles.length}`,
      `Disponibles: ${available.length}`,
      `Vendidos: ${sold.length}`,
      `Reservados: ${reserved.length}`,
      `Valor Total Inventario: ${this.formatCurrency(totalValue)}`
    ];
    
    let yPos = 58;
    stats.forEach(stat => {
      doc.text(stat, 14, yPos);
      yPos += 6;
    });
    
    // Vehicles Table
    const tableData = vehicles.map(vehicle => {
      const owner = vehicle.clientId ? clients.find(c => c.id === vehicle.clientId) : null;
      return [
        `${vehicle.brand} ${vehicle.model}`,
        vehicle.year.toString(),
        vehicle.plate || 'Sin placa',
        vehicle.vin,
        vehicle.color,
        this.formatCurrency(vehicle.price),
        this.translateVehicleStatus(vehicle.status),
        owner?.name || '-'
      ];
    });
    
    autoTable(doc, {
      head: [['Vehículo', 'Año', 'Placa', 'VIN', 'Color', 'Precio', 'Estado', 'Propietario']],
      body: tableData,
      startY: yPos + 5,
      styles: {
        fontSize: 8,
        cellPadding: 2
      },
      headStyles: {
        fillColor: [234, 88, 12],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      columnStyles: {
        5: { halign: 'right' },
        6: { halign: 'center' }
      }
    });
    
    // Footer
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Página ${i} de ${pageCount}`,
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }
    
    doc.save(`inventario-vehiculos-${new Date().toISOString().split('T')[0]}.pdf`);
  }
  
  /**
   * Genera reporte financiero en PDF
   */
  generateFinancialPDF(sales: Sale[], dateFrom: string, dateTo: string): void {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(234, 88, 12);
    doc.text('GAMMA Service ERP', 105, 20, { align: 'center' });
    
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text('Reporte Financiero', 105, 30, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Período: ${this.formatDate(dateFrom)} - ${this.formatDate(dateTo)}`, 105, 37, { align: 'center' });
    
    // Calculate financial data
    const completedSales = sales.filter(s => s.status === 'completed');
    const pendingSales = sales.filter(s => s.status === 'pending');
    const cancelledSales = sales.filter(s => s.status === 'cancelled');
    
    const totalRevenue = completedSales.reduce((sum, s) => sum + s.totalPrice, 0);
    const pendingRevenue = pendingSales.reduce((sum, s) => sum + s.totalPrice, 0);
    const lostRevenue = cancelledSales.reduce((sum, s) => sum + s.totalPrice, 0);
    
    // Group by payment method
    const byPaymentMethod = completedSales.reduce((acc, sale) => {
      acc[sale.paymentMethod] = (acc[sale.paymentMethod] || 0) + sale.totalPrice;
      return acc;
    }, {} as Record<string, number>);
    
    // Statistics
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('Resumen Financiero', 14, 50);
    
    doc.setFontSize(10);
    let yPos = 58;
    
    doc.setTextColor(0, 128, 0);
    doc.text(`Ingresos Confirmados: ${this.formatCurrency(totalRevenue)}`, 14, yPos);
    yPos += 6;
    
    doc.setTextColor(255, 140, 0);
    doc.text(`Ingresos Pendientes: ${this.formatCurrency(pendingRevenue)}`, 14, yPos);
    yPos += 6;
    
    doc.setTextColor(255, 0, 0);
    doc.text(`Ingresos Perdidos: ${this.formatCurrency(lostRevenue)}`, 14, yPos);
    yPos += 10;
    
    // Payment methods
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('Ingresos por Método de Pago', 14, yPos);
    yPos += 8;
    
    doc.setFontSize(10);
    Object.entries(byPaymentMethod).forEach(([method, amount]) => {
      doc.text(`${this.translatePaymentMethod(method)}: ${this.formatCurrency(amount)}`, 14, yPos);
      yPos += 6;
    });
    
    yPos += 5;
    
    // Monthly breakdown table
    const monthlyData = this.groupSalesByMonth(completedSales);
    const tableData = monthlyData.map(month => [
      month.month,
      month.count.toString(),
      this.formatCurrency(month.total),
      this.formatCurrency(month.average)
    ]);
    
    autoTable(doc, {
      head: [['Mes', 'Ventas', 'Total', 'Promedio']],
      body: tableData,
      startY: yPos,
      styles: {
        fontSize: 10,
        cellPadding: 3
      },
      headStyles: {
        fillColor: [234, 88, 12],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      columnStyles: {
        1: { halign: 'center' },
        2: { halign: 'right' },
        3: { halign: 'right' }
      }
    });
    
    // Footer
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Página ${i} de ${pageCount}`,
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }
    
    doc.save(`reporte-financiero-${dateFrom}-${dateTo}.pdf`);
  }
  
  /**
   * Genera reporte de ventas en Excel
   */
  generateSalesExcel(sales: Sale[], clients: Client[], vehicles: Vehicle[], dateFrom: string, dateTo: string): void {
    const workbook = XLSX.utils.book_new();
    
    // Sales sheet
    const salesData = sales.map(sale => {
      const client = clients.find(c => c.id === sale.clientId);
      const vehicle = vehicles.find(v => v.id === sale.vehicleId);
      return {
        'Número de Venta': sale.saleNumber,
        'Cliente': client?.name || 'N/A',
        'Identificación': client?.identification || 'N/A',
        'Vehículo': vehicle ? `${vehicle.brand} ${vehicle.model} ${vehicle.year}` : 'N/A',
        'Placa': vehicle?.plate || 'N/A',
        'Fecha': this.formatDate(sale.saleDate),
        'Monto': sale.totalPrice,
        'Método de Pago': this.translatePaymentMethod(sale.paymentMethod),
        'Vendedor': sale.salesperson,
        'Estado': this.translateStatus(sale.status),
        'Contrato': sale.contractGenerated ? 'Sí' : 'No'
      };
    });
    
    const salesSheet = XLSX.utils.json_to_sheet(salesData);
    
    // Set column widths
    salesSheet['!cols'] = [
      { wch: 15 },
      { wch: 25 },
      { wch: 15 },
      { wch: 30 },
      { wch: 10 },
      { wch: 12 },
      { wch: 15 },
      { wch: 15 },
      { wch: 20 },
      { wch: 12 },
      { wch: 10 }
    ];
    
    XLSX.utils.book_append_sheet(workbook, salesSheet, 'Ventas');
    
    // Summary sheet
    const completedSales = sales.filter(s => s.status === 'completed');
    const totalRevenue = completedSales.reduce((sum, s) => sum + s.totalPrice, 0);
    
    const summaryData = [
      { 'Métrica': 'Total de Ventas', 'Valor': sales.length },
      { 'Métrica': 'Ventas Completadas', 'Valor': completedSales.length },
      { 'Métrica': 'Ventas Pendientes', 'Valor': sales.filter(s => s.status === 'pending').length },
      { 'Métrica': 'Ventas Canceladas', 'Valor': sales.filter(s => s.status === 'cancelled').length },
      { 'Métrica': 'Ingresos Totales', 'Valor': totalRevenue },
      { 'Métrica': 'Venta Promedio', 'Valor': completedSales.length > 0 ? totalRevenue / completedSales.length : 0 }
    ];
    
    const summarySheet = XLSX.utils.json_to_sheet(summaryData);
    summarySheet['!cols'] = [{ wch: 25 }, { wch: 20 }];
    
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Resumen');
    
    // Save
    XLSX.writeFile(workbook, `reporte-ventas-${dateFrom}-${dateTo}.xlsx`);
  }
  
  /**
   * Genera reporte de clientes en Excel
   */
  generateClientsExcel(clients: Client[], sales: Sale[], dateFrom: string, dateTo: string): void {
    const workbook = XLSX.utils.book_new();
    
    const clientsData = clients.map(client => {
      const clientSales = sales.filter(s => s.clientId === client.id);
      const totalSpent = clientSales.reduce((sum, s) => sum + s.totalPrice, 0);
      return {
        'Nombre': client.name,
        'Identificación': client.identification,
        'Teléfono': client.phone,
        'Email': client.email,
        'Dirección': client.address,
        'Fecha de Registro': this.formatDate(client.registrationDate),
        'Total de Compras': clientSales.length,
        'Total Gastado': totalSpent,
        'Estado': client.status === 'active' ? 'Activo' : 'Inactivo'
      };
    });
    
    const clientsSheet = XLSX.utils.json_to_sheet(clientsData);
    clientsSheet['!cols'] = [
      { wch: 25 },
      { wch: 15 },
      { wch: 15 },
      { wch: 30 },
      { wch: 35 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 10 }
    ];
    
    XLSX.utils.book_append_sheet(workbook, clientsSheet, 'Clientes');
    
    XLSX.writeFile(workbook, `reporte-clientes-${dateFrom}-${dateTo}.xlsx`);
  }
  
  /**
   * Genera reporte de vehículos en Excel
   */
  generateVehiclesExcel(vehicles: Vehicle[], clients: Client[]): void {
    const workbook = XLSX.utils.book_new();
    
    const vehiclesData = vehicles.map(vehicle => {
      const owner = vehicle.clientId ? clients.find(c => c.id === vehicle.clientId) : null;
      return {
        'Marca': vehicle.brand,
        'Modelo': vehicle.model,
        'Año': vehicle.year,
        'Placa': vehicle.plate || 'Sin placa',
        'VIN': vehicle.vin,
        'Color': vehicle.color,
        'Precio': vehicle.price,
        'Estado': this.translateVehicleStatus(vehicle.status),
        'Propietario': owner?.name || '-',
        'Identificación Propietario': owner?.identification || '-'
      };
    });
    
    const vehiclesSheet = XLSX.utils.json_to_sheet(vehiclesData);
    vehiclesSheet['!cols'] = [
      { wch: 15 },
      { wch: 15 },
      { wch: 8 },
      { wch: 12 },
      { wch: 20 },
      { wch: 12 },
      { wch: 15 },
      { wch: 12 },
      { wch: 25 },
      { wch: 15 }
    ];
    
    XLSX.utils.book_append_sheet(workbook, vehiclesSheet, 'Vehículos');
    
    XLSX.writeFile(workbook, `inventario-vehiculos-${new Date().toISOString().split('T')[0]}.xlsx`);
  }
  
  /**
   * Genera CSV de ventas
   */
  generateSalesCSV(sales: Sale[], clients: Client[], vehicles: Vehicle[], dateFrom: string, dateTo: string): void {
    const salesData = sales.map(sale => {
      const client = clients.find(c => c.id === sale.clientId);
      const vehicle = vehicles.find(v => v.id === sale.vehicleId);
      return {
        'Número de Venta': sale.saleNumber,
        'Cliente': client?.name || 'N/A',
        'Vehículo': vehicle ? `${vehicle.brand} ${vehicle.model}` : 'N/A',
        'Fecha': this.formatDate(sale.saleDate),
        'Monto': sale.totalPrice,
        'Estado': this.translateStatus(sale.status)
      };
    });
    
    const worksheet = XLSX.utils.json_to_sheet(salesData);
    const csv = XLSX.utils.sheet_to_csv(worksheet);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `reporte-ventas-${dateFrom}-${dateTo}.csv`);
  }
  
  // Helper methods
  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  }
  
  private formatDate(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-CO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(date);
  }
  
  private translateStatus(status: string): string {
    const translations: Record<string, string> = {
      'pending': 'Pendiente',
      'completed': 'Completada',
      'cancelled': 'Cancelada'
    };
    return translations[status] || status;
  }
  
  private translateVehicleStatus(status: string): string {
    const translations: Record<string, string> = {
      'available': 'Disponible',
      'sold': 'Vendido',
      'reserved': 'Reservado'
    };
    return translations[status] || status;
  }
  
  private translatePaymentMethod(method: string): string {
    const translations: Record<string, string> = {
      'cash': 'Efectivo',
      'credit': 'Crédito',
      'financing': 'Financiamiento',
      'mixed': 'Mixto'
    };
    return translations[method] || method;
  }
  
  private groupSalesByMonth(sales: Sale[]): Array<{ month: string; count: number; total: number; average: number }> {
    const grouped = sales.reduce((acc, sale) => {
      const date = new Date(sale.saleDate);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!acc[monthKey]) {
        acc[monthKey] = { sales: [], total: 0 };
      }
      
      acc[monthKey].sales.push(sale);
      acc[monthKey].total += sale.totalPrice;
      
      return acc;
    }, {} as Record<string, { sales: Sale[]; total: number }>);
    
    return Object.entries(grouped).map(([month, data]) => ({
      month: this.formatMonth(month),
      count: data.sales.length,
      total: data.total,
      average: data.total / data.sales.length
    })).sort((a, b) => a.month.localeCompare(b.month));
  }
  
  private formatMonth(monthKey: string): string {
    const [year, month] = monthKey.split('-');
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${months[parseInt(month) - 1]} ${year}`;
  }
}

export default new ReportService();
