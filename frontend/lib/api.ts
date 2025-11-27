import axios from 'axios';
import { env } from './env';
import type { Jugador, Club, FilterParams, CreateJugadorDTO, CreateClubDTO } from '@/types';

// Configuración del Cliente Axios
// Se asume que env.apiUrl es "http://localhost:8080" (el host del backend)
const apiClient = axios.create({
    baseURL: env.apiUrl,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const api = {
    // ------------------------------------------------------------------
    // JUGADORES (Base Endpoint: /api/jugadores)
    // ------------------------------------------------------------------

    /**
     * Obtiene la lista de jugadores con filtros opcionales
     * Documentación 2.1: GET /api/jugadores
     */
    async getJugadores(filters?: FilterParams): Promise<Jugador[]> {
        const params = new URLSearchParams();

        if (filters?.club) params.append('club', filters.club);
        if (filters?.nombre) params.append('nombre', filters.nombre);

        // CAMBIO: Ahora enviamos 'identificacion'
        if (filters?.identificacion) params.append('identificacion', filters.identificacion);

        if (filters?.rol) params.append('rol', filters.rol);

        const queryString = params.toString() ? `?${params.toString()}` : '';
        const response = await apiClient.get<Jugador[]>(`/api/jugadores${queryString}`);
        return response.data;
    },

    async getJugadorPorId(id: string): Promise<Jugador> {
        const response = await apiClient.get<Jugador>(`/api/jugadores/${id}`);
        return response.data;
    },

    /**
     * Crea un nuevo jugador
     * Documentación 2.2: POST /api/jugadores
     */
    // CAMBIO: Usamos 'any' para permitir los campos nuevos sin error de TS inmediato
    async createJugador(data: any): Promise<void> {
        // TRADUCCIÓN DE DATOS (Frontend -> Backend)
        const payloadBackend = {
            numero: data.numero,
            paterno: data.paterno,
            materno: data.materno,
            nombres: data.nombres,
            nacimiento: data.nacimiento,
            inscripcion: data.inscripcion,

            // Usamos data.club_id
            club_id: data.club_id,

            run_input: data.rut,      // Front: 'rut' -> Back: 'run_input'
            rol_input: data.rol,      // Front: 'rol' -> Back: 'rol_input'

            // --- CORRECCIÓN: Agregamos los campos de pasaporte ---
            tipo_identificacion_input: data.tipo_identificacion_input,
            passport_input: data.passport_input,
            nacionalidad: data.nacionalidad
        };

        await apiClient.post('/api/jugadores', payloadBackend);
    },

    // CAMBIO: Usamos 'any' aquí también
    async updateJugador(id: string, data: any): Promise<void> {
        // TRADUCCIÓN DE DATOS (Frontend -> Backend)
        const payloadBackend = {
            numero: data.numero,
            paterno: data.paterno,
            materno: data.materno,
            nombres: data.nombres,
            nacimiento: data.nacimiento,
            inscripcion: data.inscripcion,
            club_id: data.club_id,
            run_input: data.rut,
            rol_input: data.rol,
            tipo_identificacion_input: data.tipo_identificacion_input,
            passport_input: data.passport_input,
            nacionalidad: data.nacionalidad
        };

        // Realizamos la petición PUT, incluyendo el ID en la URL
        await apiClient.put(`/api/jugadores/${id}`, payloadBackend);
    },

    async deleteJugador(id: string): Promise<void> {
        // El ID se pasa como parte de la URL
        await apiClient.delete(`/api/jugadores/${id}`);
    },

    // ------------------------------------------------------------------
    // CLUBES (Base Endpoint: /api/clubes)
    // ------------------------------------------------------------------

    /**
     * Obtiene la lista de clubes
     * Documentación 1.1: GET /api/clubes
     */
    async getClubes(): Promise<Club[]> {
        const response = await apiClient.get<Club[]>('/api/clubes');
        return response.data;
    },

    // AÑADIDO: Obtiene un club por su ID
    async getClubPorId(id: string): Promise<Club> {
        const response = await apiClient.get<Club>(`/api/clubes/${id}`);
        return response.data;
    },

    // AÑADIDO: Crea un nuevo club
    async createClub(data: CreateClubDTO): Promise<Club> {
        const response = await apiClient.post<Club>('/api/clubes', data);
        return response.data;
    },

    // AÑADIDO: Actualiza un club existente
    async updateClub(id: string, data: CreateClubDTO): Promise<void> {
        await apiClient.put(`/api/clubes/${id}`, data);
    },

    // AÑADIDO: Elimina un club
    async deleteClub(id: string): Promise<void> {
        await apiClient.delete(`/api/clubes/${id}`);
    },
};