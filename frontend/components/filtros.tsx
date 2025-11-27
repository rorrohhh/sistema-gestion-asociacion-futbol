'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Search, CreditCard, Hash, X, Building2, Globe } from 'lucide-react'; // Agregamos Globe
import type { Club, FilterParams } from '@/types';

// Función auxiliar para formatear RUT visualmente
const formatRut = (rut: string) => {
    const clean = rut.replace(/[^0-9kK]/g, '');
    if (clean.length <= 1) return clean;
    const body = clean.slice(0, -1);
    const dv = clean.slice(-1).toUpperCase();
    const formattedBody = body.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return `${formattedBody}-${dv}`;
};

// Función para detectar si es Pasaporte (tiene letras que no son K al final)
const isPassport = (val: string) => {
    // Si tiene alguna letra que no sea k/K, asumimos pasaporte
    return /[a-jA-J l-zL-Z]/.test(val);
};

interface FiltrosProps {
    clubes: Club[];
    filters: FilterParams;
    onFilterChange: (filters: FilterParams) => void;
    onClear: () => void;
}

export function Filtros({ clubes, filters, onFilterChange, onClear }: FiltrosProps) {
    const handleChange = (key: keyof FilterParams, value: string) => {
        const finalValue = value === "todos" ? undefined : value;
        onFilterChange({
            ...filters,
            [key]: finalValue || undefined,
        });
    };

    const hasFilters = Object.values(filters).some(value => value !== undefined && value !== '');

    // Determinamos qué icono mostrar
    const showPassportIcon = filters.identificacion && isPassport(filters.identificacion);

    return (
        <div className="space-y-5">
            {/* Filtro por Club */}
            <div className="space-y-2">
                <Label htmlFor="club" className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Club
                </Label>
                <div className="relative">
                    <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 z-10" />
                    <Select
                        value={filters.club || undefined}
                        onValueChange={(value) => handleChange('club', value)}
                    >
                        <SelectTrigger id="club" className="pl-9 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                            <SelectValue placeholder="Todos los clubes" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="todos" className="font-semibold text-slate-500">
                                Todos los clubes
                            </SelectItem>
                            {clubes.map((club) => (
                                <SelectItem key={club.id} value={club.id.toString()}>
                                    {club.nombre}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Filtro por Nombre */}
            <div className="space-y-2">
                <Label htmlFor="nombre" className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Nombre / Apellido
                </Label>
                <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                        id="nombre"
                        type="text"
                        placeholder="Buscar..."
                        className="pl-9 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                        value={filters.nombre || ''}
                        onChange={(e) => handleChange('nombre', e.target.value)}
                    />
                </div>
            </div>

            {/* Filtro UNIFICADO: Identificación (RUT o Pasaporte) */}
            <div className="space-y-2">
                <Label htmlFor="identificacion" className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Identificación
                </Label>
                <div className="relative">
                    {/* Cambiamos el icono dinámicamente */}
                    {showPassportIcon ? (
                        <Globe className="absolute left-3 top-2.5 h-4 w-4 text-indigo-500 animate-in fade-in zoom-in" />
                    ) : (
                        <CreditCard className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 transition-all" />
                    )}

                    <Input
                        id="identificacion"
                        type="text"
                        placeholder="RUT o Pasaporte"
                        className="pl-9 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800"

                        // Lógica de visualización:
                        // Si parece pasaporte, mostramos tal cual. Si parece RUT, formateamos.
                        value={
                            filters.identificacion && isPassport(filters.identificacion)
                                ? filters.identificacion
                                : formatRut(filters.identificacion || '')
                        }

                        onChange={(e) => {
                            const rawValue = e.target.value;

                            // 1. Si detectamos formato pasaporte (letras), guardamos tal cual (uppercase)
                            if (isPassport(rawValue)) {
                                handleChange('identificacion', rawValue.toUpperCase());
                            }
                            // 2. Si parece RUT, limpiamos y guardamos solo números y K
                            else {
                                const cleanValue = rawValue.replace(/[^0-9kK]/g, '').toUpperCase();
                                handleChange('identificacion', cleanValue);
                            }
                        }}
                    />
                </div>
            </div>

            {/* Filtro por ROL */}
            <div className="space-y-2">
                <Label htmlFor="rol" className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    ROL
                </Label>
                <div className="relative">
                    <Hash className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                        id="rol"
                        type="text"
                        placeholder="N° de ROL"
                        className="pl-9 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                        value={filters.rol || ''}
                        onChange={(e) => handleChange('rol', e.target.value)}
                    />
                </div>
            </div>

            {/* Botón Limpiar Filtros */}
            {hasFilters && (
                <div className="pt-2">
                    <Button
                        variant="outline"
                        onClick={onClear}
                        className="w-full border-dashed border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                        size="sm"
                    >
                        <X className="mr-2 h-3 w-3" />
                        Limpiar filtros
                    </Button>
                </div>
            )}
        </div>
    );
}