import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const About: React.FC = () => {
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Acerca del Sistema</CardTitle>
          <CardDescription>Sistema de Gestión Vehicular</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-xl font-semibold mb-2">Versión</h3>
            <p className="text-muted-foreground">0.1.0</p>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-2">Descripción</h3>
            <p className="text-muted-foreground">
              Sistema integral de gestión vehicular que incluye módulos para ventas, 
              gestión de clientes, inventario de vehículos, taller mecánico, facturación, 
              financiamiento, gestión de placas, compras, recursos humanos, reportes y más.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-2">Características Principales</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Gestión completa de ventas y clientes</li>
              <li>Control de inventario de vehículos</li>
              <li>Módulo de taller mecánico</li>
              <li>Sistema de facturación integrado</li>
              <li>Gestión de financiamiento</li>
              <li>Procesamiento de placas vehiculares</li>
              <li>Control de compras e inventario</li>
              <li>Gestión de recursos humanos</li>
              <li>Reportes y análisis detallados</li>
              <li>Portal de clientes</li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-2">Tecnologías</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>React 18 con TypeScript</li>
              <li>Vite para construcción y desarrollo</li>
              <li>Radix UI para componentes de interfaz</li>
              <li>TailwindCSS para estilos</li>
              <li>React Router para navegación</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default About;
