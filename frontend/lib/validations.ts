import { z } from 'zod';

// Función auxiliar para validar RUT Chileno (Módulo 11)
function validateRut(rut: string): boolean {
    if (!rut) return false;

    // 1. Limpiar el RUT (dejar solo números y k/K)
    const cleanRut = rut.replace(/[^0-9kK]/g, '').toUpperCase();

    // 2. Validar largo mínimo (al menos 1 número + 1 DV)
    // RUT mínimo viable: 1-9 (Clean: 19, largo 2)
    if (cleanRut.length < 2) return false;

    // 3. Separar cuerpo y dígito verificador
    const body = cleanRut.slice(0, -1);
    const dv = cleanRut.slice(-1);

    // 4. Validar que el cuerpo sea numérico
    if (!/^\d+$/.test(body)) return false;

    // 5. Calcular Dígito Verificador esperado
    let sum = 0;
    let multiplier = 2;

    for (let i = body.length - 1; i >= 0; i--) {
        // IMPORTANTE: parseInt con base 10 para evitar errores de interpretación
        sum += parseInt(body[i], 10) * multiplier;
        multiplier = multiplier === 7 ? 2 : multiplier + 1;
    }

    const remainder = sum % 11;
    const calculatedDv = remainder === 0 ? '0' : remainder === 1 ? 'K' : (11 - remainder).toString();

    // DEBUG: Ver en consola del navegador (F12) qué está calculando
    console.log(`Validando RUT: ${rut} | Cuerpo: ${body} | DV Usuario: ${dv} | DV Calculado: ${calculatedDv}`);

    // 6. Comparar
    return dv === calculatedDv;
}

// Esquema de validación para el formulario de Jugador
export const jugadorSchema = z.object({
    nombres: z.string().min(2, "El nombre es obligatorio (mínimo 2 caracteres)"),
    paterno: z.string().min(2, "El apellido paterno es obligatorio"),
    materno: z.string().optional(),

    // Validación condicional: Si es RUT, validamos formato. Si es Pasaporte, solo que no esté vacío.
    tipo_identificacion: z.enum(['RUT', 'PASSPORT']).default('RUT'),

    rut: z.string().optional().refine((val) => {
        // Esta validación se ejecuta, pero la validación fuerte la hacemos cruzada con el tipo abajo
        return true;
    }),

    // Puedes usar un campo genérico o mapear según el tipo
    numero: z.coerce.number().min(1, "El número de camiseta es obligatorio"),

    nacimiento: z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: "Fecha de nacimiento inválida",
    }),

    inscripcion: z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: "Fecha de inscripción inválida",
    }),

    club_id: z.string().min(1, "Debes seleccionar un club"),
    rol: z.string().min(1, "El ROL es obligatorio"),
    passport: z.string().optional(),
    nacionalidad: z.string().optional(),

}).superRefine((data, ctx) => {
    // Lógica condicional: Si eligió RUT, validamos el campo 'rut'
    if (data.tipo_identificacion === 'RUT') {
        if (!data.rut || !validateRut(data.rut)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['rut'],
                message: "RUT inválido (Revise el dígito verificador)",
            });
        }
    }
    // Si eligió PASAPORTE, validamos el campo 'passport' (o reutilizas el campo rut si tu UI lo comparte)
    else if (data.tipo_identificacion === 'PASSPORT') {
        if (!data.passport || data.passport.length < 3) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['passport'], // O 'rut' si usas el mismo input
                message: "Pasaporte obligatorio",
            });
        }
    }
});

export type JugadorFormValues = z.infer<typeof jugadorSchema>;