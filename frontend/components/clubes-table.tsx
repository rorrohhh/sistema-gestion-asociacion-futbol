"use client";

import { useEffect, useState } from "react";
import {
    Edit,
    Trash2,
    Building2,
    FileText,
    Loader2,
    MoreHorizontal
} from "lucide-react";
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const formatRut = (rut: number | null, dv: string | null) => {
    if (!rut) return '-';
    return `${rut.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}-${dv}`;
};

export function ClubesTable() {
    const [clubes, setClubes] = useState<Club[]>([]);
    const [loading, setLoading] = useState(true);
    const [generatingPdf, setGeneratingPdf] = useState<number | null>(null);

    // Estado para controlar el diálogo de eliminación
    const [clubToDelete, setClubToDelete] = useState<{ id: number; nombre: string } | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

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

    // Abre el diálogo de confirmación
    const confirmDelete = (id: number, nombre: string) => {
        setClubToDelete({ id, nombre });
    };

    // Ejecuta la eliminación real
    const handleDelete = async () => {
        if (!clubToDelete) return;

        setIsDeleting(true);
        try {
            await api.deleteClub(clubToDelete.id.toString());
            toast.success(`Club "${clubToDelete.nombre}" eliminado exitosamente.`);
            fetchClubes();
        } catch (error) {
            console.error("Error al eliminar el club:", error);
            toast.error("Error al eliminar el club. Puede que tenga jugadores asociados.");
        } finally {
            setIsDeleting(false);
            setClubToDelete(null); // Cierra el diálogo
        }
    };

    const handleEdit = (id: number) => {
        router.push(`/clubes/editar/${id}`);
    };

    const handleGeneratePDF = async (clubId: number, clubNombre: string) => {
        setGeneratingPdf(clubId);
        toast.info(`Generando nómina para ${clubNombre}...`);

        try {
            const respuesta = await api.getJugadores({ club: clubId.toString() });

            if (respuesta.jugadores.length === 0) {
                toast.warning(`El club ${clubNombre} no tiene jugadores inscritos.`);
                setGeneratingPdf(null);
                return;
            }

            const doc = new jsPDF();

            doc.setFontSize(18);
            doc.text(`Nómina de Jugadores - ${clubNombre}`, 14, 20);

            doc.setFontSize(10);
            doc.text(`Fecha de emisión: ${new Date().toLocaleDateString('es-CL')}`, 14, 28);
            doc.text(`Total jugadores: ${respuesta.jugadores.length}`, 14, 34);

            const tableData = respuesta.jugadores.map((j) => [
                j.folio,
                `${j.nombres} ${j.paterno} ${j.materno || ''}`,
                j.tipoIdentificacion === 'PASSPORT' ? j.pasaporte : formatRut(j.rut, j.dv),
                j.nacionalidad || '-',
                new Date(j.nacimiento).toLocaleDateString('es-CL')
            ]);

            autoTable(doc, {
                startY: 40,
                head: [['ROL', 'Nombre Completo', 'Identificación', 'Nacionalidad', 'F. Nac', 'N°']],
                body: tableData,
                styles: { fontSize: 9 },
                headStyles: { fillColor: [41, 128, 185] },
            });

            doc.save(`nomina_${clubNombre.replace(/\s+/g, '_')}.pdf`);
            toast.success("PDF descargado correctamente.");

        } catch (error) {
            console.error("Error generando PDF:", error);
            toast.error("Hubo un error al generar el documento.");
        } finally {
            setGeneratingPdf(null);
        }
    };

    return (
        <>
            <Card className="shadow-sm border-0 bg-white dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-slate-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-slate-100 dark:border-slate-800">
                    <CardTitle className="text-xl font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-slate-500" />
                        Clubes
                    </CardTitle>
                    <span className="text-sm px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full font-medium">
                        {loading ? 'Cargando...' : `${clubes.length} resultados`}
                    </span>
                </CardHeader>

                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="md:table-cell text-xs uppercase tracking-wider font-semibold text-slate-500">Nombre</TableHead>
                                <TableHead className="text-right md:table-cell text-xs uppercase tracking-wider font-semibold text-slate-500">Acciones</TableHead>
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
                                        <TableCell className="font-medium text-slate-700 dark:text-slate-200">
                                            {club.nombre}
                                        </TableCell>

                                        <TableCell className="text-right">

                                            {/* VISTA ESCRITORIO */}
                                            <div className="hidden md:flex items-center justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleGeneratePDF(club.id, club.nombre)}
                                                    disabled={generatingPdf === club.id}
                                                    title="Descargar Nómina de Jugadores"
                                                    className="text-slate-600 hover:text-blue-600 hover:bg-blue-50"
                                                >
                                                    {generatingPdf === club.id ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <FileText className="h-4 w-4" />
                                                    )}
                                                </Button>

                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleEdit(club.id)}
                                                    className="text-slate-600 hover:text-blue-600 hover:bg-blue-50"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>

                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => confirmDelete(club.id, club.nombre)}
                                                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>

                                            {/* VISTA MÓVIL */}
                                            <div className="md:hidden flex justify-end">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-blue-600">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-48">
                                                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                                        <DropdownMenuItem
                                                            onClick={() => handleGeneratePDF(club.id, club.nombre)}
                                                            disabled={generatingPdf === club.id}
                                                            className="cursor-pointer"
                                                        >
                                                            {generatingPdf === club.id ? (
                                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                            ) : (
                                                                <FileText className="mr-2 h-4 w-4 text-blue-500" />
                                                            )}
                                                            Generar Nómina
                                                        </DropdownMenuItem>

                                                        <DropdownMenuItem onClick={() => handleEdit(club.id)} className="cursor-pointer">
                                                            <Edit className="mr-2 h-4 w-4 text-slate-500" />
                                                            Editar Club
                                                        </DropdownMenuItem>

                                                        <DropdownMenuSeparator />

                                                        <DropdownMenuItem
                                                            onClick={() => confirmDelete(club.id, club.nombre)}
                                                            className="cursor-pointer text-red-600 focus:text-red-600"
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Eliminar
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>

                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* DIÁLOGO DE CONFIRMACIÓN */}
            <AlertDialog open={!!clubToDelete} onOpenChange={(open) => !open && setClubToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. Esto eliminará permanentemente el club
                            <span className="font-bold text-slate-900 dark:text-white mx-1">
                                {clubToDelete?.nombre}
                            </span>
                            y removerá sus datos de nuestros servidores.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                handleDelete();
                            }}
                            className="bg-red-600 hover:bg-red-700 text-white focus:ring-red-600"
                            disabled={isDeleting}
                        >
                            {isDeleting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Eliminando...
                                </>
                            ) : (
                                "Sí, eliminar club"
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}