const generarFixtureHibrido = (clubes, fechaInicioStr, horariosBase) => {
    
    // Validación básica
    if (clubes.length < 2) return [];

    let list = [...clubes];
    
    // Si es impar, agregamos "LIBRE" para que el algoritmo funcione
    if (list.length % 2 !== 0) {
        list.push({ id: null, nombre: "LIBRE", esFantasma: true });
    }

    const numEquipos = list.length;
    const numRondas = numEquipos - 1;
    const partidosPorRonda = numEquipos / 2;
    
    let fixture = [];

    // 1. Parsear fecha exacta (sin sumar días extras ni magia)
    const [anio, mes, dia] = fechaInicioStr.split('-').map(Number);
    let fechaBase = new Date(anio, mes - 1, dia);

    for (let ronda = 0; ronda < numRondas; ronda++) {
        // Calcular fecha de esta jornada (semana a semana)
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

            // Si ninguno es fantasma, creamos el partido
            if (!local.esFantasma && !visita.esFantasma) {
                // Alternar localía
                const clubLocal = (ronda % 2 === 0) ? local : visita;
                const clubVisita = (ronda % 2 === 0) ? visita : local;

                const partidosDelBloque = [];
                
                // Definición de las 3 series
                const seriesCheck = [
                    { key: 'tiene_super_senior', val: 'super_senior', hora: horariosBase['super_senior'] },
                    { key: 'tiene_2da', val: '2da', hora: horariosBase['2da'] },
                    { key: 'tiene_1era', val: '1era', hora: horariosBase['1era'] }
                ];

                seriesCheck.forEach(s => {
                    if (clubLocal[s.key] && clubVisita[s.key]) {
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
        
        // Rotación de equipos
        const ultimo = list.pop();
        list.splice(1, 0, ultimo);
    }

    return fixture;
};


module.exports = { generarFixtureHibrido };