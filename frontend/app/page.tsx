'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Filtros } from '@/components/filtros';
import { JugadoresTable } from '@/components/jugadores-table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDebounce } from '@/hooks/use-debounce';
import { api } from '@/lib/api';
import type { Jugador, Club, FilterParams } from '@/types';
import { toast } from 'sonner';
import {
  Users,
  UserPlus,
  Trophy,
  Filter,
  LayoutGrid,
  Activity
} from 'lucide-react';

export default function HomePage() {
  const [jugadores, setJugadores] = useState<Jugador[]>([]);
  const [clubes, setClubes] = useState<Club[]>([]);
  const [filters, setFilters] = useState<FilterParams>({});
  const [isLoading, setIsLoading] = useState(true);

  // Debounce de filtros para evitar muchas requests
  const debouncedFilters = useDebounce(filters, 300);

  // Cargar clubes al montar
  useEffect(() => {
    async function loadClubes() {
      try {
        const data = await api.getClubes();
        setClubes(data);
      } catch (error) {
        console.error('Error cargando clubes:', error);
        toast.error('Error al cargar clubes');
      }
    }
    loadClubes();
  }, []);

  // Cargar jugadores cuando cambian los filtros
  const loadJugadores = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await api.getJugadores(debouncedFilters);
      setJugadores(data);
    } catch (error) {
      console.error('Error cargando jugadores:', error);
      toast.error('Error al cargar jugadores');
    } finally {
      setIsLoading(false);
    }
  }, [debouncedFilters]);

  useEffect(() => {
    loadJugadores();
  }, [loadJugadores]);

  const handleEliminarJugador = async (jugadorId: string) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este jugador? Esta acción es irreversible.")) {
      try {
        await api.deleteJugador(jugadorId); // Llama a tu función ya creada en api.ts
        toast.success('Jugador eliminado con éxito.');
        await loadJugadores(); // Actualiza la UI
      } catch (error) {
        toast.error('Error al eliminar jugador. Inténtalo de nuevo.');
      }
    }
  };

  const handleEditarJugador = (jugadorId: string) => {
    // Lógica simple de UI: Redirigir
    window.location.href = `/editar-jugador/${jugadorId}`;
  };

  const handleFilterChange = (newFilters: FilterParams) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({});
  };

  const totalResultados = jugadores.length;

  return (
    <div className="p-8 space-y-8">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400">Bienvenido al panel de gestión.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-slate-500 dark:text-slate-400 hidden md:block">
            <span className="font-medium text-slate-900 dark:text-slate-200">{clubes.length}</span> Clubes Registrados
          </div>
          <Link href="/inscribir">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all">
              <UserPlus className="mr-2 h-4 w-4" />
              Inscribir Jugador
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Overview (Optional but adds to the "Dashboard" feel) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm bg-white dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-slate-800">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Jugadores</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {isLoading ? '...' : totalResultados}
              </h3>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-full">
              <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-white dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-slate-800">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Clubes Activos</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {clubes.length}
              </h3>
            </div>
            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-full">
              <LayoutGrid className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-white dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-slate-800">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Estado del Sistema</p>
              <h3 className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                En Línea
              </h3>
            </div>
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-full">
              <Activity className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-5 sticky top-24">
            <div className="flex items-center gap-2 mb-6 text-slate-800 dark:text-slate-200 font-semibold">
              <Filter className="h-5 w-5" />
              <h2>Filtros de Búsqueda</h2>
            </div>
            <Filtros
              clubes={clubes}
              filters={filters}
              onFilterChange={handleFilterChange}
              onClear={handleClearFilters}
            />
          </div>
        </div>

        {/* Main Content Table */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Users className="h-5 w-5 text-slate-500" />
              Listado de Jugadores
            </h2>
            <span className="text-sm px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full font-medium">
              {isLoading ? 'Cargando...' : `${totalResultados} resultados`}
            </span>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            <JugadoresTable jugadores={jugadores} isLoading={isLoading} onEliminar={handleEliminarJugador} onEditar={handleEditarJugador} />
          </div>
        </div>
      </div>
    </div>
  );
}