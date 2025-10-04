import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Car, 
  Wrench, 
  DollarSign, 
  FileText, 
  BarChart3,
  Settings,
  Shield
} from 'lucide-react';

const Home: React.FC = () => {
  const { user } = useAuth();

  const stats = [
    {
      title: 'Clientes Activos',
      value: '1,234',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Vehículos Registrados',
      value: '856',
      icon: Car,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Órdenes de Taller',
      value: '45',
      icon: Wrench,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    },
    {
      title: 'Ventas del Mes',
      value: '$125,430',
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    }
  ];

  const quickActions = [
    {
      title: 'Nueva Venta',
      description: 'Registrar una nueva venta de vehículo',
      icon: DollarSign,
      href: '/sales'
    },
    {
      title: 'Registrar Cliente',
      description: 'Agregar un nuevo cliente al sistema',
      icon: Users,
      href: '/clients'
    },
    {
      title: 'Orden de Taller',
      description: 'Crear nueva orden de trabajo',
      icon: Wrench,
      href: '/workshop'
    },
    {
      title: 'Generar Reporte',
      description: 'Crear reportes de ventas y operaciones',
      icon: BarChart3,
      href: '/reports'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            ¡Bienvenido, {user?.name || 'Usuario'}!
          </h1>
          <p className="text-gray-600 mt-1">
            Panel de control del Sistema de Gestión Vehicular
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          <Shield className="w-4 h-4 mr-1" />
          {user?.role}
        </Badge>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <IconComponent className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Acciones Rápidas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => {
            const IconComponent = action.icon;
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer group">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-gray-100 rounded-full group-hover:bg-gray-200 transition-colors">
                      <IconComponent className="w-6 h-6 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        {action.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {action.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Actividad Reciente</CardTitle>
          <CardDescription>
            Últimas acciones realizadas en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
              <div className="p-2 bg-green-100 rounded-full">
                <DollarSign className="w-4 h-4 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">
                  Nueva venta registrada
                </p>
                <p className="text-sm text-gray-600">
                  Toyota Corolla 2024 - Cliente: Juan Pérez
                </p>
              </div>
              <span className="text-sm text-gray-500">Hace 2 horas</span>
            </div>
            
            <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
              <div className="p-2 bg-blue-100 rounded-full">
                <Users className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">
                  Cliente registrado
                </p>
                <p className="text-sm text-gray-600">
                  María González agregada al sistema
                </p>
              </div>
              <span className="text-sm text-gray-500">Hace 4 horas</span>
            </div>
            
            <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
              <div className="p-2 bg-orange-100 rounded-full">
                <Wrench className="w-4 h-4 text-orange-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">
                  Orden de taller completada
                </p>
                <p className="text-sm text-gray-600">
                  Mantenimiento preventivo - Honda Civic
                </p>
              </div>
              <span className="text-sm text-gray-500">Hace 6 horas</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Home;