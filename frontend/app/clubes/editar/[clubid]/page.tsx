'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { api } from '@/lib/api';
import { Club } from '@/types';
import { notFound } from 'next/navigation';
import { ClubForm } from '@/components/club-form';
import { ArrowLeft, Trophy, Loader2 } from 'lucide-react';
import Link from 'next/link';

// Extracción de ID de la URL
const extractIdFromPath = (pathname: string): string | null => {
    const parts = pathname.split('/');
    // Intentamos obtener el último segmento, que debería ser el ID
    return parts[parts.length - 1] || null;
};

// Convertimos el componente principal en una función síncrona
export default function ClubEditarPage() {
    const pathname = usePathname();
    const [club, setClub] = useState<Club | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [clubId, setClubId] = useState<string | null>(null);

    // Función que llama a la API, ahora espera un 'string' explícito
    async function loadClubData(id: string) {
        try {
            // FIX: 'id' es un string válido aquí
            const clubData = await api.getClubPorId(id);
            setClub(clubData);
        } catch (error) {
            console.error("Error al cargar el club:", error);
            // Si la API falla (e.g., club no existe), forzamos el notFound()
            notFound();
        } finally {
            setIsLoading(false);
        }
    }

    // Efecto para obtener el ID y cargar los datos
    useEffect(() => {
        const id = extractIdFromPath(pathname);
        setClubId(id);

        // Comprobación de seguridad para evitar llamar a la API con null
        if (!id) {
            setIsLoading(false);
            return;
        }

        // Llamamos a la función con el ID validado
        loadClubData(id);
    }, [pathname]);

    // Loader
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <p className="ml-3 text-slate-600 dark:text-slate-400">Cargando datos del club ID: {clubId || '...'}</p>
            </div>
        );
    }

    // Si la carga terminó y no tenemos club, es porque la API falló (404)
    if (!club) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="bg-blue-600 p-2 rounded-lg">
                            <Trophy className="h-5 w-5 text-white" />
                        </div>
                        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent hidden sm:block">
                            Gestión Fútbol
                        </h1>
                    </div>
                </div>
            </header>
            <div className="max-w-6xl mx-auto py-8 px-4">
                <div className="mb-8 flex items-center justify-between">
                    <Link
                        href="/clubes"
                        className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors py-2"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Volver al Listado de Clubes
                    </Link>
                </div>

                <h1 className="text-3xl font-bold mb-6 text-slate-900 dark:text-white">
                    Editar Club: {club.nombre}
                </h1>

                <ClubForm club={club} />
            </div>
        </div>
    );
}