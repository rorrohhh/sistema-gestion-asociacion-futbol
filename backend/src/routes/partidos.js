const express = require('express');
const router = express.Router();
const partidoController = require('../controllers/partidoController');

// Generador
router.post('/preview', partidoController.generarPreview);
router.post('/masivo', partidoController.guardarFixtureMasivo);

// Gestión
router.get('/', partidoController.getAll); // Obtener fixture completo
router.put('/:id/resultado', partidoController.updateResultado); // Guardar goles
router.get('/tabla', partidoController.getTablaPosiciones); // Calcular tabla
router.delete('/', partidoController.eliminarFixture);
router.post('/reprogramar', partidoController.reprogramarFecha);

module.exports = router;