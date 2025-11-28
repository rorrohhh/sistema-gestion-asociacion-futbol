"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { JornadaPreview } from "@/types";

// Componentes UI
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save, Calendar, Clock, RefreshCw, Trophy, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function GenerarFixturePage() {
    const router = useRouter();
    const [step, setStep] = useState<"config" | "preview">("config");
    const [loading, setLoading] = useState(false);

    // Configuración
    const [fechaInicio, setFechaInicio] = useState("");
    const [horarios, setHorarios] = useState({
        "3era": "09:00",
        "2da": "11:00",
        "1era": "13:00",
    });

    // Datos del Fixture
    const [fixtureData, setFixtureData] = useState<JornadaPreview[]>([]);
    // --- NUEVO: Estado para paginar en el preview ---
    const [jornadaIndexVisual, setJornadaIndexVisual] = useState(0);

    const handleGenerar = async () => {
        if (!fechaInicio) return toast.error("Selecciona una fecha de inicio");
        setLoading(true);
        try {
            const data = await api.generarFixturePreview({
                fechaInicio,
                horariosBase: horarios
            });
            setFixtureData(data);
            setStep("preview");
            setJornadaIndexVisual(0); // Resetear a la fecha 1
            toast.success("¡Fixture calculado! Revisa los cruces.");
        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.error || "Error al generar fixture.");
        } finally {
            setLoading(false);
        }
    };

    const handleGuardar = async () => {
        setLoading(true);
        try {
            await api.guardarFixtureMasivo(fixtureData);
            toast.success("Fixture creado y guardado exitosamente");
            router.push("/torneo");
        } catch (error) {
            console.error(error);
            toast.error("Error al guardar el fixture en base de datos");
        } finally {
            setLoading(false);
        }
    };

    const moverDia = (jornadaIndex: number, enfrentamientoIndex: number, dias: number) => {
        const nuevoFixture = [...fixtureData];
        const cruce = nuevoFixture[jornadaIndex].enfrentamientos[enfrentamientoIndex];

        cruce.partidos = cruce.partidos.map(p => {
            // Importante: parsear fecha asegurando formato correcto
            const dateObj = new Date(p.fechaFull);
            dateObj.setDate(dateObj.getDate() + dias);
            return { ...p, fechaFull: dateObj.toISOString() };
        });

        setFixtureData(nuevoFixture);
        toast.info("Enfrentamiento reprogramado (Borrador)");
    };

    return (
        <div className="container mx-auto py-10 max-w-5xl space-y-8">

            {/* HEADER */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
                        <Trophy className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Nuevo Torneo</h1>
                        <p className="text-gray-500">Asistente de creación de fixture automático</p>
                    </div>
                </div>

                {step === "preview" && (
                    <Button variant="outline" onClick={() => setStep("config")} disabled={loading}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Volver a Configuración
                    </Button>
                )}
                {step === "config" && (
                    <Button variant="ghost" onClick={() => router.back()}>Cancelar</Button>
                )}
            </div>

            {/* --- VISTA 1: CONFIGURACIÓN --- */}
            {step === "config" && (
                <Card className="max-w-2xl mx-auto shadow-lg border-t-4 border-t-blue-500">
                    <CardHeader>
                        <CardTitle>Paso 1: Configuración Inicial</CardTitle>
                        <CardDescription>Define cuándo comienza el torneo y los horarios base para cada serie.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8 p-8">
                        <div className="grid gap-3">
                            <Label className="text-base">Fecha de Inicio (Primera Fecha)</Label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                <Input
                                    type="date"
                                    className="pl-10 h-12 text-lg"
                                    value={fechaInicio}
                                    onChange={(e) => setFechaInicio(e.target.value)}
                                />
                            </div>
                            <p className="text-sm text-gray-500">Generalmente se selecciona un Sábado. El sistema calculará las siguientes fechas automáticamente.</p>
                        </div>

                        <div className="border rounded-xl p-6 bg-slate-50 space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Clock className="h-5 w-5 text-blue-600" />
                                <h3 className="font-semibold text-gray-900">Horarios por defecto</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {["3era", "2da", "1era"].map((serie) => (
                                    <div key={serie} className="space-y-2">
                                        <Label className="text-xs font-bold uppercase text-gray-500 tracking-wide">{serie} Serie</Label>
                                        <Input
                                            type="time"
                                            value={horarios[serie as keyof typeof horarios]}
                                            onChange={(e) => setHorarios({ ...horarios, [serie]: e.target.value })}
                                            className="bg-white"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <Button className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700" onClick={handleGenerar} disabled={loading}>
                            {loading && <RefreshCw className="mr-2 h-5 w-5 animate-spin" />}
                            Generar Previsualización
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* --- VISTA 2: PREVIEW PAGINADO --- */}
            {step === "preview" && fixtureData.length > 0 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

                    {/* Top Bar: Info y Botón Guardar */}
                    <div className="sticky top-4 z-20 flex flex-col md:flex-row items-center justify-between bg-white/95 backdrop-blur-md p-4 rounded-xl border border-blue-200 shadow-md gap-4">
                        <div className="flex gap-3 items-center">
                            <div className="bg-amber-100 p-2 rounded-full"><RefreshCw className="h-5 w-5 text-amber-600" /></div>
                            <div>
                                <p className="text-sm font-bold text-gray-900">Modo Borrador</p>
                                <p className="text-xs text-gray-500">Revisa fecha por fecha antes de guardar.</p>
                            </div>
                        </div>
                        <Button onClick={handleGuardar} disabled={loading} size="lg" className="bg-green-600 hover:bg-green-700 w-full md:w-auto shadow-sm">
                            <Save className="mr-2 h-5 w-5" />
                            {loading ? "Guardando..." : "Confirmar Torneo"}
                        </Button>
                    </div>

                    {/* Navegación entre Jornadas (Preview) */}
                    <div className="flex items-center justify-center gap-4 bg-slate-100 p-4 rounded-lg">
                        <Button
                            variant="outline" size="icon"
                            onClick={() => setJornadaIndexVisual(prev => Math.max(0, prev - 1))}
                            disabled={jornadaIndexVisual === 0}
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </Button>

                        <div className="text-center">
                            <h3 className="text-xl font-bold text-slate-800">Fecha {fixtureData[jornadaIndexVisual].numero}</h3>
                            <p className="text-sm text-slate-500 capitalize">
                                {format(new Date(fixtureData[jornadaIndexVisual].fecha_calendario), "EEEE d 'de' MMMM, yyyy", { locale: es })}
                            </p>
                        </div>

                        <Button
                            variant="outline" size="icon"
                            onClick={() => setJornadaIndexVisual(prev => Math.min(fixtureData.length - 1, prev + 1))}
                            disabled={jornadaIndexVisual === fixtureData.length - 1}
                        >
                            <ChevronRight className="h-5 w-5" />
                        </Button>
                    </div>

                    {/* Grid de Partidos de la Jornada Visible */}
                    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {fixtureData[jornadaIndexVisual].enfrentamientos.map((cruce, cIndex) => (
                            <Card key={`${cruce.local.id}-vs-${cruce.visita.id}`} className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-all duration-300 ring-1 ring-gray-200">
                                <CardContent className="p-0">
                                    {/* Cabecera del Cruce */}
                                    <div className="bg-gradient-to-r from-slate-50 to-slate-100 p-4 flex justify-between items-center border-b">
                                        <span className="font-bold text-slate-800 truncate w-[40%] text-right">{cruce.local.nombre}</span>
                                        <div className="bg-white px-2 py-1 rounded shadow-sm text-[10px] font-black border text-slate-400">VS</div>
                                        <span className="font-bold text-slate-800 truncate w-[40%] text-left">{cruce.visita.nombre}</span>
                                    </div>

                                    {/* Lista de Partidos */}
                                    <div className="p-4 space-y-3 bg-white">
                                        {cruce.partidos.map((partido, pIndex) => (
                                            <div key={pIndex} className="flex justify-between items-center text-sm group p-2 rounded-md hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-colors">
                                                <Badge variant="outline" className={`text-[10px] w-12 justify-center font-bold ${partido.serie === '1era' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                        partido.serie === '2da' ? 'bg-green-50 text-green-700 border-green-200' :
                                                            'bg-orange-50 text-orange-700 border-orange-200'
                                                    }`}>
                                                    {partido.serie}
                                                </Badge>
                                                <span className="text-slate-600 font-mono font-medium">
                                                    {format(new Date(partido.fechaFull), "HH:mm")}
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Footer Acciones */}
                                    <div className="bg-slate-50 border-t p-2 flex justify-center">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 text-xs text-slate-500 hover:text-blue-600 w-full"
                                            onClick={() => moverDia(jornadaIndexVisual, cIndex, 1)}
                                        >
                                            Pasar bloque al Domingo ➡️
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}