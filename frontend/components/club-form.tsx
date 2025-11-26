"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Club, CreateClubDTO } from "@/types"; // Importamos los tipos necesarios
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Save, X, Building2, CheckCircle2 } from "lucide-react";
import Link from "next/link";

// ----------------------------------------------------------------------
// 1. ESQUEMA DE VALIDACIÓN (Local)
// ----------------------------------------------------------------------

const ClubFormSchema = z.object({
    nombre: z
        .string()
        .min(1, { message: "El nombre del club es obligatorio." })
        .max(100, { message: "El nombre no debe exceder los 100 caracteres." }),
});

type ClubFormValues = z.infer<typeof ClubFormSchema>;

// ----------------------------------------------------------------------
// 2. COMPONENTE CLUB FORM
// ----------------------------------------------------------------------

interface ClubFormProps {
    club?: Club; // Opcional: si se pasa, es modo edición
}

export function ClubForm({ club }: ClubFormProps) {
    const router = useRouter();
    const isEditing = !!club;

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<ClubFormValues>({
        resolver: zodResolver(ClubFormSchema),
        // Pre-carga los valores si estamos en modo edición
        defaultValues: {
            nombre: club?.nombre || "",
        },
    });

    const onSubmit = async (data: ClubFormValues) => {
        const clubData: CreateClubDTO = {
            nombre: data.nombre, // Guardamos el nombre 
        };

        try {
            if (isEditing) {
                // Modo Edición
                if (!club?.id) {
                    toast.error("ID del club no disponible para la edición.");
                    return;
                }
                await api.updateClub(club.id.toString(), clubData);
                toast.success("Club actualizado exitosamente.");
            } else {
                // Modo Creación
                await api.createClub(clubData);
                toast.success("Club creado exitosamente.");
            }

            // Redirigir a la lista de clubes
            router.push("/clubes");
        } catch (error) {
            console.error("Error al guardar el club:", error);
            const errorMessage = isEditing
                ? "Error al actualizar el club. Intente nuevamente."
                : "Error al crear el club. Verifique el nombre e intente de nuevo.";
            toast.error(errorMessage);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Header & Info Column (Estilo similar a Jugadores) */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="lg:sticky lg:top-8">
                        <div className="mb-6">
                            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl mb-3">
                                {isEditing ? "Editar Club" : "Registrar Nuevo Club"}
                            </h1>
                            <p className="text-slate-600 dark:text-slate-400">
                                {isEditing
                                    ? `Actualice el nombre del club ID: ${club?.id}`
                                    : "Ingrese el nombre oficial del nuevo club."}
                            </p>
                        </div>

                        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-900/50 shadow-none">
                            <CardContent className="p-4 flex items-start gap-4">
                                <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-full shrink-0">
                                    <CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="font-semibold text-blue-900 dark:text-blue-100 text-sm">Validación</h4>
                                    <p className="text-sm text-blue-700 dark:text-blue-300">
                                        El nombre es el único campo requerido. Asegúrese de que sea único en el sistema.
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
                                    <Building2 className="h-5 w-5 text-slate-500" />
                                    Datos del Club
                                </CardTitle>
                                <CardDescription>
                                    Información básica de registro
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="p-6 sm:p-8 space-y-6">
                                {/* Campo Nombre del Club */}
                                <div className="space-y-2">
                                    <Label htmlFor="nombre">Nombre del Club</Label>
                                    <Input
                                        id="nombre"
                                        placeholder="Ej: Deportes Temuco"
                                        {...register("nombre")}
                                        onChange={(e) => {
                                            e.target.value = e.target.value;
                                            register("nombre").onChange(e);
                                        }}
                                    />
                                    {errors.nombre && (
                                        <p className="text-xs text-red-500">{errors.nombre.message}</p>
                                    )}
                                </div>
                            </CardContent>

                            <CardFooter className="flex flex-col sm:flex-row gap-4 px-6 sm:px-8 py-6 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800">
                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={`w-full sm:w-auto text-white ${isEditing ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Guardando...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="mr-2 h-4 w-4" />
                                            {isEditing ? "Guardar Cambios" : "Registrar Club"}
                                        </>
                                    )}
                                </Button>

                                <Link href="/clubes" className="w-full sm:w-auto">
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
    );
}