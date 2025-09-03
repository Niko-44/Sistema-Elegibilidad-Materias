const express = require('express');
const router = express.Router();
const previaController = require('../controllers/previa.controller');

// CRUD Previas
router.get('/', previaController.getAllPrevias);
router.post('/', previaController.createPrevia);
router.put('/:id', previaController.updatePrevia);
router.delete('/:id', previaController.deletePrevia);

module.exports = router;
