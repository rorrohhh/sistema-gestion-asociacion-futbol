'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import {
  Users,
  LayoutGrid,
  Activity
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function DashboardPage() {
  const [totalJugadores, setTotalJugadores] = useState('...');
  const [totalClubes, setTotalClubes] = useState('...');
  const [systemOnline, setSystemOnline] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {

        const resJugadores = await api.getJugadores();

        const jugadoresAny = resJugadores as any;

        if (jugadoresAny && jugadoresAny.totalItems !== undefined) {

          setTotalJugadores(jugadoresAny.totalItems.toString());
        }
        else if (Array.isArray(resJugadores)) {

          setTotalJugadores(resJugadores.length.toString());
        }
        else {
          setTotalJugadores('0');
        }


        const resClubes = await api.getClubes();
        const clubesAny = resClubes as any; // Bypass de TypeScript

        if (clubesAny && clubesAny.totalItems !== undefined) {
          setTotalClubes(clubesAny.totalItems.toString());
        }
        else if (Array.isArray(resClubes)) {
          setTotalClubes(resClubes.length.toString());
        }
        else {
          setTotalClubes('0');
        }

        setSystemOnline(true);

      } catch (error) {
        console.error('Error en Dashboard:', error);
        setSystemOnline(false);
        setTotalJugadores('N/A');
        setTotalClubes('N/A');
      }
    }
    loadData();
  }, []);

  // Función auxiliar para renderizar la Card
  const renderStatCard = (title: string, value: string, Icon: any, iconBgColor: string, iconTextColor: string, valueTextColor?: string) => (
    <Card className="border-0 shadow-sm bg-white dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-slate-800">
      <CardContent className="p-6 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
          <h3 className={`text-2xl font-bold text-slate-900 dark:text-white mt-1 ${valueTextColor || ''}`}>
            {value}
          </h3>
        </div>
        <div className={`p-3 rounded-full ${iconBgColor}`}>
          <Icon className={`h-6 w-6 ${iconTextColor}`} />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-8 space-y-8">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Dashboard de Gestión</h1>
          <p className="text-slate-500 dark:text-slate-400">Métricas clave del sistema de asociación de fútbol.</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Jugadores */}
        {renderStatCard(
          "Total Jugadores",
          totalJugadores,
          Users,
          "bg-blue-50 dark:bg-blue-900/20",
          "text-blue-600 dark:text-blue-400"
        )}

        {/* Clubes Inscritos */}
        {renderStatCard(
          "Clubes Activos",
          totalClubes,
          LayoutGrid,
          "bg-indigo-50 dark:bg-indigo-900/20",
          "text-indigo-600 dark:text-indigo-400"
        )}

        {/* Estado del Sistema */}
        {renderStatCard(
          "Estado del Sistema",
          systemOnline ? "En Línea" : "Sin Conexión",
          Activity,
          systemOnline ? "bg-green-50 dark:bg-green-900/20" : "bg-red-50 dark:bg-red-900/20",
          systemOnline ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400",
          systemOnline ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
        )}
      </div>
    </div>
  );
}