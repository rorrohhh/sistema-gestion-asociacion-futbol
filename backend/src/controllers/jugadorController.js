const Jugador = require('../models/Jugador');
const Club = require('../models/Club');
const { Op } = require('sequelize');
const sequelize = require('../config/database');
const fs = require('fs');
const path = require('path');

const controller = {};

const getNextFolio = async () => {
    try {
        const result = await Jugador.findOne({
            attributes: [
                [sequelize.fn('MAX', sequelize.cast(sequelize.col('folio'), 'UNSIGNED')), 'maxFolio']
            ],
            raw: true
        });

        let maxFolio = 0;
        if (result && result.maxFolio) {
            maxFolio = parseInt(result.maxFolio, 10);
        }

        if (isNaN(maxFolio) || maxFolio < 10000) {
            return "10000";
        }

        return (maxFolio + 1).toString();

    } catch (error) {
        console.error("Error generando folio, fallback a timestamp:", error);
        return Date.now().toString().slice(-6); 
    }
};

controller.listar = async (req, res) => {
    try {
        const { club, identificacion, folio, nombre, page, size } = req.query;
        const limit = size ? parseInt(size) : 10;
        const pagina = page ? parseInt(page) : 0;
        const offset = pagina * limit;

        let where = {};

        
        if (club && club !== 'undefined') where.clubId = club;

        
        if (folio) {
            where.folio = { [Op.like]: `%${folio}%` };
        }

       
        if (identificacion) {
 
            const termino = identificacion.trim().replace(/\./g, '');
            
            const condicionesIdentificacion = [];

   
            condicionesIdentificacion.push({
                pasaporte: { [Op.like]: `%${termino}%` }
            });

        
            if (termino.length > 0) {
                condicionesIdentificacion.push(
                    sequelize.literal(`
                        CONCAT(IFNULL(rut, ''), IFNULL(dv, '')) 
                        COLLATE utf8mb4_unicode_ci 
                        LIKE '%${termino}%'
                    `)
                );
            }

            where[Op.and] = [
                { [Op.or]: condicionesIdentificacion }
            ];
        }

        // 4. Filtro Nombre
        if (nombre) {
            const nombreLimpio = nombre.trim();
            where[Op.and] = [
                sequelize.where(
                    sequelize.literal(`
                        CONCAT(
                            IFNULL(nombres, ''), ' ', 
                            IFNULL(paterno, ''), ' ', 
                            IFNULL(materno, '')
                        ) COLLATE utf8mb4_unicode_ci
                    `),
                    { [Op.like]: `%${nombreLimpio}%` }
                )
            ];
        }

        const data = await Jugador.findAndCountAll({
            where: where,
            include: [{ model: Club }], 
            order: [['paterno', 'ASC']],
            limit: limit,
            offset: offset
        });

        res.json({
            totalItems: data.count,
            totalPages: Math.ceil(data.count / limit),
            currentPage: pagina,
            jugadores: data.rows
        });

    } catch (error) {
        console.error("Error listar:", error);
        res.status(500).json({ error: error.message });
    }
};

controller.guardar = async (req, res) => {
    try {
        const { 
            paterno, materno, nombres, 
            run_input, 
            nacimiento, inscripcion, club_id,
            tipo_identificacion_input, 
            passport_input,
            nacionalidad,
            delegado_input,
            activo 
        } = req.body;

        let fotoPath = null;
        if (req.file) {
            fotoPath = `/uploads/${req.file.filename}`;
        }

        let rutData = { rut: null, dv: null };
        let pasaporte = null;
        let tipoIdentificacion = (tipo_identificacion_input || 'RUT').toUpperCase();

        if (tipoIdentificacion === 'RUT') {
            let rutString = (run_input || '').toString().replace(/[^0-9kK]/g, '').toUpperCase();
            let dv = rutString.slice(-1);
            let rutNum = rutString.slice(0, -1); // Lo guardamos como String según tu cambio anterior

            // Validación básica
            if (!rutNum) return res.status(400).json({ error: "RUT Inválido" });
            
            rutData.rut = rutNum;
            rutData.dv = dv;

        } else if (tipoIdentificacion === 'PASSPORT') {
            if (!passport_input || passport_input.trim() === '') return res.status(400).json({ error: "Número de Pasaporte obligatorio." });
            pasaporte = passport_input.toUpperCase();
        } else {
             return res.status(400).json({ error: "Tipo de identificación no válido." });
        }


        const nuevoFolio = await getNextFolio();

        const nuevo = await Jugador.create({
            paterno, materno, nombres,
            rut: rutData.rut,
            dv: rutData.dv,
            pasaporte: pasaporte,
            tipoIdentificacion: tipoIdentificacion,
            nacionalidad: nacionalidad, 
            folio: nuevoFolio, 
            nacimiento,
            inscripcion,
            clubId: club_id,
            delegadoInscripcion: delegado_input,
            foto: fotoPath,
            activo: activo === 'true' || activo === true
        });

        res.status(201).json(nuevo);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al crear jugador" });
    }
};

controller.obtener = async (req, res) => {
    try {
        const jugador = await Jugador.findByPk(req.params.id, { include: Club }); 
        if(!jugador) return res.status(404).json({error: "No encontrado"});
        res.json(jugador);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

controller.actualizar = async (req, res) => {
    try {
        const { 
            paterno, materno, nombres, 
            run_input, 
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
            updateData.rut = rutString.slice(0, -1); // String
            
            if (!updateData.rut) return res.status(400).json({ error: "RUT Inválido." });

        } else if (tipoIdentificacion === 'PASSPORT') {
            if (!passport_input || passport_input.trim() === '') return res.status(400).json({ error: "Número de Pasaporte obligatorio." });
            updateData.pasaporte = passport_input.toUpperCase();
        } else {
             return res.status(400).json({ error: "Tipo de identificación no válido." });
        }

        const camposActualizar = {
            paterno, materno, nombres,
            ...updateData,
            nacionalidad: nacionalidad,
            nacimiento,
            inscripcion,
            clubId: club_id,
            delegadoInscripcion: delegado_input,
            activo: activo === 'true' || activo === true
        };

        if (req.file) {
            camposActualizar.foto = `/uploads/${req.file.filename}`;
        }

        await Jugador.update(camposActualizar, { where: { id: req.params.id } });

        res.json({ message: "Actualizado" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

controller.eliminar = async (req, res) => {
    try {
        await Jugador.destroy({ where: { id: req.params.id } });
        res.json({ message: "Eliminado" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = controller;