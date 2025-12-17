'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { format } from 'date-fns';
import {
    Save,
    ArrowLeft,
    Loader2,
    Camera,
    Upload,
    CheckCircle2,
    XCircle,
    User
} from 'lucide-react';
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
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';

// Logic & Types
import { api } from '@/lib/api';
import { jugadorSchema } from '@/lib/validations';
import type { Club } from '@/types';

// Utilitario RUT
const formatRut = (rut: string) => {
    const clean = rut.replace(/[^0-9kK]/g, '');
    if (clean.length <= 1) return clean;
    const body = clean.slice(0, -1);
    const dv = clean.slice(-1).toUpperCase();
    return `${body.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}-${dv}`;
};

export default function NuevoJugadorPage() {
    const router = useRouter();
    const [clubes, setClubes] = useState<Club[]>([]);
    const [isLoadingClubs, setIsLoadingClubs] = useState(true);

    // Estado para la previsualización de la imagen
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

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
            nacionalidad: 'Chilena',
            delegado: '',
            club_id: '',
            nacimiento: '',
            inscripcion: format(new Date(), 'yyyy-MM-dd'),
            activo: true,
            foto: undefined,
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
                toast.error('Error cargando clubes');
            } finally {
                setIsLoadingClubs(false);
            }
        }
        loadClubes();
    }, []);

    // 3. Manejo de Imagen
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Crear URL temporal para previsualización
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
            // Asignar al formulario
            form.setValue('foto', file);
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    // 4. Submit
    async function onSubmit(data: z.infer<typeof jugadorSchema>) {
        try {
            const payload: any = {
                ...data,
                rut: data.rut || '',
                materno: data.materno || '',
                passport: data.passport || '',
                // Aseguramos que se envíen los campos correctos
                club_id: data.club_id,
                activo: data.activo,
            };

            await api.createJugador(payload);
            toast.success('Jugador inscrito correctamente');
            router.push('/jugadores');
        } catch (error) {
            console.error(error);
            toast.error('Error al crear el jugador');
        }
    }

    return (
        <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 py-8 px-4">
            <div className="max-w-5xl mx-auto space-y-6">

                {/* Header Simple */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full hover:bg-slate-200">
                            <ArrowLeft className="h-6 w-6 text-slate-600" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Nueva Ficha de Jugador</h1>
                            <p className="text-slate-500 text-sm">Formulario oficial de inscripción de la asociación.</p>
                        </div>
                    </div>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>

                        {/* TARJETA PRINCIPAL TIPO "FICHA" */}
                        <Card className="border-slate-200 shadow-sm overflow-hidden bg-white dark:bg-slate-900">

                            {/* BARRA SUPERIOR AZUL */}
                            <div className="h-2 w-full bg-blue-600"></div>

                            <CardContent className="p-8">
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                                    {/* COLUMNA IZQUIERDA: FOTO Y ESTADO (Ancho 4/12) */}
                                    <div className="lg:col-span-4 space-y-8">

                                        {/* SECCIÓN FOTO */}
                                        <div className="flex flex-col items-center space-y-4">
                                            <div
                                                className="relative group h-48 w-48 rounded-full border-4 border-slate-100 shadow-inner overflow-hidden bg-slate-50 flex items-center justify-center cursor-pointer"
                                                onClick={triggerFileInput}
                                            >
                                                {previewUrl ? (
                                                    <img
                                                        src={previewUrl}
                                                        alt="Previsualización"
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <User className="h-20 w-20 text-slate-300" />
                                                )}

                                                {/* Overlay al pasar el mouse */}
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <Camera className="h-8 w-8 text-white" />
                                                </div>
                                            </div>

                                            {/* Input oculto real */}
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                className="hidden"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                            />

                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={triggerFileInput}
                                                className="flex gap-2 text-blue-700 border-blue-200 hover:bg-blue-50"
                                            >
                                                <Upload className="h-4 w-4" />
                                                {previewUrl ? 'Cambiar Foto' : 'Subir Fotografía'}
                                            </Button>
                                            <p className="text-xs text-slate-400 text-center px-4">
                                                Se recomienda una imagen cuadrada, rostro descubierto. Max 5MB.
                                            </p>
                                        </div>

                                        <Separator />

                                        {/* SECCIÓN ESTADO (VERDE/ROJO) */}
                                        <FormField
                                            control={form.control}
                                            name="activo"
                                            render={({ field }) => (
                                                <FormItem className="space-y-3">
                                                    <Label className="text-base font-semibold text-slate-900">Estado Federativo</Label>
                                                    <FormControl>
                                                        <RadioGroup
                                                            onValueChange={(val) => field.onChange(val === 'true')}
                                                            defaultValue={field.value ? 'true' : 'false'}
                                                            className="grid grid-cols-1 gap-3"
                                                        >
                                                            {/* OPCIÓN: HABILITADO (VERDE) */}
                                                            <Label
                                                                htmlFor="status-active"
                                                                className={`
                                                                    flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-all
                                                                    ${field.value
                                                                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                                                        : 'border-slate-200 hover:border-green-200'}
                                                                `}
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    <div className={`p-2 rounded-full ${field.value ? 'bg-green-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                                                        <CheckCircle2 className="h-5 w-5" />
                                                                    </div>
                                                                    <div className="flex flex-col">
                                                                        <span className={`font-bold ${field.value ? 'text-green-800' : 'text-slate-700'}`}>Habilitado</span>
                                                                        <span className="text-xs text-slate-500">Puede jugar partidos</span>
                                                                    </div>
                                                                </div>
                                                                <RadioGroupItem value="true" id="status-active" className="sr-only" />
                                                            </Label>

                                                            {/* OPCIÓN: SUSPENDIDO (ROJO) */}
                                                            <Label
                                                                htmlFor="status-inactive"
                                                                className={`
                                                                    flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-all
                                                                    ${!field.value
                                                                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                                                        : 'border-slate-200 hover:border-red-200'}
                                                                `}
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    <div className={`p-2 rounded-full ${!field.value ? 'bg-red-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                                                        <XCircle className="h-5 w-5" />
                                                                    </div>
                                                                    <div className="flex flex-col">
                                                                        <span className={`font-bold ${!field.value ? 'text-red-800' : 'text-slate-700'}`}>Suspendido</span>
                                                                        <span className="text-xs text-slate-500">No puede ser alineado</span>
                                                                    </div>
                                                                </div>
                                                                <RadioGroupItem value="false" id="status-inactive" className="sr-only" />
                                                            </Label>
                                                        </RadioGroup>
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    {/* COLUMNA DERECHA: DATOS DEL JUGADOR (Ancho 8/12) */}
                                    <div className="lg:col-span-8 space-y-8">

                                        {/* 1. Identificación */}
                                        <div className="space-y-4">
                                            <h3 className="text-lg font-semibold text-blue-900 border-b border-slate-100 pb-2">
                                                1. Identificación Personal
                                            </h3>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <FormField
                                                    control={form.control}
                                                    name="tipo_identificacion"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Tipo de Documento</FormLabel>
                                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                                <FormControl>
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder="Seleccione tipo" />
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent>
                                                                    <SelectItem value="RUT">RUT (Cédula Chilena)</SelectItem>
                                                                    <SelectItem value="PASSPORT">Pasaporte Extranjero</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                {tipoIdentificacion === 'RUT' ? (
                                                    <FormField
                                                        control={form.control}
                                                        name="rut"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Número de RUT</FormLabel>
                                                                <FormControl>
                                                                    <Input
                                                                        placeholder="12.345.678-9"
                                                                        {...field}
                                                                        onChange={(e) => {
                                                                            const val = formatRut(e.target.value);
                                                                            if (val.length <= 12) field.onChange(val);
                                                                        }}
                                                                    />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                ) : (
                                                    <FormField
                                                        control={form.control}
                                                        name="passport"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Número de Pasaporte</FormLabel>
                                                                <FormControl>
                                                                    <Input placeholder="A00000000" {...field} />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                )}
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                <FormField
                                                    control={form.control}
                                                    name="nombres"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Nombres</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="Juan Andrés" {...field} />
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
                                                                <Input placeholder="Pérez" {...field} />
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
                                                                <Input placeholder="González" {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <FormField
                                                    control={form.control}
                                                    name="nacimiento"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Fecha de Nacimiento</FormLabel>
                                                            <FormControl>
                                                                <Input type="date" {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="nacionalidad"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Nacionalidad</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="Chilena" {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        </div>

                                        {/* 2. Datos Deportivos */}
                                        <div className="space-y-4 pt-4">
                                            <h3 className="text-lg font-semibold text-blue-900 border-b border-slate-100 pb-2">
                                                2. Datos Institucionales
                                            </h3>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <FormField
                                                    control={form.control}
                                                    name="club_id"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Club</FormLabel>
                                                            <Select onValueChange={field.onChange} defaultValue={field.value.toString()}>
                                                                <FormControl>
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder={isLoadingClubs ? "Cargando..." : "Seleccionar Club"} />
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent>
                                                                    {clubes.map(club => (
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
                                                    name="inscripcion"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Fecha de Inscripción</FormLabel>
                                                            <FormControl>
                                                                <Input type="date" {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            <FormField
                                                control={form.control}
                                                name="delegado"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Delegado Responsable</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Juan Lopez" {...field} />
                                                        </FormControl>
                                                        <FormDescription>Nombre de la persona que valida la inscripción.</FormDescription>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        {/* Botones de Acción */}
                                        <div className="pt-6 flex items-center justify-end gap-4">
                                            <Button type="button" variant="ghost" onClick={() => router.back()}>
                                                Cancelar
                                            </Button>
                                            <Button
                                                type="submit"
                                                className="bg-blue-600 hover:bg-blue-700 min-w-[140px]"
                                                disabled={form.formState.isSubmitting}
                                            >
                                                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                <Save className="mr-2 h-4 w-4" />
                                                Guardar Ficha
                                            </Button>
                                        </div>

                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </form>
                </Form>
            </div>
        </div>
    );
}