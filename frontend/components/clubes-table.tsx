"use client";

import { useEffect, useState } from "react";
import { Edit, Trash2, Building2, FileText, Loader2 } from "lucide-react"; // Agregamos iconos
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

// Librerías para PDF
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Función auxiliar para formatear RUT en el PDF
const formatRut = (rut: number | null, dv: string | null) => {
    if (!rut) return '-';
    return `${rut.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}-${dv}`;
};

export function ClubesTable() {
    const [clubes, setClubes] = useState<Club[]>([]);
    const [loading, setLoading] = useState(true);
    const [generatingPdf, setGeneratingPdf] = useState<number | null>(null); // Para mostrar loading en el botón específico
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
            fetchClubes();
        } catch (error) {
            console.error("Error al eliminar el club:", error);
            toast.error("Error al eliminar el club. Puede que tenga jugadores asociados.");
        }
    };

    const handleEdit = (id: number) => {
        router.push(`/clubes/editar/${id}`);
    };

    // --- LÓGICA GENERACIÓN PDF ---
    const handleGeneratePDF = async (clubId: number, clubNombre: string) => {
        setGeneratingPdf(clubId);
        toast.info(`Generando nómina para ${clubNombre}...`);

        try {
            // 1. Obtener jugadores filtrados por este club
            const jugadores = await api.getJugadores({ club: clubId.toString() });

            if (jugadores.length === 0) {
                toast.warning(`El club ${clubNombre} no tiene jugadores inscritos.`);
                setGeneratingPdf(null);
                return;
            }

            // 2. Crear documento PDF
            const doc = new jsPDF();

            // Encabezado del PDF
            doc.setFontSize(18);
            doc.text(`Nómina de Jugadores - ${clubNombre}`, 14, 20);

            doc.setFontSize(10);
            doc.text(`Fecha de emisión: ${new Date().toLocaleDateString('es-CL')}`, 14, 28);
            doc.text(`Total jugadores: ${jugadores.length}`, 14, 34);

            // 3. Preparar datos para la tabla
            const tableData = jugadores.map((j) => [
                j.rol,                                  // ROL
                `${j.nombres} ${j.paterno} ${j.materno || ''}`, // Nombre Completo
                j.tipoIdentificacion === 'PASSPORT' ? j.pasaporte : formatRut(j.rut, j.dv), // Identificación
                j.nacionalidad || '-',                  // Nacionalidad
                new Date(j.nacimiento).toLocaleDateString('es-CL'), // F. Nacimiento
                j.numero || '-'                         // Camiseta
            ]);

            // 4. Generar tabla con autoTable
            autoTable(doc, {
                startY: 40,
                head: [['ROL', 'Nombre Completo', 'Identificación', 'Nacionalidad', 'F. Nac', 'N°']],
                body: tableData,
                styles: { fontSize: 9 },
                headStyles: { fillColor: [41, 128, 185] }, // Color azulito corporativo
            });

            // 5. Descargar
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
        <Card className="shadow-sm border-0 bg-white dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-slate-800">
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
                            <TableHead className="text-right w-[180px]">Acciones</TableHead>
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
                                        <div className="flex items-center justify-end gap-1">
                                            {/* Botón PDF */}
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
                                                onClick={() => handleDelete(club.id, club.nombre)}
                                                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
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