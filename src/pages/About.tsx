import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  Users, 
  Target, 
  Award,
  Phone,
  Mail,
  MapPin,
  Globe
} from 'lucide-react';

const About: React.FC = () => {
  const features = [
    {
      title: 'Gestión de Clientes',
      description: 'Administra toda la información de tus clientes de manera eficiente',
      icon: Users
    },
    {
      title: 'Control de Inventario',
      description: 'Mantén un registro detallado de todos los vehículos disponibles',
      icon: Building2
    },
    {
      title: 'Módulo de Ventas',
      description: 'Procesa ventas y genera facturas de manera automatizada',
      icon: Target
    },
    {
      title: 'Taller de Servicios',
      description: 'Gestiona servicios de mantenimiento y reparaciones',
      icon: Award
    }
  ];

  const team = [
    {
      name: 'Equipo de Desarrollo',
      role: 'Desarrollo Full Stack',
      description: 'Especialistas en React, TypeScript y Node.js'
    },
    {
      name: 'Equipo de Diseño',
      role: 'UI/UX Design',
      description: 'Diseñadores enfocados en experiencia de usuario'
    },
    {
      name: 'Equipo de QA',
      role: 'Control de Calidad',
      description: 'Aseguramiento de calidad y testing'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Acerca del Sistema
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Un sistema integral de gestión vehicular diseñado para optimizar 
          todos los procesos de tu concesionario o taller automotriz.
        </p>
      </div>

      {/* Mission */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Nuestra Misión</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 leading-relaxed">
            Proporcionar una solución tecnológica completa que permita a las empresas 
            del sector automotriz gestionar de manera eficiente sus operaciones, 
            desde la venta de vehículos hasta el servicio post-venta, mejorando 
            la experiencia tanto del cliente como del personal de la empresa.
          </p>
        </CardContent>
      </Card>

      {/* Features */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Características Principales
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Technology Stack */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Tecnologías Utilizadas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Badge variant="outline" className="justify-center py-2">
              React 18
            </Badge>
            <Badge variant="outline" className="justify-center py-2">
              TypeScript
            </Badge>
            <Badge variant="outline" className="justify-center py-2">
              Tailwind CSS
            </Badge>
            <Badge variant="outline" className="justify-center py-2">
              Vite
            </Badge>
            <Badge variant="outline" className="justify-center py-2">
              Radix UI
            </Badge>
            <Badge variant="outline" className="justify-center py-2">
              Lucide Icons
            </Badge>
            <Badge variant="outline" className="justify-center py-2">
              React Router
            </Badge>
            <Badge variant="outline" className="justify-center py-2">
              React Hook Form
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Team */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Nuestro Equipo
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {team.map((member, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Users className="w-8 h-8 text-gray-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  {member.name}
                </h3>
                <p className="text-sm text-blue-600 mb-2">
                  {member.role}
                </p>
                <p className="text-sm text-gray-600">
                  {member.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Contact */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Información de Contacto</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-gray-600" />
                <span className="text-gray-700">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-gray-600" />
                <span className="text-gray-700">info@empresa.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-gray-600" />
                <span className="text-gray-700">Ciudad, País</span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Globe className="w-5 h-5 text-gray-600" />
                <span className="text-gray-700">www.empresa.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <Building2 className="w-5 h-5 text-gray-600" />
                <span className="text-gray-700">Horario: Lun-Vie 8:00-18:00</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Version Info */}
      <div className="text-center text-sm text-gray-500">
        <p>Sistema de Gestión Vehicular v1.0.0</p>
        <p>© 2024 Todos los derechos reservados</p>
      </div>
    </div>
  );
};

export default About;