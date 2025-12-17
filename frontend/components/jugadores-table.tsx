'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { differenceInYears, parseISO } from 'date-fns';
import type { Jugador } from '@/types';
import {
    Pencil,
    Trash2,
    Globe,
    CreditCard,
    MoreHorizontal,
    ArrowRightLeft,
    Eye,
    User,
    ShieldHalf,
    SearchX,
    CheckCircle2,
    XCircle
} from 'lucide-react';
import { Button } from './ui/button';
import Link from 'next/link';
import { env } from '@/lib/env'; // Asegúrate de tener esto si vas a mostrar fotos reales

interface JugadoresTableProps {
    jugadores: Jugador[];
    isLoading?: boolean;
    onEliminar: (id: string) => void;
    onEditar: (id: string) => void;
    onTransferir: (jugador: Jugador) => void;
}

// --- Funciones Auxiliares ---

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

function getInitials(nombre: string, paterno: string): string {
    return `${nombre.charAt(0)}${paterno.charAt(0)}`.toUpperCase();
}

// --- Componentes Visuales ---

function LoadingSkeleton() {
    return (
        <>
            {[...Array(5)].map((_, i) => (
                <TableRow key={i}>
                    <TableCell><div className="flex items-center gap-4"><Skeleton className="h-10 w-10 rounded-full" /><div className="space-y-2"><Skeleton className="h-4 w-32" /><Skeleton className="h-3 w-20" /></div></div></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-28" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8 rounded-md ml-auto" /></TableCell>
                </TableRow>
            ))}
        </>
    );
}

// Avatar Inteligente: Muestra foto si existe, iniciales si no, e indicador de estado
const PlayerAvatar = ({
    nombre,
    paterno,
    foto,
    activo
}: {
    nombre: string,
    paterno: string,
    foto?: string,
    activo: boolean
}) => {
    // Construir URL completa si existe foto (ajusta según tu lógica de backend)
    const fotoUrl = foto ? `${env.apiUrl}${foto}` : null;

    return (
        <div className="relative">
            <div className="h-10 w-10 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 flex items-center justify-center shadow-sm">
                {fotoUrl ? (
                    <img
                        src={fotoUrl}
                        alt={`${nombre} ${paterno}`}
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <span className="text-xs font-bold text-blue-700 dark:text-blue-300">
                        {getInitials(nombre, paterno)}
                    </span>
                )}
            </div>
            {/* Indicador de Estado (Punto) */}
            <div className={`
                absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center
                ${activo ? 'bg-green-500' : 'bg-red-500'}
            `}>
                {activo ? (
                    <CheckCircle2 className="h-2 w-2 text-white" />
                ) : (
                    <XCircle className="h-2 w-2 text-white" />
                )}
            </div>
        </div>
    );
};

export function JugadoresTable({ jugadores, isLoading = false, onEliminar, onEditar, onTransferir }: JugadoresTableProps) {
    if (isLoading) {
        return (
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
                        <TableRow>
                            <TableHead className="w-[350px]">Jugador</TableHead>
                            <TableHead>Identificación</TableHead>
                            <TableHead>Nacionalidad</TableHead>
                            <TableHead>Club</TableHead>
                            <TableHead>Edad</TableHead>
                            <TableHead>Inscripción</TableHead>
                            <TableHead>Folio</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
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
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50/50 p-16 text-center animate-in fade-in zoom-in-95 duration-300">
                <div className="bg-white p-4 rounded-full shadow-sm mb-4 ring-1 ring-slate-100">
                    <SearchX className="h-10 w-10 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">No se encontraron jugadores</h3>
                <p className="text-sm text-slate-500 mt-2 max-w-sm">
                    No hay registros que coincidan con tu búsqueda. Intenta ajustar los filtros o inscribe un nuevo jugador.
                </p>
            </div>
        );
    }

    return (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm overflow-hidden">
            <Table>
                <TableHeader className="bg-slate-50/80 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                    <TableRow className="hover:bg-transparent">
                        <TableHead className="text-xs uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400 pl-6 py-4">Deportista</TableHead>
                        <TableHead className="text-xs uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400">Documento</TableHead>
                        <TableHead className="text-xs uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400">País</TableHead>
                        <TableHead className="text-xs uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400">Institución</TableHead>
                        <TableHead className="text-xs uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400">Edad</TableHead>
                        <TableHead className="text-xs uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400">Fecha Reg.</TableHead>
                        <TableHead className="text-xs uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400">N° Folio</TableHead>
                        <TableHead className="text-xs uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400 text-right pr-6">Gestión</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {jugadores.map((jugador) => {
                        const edad = calcularEdad(jugador.nacimiento);
                        const nombreCompleto = `${jugador.nombres} ${jugador.paterno} ${jugador.materno}`;
                        const fechaInscripcion = new Date(jugador.inscripcion).toLocaleDateString('es-CL', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                        });
                        const tieneClub = !!jugador.Club?.nombre;

                        // Asumimos que viene el campo activo, si no, por defecto true
                        const isActivo = (jugador as any).activo !== false;

                        return (
                            <TableRow
                                key={jugador.id}
                                className="group hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors border-slate-100 dark:border-slate-800"
                            >
                                {/* COLUMNA JUGADOR (Avatar + Nombre + Estado Texto) */}
                                <TableCell className="pl-6 py-3">
                                    <div className="flex items-center gap-4">
                                        <PlayerAvatar
                                            nombre={jugador.nombres}
                                            paterno={jugador.paterno}
                                            foto={(jugador as any).foto}
                                            activo={isActivo}
                                        />
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-sm text-slate-800 dark:text-slate-200 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">
                                                {nombreCompleto}
                                            </span>
                                            <span className="text-xs text-slate-500 dark:text-slate-500 flex items-center gap-1.5">
                                                {isActivo ? (
                                                    <span className="text-green-600 flex items-center gap-1">Habilitado</span>
                                                ) : (
                                                    <span className="text-red-500 flex items-center gap-1">Suspendido</span>
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                </TableCell>

                                {/* COLUMNA IDENTIFICACIÓN (Monoespaciada para lectura técnica) */}
                                <TableCell>
                                    <div className="flex flex-col justify-center h-full">
                                        {jugador.tipoIdentificacion === 'PASSPORT' ? (
                                            <div className="flex items-center gap-2" title="Pasaporte Extranjero">
                                                <Globe className="h-3.5 w-3.5 text-indigo-400" />
                                                <span className="font-mono text-sm text-slate-600 dark:text-slate-300">{jugador.pasaporte}</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2" title="RUT Nacional">
                                                <CreditCard className="h-3.5 w-3.5 text-slate-400" />
                                                <span className="font-mono text-sm text-slate-600 dark:text-slate-300">{formatearRUT(jugador.rut, jugador.dv)}</span>
                                            </div>
                                        )}
                                    </div>
                                </TableCell>

                                {/* COLUMNA NACIONALIDAD */}
                                <TableCell>
                                    {jugador.nacionalidad ? (
                                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                                            <span className="text-base" role="img" aria-label="flag">🏳️</span>
                                            <span className="capitalize">{jugador.nacionalidad.toLowerCase()}</span>
                                        </div>
                                    ) : (
                                        <span className="text-slate-300 text-xs">-</span>
                                    )}
                                </TableCell>

                                {/* COLUMNA CLUB */}
                                <TableCell>
                                    {tieneClub ? (
                                        <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-100 font-normal shadow-sm">
                                            <ShieldHalf className="mr-1 h-3 w-3" />
                                            {jugador.Club?.nombre}
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline" className="text-slate-500 border-slate-200 font-normal">
                                            Sin Club
                                        </Badge>
                                    )}
                                </TableCell>

                                <TableCell className="text-slate-600 dark:text-slate-400 text-sm">
                                    {edad} años
                                </TableCell>

                                <TableCell className="text-slate-500 dark:text-slate-400 text-xs">
                                    {fechaInscripcion}
                                </TableCell>

                                {/* FOLIO (Estilo Tag Técnico) */}
                                <TableCell>
                                    <div className="font-mono text-xs font-medium text-slate-600 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded w-fit border border-slate-200 dark:border-slate-700 group-hover:border-blue-200 transition-colors">
                                        #{jugador.folio}
                                    </div>
                                </TableCell>

                                {/* ACCIONES */}
                                <TableCell className="text-right pr-6">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all rounded-full">
                                                <MoreHorizontal className="h-4 w-4" />
                                                <span className="sr-only">Acciones</span>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-56 shadow-lg border-slate-100">
                                            <DropdownMenuLabel className="text-xs text-slate-400 uppercase tracking-wider font-medium px-2 py-1.5">
                                                Administración
                                            </DropdownMenuLabel>

                                            <DropdownMenuItem asChild>
                                                <Link href={`/jugadores/${jugador.id}`} className="flex items-center cursor-pointer py-2">
                                                    <Eye className="mr-2 h-4 w-4 text-slate-500" />
                                                    <span>Ver Expediente</span>
                                                </Link>
                                            </DropdownMenuItem>

                                            <DropdownMenuItem onClick={() => onEditar(jugador.id.toString())} className="cursor-pointer py-2">
                                                <Pencil className="mr-2 h-4 w-4 text-slate-500" />
                                                <span>Editar Ficha</span>
                                            </DropdownMenuItem>

                                            <DropdownMenuSeparator />

                                            <DropdownMenuItem onClick={() => onTransferir(jugador)} className="cursor-pointer py-2 text-indigo-600 focus:text-indigo-700 focus:bg-indigo-50">
                                                <ArrowRightLeft className="mr-2 h-4 w-4" />
                                                <span>Tramitar Pase</span>
                                            </DropdownMenuItem>

                                            <DropdownMenuSeparator />

                                            <DropdownMenuItem
                                                onClick={() => onEliminar(jugador.id.toString())}
                                                className="cursor-pointer py-2 text-red-600 focus:text-red-700 focus:bg-red-50"
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                <span>Eliminar Registro</span>
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