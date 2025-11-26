# Backend - Sistema de Gestión de Asociación de Fútbol

Este directorio contiene la API RESTful para el sistema de gestión, construida con Node.js, Express y Sequelize (MySQL).

## 🛠️ Tecnologías

- **Node.js**: Entorno de ejecución.
- **Express**: Framework web.
- **Sequelize**: ORM para base de datos SQL.
- **MySQL**: Base de datos relacional.
- **Dotenv**: Gestión de variables de entorno.

## 📋 Requisitos Previos

- Node.js (v18 o superior recomendado)
- MySQL Server en ejecución

## 🚀 Instalación

1. Navega al directorio del backend:
   ```bash
   cd backend
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

## ⚙️ Configuración

Crea un archivo `.env` en la raíz del directorio `backend` con las siguientes variables:

```env
DB_NAME=nombre_de_tu_base_de_datos
DB_USER=tu_usuario_mysql
DB_PASS=tu_contraseña_mysql
DB_HOST=localhost
PORT=4000
```

> **Nota**: Sequelize sincronizará automáticamente los modelos (`force: false`), creando las tablas si no existen sin borrar datos.

## ▶️ Ejecución

### Desarrollo
Para ejecutar el servidor con recarga automática (nodemon):
```bash
npm run dev
```

### Producción
Para iniciar el servidor normalmente:
```bash
npm start
```

El servidor se iniciará por defecto en `http://localhost:4000`.

## 📂 Estructura del Proyecto

```
backend/
├── src/
│   ├── config/         # Configuración de DB (Sequelize)
│   ├── models/         # Modelos de datos (Club, Jugador)
│   ├── routes/         # Definición de rutas de la API
│   ├── app.js          # Configuración de Express y Middlewares
│   └── ...
├── server.js           # Punto de entrada del servidor
├── package.json        # Dependencias y scripts
└── ...
```

## 🔌 Endpoints Principales

La API expone los siguientes recursos base:

- **Clubes**: `/api/clubes`
- **Jugadores**: `/api/jugadores`

Para más detalles sobre los endpoints, consulta el archivo `API_DOCUMENTATION.md` (si está disponible) o revisa los archivos en `src/routes/`.
