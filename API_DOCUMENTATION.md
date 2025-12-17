# Documentación de la API - Asociación de Fútbol

Esta API permite gestionar clubes, jugadores, partidos y pases.
**URL Base:** `http://localhost:3000/api`

---

## 1. Clubes
**Endpoint Base:** `/clubes`

### Listar todos los clubes
- **Método:** `GET`
- **URL:** `/clubes`
- **Respuesta Exitosa (200 OK):**
```json
[
  {
    "id": 1,
    "nombre": "Club Deportivo Ejemplo",
    "logo": null,
    "createdAt": "2024-01-01T10:00:00.000Z",
    "updatedAt": "2024-01-01T10:00:00.000Z"
  }
]
```

### Obtener un club
- **Método:** `GET`
- **URL:** `/clubes/:id`
- **Ejemplo:** `/clubes/1`

### Crear Club
- **Método:** `POST`
- **URL:** `/clubes`
- **Cuerpo (JSON):**
```json
{
  "nombre": "Nuevo Club"
}
```

### Actualizar Club
- **Método:** `PUT`
- **URL:** `/clubes/:id`
- **Cuerpo (JSON):**
```json
{
  "nombre": "Club Actualizado"
}
```

### Eliminar Club
- **Método:** `DELETE`
- **URL:** `/clubes/:id`

---

## 2. Jugadores
**Endpoint Base:** `/jugadores`

### Listar Jugadores (Búsqueda)
- **Método:** `GET`
- **URL:** `/jugadores`
- **Parámetros de Consulta (Query Params):**
    - `club`: ID del club para filtrar.
    - `folio`: Número de folio para buscar.
    - `identificacion`: RUT o Pasaporte para buscar.
    - `nombre`: Busca por nombre, apellido paterno o materno.
- **Ejemplo:** `/jugadores?club=1&nombre=Juan`

### Crear Jugador
- **Método:** `POST`
- **URL:** `/jugadores`
- **Tipo de Contenido:** `multipart/form-data`
- **Campos:**
    - `paterno` (Text): Apellido Paterno
    - `materno` (Text): Apellido Materno
    - `nombres` (Text): Nombres
    - `tipo_identificacion_input` (Text): 'RUT' o 'PASSPORT'
    - `run_input` (Text): RUT (si tipo es RUT)
    - `passport_input` (Text): Pasaporte (si tipo es PASSPORT)
    - `nacimiento` (Date): YYYY-MM-DD
    - `inscripcion` (Date): YYYY-MM-DD
    - `club_id` (Number): ID del Club
    - `nacionalidad` (Text): 'Chilena', etc.
    - `delegado_input` (Text): Nombre del delegado
    - `activo` (Boolean): true/false
    - `foto` (File): Imagen del jugador (Opcional)

### Obtener un Jugador
- **Método:** `GET`
- **URL:** `/jugadores/:id`

### Actualizar Jugador
- **Método:** `PUT`
- **URL:** `/jugadores/:id`
- **Tipo de Contenido:** `multipart/form-data`
- **Campos:** Mismos que en Crear.

### Eliminar Jugador
- **Método:** `DELETE`
- **URL:** `/jugadores/:id`

---

## 3. Partidos y Fixture
**Endpoint Base:** `/partidos`

### Listar Partidos
- **Método:** `GET`
- **URL:** `/partidos`
- **Parámetros:** `?division=A` (o B)

### Tabla de Posiciones
- **Método:** `GET`
- **URL:** `/partidos/tabla`
- **Parámetros:** `?serie=1era&division=A`
- **Respuesta:**
```json
[
  {
    "club": "Club A",
    "pts": 10,
    "pj": 4,
    "pg": 3,
    "pe": 1,
    "pp": 0,
    "gf": 5,
    "gc": 1,
    "dif": 4
  }
]
```

### Generar Preview de Fixture
- **Método:** `POST`
- **URL:** `/partidos/preview`
- **Cuerpo (JSON):**
```json
{
  "fechaInicio": "2024-05-01",
  "horariosBase": ["10:00", "12:00"],
  "equiposIds": [1, 2, 3, 4]
}
```

### Guardar Fixture Masivo
- **Método:** `POST`
- **URL:** `/partidos/masivo`
- **Cuerpo (JSON):**
```json
{
  "division": "A",
  "fixtureConfirmado": [
    {
      "numero": 1,
      "enfrentamientos": [
        {
          "local": { "id": 1 },
          "visita": { "id": 2 },
          "partidos": [
             { "serie": "1era", "fechaFull": "2024-05-01 10:00:00" },
             { "serie": "2da", "fechaFull": "2024-05-01 12:00:00" }
          ]
        }
      ]
    }
  ]
}
```

### Actualizar Resultado
- **Método:** `PUT`
- **URL:** `/partidos/:id/resultado`
- **Cuerpo (JSON):**
```json
{
  "goles_local": 2,
  "goles_visita": 1
}
```

### Suspender Partido
- **Método:** `PUT`
- **URL:** `/partidos/:id/suspender`
- **Cuerpo (JSON):**
```json
{
  "equipo_culpable_id": 1,
  "motivo_suspension": "Incidentes en la barra"
}
```

### Reprogramar Fecha Completa
- **Método:** `POST`
- **URL:** `/partidos/reprogramar`
- **Cuerpo (JSON):**
```json
{
  "division": "A",
  "fecha_numero": 1,
  "nueva_fecha": "2024-06-01"
}
```

### Eliminar Fixture Completo
- **Método:** `DELETE`
- **URL:** `/partidos?division=A`

---

## 4. Pases (Transferencias)
**Endpoint Base:** `/pases`

### Realizar Pase
- **Método:** `POST`
- **URL:** `/pases`
- **Cuerpo (JSON):**
```json
{
  "jugadorId": 105,
  "clubDestinoId": 2,
  "fecha": "2024-12-01",
  "comentario": "Pase de prueba",
  "delegado": "Juan Pérez"
}
```

### Historial de Pases
- **Método:** `GET`
- **URL:** `/pases/historial/:id`
- **Descripción:** Obtiene el historial de transferencias de un jugador específico.
