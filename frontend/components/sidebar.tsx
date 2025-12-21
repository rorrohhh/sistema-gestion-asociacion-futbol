"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Settings, Trophy, LogOut, CalendarDays } from "lucide-react"; // Agregué CalendarDays opcionalmente, pero usaremos Trophy o Calendar
import { cn } from "@/lib/utils";

const sidebarItems = [
    {
        title: "Dashboard",
        href: "/",
        icon: LayoutDashboard,
    },
    // {
    //     title: "Torneo", // --- NUEVA PESTAÑA ---
    //     href: "/torneo",
    //     icon: CalendarDays, // Usamos un calendario para diferenciarlo del logo (o usa Trophy)
    // },
    {
        title: "Jugadores",
        href: "/jugadores",
        icon: Users,
    },
    {
        title: "Clubes",
        href: "/clubes",
        icon: Settings,
    },
];

export function Sidebar() {
    const pathname = usePathname();
    return (
        <div className="flex h-screen w-64 flex-col bg-slate-950 text-white border-r border-slate-800 flex-shrink-0">
            {/* Header del Sidebar */}
            <div className="flex h-16 items-center px-6 border-b border-slate-800">
                <Trophy className="h-6 w-6 text-blue-500 mr-2" />
                <span className="text-lg font-bold">AFESA</span>
            </div>

            {/* Lista de Navegación */}
            <div className="flex-1 overflow-y-auto py-4">
                <nav className="space-y-1 px-2">
                    {sidebarItems.map((item) => {
                        // Lógica para marcar activo (El Dashboard "/" es estricto, el resto inclusivo)
                        const isActive = item.href === "/"
                            ? pathname === "/"
                            : pathname.startsWith(item.href);

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

            {/* Footer / Cerrar Sesión */}
            {/* <div className="p-4 border-t border-slate-800">
                <button className="flex w-full items-center px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors">
                    <LogOut className="mr-3 h-5 w-5" />
                    Cerrar Sesión
                </button>
            </div> */}
        </div>
    );
}