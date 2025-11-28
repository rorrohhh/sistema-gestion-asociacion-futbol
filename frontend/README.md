# Frontend - Sistema Gestión Asociación Fútbol

Interfaz de usuario moderna para la gestión de la asociación de fútbol, construida con Next.js 16 y Tailwind CSS.

## Tecnologías

- **Next.js 16** (App Router)
- **React 19**
- **Tailwind CSS 4**
- **Shadcn UI** (Componentes de UI basados en Radix)
- **React Hook Form** + **Zod** (Manejo de formularios y validación)
- **Axios** (Cliente HTTP)

## Requisitos Previos

- Node.js (v18 o superior recomendado)
- Backend corriendo en paralelo (por defecto en puerto 4000)

## Configuración y Ejecución

1.  **Instalar dependencias:**

    ```bash
    npm install
    ```

2.  **Configurar variables de entorno:**
    Crea un archivo `.env.local` en la raíz del frontend si no existe.
    
    ```env
    NEXT_PUBLIC_API_URL=http://localhost:4000/api
    ```

3.  **Ejecutar en desarrollo:**

    ```bash
    npm run dev
    ```
    La aplicación estará disponible en `http://localhost:3000`.

4.  **Construir para producción:**

    ```bash
    npm run build
    npm start
    ```

## Estructura del Proyecto

- `app/`: Rutas y páginas (App Router).
- `components/`: Componentes reutilizables (UI, Tablas, Formularios).
- `lib/`: Utilidades y configuración (Axios, Utils).
- `hooks/`: Custom hooks (ej: `useCountdown`).
- `public/`: Archivos estáticos.

## Funcionalidades Principales

- **Gestión de Clubes:** Alta, baja y modificación de clubes.
- **Gestión de Jugadores:**
  - Inscripción con validación de RUT/Pasaporte.
  - Subida de fotografía.
  - Listado con filtros avanzados (Club, Nombre, RUT).
- **Pases:** Sistema de transferencias entre clubes con historial.
- **Campeonato:**
  - Generación automática de Fixture (Todos contra todos).
  - Programación de partidos.
  - Registro de resultados y suspensiones.
  - Tabla de posiciones automática.
