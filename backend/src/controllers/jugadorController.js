const Jugador = require('../models/Jugador');
const Club = require('../models/Club');
const { Op } = require('sequelize');

const controller = {};

// LISTAR CON FILTROS
controller.listar = async (req, res) => {
    try {
        const { club, rut, rol, nombre } = req.query;
        let where = {};

        if (club) where.clubId = club;
        if (rol) where.rol = rol;

        // Filtro RUT (limpieza)
        if (rut) {
            const limpio = rut.toString().replace(/[^0-9kK]/g, '');
            const soloNumeros = parseInt(limpio.slice(0, -1)) || parseInt(limpio);
            if(soloNumeros) where.rut = soloNumeros;
        }

        // Filtro Nombre (Búsqueda flexible OR)
        if (nombre) {
            where[Op.or] = [
                { nombres: { [Op.substring]: nombre } },
                { paterno: { [Op.substring]: nombre } },
                { materno: { [Op.substring]: nombre } }
            ];
        }

        const jugadores = await Jugador.findAll({
            where: where,
            include: [{ model: Club }], // JOIN
            order: [['paterno', 'ASC']]
        });

        res.json(jugadores);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

// GUARDAR
controller.guardar = async (req, res) => {
    try {
        const { 
            numero, paterno, materno, nombres, 
            run_input, rol_input, 
            nacimiento, inscripcion, club_id 
        } = req.body;

        // Limpiar RUT
        let rutString = (run_input || '').toString().replace(/[^0-9kK]/g, '').toUpperCase();
        let dv = rutString.slice(-1);
        let rutNum = parseInt(rutString.slice(0, -1));

        if (!rutNum) return res.status(400).json({ error: "RUT Inválido" });

        const nuevo = await Jugador.create({
            numero, paterno, materno, nombres,
            rut: rutNum,
            dv,
            rol: rol_input,
            nacimiento,
            inscripcion,
            clubId: club_id
        });

        res.status(201).json(nuevo);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al crear jugador" });
    }
};

// OBTENER UNO
controller.obtener = async (req, res) => {
    try {
        const jugador = await Jugador.findByPk(req.params.id, { include: Club });
        if(!jugador) return res.status(404).json({error: "No encontrado"});
        res.json(jugador);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ACTUALIZAR
controller.actualizar = async (req, res) => {
    try {
        const { 
            numero, paterno, materno, nombres, 
            run_input, rol_input, 
            nacimiento, inscripcion, club_id 
        } = req.body;

        // Recalcular RUT si viene
        let rutUpdate = {};
        if(run_input){
            let rutString = run_input.toString().replace(/[^0-9kK]/g, '').toUpperCase();
            rutUpdate.dv = rutString.slice(-1);
            rutUpdate.rut = parseInt(rutString.slice(0, -1));
        }

        await Jugador.update({
            numero, paterno, materno, nombres,
            ...rutUpdate, // Esparce rut y dv si existen
            rol: rol_input,
            nacimiento,
            inscripcion,
            clubId: club_id
        }, { where: { id: req.params.id } });

        res.json({ message: "Actualizado" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ELIMINAR
controller.eliminar = async (req, res) => {
    try {
        await Jugador.destroy({ where: { id: req.params.id } });
        res.json({ message: "Eliminado" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = controller;