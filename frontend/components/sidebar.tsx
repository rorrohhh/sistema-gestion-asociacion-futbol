"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, UserPlus, Settings, Trophy, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
const sidebarItems = [
    {
        title: "Dashboard",
        href: "/",
        icon: LayoutDashboard,
    },
    {
        title: "Inscribir Jugador",
        href: "/inscribir",
        icon: UserPlus,
    },
    // Add more items as needed
];
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
                        const isActive = pathname === item.href;
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