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
    Trash2, AlertTriangle, FileDown, CalendarClock, Printer, ShieldAlert
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// Definición de grupo visual
interface EnfrentamientoGroup {
    id: string;
    local: { id: number; nombre: string; logo?: string };
    visita: { id: number; nombre: string; logo?: string };
    partidos: Partido[];
}

export default function TorneoDashboard() {
    const [activeTab, setActiveTab] = useState("fixture");

    // --- ESTADO MAESTRO ---
    const [torneoSeleccionado, setTorneoSeleccionado] = useState<string>("A");

    // Filtro secundario tabla
    const [serieTabla, setSerieTabla] = useState<string>("1era");

    const [allPartidos, setAllPartidos] = useState<Partido[]>([]);
    const [tabla, setTabla] = useState<PosicionTabla[]>([]);
    const [loading, setLoading] = useState(true);
    const [fechaActual, setFechaActual] = useState<number>(1);

    // --- MODALES ---
    const [isReprogramarOpen, setIsReprogramarOpen] = useState(false);
    const [nuevaFechaReprogramacion, setNuevaFechaReprogramacion] = useState("");

    const [isPdfOpen, setIsPdfOpen] = useState(false);
    const [pdfAlcance, setPdfAlcance] = useState("fecha_actual");
    const [pdfSerie, setPdfSerie] = useState("todas");

    const [securityModalOpen, setSecurityModalOpen] = useState(false);
    const [partidoSeguridad, setPartidoSeguridad] = useState<Partido | null>(null);
    const [equipoCulpableId, setEquipoCulpableId] = useState<string>("");
    const [motivoSuspension, setMotivoSuspension] = useState("");

    // --- HELPERS ---
    const getNombreSerie = (serie: string) => {
        if (!serie) return "S/N";
        const s = serie.toLowerCase().trim();
        if (s === 'super_senior' || s === '3era') return 'Super Senior';
        if (s === '2da') return '2da Serie';
        if (s === '1era') return '1era Serie';
        return serie;
    };

    const getOrdenSerie = (serie: string) => {
        if (!serie) return 99;
        const s = serie.toLowerCase().trim();
        if (s === 'super_senior' || s === '3era') return 1;
        if (s === '2da') return 2;
        if (s === '1era') return 3;
        return 99;
    };

    // --- CARGAR DATOS ---
    const fetchData = async () => {
        setLoading(true);
        try {
            const [partidosData, tablaData] = await Promise.all([
                api.getPartidos({ division: torneoSeleccionado }),
                api.getTablaPosiciones(serieTabla, torneoSeleccionado)
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
        setFechaActual(1);
    }, [torneoSeleccionado, serieTabla]);

    // --- ACCIONES ---
    const handleUpdateScore = async (id: number) => {
        const inputLocal = document.getElementById(`local-${id}`) as HTMLInputElement;
        const inputVisita = document.getElementById(`visita-${id}`) as HTMLInputElement;
        if (!inputLocal || !inputVisita) return;

        try {
            await api.updateResultado(id, Number(inputLocal.value), Number(inputVisita.value));
            toast.success("Actualizado");
            fetchData();
        } catch (error) {
            toast.error("Error al guardar");
        }
    };

    const handleEliminarFixture = async () => {
        try {
            await api.eliminarFixture(torneoSeleccionado);
            toast.success(`Torneo Serie ${torneoSeleccionado} eliminado`);
            setAllPartidos([]);
            setTabla([]);
            setFechaActual(1);
        } catch (error) {
            toast.error("Error al eliminar");
        }
    };

    const handleReprogramar = async () => {
        if (!nuevaFechaReprogramacion) return toast.error("Falta fecha");
        try {
            await api.reprogramarFecha(fechaActual, nuevaFechaReprogramacion, torneoSeleccionado);
            toast.success("Reprogramado");
            setIsReprogramarOpen(false);
            fetchData();
        } catch (error) {
            toast.error("Error al reprogramar");
        }
    };

    // --- SEGURIDAD ---
    const abrirReporteSeguridad = (partido: Partido) => {
        setPartidoSeguridad(partido);
        setEquipoCulpableId("");
        setMotivoSuspension("");
        setSecurityModalOpen(true);
    };

    const confirmarSuspension = async () => {
        if (!partidoSeguridad || !equipoCulpableId || !motivoSuspension) {
            return toast.error("Completa todos los campos");
        }
        try {
            await api.reportarIncidente(partidoSeguridad.id, Number(equipoCulpableId), motivoSuspension);
            toast.success("Sanción aplicada");
            setSecurityModalOpen(false);
            fetchData();
        } catch (error) {
            toast.error("Error al reportar");
        }
    };

    // --- PDF: GENERAR FIXTURE ---
    const generateFixturePDF = () => {
        const doc = new jsPDF();
        let partidosFiltrados = [...allPartidos];

        if (pdfAlcance === "fecha_actual") {
            partidosFiltrados = partidosFiltrados.filter(p => p.fecha_numero === fechaActual);
        }
        if (pdfSerie !== "todas") {
            partidosFiltrados = partidosFiltrados.filter(p => p.serie === pdfSerie);
        }

        partidosFiltrados.sort((a, b) => {
            if (a.fecha_numero !== b.fecha_numero) return a.fecha_numero - b.fecha_numero;
            const ordenA = getOrdenSerie(a.serie);
            const ordenB = getOrdenSerie(b.serie);
            if (ordenA !== ordenB) return ordenA - ordenB;
            return new Date(a.dia_hora).getTime() - new Date(b.dia_hora).getTime();
        });

        if (partidosFiltrados.length === 0) {
            toast.error("No hay partidos con los filtros seleccionados");
            return;
        }

        let titulo = `Fixture Serie ${torneoSeleccionado}`;
        if (pdfAlcance === "fecha_actual") titulo += ` - Fecha ${fechaActual}`;
        if (pdfSerie !== "todas") titulo += ` (${getNombreSerie(pdfSerie)})`;

        doc.setFontSize(18);
        doc.text(titulo, 14, 20);
        doc.setFontSize(10);
        doc.text(`Generado el: ${format(new Date(), "dd/MM/yyyy HH:mm")}`, 14, 28);

        const tableData = partidosFiltrados.map(p => [
            `Fecha ${p.fecha_numero}`,
            getNombreSerie(p.serie),
            p.local?.nombre || "N/A",
            p.estado === 'suspendido' ? 'SUSP' : `${p.goles_local} - ${p.goles_visita}`,
            p.visita?.nombre || "N/A",
            format(new Date(p.dia_hora), "dd/MM HH:mm")
        ]);

        autoTable(doc, {
            head: [['Jornada', 'Serie', 'Local', 'Res', 'Visita', 'Día/Hora']],
            body: tableData,
            startY: 35,
            theme: 'grid',
            styles: { fontSize: 9, cellPadding: 3 },
            headStyles: { fillColor: [37, 99, 235] },
            alternateRowStyles: { fillColor: [248, 250, 252] }
        });

        doc.save(`fixture_serie_${torneoSeleccionado}.pdf`);
        setIsPdfOpen(false);
        toast.success("Fixture exportado");
    };

    // --- PDF: GENERAR TABLA ---
    const generateTablaPDF = () => {
        const doc = new jsPDF();

        const titulo = `Tabla de Posiciones - Serie ${torneoSeleccionado} (${getNombreSerie(serieTabla)})`;

        doc.setFontSize(18);
        doc.text(titulo, 14, 20);
        doc.setFontSize(10);
        doc.text(`Generado el: ${format(new Date(), "dd/MM/yyyy HH:mm")}`, 14, 28);

        const tableData = tabla.map((t, i) => [
            i + 1,
            t.club,
            t.pts,
            t.pj,
            t.pg,
            t.pe,
            t.pp,
            t.gf,
            t.gc,
            t.dif
        ]);

        autoTable(doc, {
            head: [['Pos', 'Club', 'PTS', 'PJ', 'PG', 'PE', 'PP', 'GF', 'GC', 'DIF']],
            body: tableData,
            startY: 35,
            theme: 'striped',
            headStyles: { fillColor: [234, 88, 12] }, // Color naranja/amber
            styles: { halign: 'center' },
            columnStyles: { 1: { halign: 'left' } } // Alinear nombres a la izquierda
        });

        doc.save(`tabla_${torneoSeleccionado}_${serieTabla}.pdf`);
        toast.success("Tabla exportada");
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
        g.partidos.sort((a, b) => getOrdenSerie(a.serie) - getOrdenSerie(b.serie));
    });

    return (
        <div className="container mx-auto py-8 max-w-6xl space-y-8">

            {/* HEADER PRINCIPAL */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Panel del Torneo</h1>
                    <div className="flex items-center gap-3 mt-3">
                        <span className="text-sm font-bold text-slate-500 uppercase tracking-wide">Viendo:</span>
                        <Select value={torneoSeleccionado} onValueChange={setTorneoSeleccionado}>
                            <SelectTrigger className="w-[220px] h-11 text-lg font-bold text-blue-700 bg-blue-50 border-blue-200 shadow-sm">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="A" className="font-semibold">🏆 Serie A (Sábados)</SelectItem>
                                <SelectItem value="B" className="font-semibold">🥈 Serie B (Domingos)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {allPartidos.length > 0 && (
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="outline" className="text-red-600 hover:bg-red-50 border-red-200 gap-2">
                                    <Trash2 className="h-4 w-4" />
                                    <span className="hidden sm:inline">Borrar Torneo</span>
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle className="text-red-600">¿Eliminar Serie {torneoSeleccionado}?</AlertDialogTitle>
                                    <AlertDialogDescription>Se borrarán todos los partidos y resultados de este campeonato.</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleEliminarFixture} className="bg-red-600">Eliminar</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    )}

                    <Link href="/torneo/generar">
                        <Button className="bg-blue-600 gap-2">
                            <PlusCircle className="h-4 w-4" /> Nuevo Torneo
                        </Button>
                    </Link>
                </div>
            </div>

            {/* MODAL SEGURIDAD */}
            <Dialog open={securityModalOpen} onOpenChange={setSecurityModalOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600"><ShieldAlert className="h-6 w-6" /> Reporte de Seguridad</DialogTitle>
                        <DialogDescription>Suspender partido por incidentes graves.</DialogDescription>
                    </DialogHeader>
                    {partidoSeguridad && (
                        <div className="grid gap-6 py-4">
                            <div className="p-3 bg-slate-50 rounded border text-center">
                                <span className="font-bold text-slate-700">{partidoSeguridad.local?.nombre}</span>
                                <span className="mx-2 text-slate-400">vs</span>
                                <span className="font-bold text-slate-700">{partidoSeguridad.visita?.nombre}</span>
                                <div className="text-xs text-slate-500 uppercase mt-1 font-bold">Serie: {getNombreSerie(partidoSeguridad.serie)}</div>
                            </div>
                            <div className="space-y-3">
                                <Label className="text-red-700 font-semibold">¿Quién causó el incidente?</Label>
                                <RadioGroup value={equipoCulpableId} onValueChange={setEquipoCulpableId}>
                                    <div className="flex items-center space-x-2 border p-3 rounded hover:bg-slate-50 cursor-pointer">
                                        <RadioGroupItem value={String(partidoSeguridad.clubLocalId)} id="r-local" />
                                        <Label htmlFor="r-local" className="cursor-pointer flex-1">{partidoSeguridad.local?.nombre} (Local)</Label>
                                    </div>
                                    <div className="flex items-center space-x-2 border p-3 rounded hover:bg-slate-50 cursor-pointer">
                                        <RadioGroupItem value={String(partidoSeguridad.clubVisitaId)} id="r-visita" />
                                        <Label htmlFor="r-visita" className="cursor-pointer flex-1">{partidoSeguridad.visita?.nombre} (Visita)</Label>
                                    </div>
                                </RadioGroup>
                            </div>
                            <div className="space-y-2">
                                <Label>Motivo</Label>
                                <Input placeholder="Ej: Agresión al árbitro..." value={motivoSuspension} onChange={(e) => setMotivoSuspension(e.target.value)} />
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setSecurityModalOpen(false)}>Cancelar</Button>
                        <Button onClick={confirmarSuspension} className="bg-red-600 hover:bg-red-700">Confirmar Sanción</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
                    <TabsTrigger value="fixture"><CalendarDays className="mr-2 h-4 w-4" /> Fixture</TabsTrigger>
                    <TabsTrigger value="tabla"><Trophy className="mr-2 h-4 w-4" /> Tabla de Posiciones</TabsTrigger>
                </TabsList>

                {/* --- PESTAÑA FIXTURE --- */}
                <TabsContent value="fixture" className="space-y-6 animate-in fade-in duration-500">
                    {fechasDisponibles.length > 0 ? (
                        <>
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-200 sticky top-4 z-10">

                                {/* Navegación Fechas */}
                                <div className="flex items-center gap-4">
                                    <Button variant="ghost" size="icon" onClick={() => setFechaActual(prev => Math.max(prev - 1, fechasDisponibles[0]))} disabled={fechaActual === fechasDisponibles[0]}>
                                        <ChevronLeft className="h-5 w-5 text-slate-500" />
                                    </Button>
                                    <div className="text-center min-w-[120px]">
                                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Fecha Actual</span>
                                        <span className="text-xl font-black text-slate-800">Fecha {fechaActual}</span>
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => setFechaActual(prev => Math.min(prev + 1, fechasDisponibles[fechasDisponibles.length - 1]))} disabled={fechaActual === fechasDisponibles[fechasDisponibles.length - 1]}>
                                        <ChevronRight className="h-5 w-5 text-slate-500" />
                                    </Button>
                                </div>

                                {/* Acciones Fixture: PDF y Reprogramar */}
                                <div className="flex gap-2">
                                    {/* BOTÓN EXPORTAR FIXTURE PDF */}
                                    <Dialog open={isPdfOpen} onOpenChange={setIsPdfOpen}>
                                        <DialogTrigger asChild>
                                            <Button variant="outline" className="gap-2 text-slate-600 border-slate-200">
                                                <FileDown className="h-4 w-4" /> <span className="hidden sm:inline">Exportar PDF</span>
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-md">
                                            <DialogHeader>
                                                <DialogTitle>Opciones de Exportación</DialogTitle>
                                                <DialogDescription>Descargar Fixture en PDF</DialogDescription>
                                            </DialogHeader>
                                            <div className="grid gap-4 py-4">
                                                <div className="space-y-2">
                                                    <Label>Alcance</Label>
                                                    <Select value={pdfAlcance} onValueChange={setPdfAlcance}>
                                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="fecha_actual">Solo Fecha {fechaActual}</SelectItem>
                                                            <SelectItem value="todo">Todo el Torneo</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Serie</Label>
                                                    <Select value={pdfSerie} onValueChange={setPdfSerie}>
                                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="todas">Todas las Series</SelectItem>
                                                            <SelectItem value="super_senior">Super Senior</SelectItem>
                                                            <SelectItem value="2da">2da Serie</SelectItem>
                                                            <SelectItem value="1era">1era Serie</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                            <DialogFooter>
                                                <Button onClick={generateFixturePDF} className="w-full bg-blue-600">Descargar</Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>

                                    {/* BOTÓN REPROGRAMAR */}
                                    <Dialog open={isReprogramarOpen} onOpenChange={setIsReprogramarOpen}>
                                        <DialogTrigger asChild>
                                            <Button variant="secondary" className="gap-2 bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200">
                                                <CalendarClock className="h-4 w-4" /> <span className="hidden sm:inline">Reprogramar</span>
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader><DialogTitle>Reprogramación Masiva</DialogTitle><DialogDescription>Mover Fecha {fechaActual}</DialogDescription></DialogHeader>
                                            <div className="py-4"><Label>Nueva Fecha</Label><Input type="date" className="mt-2" onChange={(e) => setNuevaFechaReprogramacion(e.target.value)} /></div>
                                            <DialogFooter><Button onClick={handleReprogramar} className="bg-amber-600 hover:bg-amber-700">Confirmar</Button></DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </div>

                            {/* GRID TARJETAS */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {enfrentamientos.map((cruce) => (
                                    <Card key={cruce.id} className="overflow-hidden border-slate-200 shadow-sm hover:shadow-md transition-all">
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
                                        <CardContent className="p-0">
                                            <div className="divide-y divide-slate-100">
                                                {cruce.partidos.map((partido) => (
                                                    <div key={partido.id} className={cn("p-4 hover:bg-slate-50 transition-colors relative", partido.estado === 'suspendido' && "bg-red-50 hover:bg-red-100")}>
                                                        <div className="flex items-center justify-between mb-3">
                                                            <Badge variant="outline" className={cn(
                                                                "text-[10px] px-3 py-1 border-0 font-bold whitespace-nowrap w-auto min-w-[90px] justify-center flex-shrink-0",
                                                                partido.serie === '1era' ? "bg-blue-100 text-blue-700" :
                                                                    partido.serie === '2da' ? "bg-green-100 text-green-700" :
                                                                        "bg-purple-100 text-purple-700"
                                                            )}>
                                                                {getNombreSerie(partido.serie)}
                                                            </Badge>
                                                            <div className="flex items-center gap-2">
                                                                {partido.estado === 'suspendido' ? (
                                                                    <span className="text-[10px] font-bold text-red-600 flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> SUSPENDIDO</span>
                                                                ) : (
                                                                    <span className="text-[10px] text-slate-400 font-mono">{format(new Date(partido.dia_hora), "HH:mm")}</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-4">
                                                            <div className="flex-1 flex items-center justify-center gap-3">
                                                                <Input id={`local-${partido.id}`} type="number" className="h-9 w-14 text-center text-sm p-0" defaultValue={partido.goles_local} disabled={partido.estado === 'suspendido'} />
                                                                <span className="text-slate-300 font-bold">-</span>
                                                                <Input id={`visita-${partido.id}`} type="number" className="h-9 w-14 text-center text-sm p-0" defaultValue={partido.goles_visita} disabled={partido.estado === 'suspendido'} />
                                                            </div>
                                                            <Button size="icon" variant="ghost" className="h-9 w-9 text-slate-400 hover:text-green-600 border border-slate-100" onClick={() => handleUpdateScore(partido.id)} disabled={partido.estado === 'suspendido'}><Save className="w-4 h-4" /></Button>
                                                            <Button size="icon" variant="ghost" className="h-9 w-9 text-slate-300 hover:text-red-600 hover:bg-red-50 border border-slate-100" title="Reportar Problema" onClick={() => abrirReporteSeguridad(partido)}><ShieldAlert className="w-4 h-4" /></Button>
                                                        </div>
                                                        {partido.estado === 'suspendido' && <div className="mt-2 text-xs text-red-600 italic text-center">"{partido.motivo_suspension}"</div>}
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
                            <h3 className="text-lg font-semibold text-slate-900">No hay torneo activo para la Serie {torneoSeleccionado}</h3>
                            <Link href="/torneo/generar" className="mt-4"><Button>Comenzar Nuevo Torneo</Button></Link>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="tabla" className="space-y-4">
                    {/* FILTROS TABLA */}
                    <div className="flex flex-wrap justify-between items-center gap-3 bg-white p-3 rounded-lg border shadow-sm">

                        {/* BOTÓN EXPORTAR TABLA */}
                        <Button variant="outline" className="gap-2 text-amber-700 border-amber-200 bg-amber-50 hover:bg-amber-100" onClick={generateTablaPDF}>
                            <FileDown className="h-4 w-4" /> Exportar a PDF
                        </Button>

                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-slate-600">Serie:</span>
                            <Select value={serieTabla} onValueChange={setSerieTabla}>
                                <SelectTrigger className="w-[180px] h-9"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="super_senior">Super Senior</SelectItem>
                                    <SelectItem value="2da">Segunda Serie</SelectItem>
                                    <SelectItem value="1era">Primera Serie</SelectItem>
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