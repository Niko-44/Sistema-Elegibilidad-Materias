const express = require('express');
const router = express.Router();
const estudianteController = require('../controllers/estudiante.controller');

// Middleware de autenticación (ejemplo)
function authMiddleware(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No autorizado' });
    try {
        const jwt = require('jsonwebtoken');
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch {
        res.status(401).json({ message: 'Token inválido' });
    }
}

// Inscribirse a una materia
router.post('/inscribir/:id', authMiddleware, estudianteController.inscribirMateria);

// Historial de materias inscritas
router.get('/historial', authMiddleware, estudianteController.historialMaterias);

// Obtener créditos aprobados
router.get('/creditosAprobados', authMiddleware, estudianteController.getCreditosAprobados);

router.get('/calendario', authMiddleware, estudianteController.getCalendario);


module.exports = router;