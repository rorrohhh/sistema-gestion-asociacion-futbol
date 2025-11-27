'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { differenceInYears, parseISO } from 'date-fns';
import type { Jugador } from '@/types';
import { Pencil, Trash2, Globe, CreditCard, Flag } from 'lucide-react';
import { Button } from './ui/button';

interface JugadoresTableProps {
    jugadores: Jugador[];
    isLoading?: boolean;
    onEliminar: (id: string) => void;
    onEditar: (id: string) => void;
}

function calcularEdad(fechaNacimiento: string): number {
    try {
        const fecha = parseISO(fechaNacimiento);
        return differenceInYears(new Date(), fecha);
    } catch {
        return 0;
    }
}

function formatearRUT(rut: number | string | undefined | null, dv: string | null): string {
    if (!rut) return '-';
    const rutStr = rut.toString();
    const formatted = rutStr.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `${formatted}-${dv || ''}`;
}

// CORREGIDO: Eliminados los comentarios entre celdas para evitar error de hidratación
function LoadingSkeleton() {
    return (
        <>
            {[...Array(5)].map((_, i) => (
                <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-12" /></TableCell>
                </TableRow>
            ))}
        </>
    );
}

export function JugadoresTable({ jugadores, isLoading = false, onEliminar, onEditar }: JugadoresTableProps) {
    if (isLoading) {
        return (
            <div className="rounded-md border border-slate-200 dark:border-slate-800">
                <Table>
                    <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="text-slate-700 dark:text-slate-300 font-semibold">Número</TableHead>
                            <TableHead className="text-slate-700 dark:text-slate-300 font-semibold">Nombre Completo</TableHead>
                            <TableHead className="text-slate-700 dark:text-slate-300 font-semibold">Identificación</TableHead>
                            <TableHead className="text-slate-700 dark:text-slate-300 font-semibold">Nacionalidad</TableHead>
                            <TableHead className="text-slate-700 dark:text-slate-300 font-semibold">Club</TableHead>
                            <TableHead className="text-slate-700 dark:text-slate-300 font-semibold">Edad</TableHead>
                            <TableHead className="text-slate-700 dark:text-slate-300 font-semibold">Inscripción</TableHead>
                            <TableHead className="text-slate-700 dark:text-slate-300 font-semibold">ROL</TableHead>
                            <TableHead className="text-slate-700 dark:text-slate-300 font-semibold">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <LoadingSkeleton />
                    </TableBody>
                </Table>
            </div>
        );
    }

    if (jugadores.length === 0) {
        return (
            <div className="rounded-md border p-8 text-center text-muted-foreground">
                No se encontraron jugadores con los filtros aplicados.
            </div>
        );
    }

    return (
        <div className="rounded-md border border-slate-200 dark:border-slate-800">
            <Table>
                <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
                    <TableRow className="hover:bg-transparent">
                        <TableHead className="text-slate-700 dark:text-slate-300 font-semibold">Número</TableHead>
                        <TableHead className="text-slate-700 dark:text-slate-300 font-semibold">Nombre Completo</TableHead>
                        <TableHead className="text-slate-700 dark:text-slate-300 font-semibold">Identificación</TableHead>
                        <TableHead className="text-slate-700 dark:text-slate-300 font-semibold">Nacionalidad</TableHead>
                        <TableHead className="text-slate-700 dark:text-slate-300 font-semibold">Club</TableHead>
                        <TableHead className="text-slate-700 dark:text-slate-300 font-semibold">Edad</TableHead>
                        <TableHead className="text-slate-700 dark:text-slate-300 font-semibold">Inscripción</TableHead>
                        <TableHead className="text-slate-700 dark:text-slate-300 font-semibold">ROL</TableHead>
                        <TableHead className="text-slate-700 dark:text-slate-300 font-semibold">Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {jugadores.map((jugador) => {
                        const edad = calcularEdad(jugador.nacimiento);
                        const nombreCompleto = `${jugador.nombres} ${jugador.paterno} ${jugador.materno}`;
                        const fechaInscripcion = new Date(jugador.inscripcion).toLocaleDateString('es-CL');

                        return (
                            <TableRow
                                key={jugador.id}
                                className="hover:bg-muted/50 transition-colors"
                            >
                                <TableCell className="font-medium">{jugador.numero}</TableCell>
                                <TableCell>{nombreCompleto}</TableCell>

                                <TableCell className="font-mono text-sm">
                                    {jugador.tipoIdentificacion === 'PASSPORT' ? (
                                        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400" title="Pasaporte Extranjero">
                                            <Globe className="h-4 w-4 text-slate-400" />
                                            <span className="uppercase">{jugador.pasaporte}</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300" title="RUT Nacional">
                                            <CreditCard className="h-4 w-4 text-slate-400" />
                                            <span>{formatearRUT(jugador.rut, jugador.dv)}</span>
                                        </div>
                                    )}
                                </TableCell>

                                <TableCell>
                                    {jugador.nacionalidad ? (
                                        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                                            <Flag className="h-3 w-3 text-slate-400" />
                                            <span className="capitalize">{jugador.nacionalidad}</span>
                                        </div>
                                    ) : (
                                        <span className="text-slate-400 italic text-xs">-</span>
                                    )}
                                </TableCell>

                                <TableCell>
                                    <Badge variant="secondary">{jugador.Club?.nombre || 'Sin Club'}</Badge>
                                </TableCell>
                                <TableCell>{edad} años</TableCell>
                                <TableCell>{fechaInscripcion}</TableCell>
                                <TableCell>
                                    <Badge variant="outline">{jugador.rol}</Badge>
                                </TableCell>
                                <TableCell className="w-1/12 min-w-[100px]">
                                    <div className="flex items-center space-x-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => onEditar(jugador.id.toString())}
                                            title="Editar Jugador"
                                            className="hover:text-blue-600 dark:hover:text-blue-400"
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>

                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => onEliminar(jugador.id.toString())}
                                            title="Eliminar Jugador"
                                            className="hover:text-red-600 dark:hover:text-red-400"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>

                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
}