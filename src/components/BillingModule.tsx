import React, { useState } from 'react';
import { Plus, Search, Eye, Download, Mail, FileText, DollarSign, Calendar } from 'lucide-react';
import { AlertType, Sale, Client, Vehicle } from '@/types';

interface Invoice {
  id: string;
  invoiceNumber: string;
  saleId: string;
  clientId: string;
  vehicleId: string;
  issueDate: string;
  dueDate: string;
  subtotal: number;
  tax: number;
  total: number;
  status: 'pending' | 'paid' | 'overdue';
  paymentMethod: 'cash' | 'transfer' | 'credit_card' | 'check';
  notes: string;
}

interface BillingModuleProps {
  showAlert: (type: AlertType, title: string, message: string) => void;
  showConfirmDialog: (title: string, message: string, onConfirm: () => void) => void;
  sales: Sale[];
  clients: Client[];
  vehicles: Vehicle[];
}

export const BillingModule: React.FC<BillingModuleProps> = ({ 
  showAlert, 
  showConfirmDialog, 
  sales,
  clients,
  vehicles
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    saleId: '',
    paymentMethod: 'cash' as Invoice['paymentMethod'],
    notes: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Mock invoices data
  const [invoices, setInvoices] = useState<Invoice[]>([
    {
      id: '1',
      invoiceNumber: 'FAC-2024-001',
      saleId: '1',
      clientId: '1',
      vehicleId: '1',
      issueDate: '2024-01-20',
      dueDate: '2024-02-20',
      subtotal: 85000000,
      tax: 16150000,
      total: 101150000,
      status: 'paid',
      paymentMethod: 'transfer',
      notes: 'Pago completo por transferencia bancaria'
    }
  ]);

  const paymentMethods = [
    { value: 'cash', label: 'Efectivo' },
    { value: 'transfer', label: 'Transferencia Bancaria' },
    { value: 'credit_card', label: 'Tarjeta de Crédito' },
    { value: 'check', label: 'Cheque' }
  ];

  const filteredInvoices = invoices.filter(invoice => {
    const client = clients.find(c => c.id === invoice.clientId);
    const matchesSearch = client?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const unBilledSales = sales.filter(sale => 
    sale.status === 'completed' && 
    !invoices.some(inv => inv.saleId === sale.id)
  );

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.saleId) {
      newErrors.saleId = 'Debe seleccionar una venta';
    }
    if (!formData.paymentMethod) {
      newErrors.paymentMethod = 'Debe seleccionar un método de pago';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateInvoice = () => {
    setFormData({
      saleId: '',
      paymentMethod: 'cash',
      notes: ''
    });
    setErrors({});
    setShowCreateModal(true);
  };

  const handleSaveInvoice = () => {
    if (!validateForm()) {
      showAlert('error', 'Datos inválidos', 'Por favor corrija los errores en el formulario');
      return;
    }

    const selectedSale = sales.find(s => s.id === formData.saleId);
    if (!selectedSale) {
      showAlert('error', 'Error', 'Venta no encontrada');
      return;
    }

    const subtotal = selectedSale.totalPrice;
    const tax = subtotal * 0.19; // 19% IVA
    const total = subtotal + tax;

    const newInvoice: Invoice = {
      id: Date.now().toString(),
      invoiceNumber: `FAC-${new Date().getFullYear()}-${String(invoices.length + 1).padStart(3, '0')}`,
      saleId: formData.saleId,
      clientId: selectedSale.clientId,
      vehicleId: selectedSale.vehicleId,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      subtotal,
      tax,
      total,
      status: 'pending',
      paymentMethod: formData.paymentMethod,
      notes: formData.notes
    };

    setInvoices(prev => [...prev, newInvoice]);
    setShowCreateModal(false);
    showAlert('success', 'Factura creada', `Factura ${newInvoice.invoiceNumber} creada exitosamente`);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    return client ? client.name : 'Cliente no encontrado';
  };

  const getVehicleInfo = (vehicleId: string) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    return vehicle ? `${vehicle.brand} ${vehicle.model} ${vehicle.year}` : 'Vehículo no encontrado';
  };

  const getSaleInfo = (saleId: string) => {
    const sale = sales.find(s => s.id === saleId);
    return sale ? sale.saleNumber : 'Venta no encontrada';
  };

  const getStatusBadge = (status: Invoice['status']) => {
    const statusConfig = {
      pending: { label: 'Pendiente', class: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' },
      paid: { label: 'Pagada', class: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' },
      overdue: { label: 'Vencida', class: 'bg-red-500/20 text-red-300 border border-red-500/30' }
    };
    
    const config = statusConfig[status];
    return <span className={`inline-flex px-3 py-1 text-xs rounded-full glass-content ${config.class}`}>{config.label}</span>;
  };

  const markAsPaid = (invoice: Invoice) => {
    showConfirmDialog(
      'Marcar como Pagada',
      `¿Confirma que la factura ${invoice.invoiceNumber} ha sido pagada?`,
      () => {
        setInvoices(prev => prev.map(inv => 
          inv.id === invoice.id ? { ...inv, status: 'paid' as Invoice['status'] } : inv
        ));
        showAlert('success', 'Factura actualizada', 'La factura ha sido marcada como pagada');
      }
    );
  };

  const exportToPDF = (invoice: Invoice) => {
    showAlert('success', 'PDF generado', `Factura ${invoice.invoiceNumber} exportada a PDF`);
  };

  const sendByEmail = (invoice: Invoice) => {
    const client = clients.find(c => c.id === invoice.clientId);
    showAlert('success', 'Email enviado', `Factura enviada por correo a ${client?.email}`);
  };

  return (
    <div className="space-y-6 glass-module fade-in">
      {/* Header */}
      <div className="glass-card-strong p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <h1 className="text-white">Facturación</h1>
            <p className="text-gray-200 mt-1">Gestione las facturas y pagos</p>
          </div>
          <button
            onClick={handleCreateInvoice}
            disabled={unBilledSales.length === 0}
            className="mt-4 sm:mt-0 btn-electric text-white px-6 py-3 rounded-lg transition-all hover:scale-105 disabled:bg-gray-500/40 disabled:cursor-not-allowed flex items-center space-x-2 glass-hover"
          >
            <Plus className="h-5 w-5 icon-enhanced" />
            <span>Nueva Factura</span>
          </button>
        </div>
        {unBilledSales.length === 0 && (
          <div className="mt-4 p-3 glass-content rounded-lg border border-yellow-500/30">
            <p className="text-yellow-300">No hay ventas completadas pendientes de facturación</p>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-card p-6 glass-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-200">Total Facturas</p>
              <p className="text-white text-3xl">{invoices.length}</p>
            </div>
            <FileText className="h-8 w-8 text-blue-400 icon-enhanced" />
          </div>
        </div>
        <div className="glass-card p-6 glass-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-200">Pendientes</p>
              <p className="text-white text-3xl">
                {invoices.filter(i => i.status === 'pending').length}
              </p>
            </div>
            <Calendar className="h-8 w-8 text-yellow-400 icon-enhanced" />
          </div>
        </div>
        <div className="glass-card p-6 glass-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-200">Pagadas</p>
              <p className="text-white text-3xl">
                {invoices.filter(i => i.status === 'paid').length}
              </p>
            </div>
            <div className="w-8 h-8 bg-emerald-500/20 rounded-full flex items-center justify-center glass-content">
              <div className="w-4 h-4 bg-emerald-400 rounded-full"></div>
            </div>
          </div>
        </div>
        <div className="glass-card p-6 glass-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-200">Total Facturado</p>
              <p className="text-white text-2xl">
                ${invoices.reduce((sum, i) => sum + i.total, 0).toLocaleString('es-CO')}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-emerald-400 icon-enhanced" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 icon-enhanced" />
              <input
                type="text"
                placeholder="Buscar por cliente, número de factura..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 backdrop-blur-sm"
              />
            </div>
          </div>
          <div className="w-full md:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="dropdown-menu w-full px-4 py-3 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 cursor-pointer"
            >
              <option value="all" className="dropdown-option bg-gray-800 text-white">Todos los estados</option>
              <option value="pending" className="dropdown-option bg-gray-800 text-white">Pendientes</option>
              <option value="paid" className="dropdown-option bg-gray-800 text-white">Pagadas</option>
              <option value="overdue" className="dropdown-option bg-gray-800 text-white">Vencidas</option>
            </select>
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5 backdrop-blur-sm">
              <tr>
                <th className="px-6 py-3 text-left text-gray-200 uppercase tracking-wider">Factura</th>
                <th className="px-6 py-3 text-left text-gray-200 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-3 text-left text-gray-200 uppercase tracking-wider">Vehículo</th>
                <th className="px-6 py-3 text-left text-gray-200 uppercase tracking-wider">Venta</th>
                <th className="px-6 py-3 text-left text-gray-200 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-gray-200 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-left text-gray-200 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredInvoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-white">{invoice.invoiceNumber}</div>
                      <div className="text-gray-300">
                        Emitida: {new Date(invoice.issueDate).toLocaleDateString('es-CO')}
                      </div>
                      <div className="text-gray-300">
                        Vence: {new Date(invoice.dueDate).toLocaleDateString('es-CO')}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-white">
                    {getClientName(invoice.clientId)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-white">
                    {getVehicleInfo(invoice.vehicleId)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-white">
                    {getSaleInfo(invoice.saleId)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-white">
                        ${invoice.total.toLocaleString('es-CO')}
                      </div>
                      <div className="text-gray-300">
                        Subtotal: ${invoice.subtotal.toLocaleString('es-CO')}
                      </div>
                      <div className="text-gray-300">
                        IVA: ${invoice.tax.toLocaleString('es-CO')}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(invoice.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => showAlert('info', 'Ver factura', `Mostrando detalles de ${invoice.invoiceNumber}`)}
                        className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-100 rounded"
                        title="Ver detalles"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => exportToPDF(invoice)}
                        className="text-green-600 hover:text-green-900 p-1 hover:bg-green-100 rounded"
                        title="Exportar PDF"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => sendByEmail(invoice)}
                        className="text-purple-600 hover:text-purple-900 p-1 hover:bg-purple-100 rounded"
                        title="Enviar por email"
                      >
                        <Mail className="h-4 w-4" />
                      </button>
                      {invoice.status === 'pending' && (
                        <button
                          onClick={() => markAsPaid(invoice)}
                          className="text-orange-600 hover:text-orange-900 p-1 hover:bg-orange-100 rounded"
                          title="Marcar como pagada"
                        >
                          <DollarSign className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredInvoices.length === 0 && (
          <div className="p-8 text-center">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No se encontraron facturas</p>
          </div>
        )}
      </div>

      {/* Create Invoice Modal */}
      {showCreateModal && (
        <div className="modal-backdrop fixed inset-0 flex items-center justify-center p-4 z-50">
          <div className="modal-content max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Nueva Factura
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">
                    Venta a Facturar *
                  </label>
                  <select
                    value={formData.saleId}
                    onChange={(e) => handleInputChange('saleId', e.target.value)}
                    className={`form-input w-full px-4 py-3 rounded-lg text-white cursor-pointer ${
                      errors.saleId ? 'border-red-400 focus:ring-red-400' : ''
                    }`}
                  >
                    <option value="" className="dropdown-option bg-gray-800 text-white">Seleccionar venta</option>
                    {unBilledSales.map(sale => {
                      const client = clients.find(c => c.id === sale.clientId);
                      const vehicle = vehicles.find(v => v.id === sale.vehicleId);
                      return (
                        <option key={sale.id} value={sale.id} className="dropdown-option bg-gray-800 text-white">
                          {sale.saleNumber} - {client?.name} - {vehicle?.brand} {vehicle?.model}
                        </option>
                      );
                    })}
                  </select>
                  {errors.saleId && <p className="mt-1 text-sm text-red-600">{errors.saleId}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Método de Pago *
                  </label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                    className={`form-input w-full px-4 py-3 rounded-lg text-white cursor-pointer ${
                      errors.paymentMethod ? 'border-red-400 focus:ring-red-400' : ''
                    }`}
                  >
                    {paymentMethods.map(method => (
                      <option key={method.value} value={method.value} className="dropdown-option bg-gray-800 text-white">{method.label}</option>
                    ))}
                  </select>
                  {errors.paymentMethod && <p className="mt-1 text-sm text-red-600">{errors.paymentMethod}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notas Adicionales
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    rows={3}
                    placeholder="Observaciones o condiciones especiales..."
                  />
                </div>

                {formData.saleId && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Resumen de Facturación</h4>
                    {(() => {
                      const sale = sales.find(s => s.id === formData.saleId);
                      if (sale) {
                        const subtotal = sale.totalPrice;
                        const tax = subtotal * 0.19;
                        const total = subtotal + tax;
                        return (
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span>Subtotal:</span>
                              <span>${subtotal.toLocaleString('es-CO')}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>IVA (19%):</span>
                              <span>${tax.toLocaleString('es-CO')}</span>
                            </div>
                            <div className="flex justify-between font-bold">
                              <span>Total:</span>
                              <span>${total.toLocaleString('es-CO')}</span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </div>
                )}
              </div>
              
              <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setFormData({
                      saleId: '',
                      paymentMethod: 'cash',
                      notes: ''
                    });
                    setErrors({});
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveInvoice}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  Crear Factura
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};