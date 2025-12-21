'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Filtros } from '@/components/filtros';
import { JugadoresTable } from '@/components/jugadores-table';
import { PaseModal } from '@/components/pase-modal';
import { Button } from '@/components/ui/button';
import { useDebounce } from '@/hooks/use-debounce';
import { api } from '@/lib/api';
import type { Jugador, Club, FilterParams } from '@/types';
import { toast } from 'sonner';
import {
    Users,
    UserPlus,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';

export default function JugadoresPage() {
    const router = useRouter();
    const [jugadores, setJugadores] = useState<Jugador[]>([]);
    const [clubes, setClubes] = useState<Club[]>([]);
    const [filters, setFilters] = useState<FilterParams>({});
    const [isLoading, setIsLoading] = useState(true);

    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalItems, setTotalItems] = useState(0);
    const pageSize = 10;

    const [isPaseModalOpen, setIsPaseModalOpen] = useState(false);
    const [selectedJugador, setSelectedJugador] = useState<Jugador | null>(null);

    const debouncedFilters = useDebounce(filters, 300);

    useEffect(() => {
        async function loadClubes() {
            try {
                const data = await api.getClubes();
                setClubes(data);
            } catch (error) {
                console.error(error);
                toast.error('Error al cargar clubes');
            }
        }
        loadClubes();
    }, []);

    const loadJugadores = useCallback(async () => {
        setIsLoading(true);
        try {
            const filtersToSend: any = { ...debouncedFilters };

            if (filtersToSend.identificacion) {
                filtersToSend.identificacion = filtersToSend.identificacion.replace(/\./g, '');
            }

            const data = await api.getJugadores(filtersToSend, currentPage, pageSize);

            setJugadores(data.jugadores || []);
            setTotalItems(data.totalItems || 0);
            setTotalPages(data.totalPages || 0);

        } catch (error) {
            toast.error('Error al cargar jugadores');
            setJugadores([]);
        } finally {
            setIsLoading(false);
        }
    }, [debouncedFilters, currentPage]);

    useEffect(() => {
        setCurrentPage(0);
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

    const handleTransferirJugador = (jugador: Jugador) => {
        setSelectedJugador(jugador);
        setIsPaseModalOpen(true);
    };

    const handlePaseSuccess = () => {
        loadJugadores();
        setSelectedJugador(null);
    };

    const handleFilterChange = (newFilters: FilterParams) => {
        setFilters(newFilters);
    };

    const handleClearFilters = () => {
        setFilters({});
    };

    return (
        <div className="p-4 md:p-8 space-y-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 daark:text-white">Jugadores</h1>
                    <p className="text-slate-500 dark:text-slate-400">Administra los jugadores de la asociación.</p>
                </div>
                <div className="flex items-center gap-4 w-full sm:w-auto">
                    <Link href="/jugadores/nuevo" className="w-full sm:w-auto">
                        <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all">
                            <UserPlus className="mr-2 h-4 w-4" />
                            Inscribir Jugador
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-1">
                    <Filtros
                        clubes={clubes}
                        filters={filters}
                        onFilterChange={handleFilterChange}
                        onClear={handleClearFilters}
                    />
                </div>

                <div className="lg:col-span-3 space-y-4">
                    <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
                        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                            <Users className="h-5 w-5 text-slate-500" />
                            Resultados de Búsqueda
                        </h2>
                        <span className="text-sm px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full font-medium">
                            {isLoading ? 'Cargando...' : `${totalItems} resultados`}
                        </span>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                        <div className="overflow-x-auto">
                            <JugadoresTable
                                jugadores={jugadores}
                                isLoading={isLoading}
                                onEliminar={handleEliminarJugador}
                                onEditar={handleEditarJugador}
                                onTransferir={handleTransferirJugador}
                            />
                        </div>

                        <div className="flex items-center justify-between px-4 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                            <div className="text-sm text-slate-500">
                                Página {currentPage + 1} de {totalPages || 1}
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
                                    disabled={currentPage === 0 || isLoading}
                                >
                                    <ChevronLeft className="h-4 w-4 mr-1" />
                                    Anterior
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))}
                                    disabled={currentPage >= totalPages - 1 || isLoading}
                                >
                                    Siguiente
                                    <ChevronRight className="h-4 w-4 ml-1" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

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