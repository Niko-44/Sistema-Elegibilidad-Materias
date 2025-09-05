const express = require('express');
const router = express.Router();
const User = require('../models/user.model');
const { requireAdmin } = require('../middlewares/auth');

// Devuelve los estudiantes inscritos a una materia
router.get('/inscritos/:materiaId', requireAdmin, async (req, res) => {
    const materiaId = req.params.materiaId;
    try {
        // Busca usuarios que tengan la materia en su array
        const users = await User.find({ 'materias.materia': materiaId });
        const estudiantes = users.map(u => {
            const mat = u.materias.find(m => m.materia.toString() === materiaId);
            return {
                _id: u._id,
                nombre: u.nombre,
                email: u.email,
                estado: mat?.estado || 'Pendiente'
            };
        });
        res.json(estudiantes);
    } catch (err) {
        res.status(500).json([]);
    }
});

module.exports = router;