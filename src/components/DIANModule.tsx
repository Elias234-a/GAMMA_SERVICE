import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Send, 
  CheckCircle,
  Mail,
  Clock,
  DollarSign,
  RefreshCw,
  Eye,
  Search,
  Printer,
  ChevronDown
} from 'lucide-react';
import type { AlertColor } from '@mui/material';

interface DIANInvoice {
  id: string;
  invoiceNumber: string;
  cufe: string; // Código Único de Facturación Electrónica
  clientId: string;
  clientName: string;
  clientNIT: string;
  issueDate: string;
  dueDate: string;
  subtotal: number;
  taxes: number;
  total: number;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'cancelled';
  dianStatus: 'pending' | 'approved' | 'rejected' | 'error';
  dianResponse?: string;
  xmlGenerated: boolean;
  pdfGenerated: boolean;
  emailSent: boolean;
  items: InvoiceItem[];
  notes?: string;
}

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  total: number;
}

interface DIANModuleProps {
  showAlert: (type: AlertColor, title: string, message: string) => void;
  showConfirmDialog: (title: string, message: string, onConfirm: () => void) => void;
}

export const DIANModule: React.FC<DIANModuleProps> = ({ showAlert, showConfirmDialog }) => {
  const [invoices, setInvoices] = useState<DIANInvoice[]>([
    {
      id: '1',
      invoiceNumber: 'GS-001-2024',
      cufe: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0',
      clientId: '1',
      clientName: 'María García López',
      clientNIT: '12345678-9',
      issueDate: '2024-01-15',
      dueDate: '2024-02-15',
      subtotal: 85000000,
      taxes: 16150000,
      total: 101150000,
      status: 'accepted',
      dianStatus: 'approved',
      dianResponse: 'Factura aceptada por la DIAN',
      xmlGenerated: true,
      pdfGenerated: true,
      emailSent: true,
      items: [
        {
          id: '1',
          description: 'Toyota Corolla 2024',
          quantity: 1,
          unitPrice: 85000000,
          taxRate: 0.19,
          total: 85000000
        }
      ],
      notes: 'Venta vehículo nuevo con garantía'
    },
    {
      id: '2',
      invoiceNumber: 'GS-002-2024',
      cufe: 'b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1',
      clientId: '2',
      clientName: 'Carlos Rodríguez Pérez',
      clientNIT: '98765432-1',
      issueDate: '2024-01-20',
      dueDate: '2024-02-20',
      subtotal: 45000000,
      taxes: 8550000,
      total: 53550000,
      status: 'sent',
      dianStatus: 'pending',
      xmlGenerated: true,
      pdfGenerated: true,
      emailSent: true,
      items: [
        {
          id: '1',
          description: 'Chevrolet Spark 2023',
          quantity: 1,
          unitPrice: 45000000,
          taxRate: 0.19,
          total: 45000000
        }
      ]
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<DIANInvoice | null>(null);

  const [newInvoice, setNewInvoice] = useState<Partial<DIANInvoice>>({
    clientName: '',
    clientNIT: '',
    subtotal: 0,
    taxes: 0,
    total: 0,
    items: [],
    notes: ''
  });

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.clientNIT.includes(searchTerm);
    const matchesStatus = !statusFilter || invoice.status === statusFilter;
    const matchesDate = !dateFilter || invoice.issueDate.includes(dateFilter);
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const getStatusColor = (status: DIANInvoice['status']) => {
    switch (status) {
      case 'draft': return 'bg-gray-500/20 text-gray-300 border-gray-400/50';
      case 'sent': return 'bg-blue-500/20 text-blue-300 border-blue-400/50';
      case 'accepted': return 'bg-green-500/20 text-green-300 border-green-400/50';
      case 'rejected': return 'bg-red-500/20 text-red-300 border-red-400/50';
      case 'cancelled': return 'bg-yellow-500/20 text-yellow-300 border-yellow-400/50';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-400/50';
    }
  };

  const getDIANStatusColor = (status: DIANInvoice['dianStatus']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-300 border-yellow-400/50';
      case 'approved': return 'bg-green-500/20 text-green-300 border-green-400/50';
      case 'rejected': return 'bg-red-500/20 text-red-300 border-red-400/50';
      case 'error': return 'bg-red-500/20 text-red-300 border-red-400/50';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-400/50';
    }
  };

  const statusNames = {
    draft: 'Borrador',
    sent: 'Enviada',
    accepted: 'Aceptada',
    rejected: 'Rechazada',
    cancelled: 'Anulada'
  };

  const dianStatusNames = {
    pending: 'Pendiente',
    approved: 'Aprobada',
    rejected: 'Rechazada',
    error: 'Error'
  };

  const handleSendToDIAN = (invoice: DIANInvoice) => {
    showConfirmDialog(
      'Enviar a DIAN',
      `¿Confirma el envío de la factura ${invoice.invoiceNumber} a la DIAN?`,
      () => {
        // Simulate DIAN submission
        const updatedInvoices = invoices.map(inv => 
          inv.id === invoice.id 
            ? { ...inv, status: 'sent' as const, dianStatus: 'pending' as const }
            : inv
        );
        setInvoices(updatedInvoices);
        showAlert('success', 'Enviado a DIAN', 'La factura ha sido enviada exitosamente a la DIAN');
      }
    );
  };

  const handleGenerateXML = (invoice: DIANInvoice) => {
    // Simulate XML generation
    const updatedInvoices = invoices.map(inv => 
      inv.id === invoice.id ? { ...inv, xmlGenerated: true } : inv
    );
    setInvoices(updatedInvoices);
    showAlert('success', 'XML Generado', 'El archivo XML ha sido generado exitosamente');
  };

  const handleGeneratePDF = (invoice: DIANInvoice) => {
    // Simulate PDF generation
    const updatedInvoices = invoices.map(inv => 
      inv.id === invoice.id ? { ...inv, pdfGenerated: true } : inv
    );
    setInvoices(updatedInvoices);
    showAlert('success', 'PDF Generado', 'El archivo PDF ha sido generado exitosamente');
  };

  const handleSendEmail = (invoice: DIANInvoice) => {
    // Simulate email sending
    const updatedInvoices = invoices.map(inv => 
      inv.id === invoice.id ? { ...inv, emailSent: true } : inv
    );
    setInvoices(updatedInvoices);
    showAlert('success', 'Email Enviado', 'La factura ha sido enviada por correo electrónico');
  };

  const totalInvoices = invoices.length;
  const approvedInvoices = invoices.filter(inv => inv.dianStatus === 'approved').length;
  const pendingInvoices = invoices.filter(inv => inv.dianStatus === 'pending').length;
  const totalAmount = invoices.reduce((sum, inv) => sum + inv.total, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card-strong p-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center">
              <FileText className="h-8 w-8 mr-3 text-orange-300" />
              Facturación Electrónica DIAN
            </h1>
            <p className="text-gray-200 mt-1">Sistema integrado de facturación electrónica Colombia</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary px-6 py-3 rounded-lg transition-all duration-200"
          >
            <FileText className="h-5 w-5 mr-2" />
            Nueva Factura
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-200">Total Facturas</p>
              <p className="text-3xl font-bold text-white">{totalInvoices}</p>
            </div>
            <div className="bg-blue-500/20 p-3 rounded-full">
              <FileText className="h-6 w-6 text-blue-400" />
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-200">Aprobadas DIAN</p>
              <p className="text-3xl font-bold text-white">{approvedInvoices}</p>
            </div>
            <div className="bg-green-500/20 p-3 rounded-full">
              <CheckCircle className="h-6 w-6 text-green-400" />
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-200">Pendientes</p>
              <p className="text-3xl font-bold text-white">{pendingInvoices}</p>
            </div>
            <div className="bg-yellow-500/20 p-3 rounded-full">
              <Clock className="h-6 w-6 text-yellow-400" />
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-200">Total Facturado</p>
              <p className="text-2xl font-bold text-white">
                ${totalAmount.toLocaleString('es-CO')}
              </p>
            </div>
            <div className="bg-purple-500/20 p-3 rounded-full">
              <DollarSign className="h-6 w-6 text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar factura..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input w-full pl-10 pr-4 py-3 rounded-lg"
            />
          </div>

          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 appearance-none pr-10 cursor-pointer"
              style={{
                backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%23ffffff\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'/%3E%3C/svg%3E")',
                backgroundPosition: 'right 0.75rem center',
                backgroundSize: '1.5em 1.5em',
                backgroundRepeat: 'no-repeat',
                WebkitAppearance: 'none',
                MozAppearance: 'none'
              }}
            >
              <option value="" className="bg-white text-gray-900">Todos los estados</option>
              {Object.entries(statusNames).map(([key, name]) => (
                <option 
                  key={key} 
                  value={key} 
                  className="bg-white text-gray-900 hover:bg-orange-100"
                >
                  {name}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <ChevronDown className="h-4 w-4 text-white/70" />
            </div>
          </div>

          <div className="relative">
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 appearance-none cursor-pointer"
            />
          </div>

          <button 
            onClick={() => {
              // Simular actualización de datos DIAN
              showAlert('info', 'Actualizando', 'Sincronizando con los servidores de la DIAN...');
              setTimeout(() => {
                showAlert('success', 'Actualizado', 'Datos sincronizados con la DIAN exitosamente');
              }, 2000);
            }}
            className="btn-responsive bg-white/10 border border-white/20 text-white hover:bg-white/20"
          >
            <RefreshCw className="h-4 w-4" />
            Actualizar
          </button>
        </div>
      </div>

      {/* Invoices List */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold text-white mb-6">
          Facturas Electrónicas ({filteredInvoices.length})
        </h2>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-4 font-medium text-gray-200">Factura</th>
                <th className="text-left py-3 px-4 font-medium text-gray-200">Cliente</th>
                <th className="text-left py-3 px-4 font-medium text-gray-200">Fecha</th>
                <th className="text-left py-3 px-4 font-medium text-gray-200">Total</th>
                <th className="text-left py-3 px-4 font-medium text-gray-200">Estado</th>
                <th className="text-left py-3 px-4 font-medium text-gray-200">DIAN</th>
                <th className="text-left py-3 px-4 font-medium text-gray-200">Archivos</th>
                <th className="text-center py-3 px-4 font-medium text-gray-200">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.map((invoice) => (
                <tr key={invoice.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="py-4 px-4">
                    <div>
                      <p className="font-medium text-white">{invoice.invoiceNumber}</p>
                      <p className="text-xs text-gray-300">CUFE: {invoice.cufe.substring(0, 16)}...</p>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div>
                      <p className="font-medium text-white">{invoice.clientName}</p>
                      <p className="text-sm text-gray-300">NIT: {invoice.clientNIT}</p>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-gray-200">
                    {new Date(invoice.issueDate).toLocaleDateString('es-CO')}
                  </td>
                  <td className="py-4 px-4 text-white font-medium">
                    ${invoice.total.toLocaleString('es-CO')}
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs border ${getStatusColor(invoice.status)}`}>
                      {statusNames[invoice.status]}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs border ${getDIANStatusColor(invoice.dianStatus)}`}>
                      {dianStatusNames[invoice.dianStatus]}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-2">
                      {invoice.xmlGenerated && (
                        <span className="text-green-400 text-xs">XML</span>
                      )}
                      {invoice.pdfGenerated && (
                        <span className="text-blue-400 text-xs">PDF</span>
                      )}
                      {invoice.emailSent && (
                        <span className="text-purple-400 text-xs">EMAIL</span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        onClick={() => setSelectedInvoice(invoice)}
                        className="p-2 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-colors"
                        title="Ver detalles"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      
                      {!invoice.xmlGenerated && (
                        <button
                          onClick={() => handleGenerateXML(invoice)}
                          className="p-2 bg-green-500/20 text-green-300 rounded-lg hover:bg-green-500/30 transition-colors"
                          title="Generar XML"
                        >
                          <FileText className="h-4 w-4" />
                        </button>
                      )}

                      {!invoice.pdfGenerated && (
                        <button
                          onClick={() => handleGeneratePDF(invoice)}
                          className="p-2 bg-purple-500/20 text-purple-300 rounded-lg hover:bg-purple-500/30 transition-colors"
                          title="Generar PDF"
                        >
                          <Printer className="h-4 w-4" />
                        </button>
                      )}

                      {invoice.status === 'draft' && (
                        <button
                          onClick={() => handleSendToDIAN(invoice)}
                          className="p-2 bg-orange-500/20 text-orange-300 rounded-lg hover:bg-orange-500/30 transition-colors"
                          title="Enviar a DIAN"
                        >
                          <Send className="h-4 w-4" />
                        </button>
                      )}

                      {invoice.pdfGenerated && !invoice.emailSent && (
                        <button
                          onClick={() => handleSendEmail(invoice)}
                          className="p-2 bg-yellow-500/20 text-yellow-300 rounded-lg hover:bg-yellow-500/30 transition-colors"
                          title="Enviar por email"
                        >
                          <Mail className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredInvoices.length === 0 && (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400">No se encontraron facturas</p>
            </div>
          )}
        </div>
      </div>

      {/* Invoice Details Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-2xl font-bold text-white">
                Factura {selectedInvoice.invoiceNumber}
              </h3>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="text-white/70 hover:text-white text-2xl transition-colors"
              >
                &times;
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-white/90">
              <div className="space-y-4">
                <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                  <h4 className="font-medium text-white text-lg mb-3">Información del Cliente</h4>
                  <div className="space-y-2">
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-1">Nombre</label>
                      <p className="text-white">{selectedInvoice.clientName}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-1">NIT</label>
                      <p className="text-white">{selectedInvoice.clientNIT}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                  <h4 className="font-medium text-white text-lg mb-3">CUFE</h4>
                  <p className="text-sm text-white/80 bg-white/10 p-3 rounded break-all font-mono">
                    {selectedInvoice.cufe}
                  </p>
                </div>

                <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                  <h4 className="font-medium text-white text-lg mb-3">Fechas</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-1">Emisión</label>
                      <p className="text-white">{new Date(selectedInvoice.issueDate).toLocaleDateString('es-CO')}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-1">Vencimiento</label>
                      <p className="text-white">{new Date(selectedInvoice.dueDate).toLocaleDateString('es-CO')}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                  <h4 className="font-medium text-white text-lg mb-3">Estados</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-1">Estado Factura</label>
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${getStatusColor(selectedInvoice.status)}`}>
                        {statusNames[selectedInvoice.status]}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-1">Estado DIAN</label>
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${getDIANStatusColor(selectedInvoice.dianStatus)}`}>
                        {dianStatusNames[selectedInvoice.dianStatus]}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/20 p-4 rounded-lg border border-orange-500/30">
                  <h4 className="font-medium text-white text-lg mb-3">Resumen de Pagos</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-white/80">Subtotal:</span>
                      <span className="text-white">${selectedInvoice.subtotal.toLocaleString('es-CO')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/80">IVA (19%):</span>
                      <span className="text-white">${selectedInvoice.taxes.toLocaleString('es-CO')}</span>
                    </div>
                    <div className="border-t border-white/10 my-2 pt-2">
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total:</span>
                        <span className="text-white">${selectedInvoice.total.toLocaleString('es-CO')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sección de Artículos */}
            <div className="mt-8">
              <h4 className="font-medium text-white text-lg mb-4">Artículos Facturados</h4>
              <div className="bg-white/5 border border-white/10 rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-white/10">
                  <thead className="bg-white/5">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Descripción</th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-white uppercase tracking-wider">Cantidad</th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-white uppercase tracking-wider">Precio Unit.</th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-white uppercase tracking-wider">IVA (19%)</th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-white uppercase tracking-wider">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {selectedInvoice.items.map((item) => (
                      <tr key={item.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{item.description}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white text-right">{item.quantity}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white text-right">${item.unitPrice.toLocaleString('es-CO')}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white text-right">${(item.unitPrice * 0.19).toLocaleString('es-CO')}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white text-right">${item.total.toLocaleString('es-CO')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {selectedInvoice.notes && (
              <div className="mt-6 bg-white/5 p-4 rounded-lg border border-white/10">
                <h4 className="font-medium text-white text-lg mb-2">Notas Adicionales</h4>
                <p className="text-white/80">{selectedInvoice.notes}</p>
              </div>
            )}

            {selectedInvoice.dianResponse && (
              <div className="mt-6 bg-green-500/10 p-4 rounded-lg border border-green-500/20">
                <h4 className="font-medium text-white text-lg mb-2 flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2 text-green-300" />
                  Respuesta DIAN
                </h4>
                <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                  <p className="text-white">{selectedInvoice.dianResponse}</p>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 mt-8">
              <button
                onClick={() => setSelectedInvoice(null)}
                className="flex-1 px-6 py-2.5 bg-white/5 border border-white/10 text-white rounded-lg hover:bg-white/10 transition-colors flex items-center justify-center"
              >
                Cerrar
              </button>
              <button
                onClick={() => handleGeneratePDF(selectedInvoice)}
                className="flex-1 px-6 py-2.5 bg-blue-500/20 border border-blue-400/30 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-colors flex items-center justify-center"
              >
                <Download className="h-4 w-4 mr-2" />
                Descargar PDF
              </button>
              <button
                onClick={() => handleSendEmail(selectedInvoice)}
                className="flex-1 px-6 py-2.5 bg-green-500/20 border border-green-400/30 text-green-300 rounded-lg hover:bg-green-500/30 transition-colors flex items-center justify-center"
              >
                <Send className="h-4 w-4 mr-2" />
                Enviar por Correo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};