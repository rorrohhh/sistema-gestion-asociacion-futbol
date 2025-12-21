"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LayoutDashboard, Users, Settings, Trophy, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const sidebarItems = [
    {
        title: "Dashboard",
        href: "/",
        icon: LayoutDashboard,
    },
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

export function MobileNavbar() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    return (
        <div className="md:hidden flex flex-col w-full flex-none bg-slate-950 border-b border-slate-800 text-white">
            {/* Barra Superior */}
            <div className="flex items-center justify-between p-4 h-16">
                {/* Logo */}
                <div className="flex items-center">
                    <Trophy className="h-6 w-6 text-blue-500 mr-2" />
                    <span className="text-lg font-bold">AFESA</span>
                </div>

                {/* Botón Hamburguesa */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-2 text-slate-400 hover:text-white focus:outline-none"
                >
                    {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
            </div>

            {/* Menú Desplegable (Solo visible si isOpen es true) */}
            {isOpen && (
                <div className="absolute top-16 left-0 right-0 z-50 h-[calc(100vh-4rem)] bg-slate-950 p-4 border-b border-slate-800 shadow-xl overflow-y-auto">
                    <nav className="space-y-2">
                        {sidebarItems.map((item) => {
                            const isActive = item.href === "/"
                                ? pathname === "/"
                                : pathname.startsWith(item.href);

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setIsOpen(false)} // Cerrar menú al hacer clic
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
            )}
        </div>
    );
}