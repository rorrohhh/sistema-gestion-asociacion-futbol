import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Building2, PlusCircle } from 'lucide-react';
import { ClubesTable } from "@/components/clubes-table";

/**
 * Página para la gestión y listado de Clubes con layout de dos columnas.
 */
export default function ClubesPage() {
    return (
        <div className="p-4 space-y-8">
            {/* Header Section */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Clubes</h1>
                    <p className="text-slate-500 dark:text-slate-400">Administra los clubes inscritos.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-5 sticky top-24">
                        <div className="flex items-center gap-2 mb-6 text-slate-800 dark:text-slate-200 font-semibold">
                            <Building2 className="h-5 w-5" />
                            <h2>Acciones</h2>
                        </div>

                        {/* Botón Nuevo Club */}
                        <Link href="/clubes/nuevo" className="w-full">
                            <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all">
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Agregar Equipo
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Right Column: Clubes Table */}
                <div className="lg:col-span-3 space-y-4">
                    <ClubesTable />
                </div>
            </div>
        </div>
    );
}