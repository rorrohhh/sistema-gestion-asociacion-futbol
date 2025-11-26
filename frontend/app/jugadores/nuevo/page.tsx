'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { jugadorSchema, type JugadorFormData } from '@/lib/validations';
import { api } from '@/lib/api';
import type { Club } from '@/types';
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
    Trophy
} from 'lucide-react';

// Renombrado de InscribirPage a NuevoJugadorPage para ser más explícito
export default function NuevoJugadorPage() {
    const router = useRouter();
    const [clubes, setClubes] = useState<Club[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<JugadorFormData>({
        resolver: zodResolver(jugadorSchema),
        defaultValues: {
            numero: '',
            paterno: '',
            materno: '',
            nombres: '',
            run_input: '',
            rol_input: '',
            nacimiento: '',
            inscripcion: '',
            club_id: 0,
        },
    });

    // Cargar clubes al montar
    useEffect(() => {
        async function loadClubes() {
            try {
                const data = await api.getClubes();
                setClubes(data);
            } catch (error) {
                console.error('Error cargando clubes:', error);
                toast.error('Error al cargar clubes');
            }
        }
        loadClubes();
    }, []);

    const onSubmit = async (data: JugadorFormData) => {
        setIsSubmitting(true);
        try {
            const dataToSend = {
                ...data,
                numero: data.numero,
                paterno: data.paterno,
                materno: data.materno,
                nombres: data.nombres,
                rol: data.rol_input,
                rut: data.run_input,
            };

            await api.createJugador(dataToSend);
            toast.success('Jugador inscrito exitosamente');
            // CAMBIO DE RUTA: Redirigir a la nueva página de listado de jugadores
            router.push('/jugadores');
        } catch (error) {
            console.error('Error al inscribir jugador:', error);
            toast.error('Error al inscribir jugador. Por favor intente nuevamente.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
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
            <div className="max-w-6xl mx-auto p-8">
                {/* Top Navigation */}
                <div className="mb-8 flex items-center justify-between">
                    {/* CAMBIO DE ENLACE: Ahora apunta al Listado de Jugadores */}
                    <Link href="/jugadores" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors py-2">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Volver al Listado de Jugadores
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Header & Info Column */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="lg:sticky lg:top-8">
                            <div className="mb-6">
                                <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl mb-3">
                                    Inscribir Jugador
                                </h1>
                                <p className="text-slate-600 dark:text-slate-400">
                                    Complete la información requerida para dar de alta un nuevo jugador en la asociación.
                                </p>
                            </div>

                            <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-900/50 shadow-none">
                                <CardContent className="p-4 flex items-start gap-4">
                                    <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-full shrink-0">
                                        <CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="font-semibold text-blue-900 dark:text-blue-100 text-sm">Información Importante</h4>
                                        <p className="text-sm text-blue-700 dark:text-blue-300">
                                            Asegúrese de verificar el RUT y la fecha de nacimiento antes de guardar. Los campos marcados son obligatorios.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Form Column */}
                    <div className="lg:col-span-8">
                        <Card className="border-0 shadow-lg bg-white dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-slate-800">
                            <form onSubmit={handleSubmit(onSubmit)}>
                                <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
                                    <CardTitle className="text-xl font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                                        <User className="h-5 w-5 text-slate-500" />
                                        Ficha Técnica
                                    </CardTitle>
                                    <CardDescription>
                                        Información personal y deportiva del jugador
                                    </CardDescription>
                                </CardHeader>

                                <CardContent className="p-6 sm:p-8 space-y-6">
                                    {/* Datos Personales */}
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-medium text-slate-900 dark:text-slate-200 border-l-4 border-blue-500 pl-3">
                                            Datos Personales
                                        </h3>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="run_input">RUT</Label>
                                                <div className="relative">
                                                    <CreditCard className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                                    <Input
                                                        id="run_input"
                                                        placeholder="12345678-9"
                                                        className="pl-9"
                                                        {...register('run_input')}
                                                    />
                                                </div>
                                                {errors.run_input && <p className="text-xs text-red-500">{errors.run_input.message}</p>}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="nombres">Nombres</Label>
                                                <div className="relative">
                                                    <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                                    <Input
                                                        id="nombres"
                                                        placeholder="Nombres"
                                                        className="pl-9"
                                                        {...register('nombres')}
                                                        onChange={(e) => setValue('nombres', e.target.value)}
                                                    />
                                                </div>
                                                {errors.nombres && <p className="text-xs text-red-500">{errors.nombres.message}</p>}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="paterno">Apellido Paterno</Label>
                                                <Input
                                                    id="paterno"
                                                    placeholder="Paterno"
                                                    {...register('paterno')}
                                                    onChange={(e) => setValue('paterno', e.target.value)}
                                                />
                                                {errors.paterno && <p className="text-xs text-red-500">{errors.paterno.message}</p>}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="materno">Apellido Materno</Label>
                                                <Input
                                                    id="materno"
                                                    placeholder="Materno"
                                                    {...register('materno')}
                                                    onChange={(e) => setValue('materno', e.target.value)}
                                                />
                                                {errors.materno && <p className="text-xs text-red-500">{errors.materno.message}</p>}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="nacimiento">Fecha de Nacimiento</Label>
                                                <div className="relative">
                                                    <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                                    <Input
                                                        id="nacimiento"
                                                        type="date"
                                                        className="pl-9"
                                                        {...register('nacimiento')}
                                                    />
                                                </div>
                                                {errors.nacimiento && <p className="text-xs text-red-500">{errors.nacimiento.message}</p>}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="h-px bg-slate-100 dark:bg-slate-800" />

                                    {/* Datos Deportivos */}
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-medium text-slate-900 dark:text-slate-200 border-l-4 border-indigo-500 pl-3">
                                            Datos Deportivos
                                        </h3>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2 md:col-span-2">
                                                <Label htmlFor="club_id">Club</Label>
                                                <div className="relative">
                                                    <Building2 className="absolute left-3 top-3 h-4 w-4 text-slate-400 z-10" />
                                                    <Select onValueChange={(value) => setValue('club_id', parseInt(value))}>
                                                        <SelectTrigger id="club_id" className="pl-9">
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
                                                        placeholder="Ej: 10"
                                                        className="pl-9"
                                                        {...register('numero')}
                                                    />
                                                </div>
                                                {errors.numero && <p className="text-xs text-red-500">{errors.numero.message}</p>}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="rol_input">ROL</Label>
                                                <div className="relative">
                                                    <Hash className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                                    <Input
                                                        id="rol_input"
                                                        placeholder="ROL"
                                                        className="pl-9"
                                                        {...register('rol_input')}
                                                        onChange={(e) => setValue('rol_input', e.target.value)}
                                                    />
                                                </div>
                                                {errors.rol_input && <p className="text-xs text-red-500">{errors.rol_input.message}</p>}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="inscripcion">Fecha Inscripción</Label>
                                                <div className="relative">
                                                    <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                                    <Input
                                                        id="inscripcion"
                                                        type="date"
                                                        className="pl-9"
                                                        {...register('inscripcion')}
                                                    />
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
                                                Guardar Ficha
                                            </>
                                        )}
                                    </Button>

                                    {/* CAMBIO DE ENLACE: Ahora apunta al Listado de Jugadores */}
                                    <Link href="/jugadores" className="w-full sm:w-auto">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            disabled={isSubmitting}
                                            className="w-full"
                                        >
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