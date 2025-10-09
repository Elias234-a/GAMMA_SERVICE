import ExcelJS from 'exceljs';

/**
 * Generador de archivos Excel con formato profesional
 */
class ExcelGenerator {
  constructor() {
    this.workbook = null;
  }

  /**
   * Crear nuevo workbook
   */
  createWorkbook() {
    this.workbook = new ExcelJS.Workbook();
    this.workbook.creator = 'GAMMA Service ERP';
    this.workbook.created = new Date();
    return this.workbook;
  }

  /**
   * Aplicar estilo de header
   */
  styleHeader(row) {
    row.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 12 };
    row.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF97316' }
    };
    row.alignment = { vertical: 'middle', horizontal: 'center' };
    row.height = 25;
  }

  /**
   * Aplicar bordes a una celda
   */
  applyBorders(cell) {
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };
  }

  /**
   * Generar reporte de ventas
   */
  async generateSalesReport(data, outputPath) {
    this.createWorkbook();
    
    // Hoja de resumen
    const summarySheet = this.workbook.addWorksheet('Resumen', {
      properties: { tabColor: { argb: 'FFF97316' } }
    });

    // Título
    summarySheet.mergeCells('A1:E1');
    const titleRow = summarySheet.getCell('A1');
    titleRow.value = 'REPORTE DE VENTAS';
    titleRow.font = { bold: true, size: 18, color: { argb: 'FFF97316' } };
    titleRow.alignment = { horizontal: 'center', vertical: 'middle' };
    summarySheet.getRow(1).height = 40;

    // Período
    summarySheet.mergeCells('A2:E2');
    const periodRow = summarySheet.getCell('A2');
    periodRow.value = `Período: ${data.period}`;
    periodRow.font = { size: 12 };
    periodRow.alignment = { horizontal: 'center' };

    // Resumen
    summarySheet.addRow([]);
    summarySheet.addRow(['Métrica', 'Valor']);
    this.styleHeader(summarySheet.getRow(4));

    const summaryData = [
      ['Total Ventas', `$${data.summary.total.toLocaleString('es-MX')}`],
      ['Cantidad de Ventas', data.summary.count],
      ['Ticket Promedio', `$${data.summary.average.toLocaleString('es-MX')}`],
      ['Fecha Generación', new Date().toLocaleDateString('es-MX')]
    ];

    summaryData.forEach(row => {
      const addedRow = summarySheet.addRow(row);
      addedRow.eachCell(cell => this.applyBorders(cell));
    });

    // Ajustar columnas
    summarySheet.columns = [
      { width: 30 },
      { width: 20 }
    ];

    // Hoja de detalle
    const detailSheet = this.workbook.addWorksheet('Detalle de Ventas');

    // Headers
    const headers = ['Fecha', 'Cliente', 'Documento', 'Vehículo', 'Monto', 'Estado', 'Vendedor'];
    const headerRow = detailSheet.addRow(headers);
    this.styleHeader(headerRow);

    // Datos
    data.sales.forEach(sale => {
      const row = detailSheet.addRow([
        new Date(sale.date).toLocaleDateString('es-MX'),
        sale.clientName,
        sale.clientDocument,
        sale.vehiclePlate,
        sale.amount,
        sale.status,
        sale.seller || 'N/A'
      ]);

      // Formato condicional para estado
      const statusCell = row.getCell(6);
      if (sale.status === 'Completada') {
        statusCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF90EE90' }
        };
      } else if (sale.status === 'Pendiente') {
        statusCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFFA500' }
        };
      }

      // Formato de moneda
      row.getCell(5).numFmt = '$#,##0.00';

      row.eachCell(cell => this.applyBorders(cell));
    });

    // Total al final
    detailSheet.addRow([]);
    const totalRow = detailSheet.addRow(['', '', '', 'TOTAL', data.summary.total, '', '']);
    totalRow.font = { bold: true };
    totalRow.getCell(5).numFmt = '$#,##0.00';
    totalRow.getCell(5).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFFEB3B' }
    };

    // Ajustar columnas
    detailSheet.columns = [
      { width: 15 },
      { width: 25 },
      { width: 15 },
      { width: 15 },
      { width: 15 },
      { width: 15 },
      { width: 20 }
    ];

    // Auto-filtro
    detailSheet.autoFilter = {
      from: 'A1',
      to: `G${detailSheet.rowCount}`
    };

    // Guardar
    await this.workbook.xlsx.writeFile(outputPath);
    return outputPath;
  }

  /**
   * Generar reporte de inventario
   */
  async generateInventoryReport(data, outputPath) {
    this.createWorkbook();
    
    const sheet = this.workbook.addWorksheet('Inventario');

    // Título
    sheet.mergeCells('A1:H1');
    const titleCell = sheet.getCell('A1');
    titleCell.value = 'REPORTE DE INVENTARIO';
    titleCell.font = { bold: true, size: 18, color: { argb: 'FFF97316' } };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    sheet.getRow(1).height = 40;

    // Resumen
    sheet.addRow([]);
    sheet.addRow(['Total Vehículos:', data.total, '', 'Disponibles:', data.available]);
    sheet.addRow(['Vendidos:', data.sold, '', 'En Mantenimiento:', data.maintenance]);
    sheet.addRow(['Valor Total:', `$${data.totalValue.toLocaleString('es-MX')}`]);
    sheet.addRow([]);

    // Headers
    const headers = ['Placa', 'Marca', 'Modelo', 'Año', 'Color', 'Precio', 'Estado', 'Ubicación'];
    const headerRow = sheet.addRow(headers);
    this.styleHeader(headerRow);

    // Datos
    data.vehicles.forEach(vehicle => {
      const row = sheet.addRow([
        vehicle.plate,
        vehicle.brand,
        vehicle.model,
        vehicle.year,
        vehicle.color,
        vehicle.price,
        vehicle.status,
        vehicle.location || 'N/A'
      ]);

      // Formato de precio
      row.getCell(6).numFmt = '$#,##0.00';

      // Color según estado
      const statusCell = row.getCell(7);
      if (vehicle.status === 'Disponible') {
        statusCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF90EE90' }
        };
      } else if (vehicle.status === 'Vendido') {
        statusCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFF6347' }
        };
      }

      row.eachCell(cell => this.applyBorders(cell));
    });

    // Ajustar columnas
    sheet.columns = [
      { width: 12 },
      { width: 15 },
      { width: 15 },
      { width: 10 },
      { width: 12 },
      { width: 15 },
      { width: 15 },
      { width: 15 }
    ];

    // Auto-filtro
    sheet.autoFilter = {
      from: { row: 7, column: 1 },
      to: { row: sheet.rowCount, column: 8 }
    };

    await this.workbook.xlsx.writeFile(outputPath);
    return outputPath;
  }

  /**
   * Generar reporte de clientes
   */
  async generateClientsReport(data, outputPath) {
    this.createWorkbook();
    
    const sheet = this.workbook.addWorksheet('Clientes');

    // Título
    sheet.mergeCells('A1:G1');
    const titleCell = sheet.getCell('A1');
    titleCell.value = 'REPORTE DE CLIENTES';
    titleCell.font = { bold: true, size: 18, color: { argb: 'FFF97316' } };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    sheet.getRow(1).height = 40;

    sheet.addRow([]);

    // Headers
    const headers = ['Nombre', 'Documento', 'Email', 'Teléfono', 'Compras', 'Total Gastado', 'Última Compra'];
    const headerRow = sheet.addRow(headers);
    this.styleHeader(headerRow);

    // Datos
    data.clients.forEach(client => {
      const row = sheet.addRow([
        client.name,
        client.document,
        client.email,
        client.phone,
        client.purchaseCount,
        client.totalSpent,
        client.lastPurchase ? new Date(client.lastPurchase).toLocaleDateString('es-MX') : 'N/A'
      ]);

      row.getCell(6).numFmt = '$#,##0.00';
      row.eachCell(cell => this.applyBorders(cell));
    });

    // Ajustar columnas
    sheet.columns = [
      { width: 25 },
      { width: 15 },
      { width: 30 },
      { width: 15 },
      { width: 12 },
      { width: 15 },
      { width: 15 }
    ];

    // Auto-filtro
    sheet.autoFilter = {
      from: { row: 3, column: 1 },
      to: { row: sheet.rowCount, column: 7 }
    };

    await this.workbook.xlsx.writeFile(outputPath);
    return outputPath;
  }

  /**
   * Generar reporte financiero
   */
  async generateFinancialReport(data, outputPath) {
    this.createWorkbook();
    
    // Hoja de resumen
    const summarySheet = this.workbook.addWorksheet('Resumen Financiero');

    summarySheet.mergeCells('A1:D1');
    const titleCell = summarySheet.getCell('A1');
    titleCell.value = 'REPORTE FINANCIERO';
    titleCell.font = { bold: true, size: 18, color: { argb: 'FFF97316' } };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    summarySheet.getRow(1).height = 40;

    summarySheet.addRow([]);
    
    // Ingresos
    summarySheet.addRow(['INGRESOS']);
    summarySheet.getRow(3).font = { bold: true, size: 14 };
    
    const incomeHeaders = ['Concepto', 'Monto'];
    const incomeHeaderRow = summarySheet.addRow(incomeHeaders);
    this.styleHeader(incomeHeaderRow);

    data.income.forEach(item => {
      const row = summarySheet.addRow([item.concept, item.amount]);
      row.getCell(2).numFmt = '$#,##0.00';
      row.eachCell(cell => this.applyBorders(cell));
    });

    const totalIncomeRow = summarySheet.addRow(['TOTAL INGRESOS', data.totalIncome]);
    totalIncomeRow.font = { bold: true };
    totalIncomeRow.getCell(2).numFmt = '$#,##0.00';
    totalIncomeRow.getCell(2).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF90EE90' }
    };

    summarySheet.addRow([]);

    // Egresos
    summarySheet.addRow(['EGRESOS']);
    summarySheet.getRow(summarySheet.rowCount).font = { bold: true, size: 14 };
    
    const expenseHeaderRow = summarySheet.addRow(incomeHeaders);
    this.styleHeader(expenseHeaderRow);

    data.expenses.forEach(item => {
      const row = summarySheet.addRow([item.concept, item.amount]);
      row.getCell(2).numFmt = '$#,##0.00';
      row.eachCell(cell => this.applyBorders(cell));
    });

    const totalExpenseRow = summarySheet.addRow(['TOTAL EGRESOS', data.totalExpenses]);
    totalExpenseRow.font = { bold: true };
    totalExpenseRow.getCell(2).numFmt = '$#,##0.00';
    totalExpenseRow.getCell(2).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFF6347' }
    };

    summarySheet.addRow([]);

    // Balance
    const balanceRow = summarySheet.addRow(['BALANCE', data.balance]);
    balanceRow.font = { bold: true, size: 14 };
    balanceRow.getCell(2).numFmt = '$#,##0.00';
    balanceRow.getCell(2).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: data.balance >= 0 ? { argb: 'FF90EE90' } : { argb: 'FFFF6347' }
    };

    summarySheet.columns = [
      { width: 30 },
      { width: 20 }
    ];

    await this.workbook.xlsx.writeFile(outputPath);
    return outputPath;
  }
}

export default new ExcelGenerator();
