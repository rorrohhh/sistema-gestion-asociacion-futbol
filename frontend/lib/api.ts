import axios from 'axios';
import { env } from './env';
import type { Jugador, Club, FilterParams, CreateJugadorDTO } from '@/types';

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

        // Mapeo de filtros según la doc (Query Params)
        if (filters?.club) params.append('club', filters.club);
        if (filters?.nombre) params.append('nombre', filters.nombre);
        if (filters?.rut) params.append('rut', filters.rut);
        if (filters?.rol) params.append('rol', filters.rol);

        const queryString = params.toString() ? `?${params.toString()}` : '';

        // Apuntamos a /api/jugadores
        const response = await apiClient.get<Jugador[]>(`/api/jugadores${queryString}`);
        return response.data;
    },

    /**
     * Crea un nuevo jugador
     * Documentación 2.2: POST /api/jugadores
     */
    async createJugador(data: CreateJugadorDTO): Promise<void> {
        // TRADUCCIÓN DE DATOS (Frontend -> Backend)
        const payloadBackend = {
            numero: data.numero,
            paterno: data.paterno,
            materno: data.materno,
            nombres: data.nombres,
            nacimiento: data.nacimiento,
            inscripcion: data.inscripcion,

            // CORRECCIÓN AQUÍ:
            // Usamos data.club_id (como lo tienes en tu type)
            club_id: data.club_id,

            // Revisa si 'rut' y 'rol' te dan error también. 
            // Si TypeScript no se queja, déjalos así.
            run_input: data.rut,      // Front: 'rut' -> Back: 'run_input'
            rol_input: data.rol,      // Front: 'rol' -> Back: 'rol_input'
        };

        await apiClient.post('/api/jugadores', payloadBackend);
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
};