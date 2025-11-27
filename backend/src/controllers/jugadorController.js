const Jugador = require('../models/Jugador');
const Club = require('../models/Club');
const { Op } = require('sequelize');
const sequelize = require('../config/database');
const fs = require('fs');
const path = require('path');

const controller = {};

// LISTAR
controller.listar = async (req, res) => {
    try {
        const { club, identificacion, rol, nombre } = req.query;
        let where = {};

        if (club) where.clubId = club;

        if (rol) {
            where.rol = { [Op.like]: `%${rol}%` };
        }

        // BÚSQUEDA HÍBRIDA
        if (identificacion) {
            const terminoBusqueda = identificacion.trim();
            const rutSearch = terminoBusqueda.replace(/[^0-9kK]/g, '');

            const condicionesIdentificacion = [];

            condicionesIdentificacion.push({
                pasaporte: { [Op.like]: `%${terminoBusqueda}%` }
            });

            if (rutSearch.length > 0) {
                condicionesIdentificacion.push(
                    sequelize.where(
                        sequelize.fn('CONCAT', 
                            sequelize.cast(sequelize.col('Jugador.rut'), 'char'),
                            sequelize.col('Jugador.dv')
                        ),
                        { [Op.like]: `%${rutSearch}%` }
                    )
                );
            }

            where = {
                ...where,
                [Op.and]: [
                    { [Op.or]: condicionesIdentificacion }
                ]
            };
        }

        if (nombre) {
            where[Op.or] = [
                { nombres: { [Op.substring]: nombre } },
                { paterno: { [Op.substring]: nombre } },
                { materno: { [Op.substring]: nombre } }
            ];
        }

        const jugadores = await Jugador.findAll({
            where: where,
            include: [{ model: Club }], 
            order: [['paterno', 'ASC']]
        });

        res.json(jugadores);
    } catch (error) {
        console.error("Error listar:", error);
        res.status(500).json({ error: error.message });
    }
};

// GUARDAR
controller.guardar = async (req, res) => {
    try {
        const { 
            numero, paterno, materno, nombres, 
            run_input, rol_input, 
            nacimiento, inscripcion, club_id,
            tipo_identificacion_input, 
            passport_input,
            nacionalidad,
            delegado_input,
            activo // Recibimos el estado activo
        } = req.body;

        // 1. Procesar la imagen si existe
        let fotoPath = null;
        if (req.file) {
            // Guardamos la ruta relativa para servirla después
            fotoPath = `/uploads/${req.file.filename}`;
        }

        let rutData = { rut: null, dv: null };
        let pasaporte = null;
        let tipoIdentificacion = (tipo_identificacion_input || 'RUT').toUpperCase();

        if (tipoIdentificacion === 'RUT') {
            let rutString = (run_input || '').toString().replace(/[^0-9kK]/g, '').toUpperCase();
            let dv = rutString.slice(-1);
            let rutNum = parseInt(rutString.slice(0, -1));

            if (!rutNum) return res.status(400).json({ error: "RUT Inválido" });
            
            rutData.rut = rutNum;
            rutData.dv = dv;

        } else if (tipoIdentificacion === 'PASSPORT') {
            if (!passport_input || passport_input.trim() === '') return res.status(400).json({ error: "Número de Pasaporte obligatorio." });
            pasaporte = passport_input.toUpperCase();
        } else {
             return res.status(400).json({ error: "Tipo de identificación no válido." });
        }

        const nuevo = await Jugador.create({
            numero, paterno, materno, nombres,
            rut: rutData.rut,
            dv: rutData.dv,
            pasaporte: pasaporte,
            tipoIdentificacion: tipoIdentificacion,
            nacionalidad: nacionalidad, 
            rol: rol_input,
            nacimiento,
            inscripcion,
            clubId: club_id,
            delegadoInscripcion: delegado_input,
            
            // Nuevos campos
            foto: fotoPath,
            activo: activo === 'true' || activo === true // Convertir string a boolean
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
            nacimiento, inscripcion, club_id,
            tipo_identificacion_input, 
            passport_input,
            nacionalidad,
            delegado_input,
            activo
        } = req.body;

        let updateData = {
            tipoIdentificacion: (tipo_identificacion_input || 'RUT').toUpperCase(),
            rut: null,
            dv: null,
            pasaporte: null
        };
        
        const tipoIdentificacion = updateData.tipoIdentificacion;

        if (tipoIdentificacion === 'RUT') {
            if(!run_input || run_input.trim() === '') return res.status(400).json({ error: "RUT obligatorio para tipo RUT." });
            
            let rutString = run_input.toString().replace(/[^0-9kK]/g, '').toUpperCase();
            updateData.dv = rutString.slice(-1);
            updateData.rut = parseInt(rutString.slice(0, -1));
            
            if (!updateData.rut) return res.status(400).json({ error: "RUT Inválido." });

        } else if (tipoIdentificacion === 'PASSPORT') {
            if (!passport_input || passport_input.trim() === '') return res.status(400).json({ error: "Número de Pasaporte obligatorio." });
            updateData.pasaporte = passport_input.toUpperCase();
        } else {
             return res.status(400).json({ error: "Tipo de identificación no válido." });
        }

        // Objeto base con los datos a actualizar
        const camposActualizar = {
            numero, paterno, materno, nombres,
            ...updateData,
            nacionalidad: nacionalidad,
            rol: rol_input,
            nacimiento,
            inscripcion,
            clubId: club_id,
            delegadoInscripcion: delegado_input,
            activo: activo === 'true' || activo === true
        };

        // Si se subió una nueva foto, la agregamos al objeto
        if (req.file) {
            // Opcional: Podrías borrar la foto antigua aquí si quisieras ahorrar espacio
            // const jugadorAntiguo = await Jugador.findByPk(req.params.id);
            // if(jugadorAntiguo.foto) fs.unlink(...)

            camposActualizar.foto = `/uploads/${req.file.filename}`;
        }

        await Jugador.update(camposActualizar, { where: { id: req.params.id } });

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