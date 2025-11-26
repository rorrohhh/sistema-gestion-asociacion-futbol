const Jugador = require('../models/Jugador');
const Club = require('../models/Club');
const { Op } = require('sequelize');

const controller = {};

// LISTAR CON FILTROS (No requiere cambios, ya incluye Club)
controller.listar = async (req, res) => {
    try {
        const { club, rut, rol, nombre } = req.query;
        let where = {};

        if (club) where.clubId = club;
        if (rol) where.rol = rol;

        // Filtro RUT (limpieza). NOTA: Esto solo funcionará si se busca por RUT, no por Pasaporte.
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

// GUARDAR (Actualizado para Pasaporte/RUT)
controller.guardar = async (req, res) => {
    try {
        const { 
            numero, paterno, materno, nombres, 
            run_input, rol_input, 
            nacimiento, inscripcion, club_id,
            // CAMPOS NUEVOS:
            tipo_identificacion_input, 
            passport_input 
        } = req.body;

        let rutData = { rut: null, dv: null };
        let pasaporte = null;
        let tipoIdentificacion = (tipo_identificacion_input || 'RUT').toUpperCase();

        if (tipoIdentificacion === 'RUT') {
            // Lógica de validación y limpieza para RUT
            let rutString = (run_input || '').toString().replace(/[^0-9kK]/g, '').toUpperCase();
            let dv = rutString.slice(-1);
            let rutNum = parseInt(rutString.slice(0, -1));

            // Validación: RUT debe ser numérico
            if (!rutNum) return res.status(400).json({ error: "RUT Inválido" });
            
            rutData.rut = rutNum;
            rutData.dv = dv;

        } else if (tipoIdentificacion === 'PASSPORT') {
            // Lógica de Pasaporte
            if (!passport_input || passport_input.trim() === '') return res.status(400).json({ error: "Número de Pasaporte obligatorio." });
            pasaporte = passport_input.toUpperCase(); // Guardamos en mayúsculas por consistencia
        } else {
             return res.status(400).json({ error: "Tipo de identificación no válido." });
        }


        const nuevo = await Jugador.create({
            numero, paterno, materno, nombres,
            // Datos de identificación condicionales
            rut: rutData.rut,
            dv: rutData.dv,
            pasaporte: pasaporte,
            tipoIdentificacion: tipoIdentificacion,
            
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
        // Sequilize devolverá automáticamente los campos pasaporte y tipoIdentificacion
        const jugador = await Jugador.findByPk(req.params.id, { include: Club }); 
        if(!jugador) return res.status(404).json({error: "No encontrado"});
        res.json(jugador);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ACTUALIZAR (Actualizado para Pasaporte/RUT)
controller.actualizar = async (req, res) => {
    try {
        const { 
            numero, paterno, materno, nombres, 
            run_input, rol_input, 
            nacimiento, inscripcion, club_id,
            // CAMPOS NUEVOS:
            tipo_identificacion_input, 
            passport_input
        } = req.body;

        let updateData = {
            tipoIdentificacion: (tipo_identificacion_input || 'RUT').toUpperCase(),
            rut: null,
            dv: null,
            pasaporte: null
        };
        
        const tipoIdentificacion = updateData.tipoIdentificacion;

        if (tipoIdentificacion === 'RUT') {
            // Lógica para RUT
            if(!run_input || run_input.trim() === '') return res.status(400).json({ error: "RUT obligatorio para tipo RUT." });
            
            let rutString = run_input.toString().replace(/[^0-9kK]/g, '').toUpperCase();
            updateData.dv = rutString.slice(-1);
            updateData.rut = parseInt(rutString.slice(0, -1));
            
            if (!updateData.rut) return res.status(400).json({ error: "RUT Inválido." });

        } else if (tipoIdentificacion === 'PASSPORT') {
            // Lógica para Pasaporte
            if (!passport_input || passport_input.trim() === '') return res.status(400).json({ error: "Número de Pasaporte obligatorio." });
            updateData.pasaporte = passport_input.toUpperCase();
        } else {
             return res.status(400).json({ error: "Tipo de identificación no válido." });
        }


        await Jugador.update({
            numero, paterno, materno, nombres,
            ...updateData, // Sobrescribe rut, dv, pasaporte, y tipoIdentificacion
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