// Interfaces TypeScript para el dominio del sistema de gestión de fútbol

export interface Jugador {
    id: number;
    numero: number;
    apellido_paterno: string;
    apellido_materno: string;
    nombres: string;
    rut_num: number;
    rut_dv: string;
    rol_asociacion: string;
    fecha_nacimiento: string;
    fecha_inscripcion: string;
    club_id: number;
    nombre_club: string;
}

export interface Club {
    id: number;
    nombre: string;
}

export interface FilterParams {
    club?: string;
    nombre?: string;
    rut?: string;
    rol?: string;
}

export interface CreateJugadorDTO {
    numero: string;
    paterno: string;
    materno: string;
    nombres: string;
    run_input: string; // RUT completo con formato (ej: 12345678-9)
    rol_input: string;
    nacimiento: string; // YYYY-MM-DD
    inscripcion: string; // YYYY-MM-DD
    club_id: number;
}

export interface ApiResponse<T> {
    success?: boolean;
    data?: T;
    error?: string;
    message?: string;
}
