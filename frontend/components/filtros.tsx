'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Search, CreditCard, Hash, X, Building2 } from 'lucide-react';
import type { Club, FilterParams } from '@/types';

interface FiltrosProps {
    clubes: Club[];
    filters: FilterParams;
    onFilterChange: (filters: FilterParams) => void;
    onClear: () => void;
}

export function Filtros({ clubes, filters, onFilterChange, onClear }: FiltrosProps) {
    const handleChange = (key: keyof FilterParams, value: string) => {
        onFilterChange({
            ...filters,
            [key]: value || undefined,
        });
    };

    const hasFilters = Object.values(filters).some(value => value !== undefined && value !== '');

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

            {/* Filtro por RUT */}
            <div className="space-y-2">
                <Label htmlFor="rut" className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    RUT
                </Label>
                <div className="relative">
                    <CreditCard className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                        id="rut"
                        type="text"
                        placeholder="12345678-9"
                        className="pl-9 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                        value={filters.rut || ''}
                        onChange={(e) => handleChange('rut', e.target.value)}
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
