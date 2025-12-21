'use client';

import { useState } from 'react';
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
    SearchX,
    CheckCircle2,
    XCircle,
    ShieldHalf,
    ChevronDown,
    ChevronUp,
    Calendar,
    Flag
} from 'lucide-react';
import { Button } from './ui/button';
import Link from 'next/link';
import { env } from '@/lib/env';

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

function getInitials(nombre: string, paterno: string): string {
    return `${nombre.charAt(0)}${paterno.charAt(0)}`.toUpperCase();
}

const PlayerAvatar = ({ nombre, paterno, foto, activo }: { nombre: string, paterno: string, foto?: string, activo: boolean }) => {
    const fotoUrl = foto ? `${env.apiUrl}${foto}` : null;
    return (
        <div className="relative">
            <div className="h-10 w-10 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 flex items-center justify-center shadow-sm">
                {fotoUrl ? (
                    <img src={fotoUrl} alt={`${nombre} ${paterno}`} className="h-full w-full object-cover" />
                ) : (
                    <span className="text-xs font-bold text-blue-700 dark:text-blue-300">
                        {getInitials(nombre, paterno)}
                    </span>
                )}
            </div>
            <div className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center ${activo ? 'bg-green-500' : 'bg-red-500'}`}>
                {activo ? <CheckCircle2 className="h-2 w-2 text-white" /> : <XCircle className="h-2 w-2 text-white" />}
            </div>
        </div>
    );
};

const JugadorRow = ({ jugador, onEliminar, onEditar, onTransferir }: { jugador: Jugador } & Omit<JugadoresTableProps, 'jugadores' | 'isLoading'>) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const edad = calcularEdad(jugador.nacimiento);
    const nombreCompleto = `${jugador.nombres} ${jugador.paterno} ${jugador.materno}`;
    const fechaInscripcion = new Date(jugador.inscripcion).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' });
    const tieneClub = !!jugador.Club?.nombre;
    const isActivo = (jugador as any).activo !== false;

    return (
        <>
            <TableRow className={`group hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors border-slate-100 dark:border-slate-800 ${isExpanded ? 'bg-slate-50/50 dark:bg-slate-800/30' : ''}`}>

                <TableCell className="pl-4 py-3">
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 md:hidden text-slate-400"
                            onClick={() => setIsExpanded(!isExpanded)}
                        >
                            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>

                        <div className="hidden md:block">
                            <PlayerAvatar nombre={jugador.nombres} paterno={jugador.paterno} foto={(jugador as any).foto} activo={isActivo} />
                        </div>

                        <div className="flex flex-col">
                            <span className="font-semibold text-sm text-slate-800 dark:text-slate-200 group-hover:text-blue-700 transition-colors">
                                {nombreCompleto}
                            </span>

                            <span className="text-xs text-slate-500 md:hidden flex items-center gap-1">
                                {tieneClub ? (
                                    <>
                                        <ShieldHalf className="h-3 w-3 text-blue-500" />
                                        <span className="font-medium text-blue-600 dark:text-blue-400">
                                            {jugador.Club?.nombre}
                                        </span>
                                    </>
                                ) : (
                                    <span className="italic text-slate-400">Sin Club</span>
                                )}
                            </span>
                        </div>
                    </div>
                </TableCell>

                <TableCell className="hidden md:table-cell">
                    <div className="flex flex-col justify-center h-full">
                        {jugador.tipoIdentificacion === 'PASSPORT' ? (
                            <div className="flex items-center gap-2" title="Pasaporte">
                                <Globe className="h-3.5 w-3.5 text-indigo-400 flex-shrink-0" />
                                <span className="font-mono text-sm text-slate-600 dark:text-slate-300">
                                    {jugador.pasaporte}
                                </span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2" title="RUT">
                                <CreditCard className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                                <span className="font-mono text-sm text-slate-600 dark:text-slate-300">
                                    {formatearRUT(jugador.rut, jugador.dv)}
                                </span>
                            </div>
                        )}
                    </div>
                </TableCell>

                <TableCell className="hidden md:table-cell">
                    {jugador.nacionalidad ? (
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                            <span className="text-base">🏳️</span>
                            <span className="capitalize">{jugador.nacionalidad.toLowerCase()}</span>
                        </div>
                    ) : <span className="text-slate-300 text-xs">-</span>}
                </TableCell>

                <TableCell className="hidden md:block mt-3 md:mt-0 border-0 md:border-b p-0 md:p-4">
                    {tieneClub ? (
                        <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-100 font-normal whitespace-nowrap hidden md:inline-flex">
                            <ShieldHalf className="mr-1 h-3 w-3" />
                            {jugador.Club?.nombre}
                        </Badge>
                    ) : (
                        <Badge variant="outline" className="text-slate-500 font-normal whitespace-nowrap hidden md:inline-flex">Sin Club</Badge>
                    )}
                </TableCell>

                <TableCell className="hidden md:table-cell text-slate-600 dark:text-slate-400 text-sm">
                    {edad} años
                </TableCell>

                <TableCell className="hidden md:table-cell text-slate-500 dark:text-slate-400 text-xs">
                    {fechaInscripcion}
                </TableCell>

                <TableCell className="hidden md:table-cell">
                    <div className="font-mono text-xs font-medium text-slate-600 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded w-fit border border-slate-200 dark:border-slate-700">
                        #{jugador.folio}
                    </div>
                </TableCell>

                <TableCell className="text-right pr-4">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-blue-600">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" side="bottom" className="w-56 z-50">
                            <DropdownMenuLabel className="text-xs text-slate-400 uppercase font-medium">Administración</DropdownMenuLabel>
                            <DropdownMenuItem asChild>
                                <Link href={`/jugadores/${jugador.id}`} className="cursor-pointer">
                                    <Eye className="mr-2 h-4 w-4" /> Ver Expediente
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onEditar(jugador.id.toString())} className="cursor-pointer">
                                <Pencil className="mr-2 h-4 w-4" /> Editar Ficha
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => onTransferir(jugador)} className="cursor-pointer text-indigo-600">
                                <ArrowRightLeft className="mr-2 h-4 w-4" /> Tramitar Pase
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => onEliminar(jugador.id.toString())} className="cursor-pointer text-red-600">
                                <Trash2 className="mr-2 h-4 w-4" /> Eliminar Registro
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </TableCell>
            </TableRow>

            {isExpanded && (
                <TableRow className="md:hidden bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100">
                    <TableCell colSpan={8} className="p-4">
                        <div className="grid grid-cols-2 gap-4 text-sm animate-in slide-in-from-top-2 fade-in duration-200">

                            <div className="col-span-2 space-y-1">
                                <span className="text-xs font-semibold text-slate-400 uppercase">Documento de Identidad</span>
                                <div className="flex items-center w-full">
                                    {jugador.tipoIdentificacion === 'PASSPORT' ? (
                                        <div className="flex items-center gap-2 text-slate-700 font-mono bg-white dark:bg-slate-800 border rounded px-2 py-1 w-full overflow-hidden">
                                            <Globe className="h-3.5 w-3.5 text-indigo-400 flex-shrink-0" />
                                            <span className="truncate">{jugador.pasaporte}</span>
                                            <span className="text-xs text-slate-400 ml-auto font-sans flex-shrink-0">Pasaporte</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 text-slate-700 font-mono bg-white dark:bg-slate-800 border rounded px-2 py-1 w-full overflow-hidden">
                                            <CreditCard className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                                            <span className="truncate">{formatearRUT(jugador.rut, jugador.dv)}</span>
                                            <span className="text-xs text-slate-400 ml-auto font-sans flex-shrink-0">RUT</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <span className="text-xs font-semibold text-slate-400 uppercase">Nacionalidad</span>
                                <div className="flex items-center gap-2 text-slate-700">
                                    <Flag className="h-4 w-4 text-slate-400" />
                                    <span className="capitalize">{jugador.nacionalidad || 'No definida'}</span>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <span className="text-xs font-semibold text-slate-400 uppercase">Edad</span>
                                <div className="text-slate-700 flex items-center gap-2">
                                    <span className="font-mono bg-slate-200 dark:bg-slate-800 px-1.5 rounded text-xs">{edad}</span> años
                                </div>
                            </div>
                        </div>
                    </TableCell>
                </TableRow>
            )}
        </>
    );
};

export function JugadoresTable({ jugadores, isLoading = false, onEliminar, onEditar, onTransferir }: JugadoresTableProps) {

    if (isLoading) { return <div>Cargando...</div>; }
    if (jugadores.length === 0) { return <div>Sin jugadores</div>; }

    return (

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm overflow-visible">
            <Table>
                <TableHeader className="bg-slate-50/80 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                    <TableRow className="hover:bg-transparent">
                        <TableHead className="text-xs uppercase tracking-wider font-semibold text-slate-500 pl-4 py-4">Deportista</TableHead>
                        <TableHead className="hidden md:table-cell text-xs uppercase tracking-wider font-semibold text-slate-500">Documento</TableHead>
                        <TableHead className="hidden md:table-cell text-xs uppercase tracking-wider font-semibold text-slate-500">País</TableHead>
                        <TableHead className="hidden md:table-cell">Club</TableHead> {/* Oculto título Club en movil porque va bajo el nombre */}
                        <TableHead className="hidden md:table-cell text-xs uppercase tracking-wider font-semibold text-slate-500">Edad</TableHead>
                        <TableHead className="hidden md:table-cell text-xs uppercase tracking-wider font-semibold text-slate-500">Fecha Reg.</TableHead>
                        <TableHead className="hidden md:table-cell text-xs uppercase tracking-wider font-semibold text-slate-500">N° Folio</TableHead>
                        <TableHead className="text-xs uppercase tracking-wider font-semibold text-slate-500 text-right pr-4">Gestión</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {jugadores.map((jugador) => (
                        <JugadorRow
                            key={jugador.id}
                            jugador={jugador}
                            onEliminar={onEliminar}
                            onEditar={onEditar}
                            onTransferir={onTransferir}
                        />
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}