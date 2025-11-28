const { Partido, Club } = require('../models/associations');
const { generarFixtureHibrido } = require('../services/fixtureService');

const partidoController = {
    // 1. Previsualización (No guarda en DB)
    generarPreview: async (req, res) => {
        try {
            const { fechaInicio, horariosBase } = req.body;
            const clubes = await Club.findAll(); 

            if (clubes.length < 2) return res.status(400).json({ error: "Faltan equipos" });

            const fixture = generarFixtureHibrido(clubes, fechaInicio, horariosBase);
            res.json(fixture);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: error.message });
        }
    },

    // 2. Guardado Masivo
    guardarFixtureMasivo: async (req, res) => {
        try {
            const { fixtureConfirmado } = req.body;
            const inserts = [];

            fixtureConfirmado.forEach(jornada => {
                jornada.enfrentamientos.forEach(cruce => {
                    cruce.partidos.forEach(p => {
                        inserts.push({
                            fecha_numero: jornada.numero,
                            clubLocalId: cruce.local.id,
                            clubVisitaId: cruce.visita.id,
                            serie: p.serie,
                            dia_hora: p.fechaFull,
                            estado: 'programado'
                        });
                    });
                });
            });

            await Partido.bulkCreate(inserts);
            res.status(201).json({ message: "Fixture creado exitosamente" });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: error.message });
        }
    },

    // 3. Obtener todos (ESTA ES LA QUE FALTABA O FALLABA)
    getAll: async (req, res) => {
        try {
            const partidos = await Partido.findAll({
                include: [
                    { model: Club, as: 'local' },
                    { model: Club, as: 'visita' }
                ],
                order: [['fecha_numero', 'ASC'], ['dia_hora', 'ASC']]
            });
            res.json(partidos);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: error.message });
        }
    },

    updateResultado: async (req, res) => {
        try {
            const { id } = req.params;
            const { goles_local, goles_visita } = req.body;
            
            const partido = await Partido.findByPk(id);
            if (!partido) return res.status(404).json({ error: "Partido no encontrado" });

            partido.goles_local = goles_local;
            partido.goles_visita = goles_visita;
            partido.estado = 'finalizado'; // Al guardar goles, finalizamos el partido
            
            await partido.save();
            res.json(partido);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // 5. CALCULAR TABLA DE POSICIONES
    getTablaPosiciones: async (req, res) => {
        try {
            const { serie } = req.query; // Ej: ?serie=1era
            
            if (!serie) return res.status(400).json({ error: "Debes especificar la serie" });

            // 1. Traer todos los clubes que participan en esa serie
            // (Usamos el flag correspondiente para filtrar, ej: tiene_1era = true)
            const campoSerie = `tiene_${serie}`; // tiene_1era
            const whereClub = {};
            whereClub[campoSerie] = true;

            const clubes = await Club.findAll({ where: whereClub });

            // 2. Traer solo los partidos FINALIZADOS de esa serie
            const partidos = await Partido.findAll({
                where: { 
                    estado: 'finalizado',
                    serie: serie 
                }
            });

            // 3. Inicializar estructura de tabla
            let tabla = {};
            clubes.forEach(c => {
                tabla[c.id] = {
                    club: c.nombre,
                    logo: c.logo,
                    pts: 0, pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, dif: 0
                };
            });

            // 4. Calcular estadísticas
            partidos.forEach(p => {
                const local = tabla[p.clubLocalId];
                const visita = tabla[p.clubVisitaId];

                // Solo procesamos si ambos clubes existen en la tabla (seguridad)
                if (local && visita) {
                    // Partidos Jugados
                    local.pj++; visita.pj++;
                    // Goles
                    local.gf += p.goles_local; local.gc += p.goles_visita;
                    visita.gf += p.goles_visita; visita.gc += p.goles_local;
                    // Diferencia
                    local.dif = local.gf - local.gc;
                    visita.dif = visita.gf - visita.gc;

                    // Puntos
                    if (p.goles_local > p.goles_visita) {
                        local.pts += 3; local.pg++; visita.pp++;
                    } else if (p.goles_local < p.goles_visita) {
                        visita.pts += 3; visita.pg++; local.pp++;
                    } else {
                        local.pts += 1; local.pe++;
                        visita.pts += 1; visita.pe++;
                    }
                }
            });

            // 5. Convertir a array y ordenar (Puntos > Diferencia > Goles Favor)
            const tablaOrdenada = Object.values(tabla).sort((a, b) => {
                if (b.pts !== a.pts) return b.pts - a.pts;
                if (b.dif !== a.dif) return b.dif - a.dif;
                return b.gf - a.gf;
            });

            res.json(tablaOrdenada);

        } catch (error) {
            console.error(error);
            res.status(500).json({ error: error.message });
        }
    },

    eliminarFixture: async (req, res) => {
        try {
            // "truncate: true" borra todo y resetea los IDs autoincrementables a 1
            await Partido.destroy({
                where: {},
                truncate: true 
            });
            res.json({ message: "Fixture eliminado correctamente" });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: error.message });
        }
    },
    
    reprogramarFecha: async (req, res) => {
        try {
            const { fecha_numero, nueva_fecha } = req.body; // nueva_fecha viene como "YYYY-MM-DD"

            if (!fecha_numero || !nueva_fecha) {
                return res.status(400).json({ error: "Faltan datos requeridos" });
            }

            // 1. Buscamos todos los partidos de esa jornada
            const partidos = await Partido.findAll({
                where: { fecha_numero: fecha_numero }
            });

            if (partidos.length === 0) {
                return res.status(404).json({ error: "No hay partidos en esa fecha" });
            }

            // 2. Parseamos la nueva fecha base (asegurando hora local)
            const [anio, mes, dia] = nueva_fecha.split('-').map(Number);
            
            // 3. Actualizamos uno por uno para conservar la HORA original
            for (const partido of partidos) {
                if (partido.dia_hora) {
                    const fechaOriginal = new Date(partido.dia_hora);
                    const horas = fechaOriginal.getHours();
                    const minutos = fechaOriginal.getMinutes();

                    // Crear nueva fecha combinando el día nuevo + hora original
                    const nuevaFechaFull = new Date(anio, mes - 1, dia);
                    nuevaFechaFull.setHours(horas, minutos, 0);

                    partido.dia_hora = nuevaFechaFull;
                    // Opcional: Si estaban finalizados, podríamos pasarlos a 'programado' o 'suspendido'
                    // partido.estado = 'programado'; 
                    await partido.save();
                }
            }

            res.json({ message: `Fecha ${fecha_numero} reprogramada al ${nueva_fecha} exitosamente.` });

        } catch (error) {
            console.error(error);
            res.status(500).json({ error: error.message });
        }
    }
};

module.exports = partidoController;