const express = require('express');
const router = express.Router();
const jugadorController = require('../controllers/jugadorController');
const clubController = require('../controllers/clubController');

// --- 1. HOME (PÁGINA DE INICIO) ---
router.get('/', (req, res) => {
    res.render('home'); // Renderiza la nueva vista de inicio
});

// --- 2. RUTAS DE JUGADORES (Ahora con prefijo implícito /jugadores en la URL) ---
router.get('/jugadores', jugadorController.listarJugadores);
router.get('/jugadores/inscribir', jugadorController.mostrarFormulario);
router.post('/jugadores/guardar', jugadorController.guardar);
router.get('/jugadores/editar/:id', jugadorController.editar);
router.post('/jugadores/actualizar', jugadorController.actualizar);
router.get('/jugadores/eliminar/:id', jugadorController.eliminar);

// --- 3. RUTAS DE CLUBES (CRUD NUEVO) ---
router.get('/clubes', clubController.listar);
router.post('/clubes/guardar', clubController.guardar);
router.get('/clubes/editar/:id', clubController.editar);
router.post('/clubes/actualizar', clubController.actualizar);
router.get('/clubes/eliminar/:id', clubController.eliminar);

module.exports = router;