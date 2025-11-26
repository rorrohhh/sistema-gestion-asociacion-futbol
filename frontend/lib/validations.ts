import { z } from 'zod';

/**
 * Valida RUT chileno
 * @param rutCompleto RUT en formato "12345678-9" o "123456789"
 */
export function validarRutChileno(rutCompleto: string): boolean {
    // ... (lógica de validación del RUT permanece igual)
    const rutLimpio = rutCompleto.replace(/[^0-9kK]/g, '').toUpperCase();
    if (rutLimpio.length < 2) return false;
    const dv = rutLimpio.slice(-1);
    const rutNumero = parseInt(rutLimpio.slice(0, -1));
    if (isNaN(rutNumero)) return false;
    let suma = 0;
    let multiplicador = 2;
    const rutStr = rutNumero.toString().split('').reverse();
    for (const digito of rutStr) {
        suma += parseInt(digito) * multiplicador;
        multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
    }
    const dvCalculado = 11 - (suma % 11);
    let dvEsperado: string;
    if (dvCalculado === 11) dvEsperado = '0';
    else if (dvCalculado === 10) dvEsperado = 'K';
    else dvEsperado = dvCalculado.toString();
    return dv === dvEsperado;
}

/**
 * Schema Zod para el formulario de inscripción de jugador
 */
export const jugadorSchema = z.object({
    numero: z.string().min(1, 'Número es requerido'),
    paterno: z.string().min(1, 'Apellido paterno es requerido'),
    materno: z.string().min(1, 'Apellido materno es requerido'),
    nombres: z.string().min(1, 'Nombres son requeridos'),

    // NUEVOS CAMPOS DE IDENTIFICACIÓN
    tipo_identificacion: z.enum(['RUT', 'PASSPORT'], {
        message: "Debe seleccionar el tipo de identificación (RUT o Pasaporte).",
    }),
    run_input: z.string().nullable().optional(),      // Rut (puede ser nulo)
    passport_input: z.string().nullable().optional(), // Pasaporte (puede ser nulo)

    rol_input: z.string().min(1, 'ROL es requerido'),
    nacimiento: z.string().min(1, 'Fecha de nacimiento es requerida'),
    inscripcion: z.string().min(1, 'Fecha de inscripción es requerida'),
    club_id: z.number().min(1, 'Debe seleccionar un club'),
})
    // Lógica de validación CONDICIONAL
    .refine((data) => {
        if (data.tipo_identificacion === 'RUT') {
            // Validación 1: RUT no puede estar vacío
            const rut = data.run_input?.trim() || '';
            if (rut.length === 0) return false;
            // Validación 2: Chequeo del dígito verificador
            return validarRutChileno(rut);
        }

        if (data.tipo_identificacion === 'PASSPORT') {
            // Validación: Pasaporte debe ser una cadena no vacía
            return (data.passport_input?.trim() || '').length > 0;
        }

        return false;
    }, {
        message: 'Identificación requerida o inválida según el tipo seleccionado.',

        // Apuntamos al campo RUT/Pasaporte para que el error sea visible junto al input
        path: ["run_input"]
    });

export type JugadorFormData = z.infer<typeof jugadorSchema>;