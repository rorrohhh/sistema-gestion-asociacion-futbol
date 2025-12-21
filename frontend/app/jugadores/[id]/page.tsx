'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'sonner';
import Link from 'next/link';
import {
    Loader2,
    User,
    Calendar,
    CreditCard,
    Building2,
    ArrowLeft,
    Pencil,
    Globe,
    Flag,
    UserCheck,
    ShieldCheck,
    History,
    FileText,
    CheckCircle2,
    XCircle
} from 'lucide-react';

// UI Components
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { HistorialPases } from '@/components/historial-pases';

// Logic
import { api } from '@/lib/api';
import { env } from '@/lib/env';
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
                <p className="ml-3 text-slate-600 font-medium">Cargando expediente...</p>
            </div>
        );
    }

    if (!jugador) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
                <h2 className="text-xl font-bold text-slate-800">Jugador no encontrado</h2>
                <Button variant="link" onClick={() => router.back()}>Volver al listado</Button>
            </div>
        );
    }

    // Construir URL de la foto
    const fotoUrl = (jugador as any).foto
        ? `${env.apiUrl}${(jugador as any).foto}`
        : null;

    const isActive = (jugador as any).activo;

    return (
        <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 py-8 px-4">
            <div className="max-w-5xl mx-auto space-y-6">

                {/* Navegación Superior */}
                <div className="flex items-center justify-between no-print">
                    <Button variant="ghost" onClick={() => router.back()} className="text-slate-500 hover:text-slate-900 hover:bg-slate-200/50 rounded-full px-4">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Volver al Listado
                    </Button>
                    <Link href={`/jugadores/editar/${jugador.id}`}>
                        <Button className="bg-white text-blue-700 border border-blue-200 hover:bg-blue-50 hover:border-blue-300 shadow-sm">
                            <Pencil className="mr-2 h-4 w-4" />
                            Editar Ficha
                        </Button>
                    </Link>
                </div>

                {/* TARJETA PRINCIPAL: FICHA TÉCNICA */}
                <Card className="border-slate-200 shadow-sm overflow-hidden bg-white dark:bg-slate-900 print:shadow-none">

                    {/* Barra Superior Azul (Marca de Ficha Oficial) */}
                    <div className="h-2 w-full bg-blue-600"></div>

                    <CardContent className="p-0">
                        {/* ENCABEZADO DE PERFIL */}
                        <div className="p-8 pb-6 flex flex-col md:flex-row gap-8 items-start">

                            {/* Foto de Perfil */}
                            <div className="relative flex-shrink-0">
                                <div className="h-32 w-32 rounded-full overflow-hidden border-4 border-slate-50 shadow-md bg-slate-100 flex items-center justify-center">
                                    {fotoUrl ? (
                                        <img
                                            src={fotoUrl}
                                            alt={`${jugador.nombres} ${jugador.paterno}`}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <User className="h-12 w-12 text-slate-300" />
                                    )}
                                </div>
                                {/* Badge Flotante de Estado */}
                                <div className="absolute bottom-1 right-1">
                                    {isActive ? (
                                        <div className="h-8 w-8 rounded-full bg-green-500 border-4 border-white flex items-center justify-center text-white shadow-sm" title="Habilitado">
                                            <CheckCircle2 className="h-5 w-5" />
                                        </div>
                                    ) : (
                                        <div className="h-8 w-8 rounded-full bg-red-500 border-4 border-white flex items-center justify-center text-white shadow-sm" title="Suspendido">
                                            <XCircle className="h-5 w-5" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Información Principal */}
                            <div className="flex-1 space-y-2 pt-2">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div>
                                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white leading-tight">
                                            {jugador.nombres} {jugador.paterno}
                                        </h1>
                                        <p className="text-xl text-slate-500 dark:text-slate-400 font-medium">
                                            {jugador.materno}
                                        </p>
                                    </div>

                                    {/* Folio Box */}
                                    <div className="flex flex-col items-center">
                                        <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">N° Folio</span>
                                        <div className="font-mono text-2xl font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-md border border-slate-200 dark:border-slate-700">
                                            {jugador.folio}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-3 mt-4">
                                    <Badge variant="secondary" className="px-3 py-1 text-sm bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-100">
                                        <Building2 className="mr-1.5 h-3.5 w-3.5" />
                                        {jugador.Club ? jugador.Club.nombre : 'Jugador Libre'}
                                    </Badge>

                                    {isActive ? (
                                        <Badge variant="outline" className="px-3 py-1 text-sm text-green-700 border-green-200 bg-green-50">
                                            Habilitado para jugar
                                        </Badge>
                                    ) : (
                                        <Badge variant="destructive" className="px-3 py-1 text-sm">
                                            Suspendido Administrativamente
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>

                        <Separator className="bg-slate-100" />

                        {/* GRILLA DE DETALLES */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-slate-100 dark:bg-slate-800 border-b border-slate-100">

                            {/* SECCIÓN 1: DATOS PERSONALES */}
                            <div className="bg-white dark:bg-slate-900 p-6 md:p-8">
                                <div className="flex items-center gap-2 mb-6">
                                    <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                                        <FileText className="h-5 w-5" />
                                    </div>
                                    <h3 className="font-semibold text-slate-900 dark:text-white">Datos Personales</h3>
                                </div>

                                <div className="space-y-5">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Identificación</p>
                                            <div className="flex items-center gap-2 font-medium text-slate-900 dark:text-slate-200">
                                                {jugador.tipoIdentificacion === 'PASSPORT' ? (
                                                    <>
                                                        <Globe className="h-4 w-4 text-slate-400" />
                                                        <span>{jugador.pasaporte}</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <CreditCard className="h-4 w-4 text-slate-400" />
                                                        <span>{formatRut(jugador.rut, jugador.dv)}</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Nacionalidad</p>
                                            <div className="flex items-center gap-2 font-medium text-slate-900 dark:text-slate-200">
                                                <Flag className="h-4 w-4 text-slate-400" />
                                                <span>{jugador.nacionalidad || 'No registrada'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Fecha de Nacimiento</p>
                                        <div className="flex items-center gap-2 font-medium text-slate-900 dark:text-slate-200">
                                            <Calendar className="h-4 w-4 text-slate-400" />
                                            <span>
                                                {jugador.nacimiento
                                                    ? new Date(jugador.nacimiento + 'T00:00:00').toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })
                                                    : '-'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* SECCIÓN 2: DATOS ADMINISTRATIVOS */}
                            <div className="bg-white dark:bg-slate-900 p-6 md:p-8">
                                <div className="flex items-center gap-2 mb-6">
                                    <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                                        <ShieldCheck className="h-5 w-5" />
                                    </div>
                                    <h3 className="font-semibold text-slate-900 dark:text-white">Registro Asociación</h3>
                                </div>

                                <div className="space-y-5">
                                    <div>
                                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Club Actual</p>
                                        <div className="flex items-center gap-2 font-medium text-slate-900 dark:text-slate-200">
                                            <Building2 className="h-4 w-4 text-slate-400" />
                                            <span>{jugador.Club ? jugador.Club.nombre : 'Sin Club Asignado'}</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Fecha Inscripción</p>
                                            <div className="font-medium text-slate-900 dark:text-slate-200">
                                                {jugador.inscripcion
                                                    ? new Date(jugador.inscripcion + 'T00:00:00').toLocaleDateString('es-CL')
                                                    : '-'}
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Delegado</p>
                                            <div className="flex items-center gap-2 font-medium text-slate-900 dark:text-slate-200">
                                                <UserCheck className="h-4 w-4 text-slate-400" />
                                                <span className="capitalize">{jugador.delegadoInscripcion || 'No especificado'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* HISTORIAL DE PASES (Separado visualmente pero manteniendo el lenguaje) */}
                <div className="pt-4">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="h-8 w-1 bg-blue-500 rounded-full"></div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <History className="h-5 w-5 text-slate-400" />
                            Historial de Transferencias
                        </h2>
                    </div>

                    {/* Aquí renderizamos el componente de historial existente */}
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                        <HistorialPases pases={historial} />
                    </div>
                </div>

            </div>
        </div>
    );
}