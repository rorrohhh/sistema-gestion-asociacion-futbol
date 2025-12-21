'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Filtros } from '@/components/filtros';
import { JugadoresTable } from '@/components/jugadores-table';
import { PaseModal } from '@/components/pase-modal';
import { Button } from '@/components/ui/button';
// 1. Importamos los componentes de Shadcn
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useDebounce } from '@/hooks/use-debounce';
import { api } from '@/lib/api';
import type { Jugador, Club, FilterParams } from '@/types';
import { toast } from 'sonner';
import {
    Users,
    UserPlus,
    ChevronLeft,
    ChevronRight,
    Loader2
} from 'lucide-react';

export default function JugadoresPage() {
    const router = useRouter();
    const [jugadores, setJugadores] = useState<Jugador[]>([]);
    const [clubes, setClubes] = useState<Club[]>([]);
    const [filters, setFilters] = useState<FilterParams>({});

    const [isLoading, setIsLoading] = useState(true);
    const [isPaginating, setIsPaginating] = useState(false);

    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalItems, setTotalItems] = useState(0);
    const pageSize = 10;

    const [isPaseModalOpen, setIsPaseModalOpen] = useState(false);
    const [selectedJugador, setSelectedJugador] = useState<Jugador | null>(null);

    // 2. Nuevos estados para controlar el Alert Dialog de eliminación
    const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
    const [jugadorToDelete, setJugadorToDelete] = useState<string | null>(null);

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

    const fetchData = async (page: number, currentFilters: FilterParams, isPageChange: boolean) => {
        if (isPageChange) {
            setIsPaginating(true);
        } else {
            setIsLoading(true);
        }

        try {
            const filtersToSend: any = { ...currentFilters };
            if (filtersToSend.identificacion) {
                filtersToSend.identificacion = filtersToSend.identificacion.replace(/\./g, '');
            }

            const data = await api.getJugadores(filtersToSend, page, pageSize);

            setJugadores(data.jugadores || []);
            setTotalItems(data.totalItems || 0);
            setTotalPages(data.totalPages || 0);

        } catch (error) {
            toast.error('Error al cargar jugadores');
            setJugadores([]);
        } finally {
            setIsLoading(false);
            setIsPaginating(false);
        }
    };

    useEffect(() => {
        setCurrentPage(0);
        fetchData(0, debouncedFilters, false);
    }, [debouncedFilters]);

    useEffect(() => {
        if (!isLoading) {
            fetchData(currentPage, debouncedFilters, true);
        }
    }, [currentPage]);

    // 3. Esta función ahora solo abre el modal y guarda el ID
    const handleEliminarJugador = (jugadorId: string) => {
        setJugadorToDelete(jugadorId);
        setIsDeleteAlertOpen(true);
    };

    // 4. Esta es la nueva función que ejecuta la eliminación real cuando se confirma
    const confirmDeleteJugador = async () => {
        if (!jugadorToDelete) return;

        try {
            await api.deleteJugador(jugadorToDelete);
            toast.success('Jugador eliminado con éxito.');
            fetchData(currentPage, debouncedFilters, true);
        } catch (error) {
            toast.error('Error al eliminar jugador. Inténtalo de nuevo.');
        } finally {
            // Cerramos el modal y limpiamos el estado
            setIsDeleteAlertOpen(false);
            setJugadorToDelete(null);
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
        fetchData(currentPage, debouncedFilters, true);
        setSelectedJugador(null);
    };

    const handleFilterChange = (newFilters: FilterParams) => {
        setFilters(newFilters);
    };

    const handleClearFilters = () => {
        setFilters({});
    };

    const handleNextPage = (e: React.MouseEvent) => {
        e.preventDefault();
        if (currentPage < totalPages - 1 && !isPaginating) {
            setCurrentPage((prev) => prev + 1);
        }
    };

    const handlePrevPage = (e: React.MouseEvent) => {
        e.preventDefault();
        if (currentPage > 0 && !isPaginating) {
            setCurrentPage((prev) => prev - 1);
        }
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
                            Resultados
                        </h2>
                        <span className="text-sm px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full font-medium">
                            {(isLoading || isPaginating) ? (
                                <span className="flex items-center gap-2">
                                    <Loader2 className="h-3 w-3 animate-spin" /> Actualizando...
                                </span>
                            ) : (
                                `${totalItems} resultados`
                            )}
                        </span>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col min-h-[500px]">
                        <div className={`overflow-x-auto flex-grow transition-opacity duration-200 ${isPaginating ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                            <JugadoresTable
                                jugadores={jugadores}
                                isLoading={isLoading}
                                onEliminar={handleEliminarJugador}
                                onEditar={handleEditarJugador}
                                onTransferir={handleTransferirJugador}
                            />
                        </div>

                        <div className="flex items-center justify-between px-4 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 mt-auto">
                            <div className="text-sm text-slate-500">
                                {currentPage + 1} de {totalPages || 1}
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handlePrevPage}
                                    disabled={currentPage === 0 || isLoading || isPaginating}
                                    type="button"
                                >
                                    <ChevronLeft className="h-4 w-4 mr-1" />
                                    Anterior
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleNextPage}
                                    disabled={currentPage >= totalPages - 1 || isLoading || isPaginating}
                                    type="button"
                                >
                                    {isPaginating ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                                    Siguiente
                                    {!isPaginating && <ChevronRight className="h-4 w-4 ml-1" />}
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

            {/* 5. Implementación del AlertDialog */}
            <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás completamente seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. Esto eliminará permanentemente al jugador
                            de la base de datos y removerá sus datos de los servidores.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setJugadorToDelete(null)}>
                            Cancelar
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDeleteJugador}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            Eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}