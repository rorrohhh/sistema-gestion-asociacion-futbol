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

function formatearRUT(rut: number, dv: string): string {
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
            <div className="rounded-md border">
                <Table>
                    <TableHeader className="bg-gradient-to-r from-blue-600 to-red-600">
                        <TableRow>
                            <TableHead className="text-white">Número</TableHead>
                            <TableHead className="text-white">Nombre Completo</TableHead>
                            <TableHead className="text-white">RUT</TableHead>
                            <TableHead className="text-white">Club</TableHead>
                            <TableHead className="text-white">Edad</TableHead>
                            <TableHead className="text-white">Inscripción</TableHead>
                            <TableHead className="text-white">ROL</TableHead>
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
        <div className="rounded-md border">
            <Table>
                <TableHeader className="bg-gradient-to-r from-blue-600 to-red-600">
                    <TableRow>
                        <TableHead className="text-white">Número</TableHead>
                        <TableHead className="text-white">Nombre Completo</TableHead>
                        <TableHead className="text-white">RUT</TableHead>
                        <TableHead className="text-white">Club</TableHead>
                        <TableHead className="text-white">Edad</TableHead>
                        <TableHead className="text-white">Inscripción</TableHead>
                        <TableHead className="text-white">ROL</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {jugadores.map((jugador) => {
                        const edad = calcularEdad(jugador.fecha_nacimiento);
                        const nombreCompleto = `${jugador.nombres} ${jugador.apellido_paterno} ${jugador.apellido_materno}`;
                        const rutFormateado = formatearRUT(jugador.rut_num, jugador.rut_dv);
                        const fechaInscripcion = new Date(jugador.fecha_inscripcion).toLocaleDateString('es-CL');

                        return (
                            <TableRow
                                key={jugador.id}
                                className="hover:bg-muted/50 transition-colors"
                            >
                                <TableCell className="font-medium">{jugador.numero}</TableCell>
                                <TableCell>{nombreCompleto}</TableCell>
                                <TableCell className="font-mono">{rutFormateado}</TableCell>
                                <TableCell>
                                    <Badge variant="secondary">{jugador.nombre_club}</Badge>
                                </TableCell>
                                <TableCell>{edad} años</TableCell>
                                <TableCell>{fechaInscripcion}</TableCell>
                                <TableCell>
                                    <Badge>{jugador.rol_asociacion}</Badge>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
}
