import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const About: React.FC = () => {
  return (
    <div className="container mx-auto py-6 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Acerca del Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <section>
              <h3 className="text-lg font-semibold mb-2">Sistema de Gestión Vehicular</h3>
              <p className="text-gray-600">
                Un sistema integral para la gestión de vehículos, clientes, ventas, talleres y más. 
                Diseñado para automatizar y optimizar los procesos operativos en empresas del sector automotriz.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-2">Características Principales</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>Gestión completa de clientes y vehículos</li>
                <li>Control de inventario y repuestos</li>
                <li>Módulo de ventas y facturación</li>
                <li>Sistema de taller y mantenimiento</li>
                <li>Reportes y análisis detallados</li>
                <li>Integración con DIAN para facturación electrónica</li>
                <li>Gestión de recursos humanos</li>
                <li>Portal del cliente</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-2">Información Técnica</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Versión:</span> 1.0.0
                </div>
                <div>
                  <span className="font-medium">Framework:</span> React + TypeScript
                </div>
                <div>
                  <span className="font-medium">UI:</span> Tailwind CSS + shadcn/ui
                </div>
                <div>
                  <span className="font-medium">Build:</span> Vite
                </div>
              </div>
            </section>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default About;