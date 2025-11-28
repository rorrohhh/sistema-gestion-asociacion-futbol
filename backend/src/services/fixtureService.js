/**
 * Genera un fixture Round Robin "inteligente".
 * Detecta qué series comparten los equipos para crear solo los partidos necesarios.
 */
const generarFixtureHibrido = (clubes, fechaInicio, horariosBase) => {
    // 1. Algoritmo Round Robin estándar para rotar equipos
    let list = [...clubes];
    if (list.length % 2 !== 0) {
        list.push({ id: null, nombre: "LIBRE", esFantasma: true });
    }

    const numEquipos = list.length;
    const numRondas = numEquipos - 1;
    const partidosPorRonda = numEquipos / 2;
    
    let fixture = [];

    // --- CORRECCIÓN DE FECHA ---
    // Dividimos el string "YYYY-MM-DD" y creamos la fecha manualmente.
    // Esto asegura que sea 00:00 en TU hora local, no en UTC.
    const [anio, mes, dia] = fechaInicio.split('-').map(Number);
    let fechaBase = new Date(anio, mes - 1, dia); // Mes es index 0 en JS
    // ---------------------------

    for (let ronda = 0; ronda < numRondas; ronda++) {
        // Calcular fecha calendario (Sumamos 7 días por ronda)
        let fechaCalendario = new Date(fechaBase);
        fechaCalendario.setDate(fechaCalendario.getDate() + (ronda * 7));

        let jornada = {
            numero: ronda + 1,
            fecha_calendario: fechaCalendario,
            enfrentamientos: []
        };

        for (let i = 0; i < partidosPorRonda; i++) {
            const local = list[i];
            const visita = list[numEquipos - 1 - i];

            // Si ninguno es "Fantasma" (Fecha Libre)
            if (!local.esFantasma && !visita.esFantasma) {
                // Alternar localía
                const clubLocal = (ronda % 2 === 0) ? local : visita;
                const clubVisita = (ronda % 2 === 0) ? visita : local;

                // DETECCIÓN DE SERIES
                const partidosDelBloque = [];
                
                // Mapeo seguro usando los campos correctos del modelo
                const seriesCheck = [
                    { key: 'tiene_3era', val: '3era', hora: horariosBase['3era'] },
                    { key: 'tiene_2da', val: '2da', hora: horariosBase['2da'] },
                    { key: 'tiene_1era', val: '1era', hora: horariosBase['1era'] }
                ];

                seriesCheck.forEach(s => {
                    // Verificamos que ambos clubes tengan la serie (true/1)
                    if (clubLocal[s.key] && clubVisita[s.key]) {
                        
                        // Construir fecha completa con hora
                        const [hora, min] = s.hora.split(':');
                        const fechaFull = new Date(fechaCalendario);
                        fechaFull.setHours(parseInt(hora), parseInt(min), 0);

                        partidosDelBloque.push({
                            serie: s.val,
                            horario: s.hora,
                            fechaFull: fechaFull
                        });
                    }
                });

                if (partidosDelBloque.length > 0) {
                    jornada.enfrentamientos.push({
                        local: { id: clubLocal.id, nombre: clubLocal.nombre, logo: clubLocal.logo },
                        visita: { id: clubVisita.id, nombre: clubVisita.nombre, logo: clubVisita.logo },
                        partidos: partidosDelBloque
                    });
                }
            }
        }
        fixture.push(jornada);
        // Rotación Round Robin
        const ultimo = list.pop();
        list.splice(1, 0, ultimo);
    }

    return fixture;
};

module.exports = { generarFixtureHibrido };