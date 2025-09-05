const express = require('express');
const router = express.Router();
const estudianteController = require('../controllers/estudiante.controller');

// Rutas para estudiantes
router.get('/creditosAprobados', estudianteController.getCreditosAprobados);
router.post('/inscribir/:id', estudianteController.inscribirMateria);
router.get('/historial', estudianteController.historialMaterias);
router.post('/aprobar/:id', estudianteController.aprobarMateria);

module.exports = router;