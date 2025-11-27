'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // Usamos el router de Next.js para navegación fluida
import { Filtros } from '@/components/filtros';
import { JugadoresTable } from '@/components/jugadores-table';
import { PaseModal } from '@/components/pase-modal'; // <--- IMPORTACIÓN DEL NUEVO MODAL
import { Button } from '@/components/ui/button';
import { useDebounce } from '@/hooks/use-debounce';
import { api } from '@/lib/api';
import type { Jugador, Club, FilterParams } from '@/types';
import { toast } from 'sonner';
import {
    Users,
    UserPlus,
    Filter,
} from 'lucide-react';

export default function JugadoresPage() {
    const router = useRouter();
    const [jugadores, setJugadores] = useState<Jugador[]>([]);
    const [clubes, setClubes] = useState<Club[]>([]);
    const [filters, setFilters] = useState<FilterParams>({});
    const [isLoading, setIsLoading] = useState(true);

    // --- ESTADOS PARA EL PASE (TRANSFERENCIA) ---
    const [isPaseModalOpen, setIsPaseModalOpen] = useState(false);
    const [selectedJugador, setSelectedJugador] = useState<Jugador | null>(null);
    // -------------------------------------------

    const debouncedFilters = useDebounce(filters, 300);

    // Cargar clubes al montar (necesarios para el filtro y el modal de pases)
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
                await api.deleteJugador(jugadorId);
                toast.success('Jugador eliminado con éxito.');
                await loadJugadores();
            } catch (error) {
                toast.error('Error al eliminar jugador. Inténtalo de nuevo.');
            }
        }
    };

    const handleEditarJugador = (jugadorId: string) => {
        router.push(`/jugadores/editar/${jugadorId}`);
    };

    // --- LÓGICA DEL PASE ---
    const handleTransferirJugador = (jugador: Jugador) => {
        setSelectedJugador(jugador);
        setIsPaseModalOpen(true);
    };

    const handlePaseSuccess = () => {
        // Al terminar el pase, recargamos la lista para ver al jugador en su nuevo club
        loadJugadores();
        setSelectedJugador(null);
    };
    // -----------------------

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
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Gestión de Jugadores</h1>
                    <p className="text-slate-500 dark:text-slate-400">Filtra, edita y administra los jugadores inscritos.</p>
                </div>
                <div className="flex items-center gap-4">
                    {/* Botón Inscribir Jugador */}
                    <Link href="/jugadores/nuevo">
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all">
                            <UserPlus className="mr-2 h-4 w-4" />
                            Inscribir Jugador
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Main Content: Filters and Table */}
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
                            Resultados de Búsqueda
                        </h2>
                        <span className="text-sm px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full font-medium">
                            {isLoading ? 'Cargando...' : `${totalResultados} resultados`}
                        </span>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                        <JugadoresTable
                            jugadores={jugadores}
                            isLoading={isLoading}
                            onEliminar={handleEliminarJugador}
                            onEditar={handleEditarJugador}
                            onTransferir={handleTransferirJugador} // <--- Conectamos la acción
                        />
                    </div>
                </div>
            </div>

            {/* Renderizamos el Modal de Pases */}
            <PaseModal
                isOpen={isPaseModalOpen}
                onClose={() => setIsPaseModalOpen(false)}
                jugador={selectedJugador}
                clubes={clubes}
                onSuccess={handlePaseSuccess}
            />
        </div>
    );
}