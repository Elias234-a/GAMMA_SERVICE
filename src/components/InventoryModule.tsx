import React, { useState } from 'react';
import { Package, Plus, Search, Filter, Edit, Trash2, AlertTriangle, TrendingUp, TrendingDown, Eye, Download, Truck, Settings, BarChart3, Car, Wrench, Sparkles, X } from 'lucide-react';
import { AlertType } from '@/types/common';

interface InventoryModuleProps {
  showAlert: (type: AlertType, title: string, message: string) => void;
  showConfirmDialog: (title: string, message: string, onConfirm: () => void) => void;
}

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  type: 'vehicle' | 'part' | 'accessory';
  sku: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  price: number;
  cost: number;
  supplier: string;
  location: string;
  lastUpdated: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
  description: string;
  brand: string;
  vehicleCompatibility?: string[];
}

export const InventoryModule: React.FC<InventoryModuleProps> = ({ showAlert, showConfirmDialog }) => {
  const [activeTab, setActiveTab] = useState<'vehicles' | 'parts' | 'accessories' | 'alerts'>('vehicles');
  
  // Map between tab names and item types
  const tabToTypeMap = {
    'vehicles': 'vehicle',
    'parts': 'part',
    'accessories': 'accessory',
    'alerts': ''
  } as const;
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [formData, setFormData] = useState<Omit<InventoryItem, 'id' | 'lastUpdated'>>({
    name: '',
    category: '',
    type: 'vehicle' as 'vehicle' | 'part' | 'accessory',
    sku: '',
    currentStock: 0,
    minStock: 0,
    maxStock: 0,
    price: 0,
    cost: 0,
    supplier: '',
    location: '',
    description: '',
    brand: '',
    vehicleCompatibility: [] as string[],
    status: 'in_stock' as const
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [inventory, setInventory] = useState<InventoryItem[]>([
    // Vehículos
    {
      id: '1',
      name: 'Toyota Corolla 2024',
      category: 'Sedán',
      type: 'vehicle',
      sku: 'VEH-TOY-COR24-001',
      currentStock: 5,
      minStock: 2,
      maxStock: 15,
      price: 85000000,
      cost: 75000000,
      supplier: 'Toyota Colombia',
      location: 'Lote A - Sección 1',
      lastUpdated: '2024-01-22',
      status: 'in_stock',
      description: 'Sedán compacto, motor 1.8L, transmisión CVT',
      brand: 'Toyota'
    },
    {
      id: '2',
      name: 'Chevrolet Spark 2023',
      category: 'Hatchback',
      type: 'vehicle',
      sku: 'VEH-CHE-SPA23-002',
      currentStock: 1,
      minStock: 2,
      maxStock: 10,
      price: 45000000,
      cost: 40000000,
      supplier: 'Chevrolet Colombia',
      location: 'Lote B - Sección 1',
      lastUpdated: '2024-01-21',
      status: 'low_stock',
      description: 'Hatchback urbano, motor 1.4L, transmisión manual',
      brand: 'Chevrolet'
    },
    // Repuestos
    {
      id: '3',
      name: 'Filtro de Aceite Original',
      category: 'Filtros',
      type: 'part',
      sku: 'REP-FIL-ACE-003',
      currentStock: 45,
      minStock: 20,
      maxStock: 100,
      price: 25000,
      cost: 18000,
      supplier: 'Repuestos Originales SA',
      location: 'Bodega A - Estante 15',
      lastUpdated: '2024-01-20',
      status: 'in_stock',
      description: 'Filtro de aceite compatible con motores 1.6L-2.0L',
      brand: 'Original',
      vehicleCompatibility: ['Toyota Corolla', 'Honda Civic', 'Nissan Sentra']
    },
    {
      id: '4',
      name: 'Pastillas de Freno Delanteras',
      category: 'Frenos',
      type: 'part',
      sku: 'REP-FRE-PAS-004',
      currentStock: 8,
      minStock: 15,
      maxStock: 50,
      price: 120000,
      cost: 85000,
      supplier: 'Frenos y Seguridad',
      location: 'Bodega B - Estante 8',
      lastUpdated: '2024-01-19',
      status: 'low_stock',
      description: 'Pastillas de freno cerámicas para vehículos medianos',
      brand: 'Brembo',
      vehicleCompatibility: ['Toyota Corolla', 'Chevrolet Cruze', 'Nissan Sentra']
    },
    {
      id: '5',
      name: 'Batería 12V 60Ah',
      category: 'Eléctrico',
      type: 'part',
      sku: 'REP-ELE-BAT-005',
      currentStock: 0,
      minStock: 10,
      maxStock: 25,
      price: 350000,
      cost: 280000,
      supplier: 'Baterías Nacional',
      location: 'Bodega C - Área Eléctrica',
      lastUpdated: '2024-01-18',
      status: 'out_of_stock',
      description: 'Batería libre de mantenimiento para vehículos pequeños y medianos',
      brand: 'MAC',
      vehicleCompatibility: ['Toyota Corolla', 'Chevrolet Spark', 'Nissan March']
    },
    // Accesorios
    {
      id: '6',
      name: 'Tapetes de Caucho Premium',
      category: 'Interior',
      type: 'accessory',
      sku: 'ACC-INT-TAP-006',
      currentStock: 25,
      minStock: 10,
      maxStock: 40,
      price: 150000,
      cost: 100000,
      supplier: 'Accesorios Premium',
      location: 'Sala de Ventas - Vitrina 2',
      lastUpdated: '2024-01-21',
      status: 'in_stock',
      description: 'Juego de tapetes de caucho universales, alta calidad',
      brand: 'WeatherTech',
      vehicleCompatibility: ['Universal']
    },
    {
      id: '7',
      name: 'Sistema de Alarma Avanzado',
      category: 'Seguridad',
      type: 'accessory',
      sku: 'ACC-SEG-ALA-007',
      currentStock: 12,
      minStock: 5,
      maxStock: 20,
      price: 850000,
      cost: 650000,
      supplier: 'Seguridad Automotriz',
      location: 'Taller - Área Instalaciones',
      lastUpdated: '2024-01-20',
      status: 'in_stock',
      description: 'Sistema de alarma con sensor de movimiento y control remoto',
      brand: 'Viper',
      vehicleCompatibility: ['Universal']
    }
  ]);

  const categories = {
    vehicles: ['all', 'Sedán', 'Hatchback', 'SUV', 'Pickup', 'Crossover'],
    parts: ['all', 'Motor', 'Frenos', 'Suspensión', 'Eléctrico', 'Filtros', 'Aceites'],
    accessories: ['all', 'Interior', 'Exterior', 'Seguridad', 'Audio', 'Iluminación']
  };

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.brand.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesType = activeTab === 'alerts' || item.type === tabToTypeMap[activeTab];
    return matchesSearch && matchesCategory && matchesType;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'in_stock':
        return <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded-full text-xs font-medium backdrop-blur-sm">En Stock</span>;
      case 'low_stock':
        return <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 rounded-full text-xs font-medium backdrop-blur-sm">Stock Bajo</span>;
      case 'out_of_stock':
        return <span className="px-2 py-1 bg-red-500/20 text-red-300 rounded-full text-xs font-medium backdrop-blur-sm">Sin Stock</span>;
      default:
        return <span className="px-2 py-1 bg-gray-500/20 text-gray-300 rounded-full text-xs font-medium backdrop-blur-sm">Desconocido</span>;
    }
  };

  const getStockStats = (type?: string) => {
    const items = type ? inventory.filter(item => item.type === type) : inventory;
    const total = items.length;
    const inStock = items.filter(item => item.status === 'in_stock').length;
    const lowStock = items.filter(item => item.status === 'low_stock').length;
    const outOfStock = items.filter(item => item.status === 'out_of_stock').length;
    const totalValue = items.reduce((sum, item) => sum + (item.currentStock * item.cost), 0);
    
    return { total, inStock, lowStock, outOfStock, totalValue };
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'vehicle': return <Car className="h-5 w-5" />;
      case 'part': return <Wrench className="h-5 w-5" />;
      case 'accessory': return <Sparkles className="h-5 w-5" />;
      default: return <Package className="h-5 w-5" />;
    }
  };

  const handleAddItem = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      category: '',
      type: activeTab as 'vehicle' | 'part' | 'accessory',
      sku: '',
      currentStock: 0,
      minStock: 0,
      maxStock: 0,
      price: 0,
      cost: 0,
      supplier: '',
      location: '',
      description: '',
      brand: '',
      vehicleCompatibility: [],
      status: 'in_stock'
    });
    setFormErrors({});
    setShowAddModal(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name.endsWith('Stock') || name === 'price' || name === 'cost' 
        ? Number(value) 
        : value
    }));
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.name.trim()) errors.name = 'El nombre es requerido';
    if (!formData.category) errors.category = 'La categoría es requerida';
    if (!formData.sku.trim()) errors.sku = 'El SKU es requerido';
    if (formData.currentStock < 0) errors.currentStock = 'El stock no puede ser negativo';
    if (formData.minStock < 0) errors.minStock = 'El stock mínimo no puede ser negativo';
    if (formData.maxStock < formData.minStock) errors.maxStock = 'El stock máximo debe ser mayor o igual al mínimo';
    if (formData.price <= 0) errors.price = 'El precio debe ser mayor a 0';
    if (formData.cost <= 0) errors.cost = 'El costo debe ser mayor a 0';
    if (!formData.supplier.trim()) errors.supplier = 'El proveedor es requerido';
    if (!formData.location.trim()) errors.location = 'La ubicación es requerida';
    if (!formData.brand.trim()) errors.brand = 'La marca es requerida';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      const newItem: InventoryItem = {
        ...formData,
        id: Math.random().toString(36).substr(2, 9),
        lastUpdated: new Date().toISOString(),
        status: formData.currentStock === 0 
          ? 'out_of_stock' 
          : formData.currentStock <= formData.minStock 
            ? 'low_stock' 
            : 'in_stock'
      };

      setInventory(prev => [...prev, newItem]);
      setShowAddModal(false);
      setIsSubmitting(false);
      showAlert('success', 'Éxito', 'El artículo se ha agregado correctamente');
    }, 1000);
  };

  const lowStockItems = inventory.filter(item => item.status === 'low_stock' || item.status === 'out_of_stock');
  const vehicleStats = getStockStats('vehicle');
  const partStats = getStockStats('part');
  const accessoryStats = getStockStats('accessory');
  const totalStats = getStockStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card-strong p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">Gestión de Inventario</h1>
            <p className="text-gray-200 mt-1">Control integral de vehículos, repuestos y accesorios</p>
          </div>
          <button
            onClick={handleAddItem}
            className="mt-4 sm:mt-0 btn-primary text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Nuevo Artículo</span>
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-200">Total Artículos</p>
              <p className="text-2xl font-bold text-white">{totalStats.total}</p>
              <p className="text-xs text-gray-300">Valor: ${totalStats.totalValue.toLocaleString('es-CO')}</p>
            </div>
            <Package className="h-6 w-6 text-blue-400 icon-enhanced" />
          </div>
        </div>
        
        <div className="glass-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-200">En Stock</p>
              <p className="text-2xl font-bold text-white">{totalStats.inStock}</p>
              <p className="text-xs text-green-300">Disponibles</p>
            </div>
            <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
            </div>
          </div>
        </div>
        
        <div className="glass-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-200">Stock Bajo</p>
              <p className="text-2xl font-bold text-white">{totalStats.lowStock}</p>
              <p className="text-xs text-yellow-300">Requiere atención</p>
            </div>
            <AlertTriangle className="h-6 w-6 text-yellow-400 icon-enhanced" />
          </div>
        </div>
        
        <div className="glass-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-200">Sin Stock</p>
              <p className="text-2xl font-bold text-white">{totalStats.outOfStock}</p>
              <p className="text-xs text-red-300">Crítico</p>
            </div>
            <div className="w-6 h-6 bg-red-500/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <div className="w-3 h-3 bg-red-400 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="glass-card p-1">
        <div className="flex space-x-1">
          <button
            onClick={() => setActiveTab('vehicles')}
            className={`flex-1 py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2 ${
              activeTab === 'vehicles' 
                ? 'bg-orange-500/30 text-white' 
                : 'text-gray-300 hover:bg-white/10'
            }`}
          >
            <Car className="h-4 w-4" />
            <span>Vehículos ({vehicleStats.total})</span>
          </button>
          <button
            onClick={() => setActiveTab('parts')}
            className={`flex-1 py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2 ${
              activeTab === 'parts' 
                ? 'bg-orange-500/30 text-white' 
                : 'text-gray-300 hover:bg-white/10'
            }`}
          >
            <Wrench className="h-4 w-4" />
            <span>Repuestos ({partStats.total})</span>
          </button>
          <button
            onClick={() => setActiveTab('accessories')}
            className={`flex-1 py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2 ${
              activeTab === 'accessories' 
                ? 'bg-orange-500/30 text-white' 
                : 'text-gray-300 hover:bg-white/10'
            }`}
          >
            <Sparkles className="h-4 w-4" />
            <span>Accesorios ({accessoryStats.total})</span>
          </button>
          <button
            onClick={() => setActiveTab('alerts')}
            className={`flex-1 py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2 ${
              activeTab === 'alerts' 
                ? 'bg-orange-500/30 text-white' 
                : 'text-gray-300 hover:bg-white/10'
            }`}
          >
            <AlertTriangle className="h-4 w-4" />
            <span>Alertas ({lowStockItems.length})</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      {activeTab !== 'alerts' && (
        <div className="glass-card p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-300" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, SKU o marca..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-white/20 rounded-lg glass-content placeholder-gray-300 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="dropdown-menu w-full px-4 py-3 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 cursor-pointer"
              >
                {categories[activeTab as keyof typeof categories]?.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'Todas las categorías' : category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Content based on active tab */}
      {activeTab === 'alerts' ? (
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Alertas de Inventario</h3>
          <div className="space-y-4">
            {lowStockItems.map((item) => (
              <div key={item.id} className="glass-content p-4 rounded-lg border-l-4 border-red-500">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-red-500/20 rounded-full p-2 backdrop-blur-sm">
                      {getTypeIcon(item.type)}
                    </div>
                    <div>
                      <h4 className="text-white font-medium">{item.name}</h4>
                      <p className="text-gray-300 text-sm">SKU: {item.sku} | Ubicación: {item.location}</p>
                      <p className="text-gray-400 text-sm">
                        Stock actual: {item.currentStock} | Mínimo: {item.minStock}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(item.status)}
                    <button
                      onClick={() => showAlert('info', 'Reabastecer', `Iniciando proceso de reabastecimiento para ${item.name}`)}
                      className="btn-primary text-white px-3 py-1 rounded text-sm"
                    >
                      Reabastecer
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {lowStockItems.length === 0 && (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-green-400 mx-auto mb-4" />
                <p className="text-green-300">¡Excelente! No hay alertas de inventario</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Regular inventory table */
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="glass-content">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">Artículo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">SKU</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">Precio</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">Proveedor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">Ubicación</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredInventory.map((item) => (
                  <tr key={item.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="bg-white/10 rounded-full p-2 mr-3 backdrop-blur-sm">
                          {getTypeIcon(item.type)}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white">{item.name}</div>
                          <div className="text-sm text-gray-300">{item.brand} | {item.category}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-mono">
                      {item.sku}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white">{item.currentStock}</div>
                      <div className="text-sm text-gray-300">Min: {item.minStock} | Max: {item.maxStock}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white font-medium">${item.price.toLocaleString('es-CO')}</div>
                      <div className="text-sm text-gray-300">Costo: ${item.cost.toLocaleString('es-CO')}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {item.supplier}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {item.location}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(item.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => showAlert('info', 'Ver artículo', `Mostrando detalles de ${item.name}`)}
                          className="text-blue-400 hover:text-blue-300 p-1 hover:bg-blue-500/20 rounded backdrop-blur-sm"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => showAlert('info', 'Editar artículo', `Editando ${item.name}`)}
                          className="text-yellow-400 hover:text-yellow-300 p-1 hover:bg-yellow-500/20 rounded backdrop-blur-sm"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => showAlert('info', 'Mover stock', `Gestionando movimiento de ${item.name}`)}
                          className="text-green-400 hover:text-green-300 p-1 hover:bg-green-500/20 rounded backdrop-blur-sm"
                        >
                          <Truck className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredInventory.length === 0 && (
            <div className="p-8 text-center">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-300">No se encontraron artículos</p>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white">
                  {editingItem ? 'Editar Artículo' : 'Agregar Nuevo Artículo'}
                </h2>
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-300 hover:text-white"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-200 mb-1">
                      Nombre <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    {formErrors.name && <p className="mt-1 text-sm text-red-400">{formErrors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-200 mb-1">
                      Categoría <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="">Seleccionar categoría</option>
                      {categories[formData.type === 'vehicle' ? 'vehicles' : 
                        formData.type === 'part' ? 'parts' : 'accessories']
                        .filter(cat => cat !== 'all')
                        .map(category => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                    </select>
                    {formErrors.category && <p className="mt-1 text-sm text-red-400">{formErrors.category}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-200 mb-1">
                      SKU <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="sku"
                      value={formData.sku}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    {formErrors.sku && <p className="mt-1 text-sm text-red-400">{formErrors.sku}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-200 mb-1">
                      Marca <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="brand"
                      value={formData.brand}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    {formErrors.brand && <p className="mt-1 text-sm text-red-400">{formErrors.brand}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-200 mb-1">
                      Stock Actual
                    </label>
                    <input
                      type="number"
                      name="currentStock"
                      min="0"
                      value={formData.currentStock}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    {formErrors.currentStock && <p className="mt-1 text-sm text-red-400">{formErrors.currentStock}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-200 mb-1">
                      Stock Mínimo
                    </label>
                    <input
                      type="number"
                      name="minStock"
                      min="0"
                      value={formData.minStock}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    {formErrors.minStock && <p className="mt-1 text-sm text-red-400">{formErrors.minStock}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-200 mb-1">
                      Stock Máximo
                    </label>
                    <input
                      type="number"
                      name="maxStock"
                      min={formData.minStock}
                      value={formData.maxStock}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    {formErrors.maxStock && <p className="mt-1 text-sm text-red-400">{formErrors.maxStock}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-200 mb-1">
                      Precio <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="price"
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    {formErrors.price && <p className="mt-1 text-sm text-red-400">{formErrors.price}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-200 mb-1">
                      Costo <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="cost"
                      min="0"
                      step="0.01"
                      value={formData.cost}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    {formErrors.cost && <p className="mt-1 text-sm text-red-400">{formErrors.cost}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-200 mb-1">
                      Proveedor <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="supplier"
                      value={formData.supplier}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    {formErrors.supplier && <p className="mt-1 text-sm text-red-400">{formErrors.supplier}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-200 mb-1">
                      Ubicación <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    {formErrors.location && <p className="mt-1 text-sm text-red-400">{formErrors.location}</p>}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-200 mb-1">
                      Descripción
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-200 bg-white/10 hover:bg-white/20 rounded-md"
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 rounded-md flex items-center"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Procesando...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        {editingItem ? 'Actualizar Artículo' : 'Agregar Artículo'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};