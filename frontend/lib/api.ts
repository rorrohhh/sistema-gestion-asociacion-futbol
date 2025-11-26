import axios from 'axios';
import { env } from './env';
import type { Jugador, Club, FilterParams, CreateJugadorDTO } from '@/types';

// Cliente API configurado
const apiClient = axios.create({
    baseURL: env.apiUrl,
    headers: {
        'Content-Type': 'application/json',
    },
});

// API functions
export const api = {
    /**
     * Obtiene la lista de jugadores con filtros opcionales
     */
    async getJugadores(filters?: FilterParams): Promise<Jugador[]> {
        const params = new URLSearchParams();

        if (filters?.club) params.append('club', filters.club);
        if (filters?.nombre) params.append('nombre', filters.nombre);
        if (filters?.rut) params.append('rut', filters.rut);
        if (filters?.rol) params.append('rol', filters.rol);

        const url = params.toString() ? `/?${params.toString()}` : '/';
        const response = await apiClient.get<Jugador[]>(url);
        return response.data;
    },

    /**
     * Obtiene la lista de clubes disponibles
     */
    async getClubes(): Promise<Club[]> {
        const response = await apiClient.get<Club[]>('/clubes');
        return response.data;
    },

    /**
     * Crea un nuevo jugador
     */
    async createJugador(data: CreateJugadorDTO): Promise<void> {
        await apiClient.post('/guardar', data);
    },
};
