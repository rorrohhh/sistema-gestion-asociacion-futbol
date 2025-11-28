"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { JornadaPreview, Club } from "@/types";

// UI Components
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save, Clock, RefreshCw, Trophy, Users, AlertTriangle, CheckSquare } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// Si no tienes el componente Checkbox, usaremos un input normal estilizado o asegúrate de tenerlo importado
import { cn } from "@/lib/utils";

export default function GenerarFixturePage() {
    const router = useRouter();
    const [step, setStep] = useState<"config" | "equipos" | "preview">("config");
    const [loading, setLoading] = useState(false);

    // Configuración
    const [division, setDivision] = useState<string>("A");
    const [fechaInicio, setFechaInicio] = useState("");
    const [existeTorneo, setExisteTorneo] = useState(false);
    const [horarios, setHorarios] = useState({ "super_senior": "09:00", "2da": "11:00", "1era": "13:00" });

    // Equipos
    const [todosClubes, setTodosClubes] = useState<Club[]>([]);
    const [equiposSeleccionados, setEquiposSeleccionados] = useState<number[]>([]);

    // Fixture
    const [fixtureData, setFixtureData] = useState<JornadaPreview[]>([]);

    // 1. Cargar datos iniciales
    useEffect(() => {
        const init = async () => {
            try {
                // Verificar si existe torneo
                const status = await api.checkTorneo(division);
                setExisteTorneo(status.existe);
                if (status.existe) {
                    toast.warning(`Ya existe un torneo para la Serie ${division}.`);
                }

                // Cargar Clubes
                const clubes = await api.getClubes();
                setTodosClubes(clubes);

                // Pre-seleccionar equipos de esta división
                const preseleccion = clubes.filter(c => c.division === division).map(c => c.id);
                setEquiposSeleccionados(preseleccion);
            } catch (error) {
                console.error(error);
            }
        };
        init();
    }, [division]);

    // PASO 2 -> 3: Generar
    const handleGenerar = async () => {
        if (!fechaInicio) return toast.error("Selecciona una fecha de inicio");
        if (equiposSeleccionados.length < 2) return toast.error("Debes seleccionar al menos 2 equipos");

        setLoading(true);
        try {
            const data = await api.generarFixturePreview({
                fechaInicio,
                horariosBase: horarios,
                equiposIds: equiposSeleccionados
            });
            setFixtureData(data);
            setStep("preview");
            toast.success("Fixture calculado");
        } catch (error: any) {
            toast.error("Error al generar fixture");
        } finally {
            setLoading(false);
        }
    };

    // PASO 3: Guardar
    const handleGuardar = async () => {
        setLoading(true);
        try {
            await api.guardarFixtureMasivo(fixtureData, division);
            toast.success(`Torneo Serie ${division} guardado!`);
            router.push("/torneo");
        } catch (error) {
            toast.error("Error al guardar");
        } finally {
            setLoading(false);
        }
    };

    const toggleEquipo = (id: number) => {
        setEquiposSeleccionados(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    return (
        <div className="container mx-auto py-10 max-w-5xl space-y-8">

            {/* HEADER */}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-100 rounded-lg text-blue-600"><Trophy className="h-6 w-6" /></div>
                    <div>
                        <h1 className="text-3xl font-bold">Nuevo Torneo</h1>
                        <p className="text-gray-500">
                            {step === 'config' && "Paso 1: Configuración"}
                            {step === 'equipos' && "Paso 2: Selección de Equipos"}
                            {step === 'preview' && "Paso 3: Confirmación"}
                        </p>
                    </div>
                </div>
                {step !== 'config' && <Button variant="outline" onClick={() => setStep(step === 'preview' ? 'equipos' : 'config')}>Volver</Button>}
            </div>

            {/* VISTA 1: CONFIG */}
            {step === 'config' && (
                <Card>
                    <CardHeader>
                        <CardTitle>Configuración General</CardTitle>
                        {existeTorneo && (
                            <div className="bg-amber-50 text-amber-800 p-3 rounded border border-amber-200 mt-2 flex gap-2">
                                <AlertTriangle className="h-5 w-5" />
                                <span className="text-sm font-bold">¡Atención! Ya existe un torneo activo para la Serie {division}.</span>
                            </div>
                        )}
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label>División a Crear</Label>
                                <Select value={division} onValueChange={setDivision}>
                                    <SelectTrigger className="h-12 text-lg font-bold"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="A">Serie A (Sábados)</SelectItem>
                                        <SelectItem value="B">Serie B (Domingos)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Fecha de Inicio</Label>
                                <Input type="date" className="h-12" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} />
                            </div>
                        </div>

                        <div className="border p-4 rounded bg-slate-50">
                            <Label className="mb-3 block font-bold">Horarios Base</Label>
                            <div className="grid grid-cols-3 gap-4">
                                {["super_senior", "2da", "1era"].map(s => (
                                    <div key={s}>
                                        <Label className="text-xs uppercase text-slate-500">{s.replace('_', ' ')}</Label>
                                        <Input type="time" value={horarios[s as keyof typeof horarios]} onChange={e => setHorarios({ ...horarios, [s]: e.target.value })} className="bg-white" />
                                    </div>
                                ))}
                            </div>
                        </div>
                        <Button className="w-full" size="lg" onClick={() => setStep('equipos')}>Siguiente: Elegir Equipos</Button>
                    </CardContent>
                </Card>
            )}

            {/* VISTA 2: EQUIPOS */}
            {step === 'equipos' && (
                <Card>
                    <CardHeader>
                        <CardTitle>Selección de Equipos</CardTitle>
                        <CardDescription>{equiposSeleccionados.length} equipos seleccionados para la Serie {division}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => setEquiposSeleccionados([])}>Ninguno</Button>
                            <Button variant="secondary" size="sm" onClick={() => setEquiposSeleccionados(todosClubes.map(c => c.id))}>Todos</Button>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {todosClubes.map(club => (
                                <div key={club.id} onClick={() => toggleEquipo(club.id)} className={cn("flex items-center space-x-2 border p-2 rounded cursor-pointer hover:bg-slate-50", equiposSeleccionados.includes(club.id) && "border-blue-500 bg-blue-50 ring-1 ring-blue-500")}>
                                    {/* Checkbox nativo para evitar errores si falta el componente */}
                                    <input type="checkbox" checked={equiposSeleccionados.includes(club.id)} readOnly className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
                                    <span className="text-sm font-medium">{club.nombre}</span>
                                </div>
                            ))}
                        </div>
                        <Button className="w-full" size="lg" onClick={handleGenerar} disabled={loading}>
                            {loading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <CheckSquare className="mr-2 h-4 w-4" />} Generar Fixture
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* VISTA 3: PREVIEW */}
            {step === 'preview' && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center bg-white p-4 rounded border shadow sticky top-4 z-20">
                        <span className="font-bold text-lg">Vista Previa - Serie {division}</span>
                        <Button onClick={handleGuardar} disabled={loading} className="bg-green-600 hover:bg-green-700">Confirmar y Guardar</Button>
                    </div>
                    <div className="text-center py-10 text-gray-400 border-2 border-dashed rounded bg-slate-50">
                        <p>Se generaron {fixtureData.length} fechas.</p>
                        <p className="text-xs">Revisa el fixture en el Dashboard después de guardar.</p>
                    </div>
                </div>
            )}
        </div>
    );
}