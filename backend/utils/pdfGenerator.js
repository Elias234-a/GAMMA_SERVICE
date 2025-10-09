import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Generador de PDFs profesionales
 */
class PDFGenerator {
  constructor() {
    this.doc = null;
  }

  /**
   * Crear un nuevo documento PDF
   */
  createDocument(options = {}) {
    this.doc = new PDFDocument({
      size: options.size || 'A4',
      margins: options.margins || {
        top: 50,
        bottom: 50,
        left: 50,
        right: 50
      }
    });
    return this.doc;
  }

  /**
   * Agregar encabezado estándar
   */
  addHeader(title, subtitle = '') {
    this.doc
      .fontSize(20)
      .font('Helvetica-Bold')
      .text(title, { align: 'center' })
      .moveDown(0.5);

    if (subtitle) {
      this.doc
        .fontSize(12)
        .font('Helvetica')
        .text(subtitle, { align: 'center' })
        .moveDown(1);
    }

    // Línea divisoria
    this.doc
      .strokeColor('#F97316')
      .lineWidth(2)
      .moveTo(50, this.doc.y)
      .lineTo(545, this.doc.y)
      .stroke()
      .moveDown(1);
  }

  /**
   * Agregar footer con paginación
   */
  addFooter() {
    const pages = this.doc.bufferedPageRange();
    
    for (let i = 0; i < pages.count; i++) {
      this.doc.switchToPage(i);
      
      // Footer
      this.doc
        .fontSize(8)
        .font('Helvetica')
        .text(
          `Generado el ${new Date().toLocaleDateString('es-MX')} - Página ${i + 1} de ${pages.count}`,
          50,
          this.doc.page.height - 50,
          { align: 'center' }
        );
    }
  }

  /**
   * Agregar tabla
   */
  addTable(headers, rows, options = {}) {
    const startX = options.startX || 50;
    const startY = this.doc.y;
    const columnWidth = options.columnWidth || (495 / headers.length);
    const rowHeight = options.rowHeight || 25;

    // Headers
    this.doc
      .font('Helvetica-Bold')
      .fontSize(10)
      .fillColor('#fff');

    // Background de headers
    this.doc
      .rect(startX, startY, columnWidth * headers.length, rowHeight)
      .fill('#F97316');

    // Texto de headers
    headers.forEach((header, i) => {
      this.doc.text(
        header,
        startX + (i * columnWidth) + 5,
        startY + 8,
        { width: columnWidth - 10, align: 'left' }
      );
    });

    this.doc.fillColor('#000');

    // Rows
    let currentY = startY + rowHeight;
    this.doc.font('Helvetica').fontSize(9);

    rows.forEach((row, rowIndex) => {
      // Alternar color de fondo
      if (rowIndex % 2 === 0) {
        this.doc.rect(startX, currentY, columnWidth * headers.length, rowHeight)
          .fill('#f5f5f5');
        this.doc.fillColor('#000');
      }

      // Texto de celdas
      row.forEach((cell, colIndex) => {
        this.doc.text(
          String(cell),
          startX + (colIndex * columnWidth) + 5,
          currentY + 8,
          { width: columnWidth - 10, align: 'left' }
        );
      });

      currentY += rowHeight;

      // Nueva página si es necesario
      if (currentY > this.doc.page.height - 100) {
        this.doc.addPage();
        currentY = 50;
      }
    });

    this.doc.y = currentY + 10;
  }

  /**
   * Agregar sección de información
   */
  addInfoSection(title, data) {
    this.doc
      .fontSize(14)
      .font('Helvetica-Bold')
      .text(title)
      .moveDown(0.5);

    this.doc
      .fontSize(10)
      .font('Helvetica');

    Object.entries(data).forEach(([key, value]) => {
      this.doc.text(`${key}: ${value}`, { continued: false });
    });

    this.doc.moveDown(1);
  }

  /**
   * Agregar gráfico simple (texto)
   */
  addChart(title, data) {
    this.doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .text(title)
      .moveDown(0.5);

    const maxValue = Math.max(...data.map(d => d.value));
    const barWidth = 400;

    data.forEach(item => {
      const percentage = (item.value / maxValue) * 100;
      const width = (barWidth * percentage) / 100;

      // Label
      this.doc
        .fontSize(10)
        .font('Helvetica')
        .text(item.label, { continued: true })
        .text(` (${item.value})`, { align: 'left' });

      // Barra
      const y = this.doc.y;
      this.doc
        .rect(50, y + 2, width, 15)
        .fill('#F97316');

      this.doc.fillColor('#000');
      this.doc.moveDown(1);
    });

    this.doc.moveDown(1);
  }

  /**
   * Generar reporte de ventas
   */
  async generateSalesReport(data, outputPath) {
    this.createDocument();
    
    // Header
    this.addHeader('Reporte de Ventas', `Período: ${data.period}`);

    // Resumen
    this.addInfoSection('Resumen General', {
      'Total Ventas': `$${data.summary.total.toLocaleString('es-MX')}`,
      'Cantidad de Ventas': data.summary.count,
      'Ticket Promedio': `$${data.summary.average.toLocaleString('es-MX')}`,
      'Fecha': new Date().toLocaleDateString('es-MX')
    });

    // Tabla de ventas
    if (data.sales && data.sales.length > 0) {
      this.doc.addPage();
      this.addHeader('Detalle de Ventas');
      
      const headers = ['Fecha', 'Cliente', 'Vehículo', 'Monto', 'Estado'];
      const rows = data.sales.map(sale => [
        new Date(sale.date).toLocaleDateString('es-MX'),
        sale.clientName,
        sale.vehiclePlate,
        `$${sale.amount.toLocaleString('es-MX')}`,
        sale.status
      ]);

      this.addTable(headers, rows);
    }

    // Gráfico de ventas por mes
    if (data.chartData) {
      this.doc.addPage();
      this.addChart('Ventas por Mes', data.chartData);
    }

    // Footer
    this.addFooter();

    // Guardar
    return new Promise((resolve, reject) => {
      const stream = fs.createWriteStream(outputPath);
      this.doc.pipe(stream);
      this.doc.end();

      stream.on('finish', () => resolve(outputPath));
      stream.on('error', reject);
    });
  }

  /**
   * Generar reporte de inventario
   */
  async generateInventoryReport(data, outputPath) {
    this.createDocument();
    
    this.addHeader('Reporte de Inventario', `Fecha: ${new Date().toLocaleDateString('es-MX')}`);

    // Resumen
    this.addInfoSection('Resumen', {
      'Total Vehículos': data.total,
      'Disponibles': data.available,
      'Vendidos': data.sold,
      'En Mantenimiento': data.maintenance,
      'Valor Total': `$${data.totalValue.toLocaleString('es-MX')}`
    });

    // Tabla
    const headers = ['Placa', 'Marca', 'Modelo', 'Año', 'Precio', 'Estado'];
    const rows = data.vehicles.map(v => [
      v.plate,
      v.brand,
      v.model,
      v.year,
      `$${v.price.toLocaleString('es-MX')}`,
      v.status
    ]);

    this.addTable(headers, rows);

    this.addFooter();

    return new Promise((resolve, reject) => {
      const stream = fs.createWriteStream(outputPath);
      this.doc.pipe(stream);
      this.doc.end();

      stream.on('finish', () => resolve(outputPath));
      stream.on('error', reject);
    });
  }

  /**
   * Generar factura
   */
  async generateInvoice(invoice, outputPath) {
    this.createDocument();

    // Logo y empresa (si existe)
    this.doc
      .fontSize(16)
      .font('Helvetica-Bold')
      .text('GAMMA SERVICE ERP', { align: 'center' })
      .moveDown(0.3);

    this.doc
      .fontSize(10)
      .font('Helvetica')
      .text('Sistema de Gestión Automotriz', { align: 'center' })
      .moveDown(2);

    // Información de factura
    this.doc
      .fontSize(20)
      .font('Helvetica-Bold')
      .text(`Factura #${invoice.number}`, { align: 'right' })
      .moveDown(1);

    // Info cliente
    this.addInfoSection('Cliente', {
      'Nombre': invoice.client.name,
      'Documento': invoice.client.document,
      'Email': invoice.client.email,
      'Teléfono': invoice.client.phone
    });

    // Items
    this.doc.moveDown(1);
    const headers = ['Descripción', 'Cantidad', 'Precio Unit.', 'Total'];
    const rows = invoice.items.map(item => [
      item.description,
      item.quantity,
      `$${item.price.toLocaleString('es-MX')}`,
      `$${(item.quantity * item.price).toLocaleString('es-MX')}`
    ]);

    this.addTable(headers, rows);

    // Totales
    this.doc.moveDown(1);
    const totalY = this.doc.y;
    
    this.doc
      .fontSize(12)
      .font('Helvetica')
      .text('Subtotal:', 400, totalY, { continued: true })
      .text(`$${invoice.subtotal.toLocaleString('es-MX')}`, { align: 'right' })
      .text('IVA (19%):', 400, this.doc.y + 5, { continued: true })
      .text(`$${invoice.tax.toLocaleString('es-MX')}`, { align: 'right' })
      .moveDown(0.5);

    this.doc
      .fontSize(14)
      .font('Helvetica-Bold')
      .text('Total:', 400, this.doc.y, { continued: true })
      .text(`$${invoice.total.toLocaleString('es-MX')}`, { align: 'right' });

    this.addFooter();

    return new Promise((resolve, reject) => {
      const stream = fs.createWriteStream(outputPath);
      this.doc.pipe(stream);
      this.doc.end();

      stream.on('finish', () => resolve(outputPath));
      stream.on('error', reject);
    });
  }
}

export default new PDFGenerator();
