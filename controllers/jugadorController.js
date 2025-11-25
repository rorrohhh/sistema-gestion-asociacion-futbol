const db = require("../database");

const jugadorController = {};

// --- 1. LISTAR JUGADORES ---
jugadorController.listarJugadores = async (req, res) => {
    try {
        // Obtenemos el ID del club si viene en la URL (?club=5)
        const filtroClubId = req.query.club || null;

        // A. Traemos la lista de clubes (Usando el nuevo SP)
        const [listaClubes] = await db.query('CALL sp_listar_clubes()');

        // B. Traemos los jugadores (Pasando el ID o null)
        const [rows] = await db.query('CALL sp_listar_jugadores(?)', [filtroClubId]);

        res.render('index', { 
            jugadores: rows[0], 
            filtro: filtroClubId,
            clubes: listaClubes[0] // Enviamos la lista para el combo
        });

    } catch (error) {
        console.error("Error al listar:", error);
        res.status(500).send("Error interno");
    }
};

// --- 2. MOSTRAR FORMULARIO ---
jugadorController.mostrarFormulario = async (req, res) => {
    try {
        // AHORA NECESITAMOS LOS CLUBES TAMBIÉN AQUÍ
        const [listaClubes] = await db.query('CALL sp_listar_clubes()');
        
        res.render('inscribir', {
            clubes: listaClubes[0] 
        });
    } catch (error) {
        console.error("Error al mostrar formulario:", error);
        res.send("Error al cargar formulario");
    }
};

// --- 3. GUARDAR JUGADOR ---
jugadorController.guardar = async (req, res) => {
    try {
        const { 
            numero, paterno, materno, nombres, 
            run_input, rol_input, 
            nacimiento, inscripcion, 
            club_id // <--- Ahora recibimos el ID, no el nombre
        } = req.body;

        let rutLimpio = (run_input || '').toString().replace(/[^0-9kK]/g, '').toUpperCase();
        let dv = rutLimpio.slice(-1);
        let rutNum = parseInt(rutLimpio.slice(0, -1));

        if (!rutNum) throw new Error("RUT Inválido");

        const sql = `CALL sp_guardar_jugador(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        
        // Pasamos club_id al final
        const values = [numero, paterno, materno, nombres, rutNum, dv, rol_input, nacimiento, inscripcion, club_id];

        await db.query(sql, values);
        res.redirect('/');

    } catch (error) {
        console.error("Error al guardar:", error);
        res.send(`Error: ${error.message}`);
    }
};

module.exports = jugadorController;