'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import {
    Loader2,
    User,
    Save,
    ArrowLeft,
    Camera,
    Upload,
    CheckCircle2,
    XCircle
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription
} from '@/components/ui/form';

import { jugadorSchema } from '@/lib/validations';
import { api } from '@/lib/api';
import type { Club } from '@/types';
import * as z from 'zod';

const formatRut = (rut: string) => {
    const clean = rut.replace(/[^0-9kK]/g, '');
    if (clean.length <= 1) return clean;
    const body = clean.slice(0, -1);
    const dv = clean.slice(-1).toUpperCase();
    return `${body.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}-${dv}`;
};

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
    const [folio, setFolio] = useState<string>('');

    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const form = useForm({
        resolver: zodResolver(jugadorSchema),
        defaultValues: {
            tipo_identificacion: 'RUT' as const,
            nombres: '',
            paterno: '',
            materno: '',
            rut: '',
            passport: '',
            nacionalidad: '',
            delegado: '',
            club_id: '',
            nacimiento: '',
            inscripcion: '',
            activo: true,
            foto: undefined,
        },
    });

    const { handleSubmit, setValue, watch, formState: { isSubmitting } } = form;
    const tipoIdentificacion = watch('tipo_identificacion');

    useEffect(() => {
        async function loadData() {
            if (!jugadorId) {
                toast.error('ID de jugador no encontrado.');
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
                setFolio(data.folio);

                if (data.fotoUrl) {
                    setPreviewUrl(data.fotoUrl);
                }

                form.reset({
                    nombres: data.nombres,
                    paterno: data.paterno,
                    materno: data.materno || '',
                    club_id: data.clubId ? data.clubId.toString() : (data.club_id ? data.club_id.toString() : ''),
                    nacionalidad: data.nacionalidad || '',
                    delegado: data.delegadoInscripcion || '',
                    activo: data.activo,
                    nacimiento: data.nacimiento ? String(data.nacimiento).split('T')[0] : '',
                    inscripcion: data.inscripcion ? String(data.inscripcion).split('T')[0] : '',
                    tipo_identificacion: (data.tipoIdentificacion === 'PASSPORT' ? 'PASSPORT' : 'RUT'),
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

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
            form.setValue('foto', file);
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    const onSubmit = async (data: z.infer<typeof jugadorSchema>) => {
        if (!jugadorId) return;

        try {
            const payload: any = {
                ...data,
                rut: data.rut || '',
                club_id: data.club_id,
                nacionalidad: data.nacionalidad,
                delegado: data.delegado,
                tipo_identificacion_input: data.tipo_identificacion,
                passport_input: data.passport,
                activo: data.activo,
                foto: data.foto
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
                <p className="ml-3 text-slate-600 dark:text-slate-400">Cargando ficha del jugador...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 py-4 md:py-8 px-3 md:px-4">
            <div className="max-w-5xl mx-auto space-y-6">

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3 md:gap-4 w-full">
                        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full hover:bg-slate-200 shrink-0">
                            <ArrowLeft className="h-5 w-5 md:h-6 md:w-6 text-slate-600" />
                        </Button>
                        <div className="min-w-0">
                            <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white truncate">Editar Jugador</h1>
                            <p className="text-slate-500 text-xs md:text-sm flex items-center gap-2">
                                Editando folio: <span className="font-mono bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-800 dark:text-slate-200 font-medium">#{folio}</span>
                            </p>
                        </div>
                    </div>
                </div>

                <Form {...form}>
                    <form onSubmit={handleSubmit(onSubmit)}>

                        <Card className="border-slate-200 shadow-sm overflow-hidden bg-white dark:bg-slate-900">

                            <div className="h-2 w-full bg-blue-600"></div>

                            <CardContent className="p-4 md:p-8">
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">

                                    <div className="lg:col-span-4 space-y-6 md:space-y-8">

                                        <div className="flex flex-col items-center space-y-4">
                                            <div
                                                className="relative group h-40 w-40 md:h-48 md:w-48 rounded-full border-4 border-slate-100 shadow-inner overflow-hidden bg-slate-50 flex items-center justify-center cursor-pointer"
                                                onClick={triggerFileInput}
                                            >
                                                {previewUrl ? (
                                                    <img
                                                        src={previewUrl}
                                                        alt="Foto Jugador"
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <User className="h-16 w-16 md:h-20 md:w-20 text-slate-300" />
                                                )}

                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <Camera className="h-8 w-8 text-white" />
                                                </div>
                                            </div>

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
                                                className="flex gap-2 text-blue-700 border-blue-200 hover:bg-blue-50 w-full md:w-auto"
                                            >
                                                <Upload className="h-4 w-4" />
                                                Cambiar Fotografía
                                            </Button>
                                        </div>

                                        <Separator className="block md:hidden lg:block" />

                                        <FormField
                                            control={form.control}
                                            name="activo"
                                            render={({ field }) => (
                                                <FormItem className="space-y-3">
                                                    <Label className="text-base font-semibold text-slate-900">Estado Actual</Label>
                                                    <FormControl>
                                                        <RadioGroup
                                                            onValueChange={(val) => field.onChange(val === 'true')}
                                                            defaultValue={field.value ? 'true' : 'false'}
                                                            className="grid grid-cols-1 gap-3"
                                                        >
                                                            <Label
                                                                htmlFor="status-active"
                                                                className={`
                                                                    flex items-center justify-between p-3 md:p-4 rounded-lg border-2 cursor-pointer transition-all
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

                                                            <Label
                                                                htmlFor="status-inactive"
                                                                className={`
                                                                    flex items-center justify-between p-3 md:p-4 rounded-lg border-2 cursor-pointer transition-all
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

                                    <div className="lg:col-span-8 space-y-6 md:space-y-8">

                                        <div className="space-y-4">
                                            <h3 className="text-base md:text-lg font-semibold text-blue-900 border-b border-slate-100 pb-2">
                                                1. Identificación Personal
                                            </h3>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                                <FormField
                                                    control={form.control}
                                                    name="tipo_identificacion"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Tipo de Documento</FormLabel>
                                                            <Select onValueChange={field.onChange} value={field.value}>
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

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
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

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
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

                                        <div className="space-y-4 pt-4">
                                            <h3 className="text-base md:text-lg font-semibold text-blue-900 border-b border-slate-100 pb-2">
                                                2. Datos Institucionales
                                            </h3>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                                <FormField
                                                    control={form.control}
                                                    name="club_id"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Club de Pertenencia</FormLabel>
                                                            <Select onValueChange={field.onChange} value={field.value.toString()}>
                                                                <FormControl>
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder={isLoadingData ? "Cargando..." : "Seleccionar Club"} />
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
                                                            <Input placeholder="Nombre del dirigente" {...field} />
                                                        </FormControl>
                                                        <FormDescription>Puede actualizar el nombre del oficial que inscribe.</FormDescription>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        <div className="pt-6 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 sm:gap-4">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                onClick={() => router.back()}
                                                className="w-full sm:w-auto"
                                            >
                                                Cancelar Edición
                                            </Button>
                                            <Button
                                                type="submit"
                                                className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto min-w-[150px]"
                                                disabled={isSubmitting}
                                            >
                                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                <Save className="mr-2 h-4 w-4" />
                                                Guardar Cambios
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