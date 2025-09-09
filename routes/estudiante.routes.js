const express = require('express');
const router = express.Router();
const estudianteController = require('../controllers/estudiante.controller');
const authMiddleware = require('../middlewares/auth');

// Rutas para estudiantes
router.get('/creditosAprobados', estudianteController.getCreditosAprobados);
router.post('/inscribir/:id', estudianteController.inscribirMateria);
router.get('/historial', estudianteController.historialMaterias);
router.post('/aprobar/:id', estudianteController.aprobarMateria);
router.post('/cambiarEstado/:id', estudianteController.cambiarEstadoMateria);
router.put('/cambiar-estado/:id', estudianteController.cambiarEstadoMateria);

router.get('/calendario', authMiddleware, estudianteController.getCalendario);


module.exports = router;