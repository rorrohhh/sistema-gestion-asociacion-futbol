'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
    Search,
    CreditCard,
    Hash,
    Building2,
    Globe,
    ListFilter,
    Eraser
} from 'lucide-react';
import type { Club, FilterParams } from '@/types';

const formatRut = (rut: string) => {
    const clean = rut.replace(/[^0-9kK]/g, '');
    if (clean.length <= 1) return clean;
    const body = clean.slice(0, -1);
    const dv = clean.slice(-1).toUpperCase();
    const formattedBody = body.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return `${formattedBody}-${dv}`;
};

const isPassport = (val: string) => {
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
    const showPassportIcon = filters.identificacion && isPassport(filters.identificacion);

    return (
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm h-fit bg-white dark:bg-slate-900 overflow-hidden relative lg:sticky lg:top-6">
            <CardHeader className="bg-slate-50/50 dark:bg-slate-800/50 px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <ListFilter className="h-3 w-3 text-blue-600" />
                    Filtros de Búsqueda
                </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 pt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
                <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                    <Label htmlFor="club" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Institución / Club
                    </Label>
                    <div className="relative group">
                        <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 group-hover:text-blue-500 transition-colors z-10" />
                        <Select
                            value={filters.club || undefined}
                            onValueChange={(value) => handleChange('club', value)}
                        >
                            <SelectTrigger id="club" className="pl-9 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus:ring-blue-500 text-sm">
                                <SelectValue placeholder="TODOS" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="todos" className="font-semibold text-slate-500">
                                    TODOS
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

                <Separator className="bg-slate-100 dark:bg-slate-800 sm:col-span-2 lg:col-span-1" />

                <div className="space-y-2 col-span-1">
                    <Label htmlFor="nombre" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Búsqueda por Nombre
                    </Label>
                    <div className="relative group">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
                        <Input
                            id="nombre"
                            type="text"
                            placeholder="Ej: Juan Pérez"
                            className="pl-9 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus-visible:ring-blue-500 text-sm"
                            value={filters.nombre || ''}
                            onChange={(e) => handleChange('nombre', e.target.value)}
                        />
                    </div>
                </div>

                <div className="space-y-2 col-span-1">
                    <Label htmlFor="identificacion" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Documento (RUT / Pasaporte)
                    </Label>
                    <div className="relative group">
                        {showPassportIcon ? (
                            <Globe className="absolute left-3 top-2.5 h-4 w-4 text-indigo-500 animate-in fade-in zoom-in" />
                        ) : (
                            <CreditCard className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
                        )}

                        <Input
                            id="identificacion"
                            type="text"
                            placeholder="12.345.678-9"
                            className="pl-9 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus-visible:ring-blue-500 font-mono text-sm"
                            value={
                                filters.identificacion && isPassport(filters.identificacion)
                                    ? filters.identificacion
                                    : formatRut(filters.identificacion || '')
                            }
                            onChange={(e) => {
                                const rawValue = e.target.value;
                                if (isPassport(rawValue)) {
                                    handleChange('identificacion', rawValue.toUpperCase());
                                } else {
                                    const cleanValue = rawValue.replace(/[^0-9kK]/g, '').toUpperCase();
                                    handleChange('identificacion', cleanValue);
                                }
                            }}
                        />
                    </div>
                </div>

                <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                    <Label htmlFor="folio" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Número de Folio
                    </Label>
                    <div className="relative group">
                        <Hash className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
                        <Input
                            id="folio"
                            type="text"
                            placeholder="000123"
                            className="pl-9 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus-visible:ring-blue-500 font-mono text-sm"
                            value={filters.folio || ''}
                            onChange={(e) => handleChange('folio', e.target.value)}
                        />
                    </div>
                </div>

                {hasFilters && (
                    <div className="pt-2 animate-in slide-in-from-top-2 fade-in sm:col-span-2 lg:col-span-1">
                        <Button
                            variant="outline"
                            onClick={onClear}
                            className="w-full border-dashed border-slate-300 dark:border-slate-700 text-slate-500 hover:text-red-600 hover:border-red-200 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all text-xs uppercase tracking-wide"
                            size="sm"
                        >
                            <Eraser className="mr-2 h-3.5 w-3.5" />
                            Limpiar Filtros
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}