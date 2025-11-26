'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { differenceInYears, parseISO } from 'date-fns';
import type { Jugador } from '@/types';

interface JugadoresTableProps {
    jugadores: Jugador[];
    isLoading?: boolean;
}

function calcularEdad(fechaNacimiento: string): number {
    try {
        const fecha = parseISO(fechaNacimiento);
        return differenceInYears(new Date(), fecha);
    } catch {
        return 0;
    }
}

function formatearRUT(rut: number | string | undefined | null, dv: string): string {
    if (!rut) return '-';
    const rutStr = rut.toString();
    const formatted = rutStr.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `${formatted}-${dv}`;
}

function LoadingSkeleton() {
    return (
        <>
            {[...Array(5)].map((_, i) => (
                <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                </TableRow>
            ))}
        </>
    );
}

export function JugadoresTable({ jugadores, isLoading = false }: JugadoresTableProps) {
    if (isLoading) {
        return (
            <div className="rounded-md border border-slate-200 dark:border-slate-800">
                <Table>
                    <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="text-slate-700 dark:text-slate-300 font-semibold">Número</TableHead>
                            <TableHead className="text-slate-700 dark:text-slate-300 font-semibold">Nombre Completo</TableHead>
                            <TableHead className="text-slate-700 dark:text-slate-300 font-semibold">RUT</TableHead>
                            <TableHead className="text-slate-700 dark:text-slate-300 font-semibold">Club</TableHead>
                            <TableHead className="text-slate-700 dark:text-slate-300 font-semibold">Edad</TableHead>
                            <TableHead className="text-slate-700 dark:text-slate-300 font-semibold">Inscripción</TableHead>
                            <TableHead className="text-slate-700 dark:text-slate-300 font-semibold">ROL</TableHead>
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
                        <TableHead className="text-slate-700 dark:text-slate-300 font-semibold">RUT</TableHead>
                        <TableHead className="text-slate-700 dark:text-slate-300 font-semibold">Club</TableHead>
                        <TableHead className="text-slate-700 dark:text-slate-300 font-semibold">Edad</TableHead>
                        <TableHead className="text-slate-700 dark:text-slate-300 font-semibold">Inscripción</TableHead>
                        <TableHead className="text-slate-700 dark:text-slate-300 font-semibold">ROL</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {jugadores.map((jugador) => {
                        const edad = calcularEdad(jugador.nacimiento);
                        const nombreCompleto = `${jugador.nombres} ${jugador.paterno} ${jugador.materno}`;
                        const rutFormateado = formatearRUT(jugador.rut, jugador.dv);
                        const fechaInscripcion = new Date(jugador.inscripcion).toLocaleDateString('es-CL');

                        return (
                            <TableRow
                                key={jugador.id}
                                className="hover:bg-muted/50 transition-colors"
                            >
                                <TableCell className="font-medium">{jugador.numero}</TableCell>
                                <TableCell>{nombreCompleto}</TableCell>
                                <TableCell className="font-mono">{rutFormateado}</TableCell>
                                <TableCell>
                                    <Badge variant="secondary">{jugador.Club?.nombre || 'Sin Club'}</Badge>
                                </TableCell>
                                <TableCell>{edad} años</TableCell>
                                <TableCell>{fechaInscripcion}</TableCell>
                                <TableCell>
                                    <Badge>{jugador.rol}</Badge>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
}
