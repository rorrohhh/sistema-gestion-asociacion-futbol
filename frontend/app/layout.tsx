import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Sidebar } from "@/components/sidebar";
import { MobileNavbar } from "@/components/mobile-navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sistema Gestión de Fútbol",
  description: "Sistema de gestión de asociación de fútbol - MVP",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-50 dark:bg-slate-950`}
      >
        {/* CORRECCIÓN AQUÍ:
            1. h-screen: Fija la altura a la ventana (evita scroll infinito del body).
            2. flex-col: En celular, pone el Navbar ARRIBA y el contenido ABAJO.
            3. md:flex-row: En escritorio, cambia a FILA (Sidebar IZQUIERDA, contenido DERECHA).
         */}
        <div className="flex h-screen flex-col md:flex-row overflow-hidden">

          {/* El Sidebar ya tiene "hidden md:flex", así que desaparece solo en móvil */}
          <Sidebar />

          {/* El MobileNavbar ya tiene "md:hidden", así que desaparece solo en escritorio */}
          <MobileNavbar />

          {/* main: 
             - flex-1: Ocupa todo el espacio SOBRANTE (resta la altura del navbar en móvil o el ancho del sidebar en desktop).
             - overflow-y-auto: Permite scroll SOLO dentro del contenido, no en toda la página.
             - h-full: Asegura que use la altura disponible.
          */}
          <main className="flex-1 overflow-y-auto h-full">
            {children}
          </main>
        </div>
        <Toaster />
      </body>
    </html>
  );
}