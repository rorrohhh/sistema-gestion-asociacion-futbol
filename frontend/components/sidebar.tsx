"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Settings, Trophy, LogOut } from "lucide-react"; // Importamos Users
import { cn } from "@/lib/utils";

const sidebarItems = [
    {
        title: "Dashboard", // Apunta a / (Métricas)
        href: "/",
        icon: LayoutDashboard,
    },
    {
        title: "Jugadores", // Apunta a /jugadores (Filtros y Tabla)
        href: "/jugadores",
        icon: Users,
    },
    {
        title: "Clubes", // Apunta a /clubes (Gestión de clubes)
        href: "/clubes",
        icon: Settings,
    },
    // Eliminado "Inscribir Jugador" del menú principal
];
// ... (El resto del componente Sidebar permanece igual)
export function Sidebar() {
    const pathname = usePathname();
    return (
        <div className="flex h-screen w-64 flex-col bg-slate-950 text-white border-r border-slate-800 flex-shrink-0">
            <div className="flex h-16 items-center px-6 border-b border-slate-800">
                <Trophy className="h-6 w-6 text-blue-500 mr-2" />
                <span className="text-lg font-bold">Gestión Fútbol</span>
            </div>
            <div className="flex-1 overflow-y-auto py-4">
                <nav className="space-y-1 px-2">
                    {sidebarItems.map((item) => {
                        // Regla para que solo el Dashboard esté activo en la raíz ("/")
                        const isActive = pathname === item.href || (item.href === "/" && pathname.length === 1);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                                    isActive
                                        ? "bg-blue-600 text-white"
                                        : "text-slate-400 hover:bg-slate-900 hover:text-white"
                                )}
                            >
                                <item.icon className="mr-3 h-5 w-5" />
                                {item.title}
                            </Link>
                        );
                    })}
                </nav>
            </div>
            <div className="p-4 border-t border-slate-800">
                <button className="flex w-full items-center px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors">
                    <LogOut className="mr-3 h-5 w-5" />
                    Cerrar Sesión
                </button>
            </div>
        </div>
    );
}