const { Partido, Club } = require('../models/associations');
const { generarFixtureHibrido } = require('../services/fixtureService');
const { Op } = require('sequelize'); // <--- ¡CRÍTICO! Esto faltaba o se borró

const partidoController = {

    generarPreview: async (req, res) => {
        try {
            const { fechaInicio, horariosBase, equiposIds } = req.body;

            if (!equiposIds || !Array.isArray(equiposIds) || equiposIds.length < 2) {
                return res.status(400).json({ error: "Selecciona al menos 2 equipos." });
            }

            const clubesSeleccionados = await Club.findAll({
                where: {
                    id: { [Op.in]: equiposIds }
                }
            });

            const fixture = generarFixtureHibrido(clubesSeleccionados, fechaInicio, horariosBase);
            
            res.json(fixture);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    guardarFixtureMasivo: async (req, res) => {
        try {
            const { fixtureConfirmado, division } = req.body; // division = 'A' o 'B'

            if (!division) return res.status(400).json({ error: "Falta la división (A o B)" });

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
                            estado: 'programado',
                            campeonato: division // <--- LA CLAVE DE LA INDEPENDENCIA
                        });
                    });
                });
            });

            await Partido.bulkCreate(inserts);
            res.status(201).json({ message: "Torneo guardado" });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    getAll: async (req, res) => {
        try {
            const { division } = req.query; // ?division=A
            const whereClause = division ? { campeonato: division } : {};

            const partidos = await Partido.findAll({
                where: whereClause,
                include: [
                    { model: Club, as: 'local' },
                    { model: Club, as: 'visita' }
                ],
                order: [['fecha_numero', 'ASC'], ['dia_hora', 'ASC']]
            });
            res.json(partidos);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    updateResultado: async (req, res) => {
        try {
            const { id } = req.params;
            const { goles_local, goles_visita } = req.body;
            
            const partido = await Partido.findByPk(id);
            if (!partido) return res.status(404).json({ error: "No encontrado" });

            partido.goles_local = goles_local;
            partido.goles_visita = goles_visita;
            partido.estado = 'finalizado'; 
            partido.equipo_culpable_id = null; // Reset suspension
            partido.motivo_suspension = null;

            await partido.save();
            res.json(partido);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    suspenderPartido: async (req, res) => {
        try {
            const { id } = req.params;
            const { equipo_culpable_id, motivo_suspension } = req.body;

            const partido = await Partido.findByPk(id);
            if (!partido) return res.status(404).json({ error: "No encontrado" });

            partido.estado = 'suspendido';
            partido.equipo_culpable_id = equipo_culpable_id;
            partido.motivo_suspension = motivo_suspension;

            await partido.save();
            res.json(partido);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    eliminarFixture: async (req, res) => {
        try {
            const { division } = req.query; // ?division=A
            if (!division) return res.status(400).json({error: "Especifica la división a borrar"});

            await Partido.destroy({
                where: { campeonato: division }
            });
            res.json({ message: `Fixture Serie ${division} eliminado` });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    reprogramarFecha: async (req, res) => {
        try {
            const { fecha_numero, nueva_fecha, division } = req.body;
            
            // Buscamos solo partidos de esa fecha Y de esa división
            const partidos = await Partido.findAll({ 
                where: { fecha_numero, campeonato: division } 
            });

            const [anio, mes, dia] = nueva_fecha.split('-').map(Number);
            
            for (const partido of partidos) {
                if (partido.dia_hora) {
                    const original = new Date(partido.dia_hora);
                    const nueva = new Date(anio, mes - 1, dia);
                    nueva.setHours(original.getHours(), original.getMinutes(), 0);
                    partido.dia_hora = nueva;
                    await partido.save();
                }
            }
            res.json({ message: "Fecha reprogramada" });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    getTablaPosiciones: async (req, res) => {
        try {
            const { serie, division } = req.query; 
            
            // Filtramos partidos de esa división y serie
            const partidos = await Partido.findAll({
                where: { 
                    estado: { [Op.or]: ['finalizado', 'suspendido'] },
                    serie: serie,
                    campeonato: division 
                }
            });

            // Para la tabla, usamos TODOS los clubes, pero los filtramos después
            // para mostrar solo los que tienen puntos o pertenecen a la división.
            // Una estrategia simple: Traer todos y la tabla se llena solo con los que juegan.
            const clubes = await Club.findAll(); 

            let tabla = {};
            // Inicializar tabla SOLO con clubes de la división solicitada (para que no salgan todos)
            clubes.filter(c => c.division === division).forEach(c => {
                tabla[c.id] = {
                    club: c.nombre,
                    logo: c.logo,
                    pts: 0, pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, dif: 0
                };
            });

            const ptsWin = serie === '1era' ? 3 : 2; // Regla de puntos

            partidos.forEach(p => {
                const local = tabla[p.clubLocalId];
                const visita = tabla[p.clubVisitaId];

                if (local && visita) {
                    if (p.equipo_culpable_id) { // Suspendido
                        local.pj++; visita.pj++;
                        local.gf += p.goles_local; local.gc += p.goles_visita;
                        visita.gf += p.goles_visita; visita.gc += p.goles_local;
                        if (p.equipo_culpable_id === p.clubLocalId) { 
                            visita.pts += ptsWin; visita.pg++; local.pp++; 
                        } else { 
                            local.pts += ptsWin; local.pg++; visita.pp++; 
                        }
                    } else if (p.estado === 'finalizado') { // Normal
                        local.pj++; visita.pj++;
                        local.gf += p.goles_local; local.gc += p.goles_visita;
                        visita.gf += p.goles_visita; visita.gc += p.goles_local;
                        local.dif = local.gf - local.gc; visita.dif = visita.gf - visita.gc;

                        if (p.goles_local > p.goles_visita) { 
                            local.pts += ptsWin; local.pg++; visita.pp++; 
                        } else if (p.goles_local < p.goles_visita) { 
                            visita.pts += ptsWin; visita.pg++; local.pp++; 
                        } else { 
                            local.pts += 1; local.pe++; visita.pts += 1; visita.pe++; 
                        }
                    }
                }
            });

            const tablaOrdenada = Object.values(tabla).sort((a, b) => b.pts - a.pts || b.dif - a.dif);
            res.json(tablaOrdenada);

        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    checkTorneo: async (req, res) => {
        try {
            const { division } = req.query; // 'A' o 'B'
            const count = await Partido.count({ 
                where: { campeonato: division } 
            });
            res.json({ existe: count > 0, cantidad: count });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
};

module.exports = partidoController;