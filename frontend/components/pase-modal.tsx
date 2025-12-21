'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { Loader2, ArrowRightLeft, Building2, Calendar as CalendarIcon } from 'lucide-react';
import { toast } from 'sonner';

// Componentes UI
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

import { api } from '@/lib/api';
import type { Jugador, Club } from '@/types';

const paseSchema = z.object({
    club_destino_id: z.string().min(1, "Debe seleccionar un club de destino"),
    fecha: z.string().min(1, "La fecha es obligatoria"),
    comentario: z.string().optional(),
    delegado: z.string().min(2, "Debes indicar el delegado responsable"),
});

interface PaseModalProps {
    isOpen: boolean;
    onClose: () => void;
    jugador: Jugador | null;
    clubes: Club[];
    onSuccess: () => void;
}

export function PaseModal({ isOpen, onClose, jugador, clubes, onSuccess }: PaseModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<z.infer<typeof paseSchema>>({
        resolver: zodResolver(paseSchema),
        defaultValues: {
            club_destino_id: '',
            fecha: format(new Date(), 'yyyy-MM-dd'),
            comentario: '',
            delegado: '',
        },
    });

    if (!jugador) return null;

    const clubActualId = (jugador as any).clubId || jugador.club_id;
    const clubesDestino = clubes.filter(c => c.id.toString() !== clubActualId?.toString());
    const clubActualNombre = jugador.Club?.nombre || 'Sin Club';

    const onSubmit = async (data: z.infer<typeof paseSchema>) => {
        setIsSubmitting(true);
        try {
            await api.realizarPase({
                jugadorId: jugador.id,
                clubDestinoId: data.club_destino_id,
                fecha: data.fecha,
                comentario: data.comentario || '',
                delegado: data.delegado
            });

            toast.success(`Pase realizado correctamente. ${jugador.nombres} ha sido transferido.`);
            form.reset();
            onSuccess();
            onClose();
        } catch (error) {
            console.error(error);
            toast.error('Error al realizar el pase. Inténtelo de nuevo.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            {/* CAMBIOS RESPONSIVE AQUI:
               1. w-[95vw]: Ocupa 95% del ancho en móviles.
               2. max-h-[90vh] y overflow-y-auto: Permite scroll si el contenido es muy alto o el teclado tapa.
               3. p-4 sm:p-6: Menos padding interno en móvil para ganar espacio.
            */}
            <DialogContent className="w-[95vw] max-w-[500px] max-h-[90vh] overflow-y-auto p-4 sm:p-6 rounded-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-start sm:items-center gap-2 text-lg sm:text-xl">
                        <ArrowRightLeft className="h-5 w-5 text-blue-600 mt-1 sm:mt-0 flex-shrink-0" />
                        <span>Realizar Pase</span>
                    </DialogTitle>
                    <DialogDescription className="text-sm">
                        Gestionando pase de <strong className="text-slate-900 dark:text-slate-100">{jugador.nombres} {jugador.paterno}</strong>.
                        <span className="block mt-1">Su ROL ({jugador.folio}) se mantendrá intacto.</span>
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">

                        {/* Club Actual */}
                        <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800">
                            <Label className="text-xs text-slate-500 uppercase font-bold">Club de Origen</Label>
                            <div className="flex items-center gap-2 mt-1 text-slate-700 dark:text-slate-300 font-medium text-sm sm:text-base">
                                <Building2 className="h-4 w-4 text-slate-400" />
                                <span className="truncate">{clubActualNombre}</span>
                            </div>
                        </div>

                        {/* Club Destino */}
                        <FormField
                            control={form.control}
                            name="club_destino_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Club de Destino</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Seleccione equipo" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {clubesDestino.map((club) => (
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

                        {/* Delegado */}
                        <FormField
                            control={form.control}
                            name="delegado"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Delegado Responsable</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Nombre del delegado" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Fecha */}
                        <FormField
                            control={form.control}
                            name="fecha"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Fecha del Pase</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <CalendarIcon className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                            <Input type="date" className="pl-9 w-full block" {...field} />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Comentario */}
                        <FormField
                            control={form.control}
                            name="comentario"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Comentario (Opcional)</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Motivo del pase..."
                                            className="resize-none min-h-[80px]"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Footer: gap-2 para separar botones en móvil */}
                        <DialogFooter className="pt-4 gap-2 sm:gap-0">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                                disabled={isSubmitting}
                                className="w-full sm:w-auto"
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
                            >
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Confirmar Pase
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}