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