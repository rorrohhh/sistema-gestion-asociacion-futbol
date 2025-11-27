const express = require('express');
const router = express.Router();
const controller = require('../controllers/jugadorController');
const upload = require('../libs/storage'); // Tu configuración de Multer

router.get('/', controller.listar);
router.get('/:id', controller.obtener);

router.post('/', upload.single('foto'), controller.guardar);
router.put('/:id', upload.single('foto'), controller.actualizar);

router.delete('/:id', controller.eliminar);

module.exports = router;