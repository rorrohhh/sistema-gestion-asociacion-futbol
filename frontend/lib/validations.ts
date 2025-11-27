import { z } from 'zod';

// Función auxiliar para validar RUT Chileno
function validateRut(rut: string): boolean {
    if (!rut) return false;
    const cleanRut = rut.replace(/[^0-9kK]/g, '').toUpperCase();
    if (cleanRut.length < 2) return false;
    const body = cleanRut.slice(0, -1);
    const dv = cleanRut.slice(-1);
    if (!/^\d+$/.test(body)) return false;
    let sum = 0;
    let multiplier = 2;
    for (let i = body.length - 1; i >= 0; i--) {
        sum += parseInt(body[i], 10) * multiplier;
        multiplier = multiplier === 7 ? 2 : multiplier + 1;
    }
    const remainder = sum % 11;
    const calculatedDv = remainder === 0 ? '0' : remainder === 1 ? 'K' : (11 - remainder).toString();
    return dv === calculatedDv;
}

// Esquema de validación para el formulario de Jugador
export const jugadorSchema = z.object({
    nombres: z.string().min(2, "El nombre es obligatorio (mínimo 2 caracteres)"),
    paterno: z.string().min(2, "El apellido paterno es obligatorio"),
    materno: z.string().optional(),

    tipo_identificacion: z.enum(['RUT', 'PASSPORT']).default('RUT'),

    rut: z.string().optional(),

    // Validación flexible para número y club_id (string o number)
    numero: z.union([z.string(), z.number()]).transform((val) => Number(val)),
    club_id: z.union([z.string(), z.number()]).transform((val) => String(val)).refine((val) => val !== '', "Debes seleccionar un club"),

    rol: z.string().min(1, "El ROL es obligatorio"),

    nacimiento: z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: "Fecha de nacimiento inválida",
    }),

    inscripcion: z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: "Fecha de inscripción inválida",
    }),

    passport: z.string().optional(),
    nacionalidad: z.string().optional(),
    delegado: z.string().min(2, "El nombre del delegado es obligatorio"),

    // --- NUEVOS CAMPOS ---
    activo: z.boolean().default(true),

    // La foto es opcional y puede ser cualquier cosa (File o undefined)
    // Usamos 'any' o 'custom' porque Zod en el cliente maneja File objects
    foto: z.any().optional(),

}).superRefine((data, ctx) => {
    if (data.tipo_identificacion === 'RUT') {
        if (!data.rut || !validateRut(data.rut)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['rut'],
                message: "RUT inválido (Revise el dígito verificador)",
            });
        }
    }
    else if (data.tipo_identificacion === 'PASSPORT') {
        if (!data.passport || data.passport.length < 3) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['passport'],
                message: "Pasaporte obligatorio",
            });
        }
    }
});

export type JugadorFormValues = z.infer<typeof jugadorSchema>;