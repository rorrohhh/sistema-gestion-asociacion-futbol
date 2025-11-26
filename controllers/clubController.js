const db = require("../database");
const controller = {};

// LISTAR
controller.listar = async (req, res) => {
    try {
        const [rows] = await db.query('CALL sp_listar_clubes()');
        res.render('clubes/index', { clubes: rows[0] });
    } catch (error) {
        console.error(error);
        res.send("Error al listar clubes");
    }
};

// GUARDAR (NUEVO)
controller.guardar = async (req, res) => {
    try {
        const { nombre } = req.body;
        await db.query('CALL sp_guardar_club(?)', [nombre.toUpperCase()]);
        res.redirect('/clubes');
    } catch (error) {
        console.error(error);
        res.send("Error al guardar club");
    }
};

// MOSTRAR FORM EDICIÓN
controller.editar = async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await db.query('CALL sp_obtener_club(?)', [id]);
        res.render('clubes/editar', { club: rows[0][0] });
    } catch (error) {
        console.error(error);
        res.send("Error al cargar club");
    }
};

// ACTUALIZAR
controller.actualizar = async (req, res) => {
    try {
        const { id, nombre } = req.body;
        await db.query('CALL sp_actualizar_club(?, ?)', [id, nombre.toUpperCase()]);
        res.redirect('/clubes');
    } catch (error) {
        console.error(error);
        res.send("Error al actualizar");
    }
};

// ELIMINAR
controller.eliminar = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('CALL sp_eliminar_club(?)', [id]);
        res.redirect('/clubes');
    } catch (error) {
        console.error(error);
        // Aquí podrías manejar el error si el club tiene jugadores
        res.send("No se puede eliminar el club porque tiene jugadores inscritos.");
    }
};

module.exports = controller;