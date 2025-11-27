'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ArrowRight, History, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// Interfaz para los datos que vienen del backend
interface Pase {
    id: number;
    fecha: string;
    comentario: string | null;
    ClubOrigen?: { nombre: string };
    ClubDestino?: { nombre: string };
}

interface HistorialPasesProps {
    pases: Pase[];
}

export function HistorialPases({ pases }: HistorialPasesProps) {
    // Si no hay historial, mostramos un mensaje amigable
    if (!pases || pases.length === 0) {
        return (
            <Card className="border-dashed bg-slate-50/50 dark:bg-slate-900/20">
                <CardContent className="p-8 text-center text-slate-500">
                    <History className="mx-auto h-10 w-10 mb-3 opacity-20" />
                    <p className="text-sm font-medium">Este jugador no tiene historial de transferencias.</p>
                    <p className="text-xs text-slate-400">Siempre ha pertenecido al mismo club o es su primera inscripción.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="shadow-md border-slate-200 dark:border-slate-800">
            <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-800">
                <CardTitle className="text-lg font-bold flex items-center gap-2 text-slate-800 dark:text-slate-100">
                    <History className="h-5 w-5 text-blue-600" />
                    Historial de Transferencias
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <div className="overflow-hidden">
                    <Table>
                        <TableHeader className="bg-slate-50 dark:bg-slate-900">
                            <TableRow>
                                <TableHead className="w-[120px] font-semibold">Fecha</TableHead>
                                <TableHead className="font-semibold">Movimiento</TableHead>
                                <TableHead className="font-semibold text-right">Detalle / Motivo</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {pases.map((pase) => (
                                <TableRow key={pase.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                                    <TableCell className="font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap">
                                        {/* Formato de fecha chileno dd-mm-yyyy */}
                                        {new Date(pase.fecha + 'T00:00:00').toLocaleDateString('es-CL')}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm">
                                            {/* Origen */}
                                            <div className="flex items-center gap-1 text-slate-500">
                                                <MapPin className="h-3 w-3" />
                                                <span className="font-medium">
                                                    {pase.ClubOrigen?.nombre || 'Libre / Inicios'}
                                                </span>
                                            </div>

                                            <ArrowRight className="h-4 w-4 text-blue-400 hidden sm:block" />
                                            <ArrowRight className="h-3 w-3 text-blue-400 sm:hidden rotate-90 my-1 self-start ml-1" />

                                            {/* Destino */}
                                            <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800">
                                                {pase.ClubDestino?.nombre}
                                            </Badge>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {pase.comentario ? (
                                            <span className="text-sm text-slate-600 dark:text-slate-400 italic">
                                                "{pase.comentario}"
                                            </span>
                                        ) : (
                                            <span className="text-xs text-slate-400">-</span>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}