import React, { useState } from 'react';
import { Package, Plus, Search, Truck, FileText, DollarSign, CheckCircle, Clock, Building, Trash2 } from 'lucide-react';
import { AlertType } from '@/types/common';

interface PurchasesModuleProps {
  showAlert: (type: AlertType, title: string, message: string) => void;
  showConfirmDialog: (title: string, message: string, onConfirm: () => void) => void;
}

interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  taxId: string;
  category: string;
  rating: number;
  status: 'active' | 'inactive';
  paymentTerms: string;
  creditLimit: number;
  totalPurchases: number;
}

interface PurchaseOrder {
  id: string;
  orderNumber: string;
  supplierId: string;
  orderDate: string;
  expectedDelivery: string;
  status: 'draft' | 'sent' | 'confirmed' | 'partial' | 'received' | 'cancelled';
  items: PurchaseItem[];
  subtotal: number;
  tax: number;
  total: number;
  notes: string;
  approvedBy?: string;
  receivedDate?: string;
}

interface PurchaseItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  received?: number;
}

export const PurchasesModule: React.FC<PurchasesModuleProps> = ({ showAlert }) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'suppliers' | 'analytics'>('orders');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [newOrder, setNewOrder] = useState({
    orderNumber: '',
    supplierId: '',
    orderDate: new Date().toISOString().split('T')[0],
    expectedDelivery: '',
    notes: '',
    status: 'draft',
    items: []
  });
  
  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    // Lógica para crear la orden
    const order = {
      ...newOrder,
      id: `order-${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'draft' as const,
      items: []
    };
    
    // Aquí iría la lógica para guardar la orden
    console.log('Nueva orden creada:', order);
    setShowOrderModal(false);
    // Resetear el formulario
    setNewOrder({
      orderNumber: '',
      supplierId: '',
      orderDate: new Date().toISOString().split('T')[0],
      expectedDelivery: '',
      notes: '',
      status: 'draft',
      items: []
    });
  };

  // Order Modal Component
  const OrderModal = () => (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-card-strong max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white">Nueva Orden de Compra</h2>
            <button 
              onClick={() => setShowOrderModal(false)}
              className="text-gray-400 hover:text-white transition-colors p-1"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <form onSubmit={handleCreateOrder} className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-sm text-gray-200 mb-1">N° Orden <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={newOrder.orderNumber}
                    onChange={(e) => setNewOrder({...newOrder, orderNumber: e.target.value})}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 backdrop-blur-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-200 mb-1">Proveedor <span className="text-red-500">*</span></label>
                  <select
                    value={newOrder.supplierId}
                    onChange={(e) => setNewOrder({...newOrder, supplierId: e.target.value})}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 backdrop-blur-sm"
                    required
                  >
                    <option value="" className="text-gray-900">Seleccionar proveedor</option>
                    {suppliers.map(supplier => (
                      <option key={supplier.id} value={supplier.id} className="text-gray-900">{supplier.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-200 mb-1">Fecha Orden <span className="text-red-500">*</span></label>
                  <input
                    type="date"
                    value={newOrder.orderDate}
                    onChange={(e) => setNewOrder({...newOrder, orderDate: e.target.value})}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 backdrop-blur-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-200 mb-1">Fecha Entrega</label>
                  <input
                    type="date"
                    value={newOrder.expectedDelivery}
                    onChange={(e) => setNewOrder({...newOrder, expectedDelivery: e.target.value})}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 backdrop-blur-sm"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm text-gray-200 mb-1">Notas</label>
                <textarea
                  value={newOrder.notes}
                  onChange={(e) => setNewOrder({...newOrder, notes: e.target.value})}
                  rows={2}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 backdrop-blur-sm"
                />
              </div>
              
              {/* Order Items Table */}
              <div className="mt-2">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-gray-200 text-sm font-medium">Productos</h3>
                  <button
                    type="button"
                    onClick={() => {}}
                    className="px-3 py-1.5 text-xs text-white bg-orange-600 hover:bg-orange-700 rounded-lg transition-all flex items-center space-x-1"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Agregar Producto</span>
                  </button>
                </div>
                
                <div className="overflow-x-auto rounded-lg border border-white/10">
                  <table className="min-w-full divide-y divide-white/10">
                    <thead className="bg-white/5">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">Producto</th>
                        <th className="px-2 py-2 text-center text-xs font-medium text-gray-200 uppercase tracking-wider w-20">Cantidad</th>
                        <th className="px-2 py-2 text-right text-xs font-medium text-gray-200 uppercase tracking-wider w-28">Precio Unit.</th>
                        <th className="px-2 py-2 text-right text-xs font-medium text-gray-200 uppercase tracking-wider w-28">Total</th>
                        <th className="px-2 py-2 text-center text-xs font-medium text-gray-200 uppercase tracking-wider w-12"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      <tr className="hover:bg-white/5">
                        <td className="px-3 py-2">
                          <select className="w-full px-2 py-1.5 text-sm bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 backdrop-blur-sm">
                            <option value="" className="text-gray-900">Seleccionar producto</option>
                            <option value="1">Producto de ejemplo</option>
                          </select>
                        </td>
                        <td className="px-2 py-2">
                          <div className="flex justify-center">
                            <input 
                              type="number" 
                              min="1"
                              className="w-16 px-2 py-1.5 bg-white/10 border border-white/20 rounded-lg text-white text-center text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 backdrop-blur-sm" 
                              value="1"
                            />
                          </div>
                        </td>
                        <td className="px-2 py-2">
                          <div className="flex justify-end">
                            <div className="relative">
                              <span className="absolute left-2 top-1.5 text-xs text-gray-400">$</span>
                              <input 
                                type="number" 
                                step="0.01" 
                                min="0"
                                className="w-24 pl-6 pr-2 py-1.5 bg-white/10 border border-white/20 rounded-lg text-white text-right text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 backdrop-blur-sm" 
                                value="0.00"
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-2 py-2 text-right text-sm text-gray-200">$0.00</td>
                        <td className="px-2 py-2 text-center">
                          <button 
                            type="button" 
                            className="text-red-400 hover:text-red-300 p-1 hover:bg-red-500/20 rounded transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                <div className="mt-4 flex justify-end">
                  <div className="w-56 space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">Subtotal:</span>
                      <span className="text-white">$0.00</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">IVA (19%):</span>
                      <span className="text-white">$0.00</span>
                    </div>
                    <div className="flex justify-between pt-1.5 border-t border-white/10 text-base">
                      <span className="text-gray-200 font-medium">Total:</span>
                      <span className="text-orange-400 font-bold">$0.00</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setShowOrderModal(false)}
                className="px-4 py-2 text-sm text-gray-200 bg-white/10 hover:bg-white/20 rounded-lg transition-all glass-hover border border-white/20"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 btn-electric text-white rounded-lg transition-all glass-hover flex items-center space-x-2"
              >
                <CheckCircle className="h-4 w-4" />
                <span>Guardar Orden</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [newSupplier, setNewSupplier] = useState<Omit<Supplier, 'id' | 'rating' | 'totalPurchases'>>({ 
    name: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    taxId: '',
    category: 'Vehículos',
    status: 'active',
    paymentTerms: '30 días',
    creditLimit: 0
  });

  const handleSupplierInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewSupplier(prev => ({
      ...prev,
      [name]: name === 'creditLimit' ? parseFloat(value) || 0 : value
    }));
  };

  const handleAddSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!newSupplier.name || !newSupplier.contactPerson || !newSupplier.taxId) {
      showAlert('error', 'Error', 'Por favor complete los campos obligatorios');
      return;
    }

    // Create new supplier with generated ID
    const supplier: Supplier = {
      ...newSupplier,
      id: Date.now().toString(),
      rating: 0,
      totalPurchases: 0
    };

    // Add to suppliers list
    setSuppliers(prev => [...prev, supplier]);
    
    // Reset form and close modal
    setNewSupplier({ 
      name: '',
      contactPerson: '',
      phone: '',
      email: '',
      address: '',
      taxId: '',
      category: 'Vehículos',
      status: 'active',
      paymentTerms: '30 días',
      creditLimit: 0
    });
    
    setShowSupplierModal(false);
    showAlert('success', 'Éxito', 'Proveedor agregado correctamente');
  };

  const [suppliers, setSuppliers] = useState<Supplier[]>([
    {
      id: '1',
      name: 'Toyota Colombia S.A.',
      contactPerson: 'Ana María Gutíerrez',
      phone: '+57 1 800 123 4567',
      email: 'ventas@toyota.com.co',
      address: 'Calle 100 #8A-55, Bogotá',
      taxId: '860.123.456-7',
      category: 'Vehículos',
      rating: 4.9,
      status: 'active',
      paymentTerms: '30 días',
      creditLimit: 500000000,
      totalPurchases: 1250000000
    },
    {
      id: '2',
      name: 'Repuestos Originales S.A.S.',
      contactPerson: 'Carlos Mendoza',
      phone: '+57 300 987 6543',
      email: 'ventas@repuestosoriginales.com',
      address: 'Carrera 30 #45-67, Medellín',
      taxId: '900.987.654-3',
      category: 'Repuestos',
      rating: 4.6,
      status: 'active',
      paymentTerms: '15 días',
      creditLimit: 150000000,
      totalPurchases: 380000000
    },
    {
      id: '3',
      name: 'Accesorios Premium Ltda.',
      contactPerson: 'María López',
      phone: '+57 310 456 7890',
      email: 'contacto@accesoriospreimium.co',
      address: 'Zona Franca Bogotá, Bodega 15',
      taxId: '830.456.789-1',
      category: 'Accesorios',
      rating: 4.3,
      status: 'active',
      paymentTerms: '45 días',
      creditLimit: 80000000,
      totalPurchases: 125000000
    }
  ]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [purchaseOrders, _setPurchaseOrders] = useState<PurchaseOrder[]>([
    {
      id: '1',
      orderNumber: 'OC-2024-001',
      supplierId: '1',
      orderDate: '2024-01-20',
      expectedDelivery: '2024-01-30',
      status: 'confirmed',
      items: [
        {
          id: '1',
          name: 'Toyota Corolla 2024 GLI',
          description: 'Sedán 4 puertas, motor 1.8L CVT',
          quantity: 3,
          unitPrice: 75000000,
          total: 225000000
        },
        {
          id: '2',
          name: 'Toyota Corolla 2024 XEI',
          description: 'Sedán 4 puertas, motor 2.0L CVT',
          quantity: 2,
          unitPrice: 85000000,
          total: 170000000
        }
      ],
      subtotal: 395000000,
      tax: 75050000,
      total: 470050000,
      notes: 'Entrega en concesionaria, incluye pre-entrega',
      approvedBy: 'Juan Pérez - Gerente General'
    },
    {
      id: '2',
      orderNumber: 'OC-2024-002',
      supplierId: '2',
      orderDate: '2024-01-22',
      expectedDelivery: '2024-01-25',
      status: 'partial',
      items: [
        {
          id: '1',
          name: 'Filtros de Aceite Original',
          description: 'Pack x50 unidades para motores 1.6L-2.0L',
          quantity: 50,
          unitPrice: 18000,
          total: 900000,
          received: 30
        },
        {
          id: '2',
          name: 'Pastillas de Freno Cerámicas',
          description: 'Juego completo delantero',
          quantity: 20,
          unitPrice: 85000,
          total: 1700000,
          received: 20
        }
      ],
      subtotal: 2600000,
      tax: 494000,
      total: 3094000,
      notes: 'Entrega parcial recibida',
      approvedBy: 'María García - Jefe de Compras'
    },
    {
      id: '3',
      orderNumber: 'OC-2024-003',
      supplierId: '3',
      orderDate: '2024-01-24',
      expectedDelivery: '2024-01-28',
      status: 'sent',
      items: [
        {
          id: '1',
          name: 'Tapetes Premium de Caucho',
          description: 'Juego universal 4 piezas',
          quantity: 25,
          unitPrice: 100000,
          total: 2500000
        },
        {
          id: '2',
          name: 'Alarmas de Seguridad',
          description: 'Sistema completo con control remoto',
          quantity: 10,
          unitPrice: 650000,
          total: 6500000
        }
      ],
      subtotal: 9000000,
      tax: 1710000,
      total: 10710000,
      notes: 'Pendiente confirmación del proveedor'
    }
  ]);

  const filteredOrders = purchaseOrders.filter(order => {
    const supplier = suppliers.find(s => s.id === order.supplierId);
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredSuppliers = suppliers.filter(supplier => {
    return supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           supplier.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
           supplier.contactPerson.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const getStatusBadge = (status: PurchaseOrder['status']) => {
    const statusConfig = {
      draft: { label: 'Borrador', class: 'bg-gray-500/20 text-gray-300' },
      sent: { label: 'Enviada', class: 'bg-blue-500/20 text-blue-300' },
      confirmed: { label: 'Confirmada', class: 'bg-yellow-500/20 text-yellow-300' },
      partial: { label: 'Parcial', class: 'bg-orange-500/20 text-orange-300' },
      received: { label: 'Recibida', class: 'bg-green-500/20 text-green-300' },
      cancelled: { label: 'Cancelada', class: 'bg-red-500/20 text-red-300' }
    };
    const config = statusConfig[status];
    return <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${config.class} backdrop-blur-sm`}>{config.label}</span>;
  };

  const getSupplierName = (supplierId: string) => {
    const supplier = suppliers.find(s => s.id === supplierId);
    return supplier ? supplier.name : 'Proveedor no encontrado';
  };

  const getOrderStats = () => {
    const total = purchaseOrders.length;
    const pending = purchaseOrders.filter(o => ['draft', 'sent', 'confirmed'].includes(o.status)).length;
    const completed = purchaseOrders.filter(o => o.status === 'received').length;
    const totalValue = purchaseOrders.reduce((sum, o) => sum + o.total, 0);
    
    return { total, pending, completed, totalValue };
  };

  const stats = getOrderStats();

  return (
    <div className="space-y-6">
      {/* Order Modal */}
      {showOrderModal && <OrderModal />}
      
      {/* Supplier Modal */}
      {showSupplierModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card-strong max-w-2xl w-full">
            <div className="p-5">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">Nuevo Proveedor</h2>
                <button 
                  onClick={() => setShowSupplierModal(false)}
                  className="text-gray-400 hover:text-white transition-colors p-1"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form onSubmit={handleAddSupplier} className="space-y-3">
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">Nombre <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      name="name"
                      value={newSupplier.name}
                      onChange={handleSupplierInputChange}
                      className="w-full px-3 py-1.5 text-sm bg-white/5 border border-white/10 rounded-md text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">Contacto <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        name="contactPerson"
                        value={newSupplier.contactPerson}
                        onChange={handleSupplierInputChange}
                        className="w-full px-3 py-1.5 text-sm bg-white/5 border border-white/10 rounded-md text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">Teléfono</label>
                      <input
                        type="tel"
                        name="phone"
                        value={newSupplier.phone}
                        onChange={handleSupplierInputChange}
                        className="w-full px-3 py-1.5 text-sm bg-white/5 border border-white/10 rounded-md text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={newSupplier.email}
                      onChange={handleSupplierInputChange}
                      className="w-full px-3 py-1.5 text-sm bg-white/5 border border-white/10 rounded-md text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">NIT/RUT <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        name="taxId"
                        value={newSupplier.taxId}
                        onChange={handleSupplierInputChange}
                        className="w-full px-3 py-1.5 text-sm bg-white/5 border border-white/10 rounded-md text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">Categoría</label>
                      <select
                        name="category"
                        value={newSupplier.category}
                        onChange={handleSupplierInputChange}
                        className="w-full px-3 py-1.5 text-sm bg-white/5 border border-white/10 rounded-md text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      >
                        <option value="Vehículos">Vehículos</option>
                        <option value="Repuestos">Repuestos</option>
                        <option value="Accesorios">Accesorios</option>
                        <option value="Servicios">Servicios</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">Dirección</label>
                    <textarea
                      name="address"
                      value={newSupplier.address}
                      onChange={handleSupplierInputChange}
                      rows={2}
                      className="w-full px-3 py-1.5 text-sm bg-white/5 border border-white/10 rounded-md text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">Términos de Pago</label>
                      <select
                        name="paymentTerms"
                        value={newSupplier.paymentTerms}
                        onChange={handleSupplierInputChange}
                        className="w-full px-3 py-1.5 text-sm bg-white/5 border border-white/10 rounded-md text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      >
                        <option value="Contado">Contado</option>
                        <option value="15 días">15 días</option>
                        <option value="30 días">30 días</option>
                        <option value="60 días">60 días</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">Límite Crédito</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">$</span>
                        <input
                          type="number"
                          name="creditLimit"
                          value={newSupplier.creditLimit || ''}
                          onChange={handleSupplierInputChange}
                          min="0"
                          step="100000"
                          className="w-full pl-8 pr-3 py-1.5 text-sm bg-white/5 border border-white/10 rounded-md text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent text-right"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-2">
                    <label className="block text-xs font-medium text-gray-300 mb-2">Estado</label>
                    <div className="flex items-center space-x-4">
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          name="status"
                          value="active"
                          checked={newSupplier.status === 'active'}
                          onChange={handleSupplierInputChange}
                          className="h-3.5 w-3.5 text-orange-500 focus:ring-orange-500"
                        />
                        <span className="ml-2 text-xs text-gray-300">Activo</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          name="status"
                          value="inactive"
                          checked={newSupplier.status === 'inactive'}
                          onChange={handleSupplierInputChange}
                          className="h-3.5 w-3.5 text-orange-500 focus:ring-orange-500"
                        />
                        <span className="ml-2 text-xs text-gray-300">Inactivo</span>
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 flex justify-end space-x-2 border-t border-white/10 mt-4">
                  <button
                    type="button"
                    onClick={() => setShowSupplierModal(false)}
                    className="px-4 py-1.5 text-xs font-medium text-gray-300 hover:text-white transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-orange-500 text-white text-xs font-medium rounded-md hover:bg-orange-600 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-orange-500 transition-colors"
                  >
                    Guardar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="glass-card-strong p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">Compras y Proveedores</h1>
            <p className="text-gray-200 mt-1">Gestión de órdenes de compra y relaciones con proveedores</p>
          </div>
          <div className="flex space-x-3 mt-4 sm:mt-0">
            <button
              onClick={() => setShowSupplierModal(true)}
              className="btn-emerald text-white px-4 py-2 rounded-lg flex items-center space-x-2"
            >
              <Building className="h-4 w-4" />
              <span>Nuevo Proveedor</span>
            </button>
            <button
              onClick={() => setShowOrderModal(true)}
              className="btn-primary text-white px-4 py-2 rounded-lg flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Nueva Orden</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-200">Órdenes Totales</p>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
            </div>
            <FileText className="h-6 w-6 text-blue-400 icon-enhanced" />
          </div>
        </div>
        
        <div className="glass-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-200">Pendientes</p>
              <p className="text-2xl font-bold text-white">{stats.pending}</p>
            </div>
            <Clock className="h-6 w-6 text-yellow-400 icon-enhanced" />
          </div>
        </div>
        
        <div className="glass-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-200">Completadas</p>
              <p className="text-2xl font-bold text-white">{stats.completed}</p>
            </div>
            <CheckCircle className="h-6 w-6 text-green-400 icon-enhanced" />
          </div>
        </div>
        
        <div className="glass-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-200">Valor Total</p>
              <p className="text-xl font-bold text-white">${stats.totalValue.toLocaleString('es-CO')}</p>
            </div>
            <DollarSign className="h-6 w-6 text-green-400 icon-enhanced" />
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="glass-card p-1">
        <div className="flex space-x-1">
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
              activeTab === 'orders' 
                ? 'bg-orange-500/30 text-white' 
                : 'text-gray-300 hover:bg-white/10'
            }`}
          >
            Órdenes de Compra
          </button>
          <button
            onClick={() => setActiveTab('suppliers')}
            className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
              activeTab === 'suppliers' 
                ? 'bg-orange-500/30 text-white' 
                : 'text-gray-300 hover:bg-white/10'
            }`}
          >
            Proveedores
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
              activeTab === 'analytics' 
                ? 'bg-orange-500/30 text-white' 
                : 'text-gray-300 hover:bg-white/10'
            }`}
          >
            Análisis
          </button>
        </div>
      </div>

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <>
          {/* Filters */}
          <div className="glass-card p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-300" />
                  <input
                    type="text"
                    placeholder="Buscar por número de orden o proveedor..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-white/20 rounded-lg glass-content placeholder-gray-300 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
              </div>
              <div className="w-full md:w-48">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-white/20 rounded-lg glass-content text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="all">Todos los estados</option>
                  <option value="draft">Borrador</option>
                  <option value="sent">Enviadas</option>
                  <option value="confirmed">Confirmadas</option>
                  <option value="partial">Parciales</option>
                  <option value="received">Recibidas</option>
                  <option value="cancelled">Canceladas</option>
                </select>
              </div>
            </div>
          </div>

          {/* Orders Table */}
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="glass-content">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">Orden</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">Proveedor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">Fecha Orden</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">Entrega Estimada</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">Estado</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="bg-white/10 rounded-full p-2 mr-3 backdrop-blur-sm">
                            <FileText className="h-5 w-5 text-gray-300" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-white">{order.orderNumber}</div>
                            <div className="text-sm text-gray-300">{order.items.length} artículos</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-white">{getSupplierName(order.supplierId)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        {new Date(order.orderDate).toLocaleDateString('es-CO')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        {new Date(order.expectedDelivery).toLocaleDateString('es-CO')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(order.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-medium">
                        ${order.total.toLocaleString('es-CO')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => showAlert('info', 'Ver orden', `Mostrando detalles de ${order.orderNumber}`)}
                            className="text-blue-400 hover:text-blue-300 p-1 hover:bg-blue-500/20 rounded backdrop-blur-sm"
                          >
                            <FileText className="h-4 w-4" />
                          </button>
                          {order.status === 'confirmed' && (
                            <button
                              onClick={() => showAlert('success', 'Recibir orden', `Marcando orden ${order.orderNumber} como recibida`)}
                              className="text-green-400 hover:text-green-300 p-1 hover:bg-green-500/20 rounded backdrop-blur-sm"
                            >
                              <Truck className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredOrders.length === 0 && (
              <div className="p-8 text-center">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-300">No se encontraron órdenes de compra</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Suppliers Tab */}
      {activeTab === 'suppliers' && (
        <>
          {/* Suppliers Search */}
          <div className="glass-card p-6">
            <div className="relative">
              <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-300" />
              <input
                type="text"
                placeholder="Buscar por nombre, categoría o contacto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-white/20 rounded-lg glass-content placeholder-gray-300 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
          </div>

          {/* Suppliers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSuppliers.map((supplier) => (
              <div key={supplier.id} className="glass-card p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-white/10 rounded-full p-3 backdrop-blur-sm">
                      <Building className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{supplier.name}</h3>
                      <p className="text-sm text-gray-300">{supplier.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="text-yellow-400">★</span>
                    <span className="text-white text-sm">{supplier.rating}</span>
                  </div>
                </div>
                
                <div className="space-y-2 mb-4">
                  <p className="text-sm text-gray-200">
                    <span className="text-gray-400">Contacto:</span> {supplier.contactPerson}
                  </p>
                  <p className="text-sm text-gray-200">
                    <span className="text-gray-400">Teléfono:</span> {supplier.phone}
                  </p>
                  <p className="text-sm text-gray-200">
                    <span className="text-gray-400">Email:</span> {supplier.email}
                  </p>
                  <p className="text-sm text-gray-200">
                    <span className="text-gray-400">Términos:</span> {supplier.paymentTerms}
                  </p>
                </div>
                
                <div className="border-t border-white/10 pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-400">Total Compras</span>
                    <span className="text-sm text-white font-medium">
                      ${supplier.totalPurchases.toLocaleString('es-CO')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Límite Crédito</span>
                    <span className="text-sm text-white font-medium">
                      ${supplier.creditLimit.toLocaleString('es-CO')}
                    </span>
                  </div>
                </div>
                
                <button
                  onClick={() => showAlert('info', 'Nueva orden', `Creando orden para ${supplier.name}`)}
                  className="w-full btn-primary text-white py-2 rounded-lg mt-4"
                >
                  Nueva Orden
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Compras por Categoría</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Vehículos</span>
                <span className="text-white font-medium">$470,050,000</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Repuestos</span>
                <span className="text-white font-medium">$3,094,000</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Accesorios</span>
                <span className="text-white font-medium">$10,710,000</span>
              </div>
            </div>
          </div>
          
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Top Proveedores</h3>
            <div className="space-y-3">
              {suppliers.sort((a, b) => b.totalPurchases - a.totalPurchases).slice(0, 5).map((supplier) => (
                <div key={supplier.id} className="flex justify-between items-center">
                  <span className="text-gray-300">{supplier.name}</span>
                  <span className="text-white font-medium">
                    ${supplier.totalPurchases.toLocaleString('es-CO')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};