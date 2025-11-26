"use client";

import { useEffect, useState } from "react";
import { Edit, Trash2, Building2 } from "lucide-react";
import { api } from "@/lib/api";
import { Club } from "@/types";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ClubesTable() {
    const [clubes, setClubes] = useState<Club[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const fetchClubes = async () => {
        setLoading(true);
        try {
            const data = await api.getClubes();
            setClubes(data);
        } catch (error) {
            console.error("Error al obtener la lista de clubes:", error);
            toast.error("Error al cargar los clubes.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClubes();
    }, []);

    const handleDelete = async (id: number, nombre: string) => {
        if (!window.confirm(`¿Estás seguro de que quieres eliminar el club "${nombre}"? Esta acción es irreversible.`)) {
            return;
        }

        try {
            await api.deleteClub(id.toString());
            toast.success(`Club "${nombre}" eliminado exitosamente.`);
            fetchClubes(); // Actualizar lista
        } catch (error) {
            console.error("Error al eliminar el club:", error);
            toast.error("Error al eliminar el club. Puede que tenga jugadores asociados.");
        }
    };

    const handleEdit = (id: number) => {
        // Redirigir a la nueva ruta de edición anidada
        router.push(`/clubes/editar/${id}`);
    };

    return (
        <Card className="shadow-sm border-0 bg-white dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-slate-800">
            {/* Título y conteo de resultados */}
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-slate-100 dark:border-slate-800">
                <CardTitle className="text-xl font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-slate-500" />
                    Listado de Clubes
                </CardTitle>
                <span className="text-sm px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full font-medium">
                    {loading ? 'Cargando...' : `${clubes.length} resultados`}
                </span>
            </CardHeader>

            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="w-[100px]">ID</TableHead>
                            <TableHead>Nombre</TableHead>
                            <TableHead className="text-right w-[100px]">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            Array.from({ length: 3 }).map((_, i) => (
                                <TableRow key={i} className="hover:bg-transparent">
                                    <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                                    <TableCell className="text-right"><Skeleton className="h-8 w-16 float-right" /></TableCell>
                                </TableRow>
                            ))
                        ) : clubes.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={3} className="text-center text-slate-500 py-6">
                                    No hay clubes registrados.
                                </TableCell>
                            </TableRow>
                        ) : (
                            clubes.map((club) => (
                                <TableRow key={club.id}>
                                    <TableCell className="font-medium">{club.id}</TableCell>
                                    <TableCell>{club.nombre}</TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleEdit(club.id)}
                                            className="mr-1"
                                        >
                                            <Edit className="h-4 w-4 text-blue-500" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDelete(club.id, club.nombre)}
                                            className="text-red-500 hover:text-red-600"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}