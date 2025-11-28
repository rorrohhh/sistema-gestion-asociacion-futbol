# Sistema de Gestión para Asociación de Fútbol - Backend

Este proyecto es el núcleo (API RESTful) de una plataforma integral diseñada para digitalizar y administrar las operaciones de una asociación de fútbol amateur o profesional. Su objetivo principal es centralizar la información de clubes, jugadores y el desarrollo de los campeonatos.

El sistema permite llevar un control riguroso desde la inscripción de un jugador hasta la generación automática de la tabla de posiciones tras cada fecha.

## 🚀 Funcionalidades Principales

### 1. Gestión de Clubes
Administración completa de las entidades deportivas que participan en la asociación.
- **Registro y Edición:** Alta de nuevos clubes y actualización de sus datos básicos.
- **Visualización:** Listado ordenado para fácil acceso.

### 2. Gestión de Jugadores (Ficha Digital)
El sistema maneja un expediente digital completo para cada deportista.
- **Identificación Flexible:** Soporte para **RUT** (con validación de dígito verificador) y **Pasaporte** para jugadores extranjeros.
- **Datos Personales:** Registro de nombres, fecha de nacimiento, nacionalidad y fotografía digital.
- **Control de Roles:** Clasificación de jugadores (ej. Jugador, Arquero, Capitán).
- **Estado:** Control de jugadores activos/inactivos.
- **Validaciones:** Evita duplicidad de registros mediante validación estricta de identificación.

### 3. Sistema de Pases y Transferencias
Módulo dedicado al movimiento de jugadores entre clubes, asegurando la integridad de la competencia.
- **Historial de Transferencias:** Registro inmutable de todos los movimientos de un jugador a lo largo de su carrera en la asociación.
- **Transacciones Seguras:** El sistema garantiza que un jugador no pueda estar en dos clubes al mismo tiempo.
- **Registro de Delegados:** Se almacena quién autorizó o realizó el trámite del pase.

### 4. Gestión de Campeonatos y Partidos
Motor de gestión deportiva que administra el ciclo de vida del torneo.
- **Generación de Fixture:** Herramienta para crear el calendario de partidos (todos contra todos), permitiendo ajustes manuales antes de oficializarlo.
- **Programación:** Definición de fechas, horarios y series para cada encuentro.
- **Control de Resultados:** Carga de goles locales y visitantes.
- **Suspensiones:** Capacidad para suspender partidos, asignar responsabilidad a un equipo (si aplica) y registrar los motivos.
- **Reprogramación:** Funcionalidad para cambiar la fecha/hora de partidos postergados.

### 5. Tabla de Posiciones Automatizada
Cálculo automático de la tabla de posiciones en tiempo real basado en los resultados registrados.
- **Criterios:** Puntos, Partidos Jugados (PJ), Ganados (PG), Empatados (PE), Perdidos (PP), Goles a Favor (GF), Goles en Contra (GC) y Diferencia de Gol (DIF).
- **Reglas de Puntuación:** Configurable por serie (ej. 3 puntos por victoria).
- **Manejo de Suspensiones:** La tabla refleja correctamente los puntos otorgados o quitados en caso de partidos suspendidos con culpa de un equipo.

---

## 🛠️ Tecnologías Utilizadas

El backend está construido con tecnologías robustas y escalables:

- **Node.js & Express:** Para el servidor y manejo de rutas API.
- **Sequelize ORM:** Para la interacción segura y estructurada con la base de datos.
- **MySQL:** Motor de base de datos relacional.
- **Multer:** Gestión de subida de archivos (fotografías de jugadores).

---

## ⚙️ Instalación y Configuración

Si deseas levantar este proyecto en tu entorno local:

1.  **Instalar dependencias:**
    ```bash
    npm install
    ```

2.  **Configuración de Entorno:**
    Crea un archivo `.env` en la raíz con las credenciales de tu base de datos y puerto:
    ```env
    PORT=4000
    DB_NAME=nombre_base_datos
    DB_USER=usuario
    DB_PASS=contraseña
    DB_HOST=localhost
    ```

3.  **Base de Datos:**
    Ejecuta las migraciones para crear la estructura de tablas:
    ```bash
    npm run migrate
    ```

4.  **Iniciar Servidor:**
    ```bash
    npm run dev  # Modo desarrollo
    npm start    # Modo producción
    ```

---

## 📡 Documentación Rápida de API

A continuación, un resumen de los endpoints disponibles para integración:

| Recurso | Método | Endpoint | Descripción |
| :--- | :--- | :--- | :--- |
| **Clubes** | GET | `/api/clubes` | Listar todos los clubes |
| | POST | `/api/clubes` | Crear un nuevo club |
| **Jugadores** | GET | `/api/jugadores` | Listar con filtros (club, rut, nombre) |
| | POST | `/api/jugadores` | Inscribir jugador (Multipart/form-data) |
| **Pases** | POST | `/api/pases` | Realizar transferencia de jugador |
| | GET | `/api/pases/historial/:id` | Ver historial de un jugador |
| **Partidos** | GET | `/api/partidos` | Ver fixture |
| | GET | `/api/partidos/tabla` | Obtener tabla de posiciones calculada |
| | PUT | `/api/partidos/:id/resultado` | Cargar resultado de partido |
