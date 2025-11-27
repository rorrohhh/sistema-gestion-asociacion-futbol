'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { toast } from 'sonner';
import Link from 'next/link';
import {
    Loader2,
    User,
    Calendar,
    Hash,
    CreditCard,
    Shirt,
    Building2,
    ArrowLeft,
    Pencil,
    Globe,
    Flag,
    History
} from 'lucide-react';

// UI
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { HistorialPases } from '@/components/historial-pases'; // Reutilizamos el componente

// Logic
import { api } from '@/lib/api';
import type { Jugador, Club } from '@/types';

// Helpers
const extractIdFromPath = (pathname: string): string | null => {
    const parts = pathname.split('/');
    return parts[parts.length - 1] || null;
};

const formatRut = (rut: number | null, dv: string | null) => {
    if (!rut) return '-';
    return `${rut.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}-${dv}`;
};

export default function DetalleJugadorPage() {
    const router = useRouter();
    const pathname = usePathname();
    const jugadorId = extractIdFromPath(pathname);

    const [jugador, setJugador] = useState<Jugador | null>(null);
    const [historial, setHistorial] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            if (!jugadorId) return;
            try {
                // Cargamos datos del jugador e historial en paralelo
                const [playerData, historialData] = await Promise.all([
                    api.getJugadorPorId(jugadorId),
                    api.getHistorialPases(jugadorId)
                ]);
                setJugador(playerData);
                setHistorial(historialData);
            } catch (error) {
                console.error(error);
                toast.error('Error al cargar la ficha del jugador.');
            } finally {
                setIsLoading(false);
            }
        }
        loadData();
    }, [jugadorId]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (!jugador) {
        return <div className="p-8 text-center">Jugador no encontrado</div>;
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 sm:p-8">
            <div className="max-w-5xl mx-auto space-y-6">

                {/* Navegación Superior */}
                <div className="flex items-center justify-between">
                    <Button variant="ghost" onClick={() => router.back()} className="text-slate-500 hover:text-slate-900">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Volver
                    </Button>
                    <Link href={`/jugadores/editar/${jugador.id}`}>
                        <Button variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50">
                            <Pencil className="mr-2 h-4 w-4" />
                            Editar Ficha
                        </Button>
                    </Link>
                </div>

                {/* Encabezado Principal */}
                <div className="flex flex-col md:flex-row gap-6 items-start md:items-center bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
                    <div className="h-20 w-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-2xl font-bold text-slate-400">
                        {jugador.nombres.charAt(0)}{jugador.paterno.charAt(0)}
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                                {jugador.nombres} {jugador.paterno} {jugador.materno}
                            </h1>
                            <Badge variant={jugador.Club ? "default" : "secondary"} className="text-sm">
                                {jugador.Club ? jugador.Club.nombre : 'Libre'}
                            </Badge>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                            <span className="flex items-center gap-1">
                                <Hash className="h-3 w-3" /> ROL: {jugador.rol}
                            </span>
                            <span className="flex items-center gap-1">
                                <Shirt className="h-3 w-3" /> Camiseta: {jugador.numero}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Columna Izquierda: Datos Personales */}
                    <div className="lg:col-span-1 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base font-semibold flex items-center gap-2">
                                    <User className="h-4 w-4 text-blue-500" />
                                    Información Personal
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <p className="text-xs text-slate-400 uppercase font-bold mb-1">Identificación</p>
                                    {jugador.tipoIdentificacion === 'PASSPORT' ? (
                                        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                                            <Globe className="h-4 w-4" />
                                            <span>{jugador.pasaporte}</span>
                                            <Badge variant="outline" className="text-[10px]">Pasaporte</Badge>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                                            <CreditCard className="h-4 w-4" />
                                            <span>{formatRut(jugador.rut, jugador.dv)}</span>
                                            <Badge variant="outline" className="text-[10px]">RUT</Badge>
                                        </div>
                                    )}
                                </div>
                                <Separator />
                                <div>
                                    <p className="text-xs text-slate-400 uppercase font-bold mb-1">Nacionalidad</p>
                                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                                        <Flag className="h-4 w-4" />
                                        <span>{jugador.nacionalidad || 'No registrada'}</span>
                                    </div>
                                </div>
                                <Separator />
                                <div>
                                    <p className="text-xs text-slate-400 uppercase font-bold mb-1">Fecha Nacimiento</p>
                                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                                        <Calendar className="h-4 w-4" />
                                        <span>
                                            {jugador.nacimiento
                                                ? new Date(jugador.nacimiento).toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })
                                                : '-'}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base font-semibold flex items-center gap-2">
                                    <Building2 className="h-4 w-4 text-green-500" />
                                    Datos Asociación
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <p className="text-xs text-slate-400 uppercase font-bold mb-1">Fecha Inscripción</p>
                                    <p className="text-sm font-medium">
                                        {jugador.inscripcion
                                            ? new Date(jugador.inscripcion).toLocaleDateString('es-CL')
                                            : '-'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400 uppercase font-bold mb-1">Club Actual</p>
                                    <p className="text-lg font-bold text-blue-600">
                                        {jugador.Club?.nombre || 'Sin Club'}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Columna Derecha: Historial */}
                    <div className="lg:col-span-2">
                        {/* Aquí usamos tu componente de historial */}
                        <HistorialPases pases={historial} />
                    </div>
                </div>
            </div>
        </div>
    );
}