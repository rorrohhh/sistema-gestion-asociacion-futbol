'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
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
    UserCheck,
    Circle
} from 'lucide-react';

// UI
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { HistorialPases } from '@/components/historial-pases';

// Logic
import { api } from '@/lib/api';
import { env } from '@/lib/env'; // <--- IMPORTAR ENV PARA URL BASE DE IMAGEN
import type { Jugador } from '@/types';

const formatRut = (rut: number | null, dv: string | null) => {
    if (!rut) return '-';
    return `${rut.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}-${dv}`;
};

export default function DetalleJugadorPage() {
    const router = useRouter();
    const params = useParams();
    const jugadorId = params.id as string;

    const [jugador, setJugador] = useState<Jugador | null>(null);
    const [historial, setHistorial] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            if (!jugadorId) return;
            try {
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

    // Construir URL de la foto si existe
    // Si la ruta viene como '/uploads/foto.jpg', le pegamos la URL base del backend
    const fotoUrl = (jugador as any).foto
        ? `${env.apiUrl}${(jugador as any).foto}`
        : null;

    const isActive = (jugador as any).activo;

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

                    {/* FOTO DE PERFIL */}
                    <div className="relative h-24 w-24 rounded-full overflow-hidden border-4 border-white shadow-sm bg-slate-100 dark:bg-slate-800 flex-shrink-0">
                        {fotoUrl ? (
                            <img
                                src={fotoUrl}
                                alt="Foto de perfil"
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <div className="h-full w-full flex items-center justify-center text-3xl font-bold text-slate-400">
                                {jugador.nombres.charAt(0)}{jugador.paterno.charAt(0)}
                            </div>
                        )}
                    </div>

                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                                {jugador.nombres} {jugador.paterno} {jugador.materno}
                            </h1>

                            {/* ESTADO ACTIVO/INACTIVO */}
                            {isActive ? (
                                <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100 gap-1">
                                    <Circle className="h-2 w-2 fill-current" /> Activo
                                </Badge>
                            ) : (
                                <Badge variant="destructive" className="gap-1">
                                    <Circle className="h-2 w-2 fill-current" /> Inactivo
                                </Badge>
                            )}
                        </div>

                        <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                            <span className="flex items-center gap-1">
                                <Hash className="h-3 w-3" /> ROL: {jugador.rol}
                            </span>
                            <span className="flex items-center gap-1">
                                <Shirt className="h-3 w-3" /> Camiseta: {jugador.numero}
                            </span>
                            <span className="flex items-center gap-1">
                                <Building2 className="h-3 w-3" /> {jugador.Club ? jugador.Club.nombre : 'Libre'}
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
                                                ? new Date(jugador.nacimiento + 'T00:00:00').toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })
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
                                            ? new Date(jugador.inscripcion + 'T00:00:00').toLocaleDateString('es-CL')
                                            : '-'}
                                    </p>
                                </div>
                                <div className="pt-2">
                                    <p className="text-xs text-slate-400 uppercase font-bold mb-1">Inscrito por</p>
                                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                                        <UserCheck className="h-4 w-4" />
                                        <span className="capitalize">{jugador.delegadoInscripcion || 'No registrado'}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Columna Derecha: Historial */}
                    <div className="lg:col-span-2">
                        <HistorialPases pases={historial} />
                    </div>
                </div>
            </div>
        </div>
    );
}