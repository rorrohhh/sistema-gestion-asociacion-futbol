const express = require('express');
const router = express.Router();
const controller = require('../controllers/paseController');

// Ruta para realizar un nuevo pase
// POST /api/pases
router.post('/', controller.realizarPase);

// Ruta para obtener el historial de un jugador específico
// GET /api/pases/historial/:id
router.get('/historial/:id', controller.obtenerHistorial);

module.exports = router;