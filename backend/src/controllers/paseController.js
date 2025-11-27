const Pase = require('../models/Pase');
const Jugador = require('../models/Jugador');
const Club = require('../models/Club');
const sequelize = require('../config/database'); // Necesario para la transacción

const controller = {};

// --- REALIZAR UN PASE (Transacción) ---
controller.realizarPase = async (req, res) => {
    // Iniciamos una transacción para asegurar la integridad de los datos
    const t = await sequelize.transaction();

    try {
        const { jugadorId, clubDestinoId, fecha, comentario } = req.body;

        // 1. Verificar que el jugador existe y obtener su club actual (Origen)
        const jugador = await Jugador.findByPk(jugadorId, { transaction: t });
        
        if (!jugador) {
            await t.rollback();
            return res.status(404).json({ error: "Jugador no encontrado" });
        }

        const clubOrigenId = jugador.clubId;

        // Validación: No se puede hacer pase al mismo club donde ya está
        if (Number(clubOrigenId) === Number(clubDestinoId)) {
            await t.rollback();
            return res.status(400).json({ error: "El jugador ya pertenece al club de destino." });
        }

        // 2. Crear el registro en el Historial (Tabla Pases)
        await Pase.create({
            jugadorId,
            clubOrigenId,   // Guardamos de dónde venía
            clubDestinoId,  // Guardamos a dónde va
            fecha: fecha || new Date(),
            comentario      // Guardamos el comentario del pase
        }, { transaction: t });

        // 3. Actualizar el club actual del Jugador
        // IMPORTANTE: El ROL no se toca, se mantiene el original del jugador.
        jugador.clubId = clubDestinoId;
        await jugador.save({ transaction: t });

        // 4. Confirmar cambios en la base de datos
        await t.commit();

        res.json({ message: "Pase realizado con éxito. Historial actualizado." });

    } catch (error) {
        // Si algo falla en cualquier paso, deshacemos todo
        await t.rollback();
        console.error("Error al realizar pase:", error);
        res.status(500).json({ error: "Error interno al procesar el pase." });
    }
};

// --- OBTENER HISTORIAL DE UN JUGADOR ---
controller.obtenerHistorial = async (req, res) => {
    try {
        const { id } = req.params; // ID del jugador

        const historial = await Pase.findAll({
            where: { jugadorId: id },
            // Incluimos los nombres de los clubes para mostrar "De: Colo Colo, A: U de Chile"
            include: [
                { model: Club, as: 'ClubOrigen', attributes: ['nombre'] },
                { model: Club, as: 'ClubDestino', attributes: ['nombre'] }
            ],
            order: [['fecha', 'DESC'], ['createdAt', 'DESC']] // Los más recientes primero
        });

        res.json(historial);
    } catch (error) {
        console.error("Error obteniendo historial:", error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = controller;