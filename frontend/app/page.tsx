'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Filtros } from '@/components/filtros';
import { JugadoresTable } from '@/components/jugadores-table';
import { Button } from '@/components/ui/button';
import { useDebounce } from '@/hooks/use-debounce';
import { api } from '@/lib/api';
import type { Jugador, Club, FilterParams } from '@/types';
import { toast } from 'sonner';

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
  useEffect(() => {
    async function loadJugadores() {
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
    }
    loadJugadores();
  }, [debouncedFilters]);

  const handleFilterChange = (newFilters: FilterParams) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({});
  };

  const totalResultados = jugadores.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-red-50 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-red-600 bg-clip-text text-transparent">
            Sistema de Gestión de Fútbol
          </h1>
          <p className="text-muted-foreground">
            Listado de jugadores inscritos en la asociación
          </p>
        </div>

        {/* Botón Inscribir */}
        <div className="mb-6">
          <Link href="/inscribir">
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-red-600 hover:from-blue-700 hover:to-red-700">
              Inscribir Jugador
            </Button>
          </Link>
        </div>

        {/* Filtros */}
        <Filtros
          clubes={clubes}
          filters={filters}
          onFilterChange={handleFilterChange}
          onClear={handleClearFilters}
        />

        {/* Contador de resultados */}
        <div className="mb-4">
          <p className="text-sm text-muted-foreground">
            {isLoading ? (
              'Cargando...'
            ) : (
              <>
                Se encontraron <span className="font-semibold text-foreground">{totalResultados}</span> jugador{totalResultados !== 1 ? 'es' : ''}
              </>
            )}
          </p>
        </div>

        {/* Tabla de jugadores */}
        <JugadoresTable jugadores={jugadores} isLoading={isLoading} />
      </div>
    </div>
  );
}
