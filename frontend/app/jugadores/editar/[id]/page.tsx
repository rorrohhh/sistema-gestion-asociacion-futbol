'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
    Save,
    X,
    ArrowLeft,
    CheckCircle2,
    Trophy,
    Pencil
} from 'lucide-react';

// Componentes UI
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// Lógica y Tipos
import { jugadorSchema } from '@/lib/validations';
import { api } from '@/lib/api';
import type { Club } from '@/types';
import * as z from 'zod';

// Función auxiliar para formatear RUT visualmente
const formatRut = (rut: string) => {
    const clean = rut.replace(/[^0-9kK]/g, '');
    if (clean.length <= 1) return clean;
    const body = clean.slice(0, -1);
    const dv = clean.slice(-1).toUpperCase();
    const formattedBody = body.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return `${formattedBody}-${dv}`;
};

// Extracción de ID de la URL
const extractIdFromPath = (pathname: string): string | null => {
    const parts = pathname.split('/');
    return parts[parts.length - 1] || null;
};

export default function EditarJugadorPage() {
    const router = useRouter();
    const pathname = usePathname();
    const jugadorId = extractIdFromPath(pathname);

    const [clubes, setClubes] = useState<Club[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(true);

    // 1. Configuración del Formulario
    const form = useForm({
        resolver: zodResolver(jugadorSchema),
        defaultValues: {
            tipo_identificacion: 'RUT' as const,
            nombres: '',
            paterno: '',
            materno: '',
            rut: '',
            passport: '',
            nacionalidad: '', // <--- NUEVO VALOR POR DEFECTO
            rol: '',
            numero: 0,
            club_id: '',
            nacimiento: '',
            inscripcion: '',
        },
    });

    const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = form;

    // Observamos el tipo para mostrar/ocultar campos condicionales
    const tipoIdentificacion = watch('tipo_identificacion');

    // 2. Cargar datos
    useEffect(() => {
        async function loadData() {
            if (!jugadorId) {
                toast.error('ID de jugador no encontrado en la URL.');
                setIsLoadingData(false);
                return;
            }

            try {
                const [clubesData, jugadorData] = await Promise.all([
                    api.getClubes(),
                    api.getJugadorPorId(jugadorId)
                ]);

                setClubes(clubesData);

                const data: any = jugadorData;

                // Pre-llenar formulario
                form.reset({
                    nombres: data.nombres,
                    paterno: data.paterno,
                    materno: data.materno || '',

                    // Convertimos ID a string para el Select
                    club_id: data.clubId ? data.clubId.toString() : (data.club_id ? data.club_id.toString() : ''),

                    numero: data.numero,
                    rol: data.rol,
                    nacionalidad: data.nacionalidad || '', // <--- CARGAMOS LA NACIONALIDAD

                    // Manejo de fechas
                    nacimiento: data.nacimiento ? String(data.nacimiento) : '',
                    inscripcion: data.inscripcion ? String(data.inscripcion) : '',

                    // Identificación (aseguramos el tipo correcto)
                    tipo_identificacion: (data.tipoIdentificacion === 'PASSPORT' ? 'PASSPORT' : 'RUT'),

                    // Formatear RUT si existe
                    rut: data.rut ? formatRut(data.rut.toString() + (data.dv || '')) : '',
                    passport: data.pasaporte || '',
                });

            } catch (error) {
                console.error('Error cargando datos:', error);
                toast.error('Error al cargar la información del jugador.');
            } finally {
                setIsLoadingData(false);
            }
        }
        loadData();
    }, [jugadorId, form]);

    // 3. Enviar datos (Submit)
    const onSubmit = async (data: z.infer<typeof jugadorSchema>) => {
        if (!jugadorId) return;

        try {
            // Preparar payload
            const payload: any = {
                ...data,
                rut: data.rut || '',
                rol: data.rol,
                club_id: data.club_id,
                nacionalidad: data.nacionalidad, // <--- SE ENVÍA AQUÍ
                tipo_identificacion_input: data.tipo_identificacion,
                passport_input: data.passport
            };

            await api.updateJugador(jugadorId, payload);

            toast.success('Jugador actualizado exitosamente');
            router.push('/jugadores');

        } catch (error) {
            console.error('Error al editar jugador:', error);
            toast.error('Error al actualizar. Verifique los datos.');
        }
    };

    if (isLoadingData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <p className="ml-3 text-slate-600 dark:text-slate-400">Cargando datos...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            {/* Header */}
            <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="bg-blue-600 p-2 rounded-lg">
                            <Trophy className="h-5 w-5 text-white" />
                        </div>
                        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent hidden sm:block">
                            Gestión Fútbol
                        </h1>
                    </div>
                </div>
            </header>

            <div className="max-w-6xl mx-auto py-8 px-4">
                <div className="mb-8 flex items-center justify-between">
                    <Link href="/jugadores" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors py-2">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Volver al Listado
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Info Lateral */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="lg:sticky lg:top-8">
                            <div className="mb-6">
                                <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl mb-3 flex items-center gap-2">
                                    <Pencil className="h-8 w-8 text-blue-500" />
                                    Editar Jugador
                                </h1>
                                <p className="text-slate-600 dark:text-slate-400">
                                    Editando ficha del jugador ID: <span className="font-mono bg-slate-100 px-1 rounded">{jugadorId}</span>
                                </p>
                            </div>

                            <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-900/50 shadow-none">
                                <CardContent className="p-4 flex items-start gap-4">
                                    <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-full shrink-0">
                                        <CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="font-semibold text-blue-900 dark:text-blue-100 text-sm">Modo Edición</h4>
                                        <p className="text-sm text-blue-700 dark:text-blue-300">
                                            Edite los campos necesarios. El RUT solo acepta formato válido chileno.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Formulario Principal */}
                    <div className="lg:col-span-8">
                        <Card className="border-0 shadow-lg bg-white dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-slate-800">
                            <form onSubmit={handleSubmit(onSubmit)}>
                                <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
                                    <CardTitle className="text-xl font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                                        <User className="h-5 w-5 text-slate-500" />
                                        Ficha Técnica
                                    </CardTitle>
                                    <CardDescription>Información personal y deportiva</CardDescription>
                                </CardHeader>

                                <CardContent className="p-6 sm:p-8 space-y-6">

                                    {/* IDENTIFICACIÓN */}
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-medium text-slate-900 dark:text-slate-200 border-l-4 border-blue-500 pl-3">
                                            Identificación
                                        </h3>

                                        {/* Selector de Tipo */}
                                        <div className="space-y-3">
                                            <Label>Tipo de Documento</Label>
                                            <RadioGroup
                                                onValueChange={(val) => setValue('tipo_identificacion', val as "RUT" | "PASSPORT")}
                                                defaultValue={tipoIdentificacion}
                                                key={tipoIdentificacion}
                                                className="flex flex-col sm:flex-row gap-4"
                                            >
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="RUT" id="r-rut" />
                                                    <Label htmlFor="r-rut" className="font-normal">RUT (Chile)</Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="PASSPORT" id="r-pass" />
                                                    <Label htmlFor="r-pass" className="font-normal">Pasaporte</Label>
                                                </div>
                                            </RadioGroup>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {/* Campo RUT */}
                                            {tipoIdentificacion === 'RUT' && (
                                                <div className="space-y-2">
                                                    <Label htmlFor="rut">RUT</Label>
                                                    <div className="relative">
                                                        <CreditCard className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                                        <Input
                                                            id="rut"
                                                            placeholder="12.345.678-9"
                                                            className="pl-9"
                                                            {...register('rut')}
                                                            onChange={(e) => {
                                                                const formatted = formatRut(e.target.value);
                                                                if (formatted.length <= 12) {
                                                                    setValue('rut', formatted);
                                                                }
                                                            }}
                                                        />
                                                    </div>
                                                    {errors.rut && <p className="text-xs text-red-500">{errors.rut.message}</p>}
                                                </div>
                                            )}

                                            {/* Campo Pasaporte */}
                                            {tipoIdentificacion === 'PASSPORT' && (
                                                <div className="space-y-2">
                                                    <Label htmlFor="passport">N° Pasaporte</Label>
                                                    <Input
                                                        id="passport"
                                                        placeholder="A12345678"
                                                        {...register('passport')}
                                                    />
                                                    {errors.passport && <p className="text-xs text-red-500">{errors.passport.message}</p>}
                                                </div>
                                            )}

                                            {/* ROL */}
                                            <div className="space-y-2">
                                                <Label htmlFor="rol">N° ROL</Label>
                                                <div className="relative">
                                                    <Hash className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                                    <Input
                                                        id="rol"
                                                        placeholder="Ej: 6785"
                                                        className="pl-9"
                                                        {...register('rol')}
                                                    />
                                                </div>
                                                {errors.rol && <p className="text-xs text-red-500">{errors.rol.message}</p>}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="h-px bg-slate-100 dark:bg-slate-800" />

                                    {/* DATOS PERSONALES */}
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-medium text-slate-900 dark:text-slate-200 border-l-4 border-indigo-500 pl-3">
                                            Datos Personales
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="nombres">Nombres</Label>
                                                <div className="relative">
                                                    <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                                    <Input id="nombres" className="pl-9" {...register('nombres')} />
                                                </div>
                                                {errors.nombres && <p className="text-xs text-red-500">{errors.nombres.message}</p>}
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="paterno">Apellido Paterno</Label>
                                                <Input id="paterno" {...register('paterno')} />
                                                {errors.paterno && <p className="text-xs text-red-500">{errors.paterno.message}</p>}
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="materno">Apellido Materno</Label>
                                                <Input id="materno" {...register('materno')} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="nacimiento">Fecha Nacimiento</Label>
                                                <div className="relative">
                                                    <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                                    <Input id="nacimiento" type="date" className="pl-9" {...register('nacimiento')} />
                                                </div>
                                                {errors.nacimiento && <p className="text-xs text-red-500">{errors.nacimiento.message}</p>}
                                            </div>

                                            {/* NUEVO CAMPO: NACIONALIDAD */}
                                            <div className="space-y-2">
                                                <Label htmlFor="nacionalidad">Nacionalidad</Label>
                                                <Input id="nacionalidad" placeholder="Ej: Chilena" {...register('nacionalidad')} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="h-px bg-slate-100 dark:bg-slate-800" />

                                    {/* DATOS DEPORTIVOS */}
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-medium text-slate-900 dark:text-slate-200 border-l-4 border-green-500 pl-3">
                                            Datos del Club
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2 md:col-span-2">
                                                <Label htmlFor="club_id">Club</Label>
                                                <div className="relative">
                                                    <Building2 className="absolute left-3 top-3 h-4 w-4 text-slate-400 z-10" />
                                                    <Select
                                                        onValueChange={(value) => setValue('club_id', value)}
                                                        value={watch('club_id')}
                                                    >
                                                        <SelectTrigger className="pl-9">
                                                            <SelectValue placeholder="Seleccione un club" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {clubes.map((club) => (
                                                                <SelectItem key={club.id} value={club.id.toString()}>
                                                                    {club.nombre}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                {errors.club_id && <p className="text-xs text-red-500">{errors.club_id.message}</p>}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="numero">Número Camiseta</Label>
                                                <div className="relative">
                                                    <Shirt className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                                    <Input
                                                        id="numero"
                                                        type="number"
                                                        className="pl-9"
                                                        {...register('numero')}
                                                        onChange={(e) => setValue('numero', e.target.valueAsNumber)}
                                                    />
                                                </div>
                                                {errors.numero && <p className="text-xs text-red-500">{errors.numero.message}</p>}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="inscripcion">Fecha Inscripción</Label>
                                                <div className="relative">
                                                    <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                                    <Input id="inscripcion" type="date" className="pl-9" {...register('inscripcion')} />
                                                </div>
                                                {errors.inscripcion && <p className="text-xs text-red-500">{errors.inscripcion.message}</p>}
                                            </div>
                                        </div>
                                    </div>

                                </CardContent>

                                <CardFooter className="flex flex-col sm:flex-row gap-4 px-6 sm:px-8 py-6 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800">
                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Guardando...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="mr-2 h-4 w-4" />
                                                Guardar Cambios
                                            </>
                                        )}
                                    </Button>

                                    <Link href="/jugadores" className="w-full sm:w-auto">
                                        <Button type="button" variant="outline" disabled={isSubmitting} className="w-full">
                                            <X className="mr-2 h-4 w-4" />
                                            Cancelar
                                        </Button>
                                    </Link>
                                </CardFooter>
                            </form>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}