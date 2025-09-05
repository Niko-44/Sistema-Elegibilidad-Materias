const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const Materia = require('../models/materia.model');

// Inscribir a una materia
exports.inscribirMateria = async (req, res) => {
    const userId = req.user.userId; // Debes tener un middleware de autenticación que agregue req.user
    const materiaId = req.params.id;

    try {
        const materia = await Materia.findById(materiaId);
        if (!materia) return res.status(404).json({ message: 'Materia no encontrada' });

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

        // Verificar si ya está inscrito
        const yaInscripto = user.materias.some(m => m.materia.toString() === materiaId);
        if (yaInscripto) return res.status(400).json({ message: 'Ya está inscrito en esta materia' });

        user.materias.push({ materia: materiaId, estado: 'En Curso' });
        await user.save();

        res.json({ message: 'Inscripción exitosa' });
    } catch (err) {
        res.status(500).json({ message: 'Error al inscribirse', error: err.message });
    }
};

// Historial de materias inscritas
exports.historialMaterias = async (req, res) => {
    const userId = req.user.userId;
    try {
        const user = await User.findById(userId).populate('materias.materia');
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

        res.json(user.materias);
    } catch (err) {
        res.status(500).json({ message: 'Error al obtener historial', error: err.message });
    }
};

// Obtener créditos aprobados
exports.getCreditosAprobados = async (req, res) => {
    // Obtener el token del header
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).json({ creditos: 0, message: 'No autorizado' });

    const token = authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ creditos: 0, message: 'Token malformado' });

    let userId;
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        userId = decoded.id || decoded._id;
    } catch (err) {
        return res.status(403).json({ creditos: 0, message: 'Token inválido' });
    }

    try {
        const user = await User.findById(userId).populate('materias.materia');
        if (!user) return res.status(404).json({ creditos: 0 });

        let suma = 0;
        user.materias.forEach(m => {
            if (m.estado === 'Aprobado' && m.materia && m.materia.creditos) {
                suma += m.materia.creditos;
            }
        });

        res.json({ creditos: suma });
    } catch (err) {
        res.status(500).json({ creditos: 0 });
    }
};