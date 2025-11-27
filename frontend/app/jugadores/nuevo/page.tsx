'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Save, ArrowLeft, Loader2 } from 'lucide-react';
import * as z from 'zod';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription
} from '@/components/ui/form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

// Logic & Types
import { api } from '@/lib/api';
import { jugadorSchema } from '@/lib/validations';
import type { Club } from '@/types';

// Función auxiliar para formatear RUT visualmente
const formatRut = (rut: string) => {
    const clean = rut.replace(/[^0-9kK]/g, '');
    if (clean.length <= 1) return clean;
    const body = clean.slice(0, -1);
    const dv = clean.slice(-1).toUpperCase();
    const formattedBody = body.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return `${formattedBody}-${dv}`;
};

export default function NuevoJugadorPage() {
    const router = useRouter();
    const [clubes, setClubes] = useState<Club[]>([]);
    const [isLoadingClubs, setIsLoadingClubs] = useState(true);

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
            inscripcion: format(new Date(), 'yyyy-MM-dd'),
        },
    });

    const tipoIdentificacion = form.watch('tipo_identificacion');

    // 2. Cargar Clubes
    useEffect(() => {
        async function loadClubes() {
            try {
                const data = await api.getClubes();
                setClubes(data);
            } catch (error) {
                toast.error('Error al cargar la lista de clubes');
            } finally {
                setIsLoadingClubs(false);
            }
        }
        loadClubes();
    }, []);

    // 3. Submit
    async function onSubmit(data: z.infer<typeof jugadorSchema>) {
        try {
            const payload: any = {
                ...data,
                rut: data.rut || '',
                materno: data.materno || '',
                passport: data.passport || '',
                rol: data.rol,
                club_id: data.club_id,
                nacionalidad: data.nacionalidad, // <--- SE ENVÍA AQUÍ
                tipo_identificacion_input: data.tipo_identificacion,
                passport_input: data.passport
            };

            await api.createJugador(payload);

            toast.success('Jugador inscrito correctamente');
            router.push('/jugadores');
        } catch (error) {
            console.error(error);
            toast.error('Error al crear el jugador. Revise los datos.');
        }
    }

    return (
        <div className="max-w-3xl mx-auto py-8 px-4">
            <div className="mb-6 flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => router.back()} type="button">
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Inscribir Nuevo Jugador</h1>
                    <p className="text-muted-foreground">Complete los datos para registrar un jugador.</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Datos Personales y Deportivos</CardTitle>
                    <CardDescription>Campos obligatorios marcados.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                            {/* SECCIÓN 1: Identificación */}
                            <div className="space-y-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border">
                                <h3 className="text-sm font-medium uppercase text-slate-500">Identificación</h3>

                                <FormField
                                    control={form.control}
                                    name="tipo_identificacion"
                                    render={({ field }) => (
                                        <FormItem className="space-y-3">
                                            <FormLabel>Tipo de Documento</FormLabel>
                                            <FormControl>
                                                <RadioGroup
                                                    onValueChange={field.onChange}
                                                    defaultValue={field.value}
                                                    className="flex flex-col sm:flex-row gap-4"
                                                >
                                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                                        <FormControl>
                                                            <RadioGroupItem value="RUT" />
                                                        </FormControl>
                                                        <FormLabel className="font-normal">RUT (Chile)</FormLabel>
                                                    </FormItem>
                                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                                        <FormControl>
                                                            <RadioGroupItem value="PASSPORT" />
                                                        </FormControl>
                                                        <FormLabel className="font-normal">Pasaporte</FormLabel>
                                                    </FormItem>
                                                </RadioGroup>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {tipoIdentificacion === 'RUT' && (
                                        <FormField
                                            control={form.control}
                                            name="rut"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>RUT</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="12.345.678-9"
                                                            {...field}
                                                            value={field.value as string || ''}
                                                            onChange={(e) => {
                                                                const formatted = formatRut(e.target.value);
                                                                if (formatted.length <= 12) {
                                                                    field.onChange(formatted);
                                                                }
                                                            }}
                                                        />
                                                    </FormControl>
                                                    <FormDescription>Con o sin puntos.</FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    )}

                                    {tipoIdentificacion === 'PASSPORT' && (
                                        <FormField
                                            control={form.control}
                                            name="passport"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>N° Pasaporte</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="A12345678"
                                                            {...field}
                                                            value={field.value as string || ''}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    )}

                                    <FormField
                                        control={form.control}
                                        name="rol"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>N° ROL</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Ej: 6785"
                                                        {...field}
                                                        value={field.value as string || ''}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            {/* SECCIÓN 2: Datos Personales */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="nombres"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nombres</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Juan Andrés"
                                                    {...field}
                                                    value={field.value as string || ''}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="paterno"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Apellido Paterno</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Pérez"
                                                    {...field}
                                                    value={field.value as string || ''}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="materno"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Apellido Materno</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="González"
                                                    {...field}
                                                    value={field.value as string || ''}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="nacimiento"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Fecha de Nacimiento</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="date"
                                                    {...field}
                                                    value={field.value as string || ''}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* NUEVO CAMPO: NACIONALIDAD */}
                                <FormField
                                    control={form.control}
                                    name="nacionalidad"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nacionalidad</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Ej: Chilena"
                                                    {...field}
                                                    value={field.value as string || ''}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* SECCIÓN 3: Club y Datos Técnicos */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="club_id"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Club</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value as string}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder={isLoadingClubs ? "Cargando..." : "Seleccione un club"} />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {clubes.map((club) => (
                                                        <SelectItem key={club.id} value={club.id.toString()}>
                                                            {club.nombre}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="numero"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Número de Camiseta</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    {...field}
                                                    value={(field.value as number) || ''}
                                                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="inscripcion"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Fecha de Inscripción</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="date"
                                                    {...field}
                                                    value={field.value as string || ''}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="flex justify-end gap-4 pt-4">
                                <Button type="button" variant="ghost" onClick={() => router.back()}>
                                    Cancelar
                                </Button>
                                <Button type="submit" disabled={form.formState.isSubmitting}>
                                    {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    <Save className="mr-2 h-4 w-4" />
                                    Guardar Jugador
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}