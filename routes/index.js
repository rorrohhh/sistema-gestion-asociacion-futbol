const express = require('express');
const router = express.Router();
const jugadorController = require('../controllers/jugadorController');

// Depuración: Esto imprimirá en la consola qué funciones encontró.
// Si sale "undefined", es que el archivo controller no se guardó bien.
console.log("Funciones cargadas:", jugadorController);

// --- RUTAS ---
router.get('/', jugadorController.listarJugadores);
router.get('/inscribir', jugadorController.mostrarFormulario);
router.post('/guardar', jugadorController.guardar); // <--- Aquí fallaba antes

module.exports = router;