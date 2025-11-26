import { ClubForm } from "@/components/club-form";
import Link from 'next/link';
import { ArrowLeft, Trophy } from 'lucide-react';

/**
 * Página para el formulario de registro de un nuevo club.
 */
export default function NuevoClubPage() {
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
                {/* El componente ClubForm se encarga del título y los estilos */}
                <ClubForm />
            </div>
        </div>
    );
}