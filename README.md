# Sistema de Gestión de Asociación de Fútbol

Bienvenido al repositorio del Sistema de Gestión de Asociación de Fútbol. Este proyecto es una aplicación web completa diseñada para administrar clubes, jugadores y procesos de inscripción.

El sistema está dividido en dos componentes principales:

- **Backend**: API RESTful construida con Node.js, Express y MySQL.
- **Frontend**: Interfaz de usuario moderna construida con Next.js, React y Tailwind CSS.

## 🚀 Inicio Rápido

Para ejecutar el sistema completo, necesitarás iniciar tanto el backend como el frontend en terminales separadas.

### 1. Configuración del Backend

El backend maneja la lógica de negocio y la conexión a la base de datos.

1.  Navega a la carpeta `backend`:
    ```bash
    cd backend
    ```
2.  Instala las dependencias:
    ```bash
    npm install
    ```
3.  Configura las variables de entorno en un archivo `.env` (ver `backend/README.md` para detalles).
4.  Inicia el servidor:
    ```bash
    npm run dev
    ```

### 2. Configuración del Frontend

El frontend proporciona la interfaz para interactuar con el sistema.

1.  Abre una nueva terminal y navega a la carpeta `frontend`:
    ```bash
    cd frontend
    ```
2.  Instala las dependencias:
    ```bash
    npm install
    ```
3.  Inicia el servidor de desarrollo:
    ```bash
    npm run dev
    ```

La aplicación estará disponible en `http://localhost:3000`.

## 🛠️ Tecnologías Utilizadas

### Backend
- **Node.js & Express**: Núcleo de la API.
- **Sequelize & MySQL**: Gestión de base de datos.

### Frontend
- **Next.js 15 & React 19**: Framework y biblioteca de UI.
- **Tailwind CSS & Shadcn UI**: Estilizado y componentes.
- **Zod & React Hook Form**: Manejo de datos y validación.

## 📚 Documentación Detallada

Cada subproyecto tiene su propia documentación detallada:

- [Documentación del Backend](./backend/README.md): Detalles sobre endpoints, modelos y configuración avanzada.
- [Documentación del Frontend](./frontend/README.md): Estructura de componentes, rutas y configuración de UI.
