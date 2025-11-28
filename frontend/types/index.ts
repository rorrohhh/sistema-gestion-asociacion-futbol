// Interfaces TypeScript para el dominio del sistema de gestión de fútbol

export interface Jugador {
    id: number;
    numero: number;
    paterno: string;
    materno: string;
    nombres: string;

    // ACTUALIZADO: El RUT puede ser nulo si es extranjero
    rut: number | null;
    dv: string | null;

    // NUEVOS CAMPOS: Soporte para pasaporte
    tipoIdentificacion: string; // 'RUT' | 'PASSPORT'
    pasaporte: string | null;
    nacionalidad: string | null;
    delegadoInscripcion: string | null;
    rol: string;
    nacimiento: string;
    inscripcion: string;
    club_id: number;
    Club?: Club;
}

export interface Club {
    id: number;
    nombre: string;
}

export interface FilterParams {
    club?: string;
    nombre?: string;
    identificacion?: string;
    rol?: string;
}

export interface CreateJugadorDTO {
    // Flexibilidad para recibir string del formulario o number
    numero: string | number;
    paterno: string;
    materno: string;
    nombres: string;

    // RUT ahora es opcional en el DTO
    rut?: string;

    rol: string;
    nacimiento: string; // YYYY-MM-DD
    inscripcion: string; // YYYY-MM-DD

    // Flexibilidad para el select
    club_id: number | string;

    // NUEVOS CAMPOS para el envío al backend
    tipo_identificacion_input?: string;
    passport_input?: string;
    nacionalidad?: string;
    delegado_input?: string;
}


export interface CreateClubDTO {
    nombre: string;
}

export interface ApiResponse<T> {
    success?: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export interface PartidoPreview {
    serie: '1era' | '2da' | '3era';
    horario: string;
    fechaFull: string;
}

export interface EnfrentamientoPreview {
    local: { id: number; nombre: string; logo?: string };
    visita: { id: number; nombre: string; logo?: string };
    partidos: PartidoPreview[];
}

export interface JornadaPreview {
    numero: number;
    fecha_calendario: string;
    enfrentamientos: EnfrentamientoPreview[];
}

export interface Partido {
    id: number;
    fecha_numero: number;
    dia_hora: string;
    serie: '1era' | '2da' | '3era';
    clubLocalId: number;
    clubVisitaId: number;
    goles_local: number;
    goles_visita: number;
    estado: 'programado' | 'finalizado' | 'suspendido';
    local?: Club;
    visita?: Club;
}

export interface PosicionTabla {
    club: string;
    logo?: string;
    pts: number;
    pj: number;
    pg: number;
    pe: number;
    pp: number;
    gf: number;
    gc: number;
    dif: number;
}

// Tipos para el Generador (Preview)
export interface PartidoPreview {
    serie: '1era' | '2da' | '3era';
    horario: string;
    fechaFull: string;
}

export interface EnfrentamientoPreview {
    local: { id: number; nombre: string; logo?: string };
    visita: { id: number; nombre: string; logo?: string };
    partidos: PartidoPreview[];
}

export interface JornadaPreview {
    numero: number;
    fecha_calendario: string;
    enfrentamientos: EnfrentamientoPreview[];
}