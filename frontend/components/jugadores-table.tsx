'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { differenceInYears, parseISO } from 'date-fns';
import type { Jugador } from '@/types';
import { Pencil, Trash2, Globe, CreditCard, Flag, MoreHorizontal, ArrowRightLeft, Eye } from 'lucide-react'; // <--- AGREGADO Eye
import { Button } from './ui/button';
import Link from 'next/link'; // <--- AGREGADO Link

interface JugadoresTableProps {
    jugadores: Jugador[];
    isLoading?: boolean;
    onEliminar: (id: string) => void;
    onEditar: (id: string) => void;
    onTransferir: (jugador: Jugador) => void;
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

export function JugadoresTable({ jugadores, isLoading = false, onEliminar, onEditar, onTransferir }: JugadoresTableProps) {
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
                            <TableHead className="text-slate-700 dark:text-slate-300 font-semibold text-right">Acciones</TableHead>
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
                        <TableHead className="text-slate-700 dark:text-slate-300 font-semibold text-right">Acciones</TableHead>
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

                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <span className="sr-only">Abrir menú</span>
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Acciones</DropdownMenuLabel>

                                            {/* --- BOTÓN VER FICHA (NUEVO) --- */}
                                            <DropdownMenuItem asChild>
                                                <Link
                                                    href={`/jugadores/${jugador.id}`}
                                                    className="flex items-center w-full cursor-pointer"
                                                >
                                                    <Eye className="mr-2 h-4 w-4 text-slate-500" />
                                                    Ver Ficha
                                                </Link>
                                            </DropdownMenuItem>

                                            <DropdownMenuItem onClick={() => onTransferir(jugador)}>
                                                <ArrowRightLeft className="mr-2 h-4 w-4 text-blue-600" />
                                                Realizar Pase
                                            </DropdownMenuItem>

                                            <DropdownMenuItem onClick={() => onEditar(jugador.id.toString())}>
                                                <Pencil className="mr-2 h-4 w-4" />
                                                Editar
                                            </DropdownMenuItem>

                                            <DropdownMenuItem
                                                onClick={() => onEliminar(jugador.id.toString())}
                                                className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/10"
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Eliminar
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>

                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
}