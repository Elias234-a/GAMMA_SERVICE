import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Car, 
  Users, 
  Wrench, 
  DollarSign, 
  Shield, 
  BarChart3,
  Settings,
  FileText
} from 'lucide-react';

const About: React.FC = () => {
  const features = [
    {
      icon: Car,
      title: 'Gestión de Vehículos',
      description: 'Control completo del inventario de vehículos, desde la compra hasta la venta.'
    },
    {
      icon: Users,
      title: 'Gestión de Clientes',
      description: 'CRM integrado para el seguimiento y gestión de relaciones con clientes.'
    },
    {
      icon: Wrench,
      title: 'Taller de Servicios',
      description: 'Sistema completo para la gestión de órdenes de trabajo y servicios.'
    },
    {
      icon: DollarSign,
      title: 'Ventas y Facturación',
      description: 'Proceso completo de ventas con integración de facturación electrónica.'
    },
    {
      icon: BarChart3,
      title: 'Reportes y Analytics',
      description: 'Dashboards y reportes detallados para la toma de decisiones.'
    },
    {
      icon: Shield,
      title: 'Seguridad',
      description: 'Sistema de roles y permisos para garantizar la seguridad de los datos.'
    }
  ];

  const modules = [
    {
      name: 'Dashboard',
      description: 'Panel principal con métricas y resumen de operaciones',
      status: 'Activo'
    },
    {
      name: 'Ventas',
      description: 'Gestión completa del proceso de ventas',
      status: 'Activo'
    },
    {
      name: 'Clientes',
      description: 'CRM y gestión de relaciones con clientes',
      status: 'Activo'
    },
    {
      name: 'Vehículos',
      description: 'Inventario y gestión de vehículos',
      status: 'Activo'
    },
    {
      name: 'Taller',
      description: 'Órdenes de trabajo y servicios',
      status: 'Activo'
    },
    {
      name: 'Facturación',
      description: 'Gestión de facturación y pagos',
      status: 'Activo'
    },
    {
      name: 'Financiación',
      description: 'Gestión de créditos y financiación',
      status: 'Activo'
    },
    {
      name: 'Placas',
      description: 'Gestión de trámites de placas',
      status: 'Activo'
    },
    {
      name: 'Inventario',
      description: 'Control de stock y compras',
      status: 'Activo'
    },
    {
      name: 'Compras',
      description: 'Gestión de proveedores y compras',
      status: 'Activo'
    },
    {
      name: 'Recursos Humanos',
      description: 'Gestión de empleados y nómina',
      status: 'Activo'
    },
    {
      name: 'Reportes',
      description: 'Generación de reportes y analytics',
      status: 'Activo'
    },
    {
      name: 'DIAN',
      description: 'Integración con sistemas fiscales',
      status: 'Activo'
    },
    {
      name: 'Portal Cliente',
      description: 'Portal web para clientes',
      status: 'Activo'
    },
    {
      name: 'Usuarios',
      description: 'Gestión de usuarios y roles',
      status: 'Activo'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Sistema de Gestión Vehicular
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Una solución integral para la gestión completa de concesionarios de vehículos, 
          desde la venta hasta el servicio post-venta.
        </p>
      </div>

      {/* Features */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
          Características Principales
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="flex justify-center mb-4">
                    <div className="p-4 bg-blue-100 rounded-full">
                      <IconComponent className="w-8 h-8 text-blue-600" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Modules */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
          Módulos del Sistema
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {modules.map((module, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">
                    {module.name}
                  </h3>
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    {module.status}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">
                  {module.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Technology Stack */}
      <Card>
        <CardHeader>
          <CardTitle>Tecnologías Utilizadas</CardTitle>
          <CardDescription>
            Stack tecnológico moderno para un rendimiento óptimo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="p-4 bg-blue-100 rounded-lg mb-2">
                <span className="text-2xl font-bold text-blue-600">React</span>
              </div>
              <p className="text-sm text-gray-600">Frontend</p>
            </div>
            <div className="text-center">
              <div className="p-4 bg-green-100 rounded-lg mb-2">
                <span className="text-2xl font-bold text-green-600">TypeScript</span>
              </div>
              <p className="text-sm text-gray-600">Tipado</p>
            </div>
            <div className="text-center">
              <div className="p-4 bg-purple-100 rounded-lg mb-2">
                <span className="text-2xl font-bold text-purple-600">Vite</span>
              </div>
              <p className="text-sm text-gray-600">Build Tool</p>
            </div>
            <div className="text-center">
              <div className="p-4 bg-cyan-100 rounded-lg mb-2">
                <span className="text-2xl font-bold text-cyan-600">Tailwind</span>
              </div>
              <p className="text-sm text-gray-600">Styling</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Version Info */}
      <Card>
        <CardContent className="p-6 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Información del Sistema
          </h3>
          <div className="flex justify-center space-x-6 text-sm text-gray-600">
            <span>Versión: 1.0.0</span>
            <span>•</span>
            <span>Última actualización: {new Date().toLocaleDateString()}</span>
            <span>•</span>
            <span>Estado: En desarrollo</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default About;