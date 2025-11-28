import axios from 'axios';
import { env } from './env';
import type { Jugador, Club, FilterParams, CreateJugadorDTO, CreateClubDTO, Partido, PosicionTabla, PartidoPreview, EnfrentamientoPreview, JornadaPreview } from '@/types';

// Configuración del Cliente Axios
const apiClient = axios.create({
    baseURL: env.apiUrl,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const api = {
    // ------------------------------------------------------------------
    // JUGADORES
    // ------------------------------------------------------------------

    async getJugadores(filters?: FilterParams): Promise<Jugador[]> {
        const params = new URLSearchParams();
        if (filters?.club) params.append('club', filters.club);
        if (filters?.nombre) params.append('nombre', filters.nombre);
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


    async createJugador(data: any): Promise<void> {
        const formData = new FormData();

        // Campos de texto
        formData.append('numero', data.numero);
        formData.append('nombres', data.nombres);
        formData.append('paterno', data.paterno);
        formData.append('materno', data.materno || '');
        formData.append('nacimiento', data.nacimiento);
        formData.append('inscripcion', data.inscripcion);
        formData.append('club_id', data.club_id);
        formData.append('rol_input', data.rol);
        formData.append('nacionalidad', data.nacionalidad || '');
        formData.append('delegado_input', data.delegado || '');

        // Identificación
        formData.append('tipo_identificacion_input', data.tipo_identificacion);
        if (data.tipo_identificacion === 'RUT') {
            formData.append('run_input', data.rut);
        } else {
            formData.append('passport_input', data.passport);
        }

        // NUEVOS CAMPOS
        // 1. Activo (convertir boolean a string)
        formData.append('activo', String(data.activo));

        // 2. Foto (solo si existe y es un archivo)
        if (data.foto instanceof File) {
            formData.append('foto', data.foto);
        }

        // Enviamos como multipart/form-data
        await apiClient.post('/api/jugadores', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },

    async updateJugador(id: string, data: any): Promise<void> {
        const formData = new FormData();

        formData.append('numero', data.numero);
        formData.append('nombres', data.nombres);
        formData.append('paterno', data.paterno);
        formData.append('materno', data.materno || '');
        formData.append('nacimiento', data.nacimiento);
        formData.append('inscripcion', data.inscripcion);
        formData.append('club_id', data.club_id);
        formData.append('rol_input', data.rol);
        formData.append('nacionalidad', data.nacionalidad || '');
        // El delegado también se puede actualizar si se desea
        formData.append('delegado_input', data.delegado || '');

        formData.append('tipo_identificacion_input', data.tipo_identificacion);
        if (data.tipo_identificacion === 'RUT') {
            formData.append('run_input', data.rut);
        } else {
            formData.append('passport_input', data.passport);
        }

        // NUEVOS CAMPOS
        formData.append('activo', String(data.activo));

        if (data.foto instanceof File) {
            formData.append('foto', data.foto);
        }

        await apiClient.put(`/api/jugadores/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },

    async deleteJugador(id: string): Promise<void> {
        await apiClient.delete(`/api/jugadores/${id}`);
    },

    // ------------------------------------------------------------------
    // CLUBES
    // ------------------------------------------------------------------

    async getClubes(): Promise<Club[]> {
        const response = await apiClient.get<Club[]>('/api/clubes');
        return response.data;
    },

    async getClubPorId(id: string): Promise<Club> {
        const response = await apiClient.get<Club>(`/api/clubes/${id}`);
        return response.data;
    },

    async createClub(data: CreateClubDTO): Promise<Club> {
        const response = await apiClient.post<Club>('/api/clubes', data);
        return response.data;
    },

    async updateClub(id: string, data: CreateClubDTO): Promise<void> {
        await apiClient.put(`/api/clubes/${id}`, data);
    },

    async deleteClub(id: string): Promise<void> {
        await apiClient.delete(`/api/clubes/${id}`);
    },

    // ------------------------------------------------------------------
    // PASES
    // ------------------------------------------------------------------

    async realizarPase(data: { jugadorId: number | string, clubDestinoId: number | string, fecha: string, comentario: string, delegado: string }): Promise<void> {
        await apiClient.post('/api/pases', data);
    },

    async getHistorialPases(jugadorId: string): Promise<any[]> {
        const response = await apiClient.get(`/api/pases/historial/${jugadorId}`);
        return response.data;
    },

    async getPartidos(filters?: { fecha?: number; serie?: string }): Promise<Partido[]> {

        const response = await apiClient.get<Partido[]>('/api/partidos');
        return response.data;
    },

    async updateResultado(id: number, goles_local: number, goles_visita: number): Promise<void> {
        await apiClient.put(`/api/partidos/${id}/resultado`, { goles_local, goles_visita });
    },

    async getTablaPosiciones(serie: string): Promise<PosicionTabla[]> {
        const response = await apiClient.get<PosicionTabla[]>(`/api/partidos/tabla?serie=${serie}`);
        return response.data;
    },

    async generarFixturePreview(data: { fechaInicio: string; horariosBase: any }): Promise<JornadaPreview[]> {
        const response = await apiClient.post<JornadaPreview[]>('/api/partidos/preview', data);
        return response.data;
    },

    // 2. Guardar Fixture Confirmado
    async guardarFixtureMasivo(fixture: JornadaPreview[]): Promise<void> {
        await apiClient.post('/api/partidos/masivo', { fixtureConfirmado: fixture });
    },

    async eliminarFixture(): Promise<void> {
        await apiClient.delete('/api/partidos');
    },

    async reprogramarFecha(fechaNumero: number, nuevaFecha: string): Promise<void> {
        await apiClient.post('/api/partidos/reprogramar', { fecha_numero: fechaNumero, nueva_fecha: nuevaFecha });
    },
};