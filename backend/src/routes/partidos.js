const express = require('express');
const router = express.Router();
const partidoController = require('../controllers/partidoController');

router.get('/', partidoController.getAll); 
router.get('/tabla', partidoController.getTablaPosiciones);

router.post('/preview', partidoController.generarPreview);
router.post('/masivo', partidoController.guardarFixtureMasivo);
router.get('/check', partidoController.checkTorneo);


router.put('/:id/resultado', partidoController.updateResultado);
router.put('/:id/suspender', partidoController.suspenderPartido);
router.post('/reprogramar', partidoController.reprogramarFecha);

router.delete('/', partidoController.eliminarFixture);
module.exports = router;