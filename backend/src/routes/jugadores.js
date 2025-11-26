const express = require('express');
const router = express.Router();
const controller = require('../controllers/jugadorController');

router.get('/', controller.listar);
router.post('/', controller.guardar);
router.get('/:id', controller.obtener);
router.put('/:id', controller.actualizar);
router.delete('/:id', controller.eliminar);

module.exports = router;