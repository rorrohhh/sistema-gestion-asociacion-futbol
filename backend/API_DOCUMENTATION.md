# Documentación de la API - Sistema de Gestión Asociación Fútbol

Esta API permite gestionar los clubes y jugadores de la asociación de fútbol.

**Base URL**: `/api`

---

## 1. Clubes

Gestión de los clubes de fútbol.

**Endpoint Base**: `/api/clubes`

### Modelo de Datos (Club)

| Campo  | Tipo    | Descripción                  |
| :----- | :------ | :--------------------------- |
| `id`   | Integer | Identificador único (PK)     |
| `nombre`| String  | Nombre del club (Único)      |

### Endpoints

#### 1.1 Listar Clubes
Obtiene una lista de todos los clubes, ordenados alfabéticamente por nombre.

- **Método**: `GET`
- **URL**: `/`
- **Respuesta Exitosa (200 OK)**:
  ```json
  [
    {
      "id": 1,
      "nombre": "CLUB DEPORTIVO EJEMPLO"
    },
    ...
  ]
  ```

#### 1.2 Crear Club
Registra un nuevo club. El nombre se guarda automáticamente en mayúsculas.

- **Método**: `POST`
- **URL**: `/`
- **Cuerpo de la Petición (JSON)**:
  ```json
  {
    "nombre": "Nuevo Club"
  }
  ```
- **Respuesta Exitosa (201 Created)**:
  ```json
  {
    "id": 2,
    "nombre": "NUEVO CLUB"
  }
  ```
- **Errores**:
  - `404 Bad Request`: Si el club ya existe o hay error de validación.

#### 1.3 Obtener Club
Obtiene los detalles de un club específico por su ID.

- **Método**: `GET`
- **URL**: `/:id`
- **Respuesta Exitosa (200 OK)**:
  ```json
  {
    "id": 1,
    "nombre": "CLUB DEPORTIVO EJEMPLO"
  }
  ```
- **Errores**:
  - `404 Not Found`: Si el club no existe.

#### 1.4 Actualizar Club
Actualiza el nombre de un club existente.

- **Método**: `PUT`
- **URL**: `/:id`
- **Cuerpo de la Petición (JSON)**:
  ```json
  {
    "nombre": "Nombre Actualizado"
  }
  ```
- **Respuesta Exitosa (200 OK)**:
  ```json
  {
    "message": "Club actualizado"
  }
  ```

#### 1.5 Eliminar Club
Elimina un club. No se puede eliminar si tiene jugadores asociados.

- **Método**: `DELETE`
- **URL**: `/:id`
- **Respuesta Exitosa (200 OK)**:
  ```json
  {
    "message": "Club eliminado"
  }
  ```
- **Errores**:
  - `400 Bad Request`: Si el club tiene jugadores asociados (violación de llave foránea).

---

## 2. Jugadores

Gestión de los jugadores inscritos en los clubes.

**Endpoint Base**: `/api/jugadores`

### Modelo de Datos (Jugador)

| Campo        | Tipo    | Descripción                                      |
| :----------- | :------ | :----------------------------------------------- |
| `id`         | Integer | Identificador único (PK)                         |
| `numero`     | Integer | Número de camiseta                               |
| `paterno`    | String  | Apellido Paterno                                 |
| `materno`    | String  | Apellido Materno                                 |
| `nombres`    | String  | Nombres                                          |
| `rut`        | Integer | Parte numérica del RUT                           |
| `dv`         | String  | Dígito Verificador                               |
| `rol`        | String  | Rol del jugador (ej. "Jugador", "Arquero")       |
| `nacimiento` | Date    | Fecha de nacimiento (YYYY-MM-DD)                 |
| `inscripcion`| Date    | Fecha de inscripción (YYYY-MM-DD)                |
| `clubId`     | Integer | ID del club al que pertenece (FK)                |

### Endpoints

#### 2.1 Listar Jugadores
Obtiene una lista de jugadores. Soporta filtros opcionales.

- **Método**: `GET`
- **URL**: `/`
- **Parámetros de Consulta (Query Params)**:
  - `club`: ID del club para filtrar.
  - `rol`: Rol del jugador para filtrar.
  - `rut`: RUT para buscar (limpia formato automáticamente).
  - `nombre`: Busca coincidencia parcial en nombres, apellido paterno o materno.
- **Ejemplo**: `/api/jugadores?club=1&nombre=juan`
- **Respuesta Exitosa (200 OK)**:
  ```json
  [
    {
      "id": 1,
      "numero": 10,
      "paterno": "PEREZ",
      "materno": "GONZALEZ",
      "nombres": "JUAN",
      "rut": 12345678,
      "dv": "9",
      "rol": "Jugador",
      "nacimiento": "1990-01-01",
      "inscripcion": "2023-01-01",
      "clubId": 1,
      "Club": {
        "id": 1,
        "nombre": "CLUB DEPORTIVO EJEMPLO"
      }
    },
    ...
  ]
  ```

#### 2.2 Crear Jugador
Registra un nuevo jugador. Valida y formatea el RUT automáticamente.

- **Método**: `POST`
- **URL**: `/`
- **Cuerpo de la Petición (JSON)**:
  ```json
  {
    "numero": 10,
    "paterno": "Perez",
    "materno": "Gonzalez",
    "nombres": "Juan",
    "run_input": "12.345.678-9", // Puede venir con puntos y guión
    "rol_input": "Jugador",
    "nacimiento": "1990-01-01",
    "inscripcion": "2023-01-01",
    "club_id": 1
  }
  ```
- **Respuesta Exitosa (201 Created)**:
  Retorna el objeto del jugador creado.
- **Errores**:
  - `400 Bad Request`: Si el RUT es inválido.

#### 2.3 Obtener Jugador
Obtiene los detalles de un jugador por su ID.

- **Método**: `GET`
- **URL**: `/:id`
- **Respuesta Exitosa (200 OK)**:
  Objeto jugador con datos del Club incluido.
- **Errores**:
  - `404 Not Found`: Si el jugador no existe.

#### 2.4 Actualizar Jugador
Actualiza los datos de un jugador.

- **Método**: `PUT`
- **URL**: `/:id`
- **Cuerpo de la Petición (JSON)**:
  Mismos campos que en Crear Jugador. Si se envía `run_input`, se recalcula el RUT y DV.
- **Respuesta Exitosa (200 OK)**:
  ```json
  {
    "message": "Actualizado"
  }
  ```

#### 2.5 Eliminar Jugador
Elimina un jugador del sistema.

- **Método**: `DELETE`
- **URL**: `/:id`
- **Respuesta Exitosa (200 OK)**:
  ```json
  {
    "message": "Eliminado"
  }
  ```
