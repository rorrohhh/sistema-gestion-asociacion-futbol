// Interfaces TypeScript para el dominio del sistema de gestión de fútbol

export interface Jugador {
    id: number;
    numero: number;
    paterno: string;
    materno: string;
    nombres: string;
    rut: number;
    dv: string;
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
    rut?: string;
    rol?: string;
}

export interface CreateJugadorDTO {
    numero: string;
    paterno: string;
    materno: string;
    nombres: string;
    rut: string; // RUT completo con formato (ej: 12345678-9)
    rol: string;
    nacimiento: string; // YYYY-MM-DD
    inscripcion: string; // YYYY-MM-DD
    club_id: number;
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
