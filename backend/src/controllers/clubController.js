const Club = require('../models/Club');

const controller = {};

// Listar todos
controller.listar = async (req, res) => {
    try {
        const clubes = await Club.findAll({ order: [['nombre', 'ASC']] });
        res.json(clubes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Guardar
controller.guardar = async (req, res) => {
    console.log("1. Entró al controlador"); // <--- AGREGA ESTO
    console.log("2. Datos recibidos:", req.body); // <--- Y ESTO
    try {
        const { nombre } = req.body;
        const nuevo = await Club.create({ nombre: nombre });
        res.status(201).json(nuevo);
    } catch (error) {
        res.status(400).json({ error: "Error al guardar (posible duplicado)" });
    }
};

// Obtener uno
controller.obtener = async (req, res) => {
    try {
        const club = await Club.findByPk(req.params.id);
        if(!club) return res.status(404).json({error: "Club no encontrado"});
        res.json(club);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Actualizar
controller.actualizar = async (req, res) => {
    try {
        await Club.update(
            { nombre: req.body.nombre },
            { where: { id: req.params.id } }
        );
        res.json({ message: "Club actualizado" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Eliminar
controller.eliminar = async (req, res) => {
    try {
        await Club.destroy({ where: { id: req.params.id } });
        res.json({ message: "Club eliminado" });
    } catch (error) {
        res.status(400).json({ error: "No se puede eliminar (probablemente tiene jugadores)" });
    }
};

module.exports = controller;