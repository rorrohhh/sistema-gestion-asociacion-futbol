'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
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

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Filtro por Club */}
            <div className="space-y-2">
                <Label htmlFor="club">Club</Label>
                <Select
                    value={filters.club || undefined}
                    onValueChange={(value) => handleChange('club', value)}
                >
                    <SelectTrigger id="club">
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

            {/* Filtro por Nombre */}
            <div className="space-y-2">
                <Label htmlFor="nombre">Nombre/Apellido</Label>
                <Input
                    id="nombre"
                    type="text"
                    placeholder="Buscar por nombre..."
                    value={filters.nombre || ''}
                    onChange={(e) => handleChange('nombre', e.target.value)}
                />
            </div>

            {/* Filtro por RUT */}
            <div className="space-y-2">
                <Label htmlFor="rut">RUT</Label>
                <Input
                    id="rut"
                    type="text"
                    placeholder="Ejemplo: 12345678"
                    value={filters.rut || ''}
                    onChange={(e) => handleChange('rut', e.target.value)}
                />
            </div>

            {/* Filtro por ROL */}
            <div className="space-y-2">
                <Label htmlFor="rol">ROL</Label>
                <Input
                    id="rol"
                    type="text"
                    placeholder="Buscar por ROL..."
                    value={filters.rol || ''}
                    onChange={(e) => handleChange('rol', e.target.value)}
                />
            </div>

            {/* Botón Limpiar Filtros */}
            <div className="flex items-end">
                <Button
                    variant="outline"
                    onClick={onClear}
                    className="w-full"
                >
                    Limpiar filtros
                </Button>
            </div>
        </div>
    );
}
