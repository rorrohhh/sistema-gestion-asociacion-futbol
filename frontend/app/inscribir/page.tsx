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
import { Loader2 } from 'lucide-react';

export default function InscribirPage() {
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
            // Transformar a mayúsculas los campos de texto
            const dataToSend = {
                ...data,
                numero: data.numero.toUpperCase(),
                paterno: data.paterno.toUpperCase(),
                materno: data.materno.toUpperCase(),
                nombres: data.nombres.toUpperCase(),
                rol_input: data.rol_input.toUpperCase(),
            };

            await api.createJugador(dataToSend);
            toast.success('Jugador inscrito exitosamente');
            router.push('/');
        } catch (error) {
            console.error('Error al inscribir jugador:', error);
            toast.error('Error al inscribir jugador. Por favor intente nuevamente.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-red-50 dark:from-slate-900 dark:to-slate-800 py-8">
            <div className="container mx-auto px-4 max-w-2xl">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-red-600 bg-clip-text text-transparent">
                        Inscribir Jugador
                    </h1>
                    <p className="text-muted-foreground">
                        Complete el formulario para registrar un nuevo jugador
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Ficha de Inscripción</CardTitle>
                        <CardDescription>
                            Todos los campos son obligatorios
                        </CardDescription>
                    </CardHeader>

                    <form onSubmit={handleSubmit(onSubmit)}>
                        <CardContent className="space-y-6">
                            {/* Número */}
                            <div className="space-y-2">
                                <Label htmlFor="numero">Número de Camiseta</Label>
                                <Input
                                    id="numero"
                                    type="text"
                                    placeholder="Ej: 10"
                                    {...register('numero')}
                                />
                                {errors.numero && (
                                    <p className="text-sm text-destructive">{errors.numero.message}</p>
                                )}
                            </div>

                            {/* Nombres */}
                            <div className="space-y-2">
                                <Label htmlFor="nombres">Nombres</Label>
                                <Input
                                    id="nombres"
                                    type="text"
                                    placeholder="Nombres"
                                    {...register('nombres')}
                                    onChange={(e) => {
                                        const upper = e.target.value.toUpperCase();
                                        setValue('nombres', upper);
                                    }}
                                />
                                {errors.nombres && (
                                    <p className="text-sm text-destructive">{errors.nombres.message}</p>
                                )}
                            </div>

                            {/* Apellidos */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="paterno">Apellido Paterno</Label>
                                    <Input
                                        id="paterno"
                                        type="text"
                                        placeholder="Apellido Paterno"
                                        {...register('paterno')}
                                        onChange={(e) => {
                                            const upper = e.target.value.toUpperCase();
                                            setValue('paterno', upper);
                                        }}
                                    />
                                    {errors.paterno && (
                                        <p className="text-sm text-destructive">{errors.paterno.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="materno">Apellido Materno</Label>
                                    <Input
                                        id="materno"
                                        type="text"
                                        placeholder="Apellido Materno"
                                        {...register('materno')}
                                        onChange={(e) => {
                                            const upper = e.target.value.toUpperCase();
                                            setValue('materno', upper);
                                        }}
                                    />
                                    {errors.materno && (
                                        <p className="text-sm text-destructive">{errors.materno.message}</p>
                                    )}
                                </div>
                            </div>

                            {/* RUT */}
                            <div className="space-y-2">
                                <Label htmlFor="run_input">RUT (con guión)</Label>
                                <Input
                                    id="run_input"
                                    type="text"
                                    placeholder="12345678-9"
                                    {...register('run_input')}
                                />
                                {errors.run_input && (
                                    <p className="text-sm text-destructive">{errors.run_input.message}</p>
                                )}
                            </div>

                            {/* ROL */}
                            <div className="space-y-2">
                                <Label htmlFor="rol_input">ROL</Label>
                                <Input
                                    id="rol_input"
                                    type="text"
                                    placeholder="ROL del jugador"
                                    {...register('rol_input')}
                                    onChange={(e) => {
                                        const upper = e.target.value.toUpperCase();
                                        setValue('rol_input', upper);
                                    }}
                                />
                                {errors.rol_input && (
                                    <p className="text-sm text-destructive">{errors.rol_input.message}</p>
                                )}
                            </div>

                            {/* Fechas */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="nacimiento">Fecha de Nacimiento</Label>
                                    <Input
                                        id="nacimiento"
                                        type="date"
                                        {...register('nacimiento')}
                                    />
                                    {errors.nacimiento && (
                                        <p className="text-sm text-destructive">{errors.nacimiento.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="inscripcion">Fecha de Inscripción</Label>
                                    <Input
                                        id="inscripcion"
                                        type="date"
                                        {...register('inscripcion')}
                                    />
                                    {errors.inscripcion && (
                                        <p className="text-sm text-destructive">{errors.inscripcion.message}</p>
                                    )}
                                </div>
                            </div>

                            {/* Club */}
                            <div className="space-y-2">
                                <Label htmlFor="club_id">Club</Label>
                                <Select onValueChange={(value) => setValue('club_id', parseInt(value))}>
                                    <SelectTrigger id="club_id">
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
                                {errors.club_id && (
                                    <p className="text-sm text-destructive">{errors.club_id.message}</p>
                                )}
                            </div>
                        </CardContent>

                        <CardFooter className="flex gap-4">
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="bg-gradient-to-r from-blue-600 to-red-600 hover:from-blue-700 hover:to-red-700"
                            >
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isSubmitting ? 'Guardando...' : 'Guardar Ficha'}
                            </Button>

                            <Link href="/">
                                <Button type="button" variant="outline" disabled={isSubmitting}>
                                    Cancelar
                                </Button>
                            </Link>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </div>
    );
}
