const db = require("../database");
const ejs = require('ejs'); 
const path = require('path'); 

const jugadorController = {};

// ---  LISTAR JUGADORES ---
jugadorController.listarJugadores = async (req, res) => {
    try {
        const esAjax = req.query.ajax === 'true';

        // Filtros
        const filtroClubId = req.query.club || null;
        let filtroRut = req.query.rut || null;
        const filtroRol = req.query.rol || null;
        const filtroNombre = req.query.nombre || null;

        if (filtroRut) {
            // Solo quitamos puntos y guiones. Mantenemos el número completo con DV.
            filtroRut = filtroRut.toString().replace(/[^0-9kK]/g, '');
        }

        // Consultar BD
        const [rows] = await db.query('CALL sp_listar_jugadores(?, ?, ?, ?)', [
            filtroClubId, filtroRut, filtroRol, filtroNombre
        ]);
        
        const jugadoresEncontrados = rows[0];

        // --- CAMINO 1: ES AJAX (BÚSQUEDA EN VIVO) ---
        if (esAjax) {
            // Usamos el layout vacío que acabamos de crear
            return res.render('partials/tabla_resultados', { 
                jugadores: jugadoresEncontrados,
                layout: 'layout_ajax'
            });
        }

        // --- CAMINO 2: CARGA NORMAL ---
        const [clubesData] = await db.query('CALL sp_listar_clubes()');

        return res.render('index', { 
            jugadores: jugadoresEncontrados, 
            clubes: clubesData[0],
            filtroClub: filtroClubId,
            filtroRut: filtroRut,
            filtroRol: filtroRol,
            filtroNombre: filtroNombre
            // Aquí usa el layout por defecto ('layout.ejs') automáticamente
        });

    } catch (error) {
        console.error("Error al listar:", error);
        if(!res.headersSent) { // Evita error si ya se envió respuesta
            res.status(500).send("Error interno: " + error.message);
        }
    }
};

// ---  MOSTRAR FORMULARIO ---
jugadorController.mostrarFormulario = async (req, res) => {
    try {
        // AHORA NECESITAMOS LOS CLUBES TAMBIÉN AQUÍ
        const [listaClubes] = await db.query('CALL sp_listar_clubes()');
        
        res.render('inscribir', {
            clubes: listaClubes[0],
            layout: 'layout'
        });
    } catch (error) {
        console.error("Error al mostrar formulario:", error);
        res.send("Error al cargar formulario");
    }
};

// --- GUARDAR JUGADOR ---
jugadorController.guardar = async (req, res) => {
    console.log("--------------------------------");
    console.log("INTENTANDO GUARDAR JUGADOR");
    console.log("Datos recibidos (Body):", req.body);
    console.log("--------------------------------");
    try {
        const { 
            numero, paterno, materno, nombres, 
            run_input, rol_input, 
            nacimiento, inscripcion, 
            club_id // <--- Ahora recibimos el ID
        } = req.body;

        let rutLimpio = (run_input || '').toString().replace(/[^0-9kK]/g, '').toUpperCase();
        let dv = rutLimpio.slice(-1);
        let rutNum = parseInt(rutLimpio.slice(0, -1));

        if (!rutNum) throw new Error("RUT Inválido");

        const sql = `CALL sp_guardar_jugador(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        
        // Pasamos club_id al final
        const values = [numero, paterno, materno, nombres, rutNum, dv, rol_input, nacimiento, inscripcion, club_id];

        await db.query(sql, values);
        res.redirect('/jugadores');

    } catch (error) {
        console.error("Error al guardar:", error);
        res.send(`Error: ${error.message}`);
    }
};


// --- EDITAR: Mostrar formulario con datos ---
jugadorController.editar = async (req, res) => {
    const { id } = req.params;
    try {
        // 1. Obtener datos del jugador
        const [jugadorData] = await db.query('CALL sp_obtener_jugador(?)', [id]);
        
        // 2. Obtener lista de clubes (para el select)
        const [clubesData] = await db.query('CALL sp_listar_clubes()');

        res.render('editar', {
            jugador: jugadorData[0][0], // El primer registro del primer resultado
            clubes: clubesData[0]
        });
    } catch (error) {
        console.error(error);
        res.send("Error al cargar edición");
    }
};

// --- ACTUALIZAR: Guardar cambios en BD ---
jugadorController.actualizar = async (req, res) => {
    try {
        const { 
            id, // ¡Importante! Este viene de un campo oculto
            numero, paterno, materno, nombres, 
            run_input, rol_input, 
            nacimiento, inscripcion, club_id 
        } = req.body;

        // Limpieza de RUT (Igual que en guardar)
        let rutLimpio = (run_input || '').toString().replace(/[^0-9kK]/g, '').toUpperCase();
        let dv = rutLimpio.slice(-1);
        let rutNum = rutLimpio.slice(0, -1); // Ahora es string por los pasaportes

        const sql = `CALL sp_actualizar_jugador(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        const values = [id, numero, paterno, materno, nombres, rutNum, dv, rol_input, nacimiento, inscripcion, club_id];

        await db.query(sql, values);
        res.redirect('/jugadores');

    } catch (error) {
        console.error("Error al actualizar:", error);
        res.send("Error al actualizar: " + error.message);
    }
};

// --- ELIMINAR ---
jugadorController.eliminar = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('CALL sp_eliminar_jugador(?)', [id]);
        res.redirect('/jugadores');
    } catch (error) {
        console.error(error);
        res.send("Error al eliminar");
    }
};

module.exports = jugadorController;


