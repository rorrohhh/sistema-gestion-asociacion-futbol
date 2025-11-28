"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Partido, PosicionTabla } from "@/types";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// UI Components
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
    Trophy, CalendarDays, PlusCircle, Save, ChevronLeft, ChevronRight, Filter,
    Trash2, AlertTriangle, FileDown, CalendarClock, Printer
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

// Definición de grupo visual
interface EnfrentamientoGroup {
    id: string;
    local: { id: number; nombre: string; logo?: string };
    visita: { id: number; nombre: string; logo?: string };
    partidos: Partido[];
}

export default function TorneoDashboard() {
    const [activeTab, setActiveTab] = useState("fixture");
    const [serieTabla, setSerieTabla] = useState<string>("1era");

    const [allPartidos, setAllPartidos] = useState<Partido[]>([]);
    const [tabla, setTabla] = useState<PosicionTabla[]>([]);
    const [loading, setLoading] = useState(true);
    const [fechaActual, setFechaActual] = useState<number>(1);

    // Estados para Modales
    const [isReprogramarOpen, setIsReprogramarOpen] = useState(false);
    const [nuevaFechaReprogramacion, setNuevaFechaReprogramacion] = useState("");

    // --- NUEVO: Estados para Exportar PDF ---
    const [isPdfOpen, setIsPdfOpen] = useState(false);
    const [pdfAlcance, setPdfAlcance] = useState("fecha_actual"); // 'todo' | 'fecha_actual'
    const [pdfSerie, setPdfSerie] = useState("todas"); // 'todas' | '1era' | '2da' | '3era'

    // --- CARGAR DATOS ---
    const fetchData = async () => {
        setLoading(true);
        try {
            const [partidosData, tablaData] = await Promise.all([
                api.getPartidos(),
                api.getTablaPosiciones(serieTabla)
            ]);
            setAllPartidos(partidosData);
            setTabla(tablaData);
        } catch (error) {
            console.error(error);
            toast.error("Error al cargar datos");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [serieTabla]);

    // --- GUARDAR RESULTADO ---
    const handleUpdateScore = async (id: number) => {
        const inputLocal = document.getElementById(`local-${id}`) as HTMLInputElement;
        const inputVisita = document.getElementById(`visita-${id}`) as HTMLInputElement;
        if (!inputLocal || !inputVisita) return;

        try {
            await api.updateResultado(id, Number(inputLocal.value), Number(inputVisita.value));
            toast.success("Actualizado");
            const [pData, tData] = await Promise.all([
                api.getPartidos(),
                api.getTablaPosiciones(serieTabla)
            ]);
            setAllPartidos(pData);
            setTabla(tData);
        } catch (error) {
            toast.error("Error al guardar");
        }
    };

    // --- ELIMINAR FIXTURE ---
    const handleEliminarFixture = async () => {
        try {
            await api.eliminarFixture();
            toast.success("Torneo eliminado correctamente");
            setAllPartidos([]);
            setTabla([]);
            setFechaActual(1);
        } catch (error) {
            toast.error("No se pudo eliminar el fixture");
        }
    };

    // --- REPROGRAMAR FECHA ---
    const handleReprogramar = async () => {
        if (!nuevaFechaReprogramacion) return toast.error("Selecciona una nueva fecha");

        try {
            await api.reprogramarFecha(fechaActual, nuevaFechaReprogramacion);
            toast.success(`Fecha ${fechaActual} reprogramada exitosamente`);
            setIsReprogramarOpen(false);
            fetchData();
        } catch (error) {
            toast.error("Error al reprogramar la fecha");
        }
    };

    // --- GENERAR PDF CON FILTROS ---
    const generatePDF = () => {
        const doc = new jsPDF();

        // 1. Filtrar los datos según la selección del usuario
        let partidosFiltrados = [...allPartidos];

        // Filtro por Fecha
        if (pdfAlcance === "fecha_actual") {
            partidosFiltrados = partidosFiltrados.filter(p => p.fecha_numero === fechaActual);
        }

        // Filtro por Serie
        if (pdfSerie !== "todas") {
            partidosFiltrados = partidosFiltrados.filter(p => p.serie === pdfSerie);
        }

        // Ordenar: Fecha -> Serie -> Hora
        partidosFiltrados.sort((a, b) => {
            if (a.fecha_numero !== b.fecha_numero) return a.fecha_numero - b.fecha_numero;
            if (a.serie !== b.serie) return a.serie.localeCompare(b.serie); // Simple string compare
            return new Date(a.dia_hora).getTime() - new Date(b.dia_hora).getTime();
        });

        if (partidosFiltrados.length === 0) {
            toast.error("No hay partidos con los filtros seleccionados");
            return;
        }

        // 2. Construir Título Dinámico
        let titulo = "Fixture del Torneo";
        if (pdfAlcance === "fecha_actual") titulo += ` - Fecha ${fechaActual}`;
        if (pdfSerie !== "todas") titulo += ` (${pdfSerie} Serie)`;

        doc.setFontSize(18);
        doc.text(titulo, 14, 20);

        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Generado el: ${format(new Date(), "dd/MM/yyyy HH:mm")}`, 14, 28);

        // 3. Generar Tabla
        const tableData = partidosFiltrados.map(p => [
            `Fecha ${p.fecha_numero}`,
            p.serie,
            p.local?.nombre || "N/A",
            `${p.goles_local} - ${p.goles_visita}`,
            p.visita?.nombre || "N/A",
            format(new Date(p.dia_hora), "dd/MM/yyyy HH:mm")
        ]);

        autoTable(doc, {
            head: [['Jornada', 'Serie', 'Local', 'Res', 'Visita', 'Día/Hora']],
            body: tableData,
            startY: 35,
            theme: 'grid',
            styles: { fontSize: 9, cellPadding: 3 },
            headStyles: { fillColor: [37, 99, 235] }, // Azul Tailwind (blue-600)
            alternateRowStyles: { fillColor: [248, 250, 252] } // Slate-50
        });

        doc.save(`fixture_${pdfAlcance}_${pdfSerie}.pdf`);
        setIsPdfOpen(false); // Cerrar modal
        toast.success("PDF generado correctamente");
    };

    // --- LÓGICA VISUAL ---
    const fechasDisponibles = Array.from(new Set(allPartidos.map(p => p.fecha_numero))).sort((a, b) => a - b);
    const partidosDeLaFecha = allPartidos.filter(p => p.fecha_numero === fechaActual);

    const enfrentamientos: EnfrentamientoGroup[] = [];
    partidosDeLaFecha.forEach((p) => {
        if (!p.local || !p.visita) return;
        const key = `${p.clubLocalId}-${p.clubVisitaId}`;
        let grupo = enfrentamientos.find(g => g.id === key);
        if (!grupo) {
            grupo = { id: key, local: p.local, visita: p.visita, partidos: [] };
            enfrentamientos.push(grupo);
        }
        grupo.partidos.push(p);
    });

    enfrentamientos.forEach(g => {
        const orden = { '3era': 1, '2da': 2, '1era': 3 };
        g.partidos.sort((a, b) => orden[a.serie] - orden[b.serie]);
    });

    return (
        <div className="container mx-auto py-8 max-w-6xl space-y-8">

            {/* HEADER PRINCIPAL */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Panel del Torneo</h1>
                    <p className="text-slate-500 text-sm">Gestiona resultados, fixture y tablas.</p>
                </div>

                {/* BARRA DE ACCIONES */}
                <div className="flex flex-wrap items-center gap-2">

                    {allPartidos.length > 0 && (
                        <>
                            {/* BOTÓN EXPORTAR PDF (Abre Modal) */}
                            <Dialog open={isPdfOpen} onOpenChange={setIsPdfOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="outline" className="gap-2">
                                        <FileDown className="h-4 w-4 text-slate-600" />
                                        <span className="hidden sm:inline">Exportar PDF</span>
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-md">
                                    <DialogHeader>
                                        <DialogTitle className="flex items-center gap-2">
                                            <Printer className="h-5 w-5 text-blue-600" />
                                            Opciones de Exportación
                                        </DialogTitle>
                                        <DialogDescription>
                                            Personaliza el reporte que deseas generar.
                                        </DialogDescription>
                                    </DialogHeader>

                                    <div className="grid gap-4 py-4">
                                        {/* Opción 1: Alcance */}
                                        <div className="space-y-2">
                                            <Label>¿Qué deseas incluir?</Label>
                                            <Select value={pdfAlcance} onValueChange={setPdfAlcance}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="fecha_actual">Solo Fecha {fechaActual} (Vista Actual)</SelectItem>
                                                    <SelectItem value="todo">Todo el Torneo</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* Opción 2: Serie */}
                                        <div className="space-y-2">
                                            <Label>Filtrar por Serie</Label>
                                            <Select value={pdfSerie} onValueChange={setPdfSerie}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="todas">Todas las Series</SelectItem>
                                                    <SelectItem value="1era">Primera Serie</SelectItem>
                                                    <SelectItem value="2da">Segunda Serie</SelectItem>
                                                    <SelectItem value="3era">Tercera Serie</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <DialogFooter>
                                        <Button onClick={generatePDF} className="w-full bg-blue-600 hover:bg-blue-700">
                                            <FileDown className="mr-2 h-4 w-4" /> Descargar PDF
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>

                            {/* Botón Eliminar (Peligro) */}
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="outline" className="text-red-600 hover:bg-red-50 border-red-200 gap-2">
                                        <Trash2 className="h-4 w-4" />
                                        <span className="hidden sm:inline">Borrar Todo</span>
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle className="text-red-600">¿Eliminar torneo completo?</AlertDialogTitle>
                                        <AlertDialogDescription>Se borrarán todos los partidos y resultados permanentemente.</AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleEliminarFixture} className="bg-red-600">Eliminar</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </>
                    )}

                    <Link href="/torneo/generar">
                        <Button className={allPartidos.length > 0 ? "hidden" : "bg-blue-600"}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Nuevo Torneo
                        </Button>
                    </Link>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
                    <TabsTrigger value="fixture"><CalendarDays className="mr-2 h-4 w-4" /> Fixture</TabsTrigger>
                    <TabsTrigger value="tabla"><Trophy className="mr-2 h-4 w-4" /> Tabla de Posiciones</TabsTrigger>
                </TabsList>

                {/* --- PESTAÑA FIXTURE --- */}
                <TabsContent value="fixture" className="space-y-6 animate-in fade-in duration-500">

                    {fechasDisponibles.length > 0 ? (
                        <>
                            {/* NAVEGADOR DE FECHAS & REPROGRAMACIÓN */}
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-200 sticky top-4 z-10">

                                {/* Controles de Navegación */}
                                <div className="flex items-center gap-4">
                                    <Button variant="ghost" size="icon"
                                        onClick={() => setFechaActual(prev => Math.max(prev - 1, fechasDisponibles[0]))}
                                        disabled={fechaActual === fechasDisponibles[0]}>
                                        <ChevronLeft className="h-5 w-5 text-slate-500" />
                                    </Button>
                                    <div className="text-center min-w-[120px]">
                                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Fecha Actual</span>
                                        <span className="text-xl font-black text-slate-800">Fecha {fechaActual}</span>
                                    </div>
                                    <Button variant="ghost" size="icon"
                                        onClick={() => setFechaActual(prev => Math.min(prev + 1, fechasDisponibles[fechasDisponibles.length - 1]))}
                                        disabled={fechaActual === fechasDisponibles[fechasDisponibles.length - 1]}>
                                        <ChevronRight className="h-5 w-5 text-slate-500" />
                                    </Button>
                                </div>

                                {/* Botón Reprogramar Esta Fecha */}
                                <Dialog open={isReprogramarOpen} onOpenChange={setIsReprogramarOpen}>
                                    <DialogTrigger asChild>
                                        <Button variant="secondary" className="gap-2 bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200">
                                            <CalendarClock className="h-4 w-4" />
                                            Reprogramar Fecha {fechaActual}
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Reprogramación Masiva</DialogTitle>
                                            <DialogDescription>
                                                Mover todos los partidos de la <strong>Fecha {fechaActual}</strong> a un nuevo día.
                                                Se conservarán los horarios originales.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="py-4">
                                            <Label>Nueva Fecha para la jornada</Label>
                                            <Input
                                                type="date"
                                                className="mt-2"
                                                onChange={(e) => setNuevaFechaReprogramacion(e.target.value)}
                                            />
                                        </div>
                                        <DialogFooter>
                                            <Button onClick={handleReprogramar} className="bg-amber-600 hover:bg-amber-700">
                                                Confirmar Cambio
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </div>

                            {/* TARJETAS DE PARTIDOS */}
                            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {enfrentamientos.map((cruce) => (
                                    <Card key={cruce.id} className="overflow-hidden border-slate-200 shadow-sm hover:shadow-md transition-all">
                                        {/* Header Cruce */}
                                        <div className="bg-gradient-to-r from-slate-50 to-white p-4 border-b flex justify-between items-center relative overflow-hidden">
                                            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                                            <div className="w-[42%] text-right pr-2">
                                                <span className="font-bold text-slate-800 text-sm md:text-base leading-tight block truncate" title={cruce.local.nombre}>{cruce.local.nombre}</span>
                                            </div>
                                            <div className="z-10 bg-white border px-2 py-1 rounded text-[10px] font-black text-slate-400 shadow-sm">VS</div>
                                            <div className="w-[42%] text-left pl-2">
                                                <span className="font-bold text-slate-800 text-sm md:text-base leading-tight block truncate" title={cruce.visita.nombre}>{cruce.visita.nombre}</span>
                                            </div>
                                        </div>

                                        {/* Partidos */}
                                        <CardContent className="p-0">
                                            <div className="divide-y divide-slate-100">
                                                {cruce.partidos.map((partido) => (
                                                    <div key={partido.id} className="p-3 hover:bg-slate-50 transition-colors">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <Badge variant="outline" className={cn("text-[10px] px-2 py-0 h-5 border-0 font-bold",
                                                                partido.serie === '1era' ? "bg-blue-100 text-blue-700" :
                                                                    partido.serie === '2da' ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                                                            )}>{partido.serie}</Badge>
                                                            <div className="flex items-center gap-1">
                                                                <span className="text-[10px] text-slate-400 font-mono">
                                                                    {format(new Date(partido.dia_hora), "dd/MM HH:mm")}
                                                                </span>
                                                                {partido.estado === 'finalizado' && <div className="h-1.5 w-1.5 rounded-full bg-green-500" title="Finalizado" />}
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex-1 flex items-center justify-center gap-2">
                                                                <Input id={`local-${partido.id}`} type="number" className={cn("h-9 w-12 text-center font-bold p-0 bg-white border-slate-200 focus:border-blue-500", partido.goles_local > partido.goles_visita && "text-blue-600 bg-blue-50/50")} defaultValue={partido.goles_local} />
                                                                <span className="text-slate-300">-</span>
                                                                <Input id={`visita-${partido.id}`} type="number" className={cn("h-9 w-12 text-center font-bold p-0 bg-white border-slate-200 focus:border-blue-500", partido.goles_visita > partido.goles_local && "text-blue-600 bg-blue-50/50")} defaultValue={partido.goles_visita} />
                                                            </div>
                                                            <Button size="icon" variant="ghost" className="h-9 w-9 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-full" onClick={() => handleUpdateScore(partido.id)}><Save className="w-4 h-4" /></Button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                            <div className="bg-white p-4 rounded-full shadow-sm mb-4"><CalendarDays className="h-8 w-8 text-slate-400" /></div>
                            <h3 className="text-lg font-semibold text-slate-900">No hay torneo activo</h3>
                            <Link href="/torneo/generar" className="mt-4"><Button>Comenzar Nuevo Torneo</Button></Link>
                        </div>
                    )}
                </TabsContent>

                {/* --- PESTAÑA TABLA (Sin cambios mayores) --- */}
                <TabsContent value="tabla" className="animate-in fade-in duration-500 space-y-4">
                    <div className="flex justify-end bg-white p-2 rounded-lg border shadow-sm">
                        <div className="flex items-center gap-2">
                            <Filter className="w-4 h-4 text-slate-500" />
                            <span className="text-sm font-medium text-slate-600">Filtrar por:</span>
                            <Select value={serieTabla} onValueChange={setSerieTabla}>
                                <SelectTrigger className="w-[160px] h-9 bg-slate-50 border-slate-200"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1era">Primera Serie</SelectItem>
                                    <SelectItem value="2da">Segunda Serie</SelectItem>
                                    <SelectItem value="3era">Tercera Serie</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <Card className="border-slate-200 shadow-sm">
                        <CardHeader className="pb-2 border-b border-slate-100 bg-slate-50/50">
                            <CardTitle className="text-lg flex items-center gap-2"><Trophy className="w-5 h-5 text-amber-500" />Tabla de Posiciones</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-slate-50 text-slate-500 font-semibold">
                                        <tr>
                                            <th className="px-4 py-3 text-center w-12">#</th>
                                            <th className="px-4 py-3">Club</th>
                                            <th className="px-4 py-3 text-center font-bold text-slate-800 bg-slate-100">PTS</th>
                                            <th className="px-4 py-3 text-center">PJ</th>
                                            <th className="px-4 py-3 text-center hidden sm:table-cell">PG</th>
                                            <th className="px-4 py-3 text-center hidden sm:table-cell">PE</th>
                                            <th className="px-4 py-3 text-center hidden sm:table-cell">PP</th>
                                            <th className="px-4 py-3 text-center hidden md:table-cell">GF</th>
                                            <th className="px-4 py-3 text-center hidden md:table-cell">GC</th>
                                            <th className="px-4 py-3 text-center">DIF</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {tabla.map((fila, index) => (
                                            <tr key={index} className="hover:bg-blue-50/30 transition-colors">
                                                <td className="px-4 py-3 text-center font-bold text-slate-400">{index + 1}</td>
                                                <td className="px-4 py-3 font-medium text-slate-700 flex items-center gap-3">
                                                    {fila.logo ? <img src={fila.logo} alt={fila.club} className="w-8 h-8 object-contain" /> : <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-[10px] text-slate-500 font-bold">{fila.club.substring(0, 2).toUpperCase()}</div>}
                                                    {fila.club}
                                                </td>
                                                <td className="px-4 py-3 text-center font-bold text-blue-700 bg-blue-50/50 text-base border-x border-slate-100">{fila.pts}</td>
                                                <td className="px-4 py-3 text-center text-slate-600">{fila.pj}</td>
                                                <td className="px-4 py-3 text-center hidden sm:table-cell text-slate-400">{fila.pg}</td>
                                                <td className="px-4 py-3 text-center hidden sm:table-cell text-slate-400">{fila.pe}</td>
                                                <td className="px-4 py-3 text-center hidden sm:table-cell text-slate-400">{fila.pp}</td>
                                                <td className="px-4 py-3 text-center hidden md:table-cell text-slate-400">{fila.gf}</td>
                                                <td className="px-4 py-3 text-center hidden md:table-cell text-slate-400">{fila.gc}</td>
                                                <td className={cn("px-4 py-3 text-center font-bold", fila.dif > 0 ? "text-green-600" : fila.dif < 0 ? "text-red-500" : "text-slate-400")}>{fila.dif > 0 ? `+${fila.dif}` : fila.dif}</td>
                                            </tr>
                                        ))}
                                        {tabla.length === 0 && <tr><td colSpan={10} className="text-center py-12 text-gray-400">Sin datos registrados</td></tr>}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}