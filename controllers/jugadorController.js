const db = require("../database");

const jugadorController = {};

// --- 1. LISTAR JUGADORES ---
jugadorController.listarJugadores = async (req, res) => {

    try {
        const esAjax = req.query.ajax === 'true';


        // Filtros
        const filtroClubId = req.query.club || null;
        const filtroRut = req.query.rut || null;
        const filtroRol = req.query.rol || null;
        const filtroNombre = req.query.nombre || null;

        // Prueba de Base de Datos

        const [rows] = await db.query('CALL sp_listar_jugadores(?, ?, ?, ?)', [filtroClubId, filtroRut, filtroRol, filtroNombre]);
        
        // Verificar si la BD respondió
        if (!rows || rows.length === 0) {
            console.error("!!! ERROR: La base de datos devolvió vacío o undefined");
            return res.status(500).send("Error en BD");
        }
        
        const jugadoresEncontrados = rows[0];


        if (esAjax) {


            return res.render('partials/tabla_resultados', { jugadores: jugadoresEncontrados }, (err, html) => {
                if (err) {
                    console.error(err); // 
                    return res.status(500).send("Error renderizando la vista: " + err.message);
                }
                console.log("6. Renderizado exitoso. Enviando HTML...");
                res.send(html);
            });
        }

        // Carga normal

        const [clubesData] = await db.query('CALL sp_listar_clubes()');
        res.render('index', { 
            jugadores: jugadoresEncontrados, 
            clubes: clubesData[0],
            filtroClub: filtroClubId,
            filtroRut: filtroRut,
            filtroRol: filtroRol,
            filtroNombre: filtroNombre
        });

    } catch (error) {
        console.error("!!! ERROR FATAL EN CATCH !!!", error);
        res.status(500).send("Error interno: " + error.message);
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
        res.redirect('/');

    } catch (error) {
        console.error("Error al guardar:", error);
        res.send(`Error: ${error.message}`);
    }
};

module.exports = jugadorController;