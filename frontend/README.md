# Frontend - Sistema de Gestión de Asociación de Fútbol

Este directorio contiene la interfaz de usuario del sistema, construida con Next.js 15 (App Router), React 19 y Tailwind CSS.

## 🛠️ Tecnologías Principales

- **Next.js 15**: Framework de React para producción (App Router).
- **React 19**: Biblioteca para construir interfaces de usuario.
- **Tailwind CSS v4**: Framework de utilidades CSS.
- **Shadcn UI**: Componentes de interfaz reutilizables (basados en Radix UI).
- **React Hook Form**: Gestión de formularios.
- **Zod**: Validación de esquemas.
- **Lucide React**: Iconos.
- **Axios**: Cliente HTTP para conectar con el backend.

## 📋 Requisitos Previos

- Node.js (v18 o superior recomendado)
- Backend en ejecución (para funcionalidad completa)

## 🚀 Instalación

1. Navega al directorio del frontend:
   ```bash
   cd frontend
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

## ⚙️ Configuración

Crea un archivo `.env.local` en la raíz del directorio `frontend` si necesitas configurar variables de entorno específicas (por ejemplo, la URL del backend si es diferente a la predeterminada).

Ejemplo:
```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

## ▶️ Ejecución

### Desarrollo
Para iniciar el servidor de desarrollo:
```bash
npm run dev
```
La aplicación estará disponible en `http://localhost:3000`.

### Producción
Para construir y ejecutar la versión de producción:
```bash
npm run build
npm start
```

## 📂 Estructura del Proyecto

```
frontend/
├── app/                # Páginas y rutas (App Router)
├── components/         # Componentes reutilizables (UI, Tablas, Formularios)
│   ├── ui/             # Componentes base de Shadcn UI
│   └── ...
├── lib/                # Utilidades y funciones auxiliares
├── public/             # Archivos estáticos
├── types/              # Definiciones de tipos TypeScript
├── package.json        # Dependencias y scripts
└── ...
```

## 🎨 Características

- **Diseño Responsivo**: Adaptable a diferentes tamaños de pantalla.
- **Modo Oscuro**: Soporte nativo para temas claro y oscuro.
- **Validación de Formularios**: Implementada con Zod y React Hook Form.
- **Tablas Interactivas**: Listados con filtros y acciones.
