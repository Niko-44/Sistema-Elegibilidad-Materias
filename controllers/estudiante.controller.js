const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const Materia = require('../models/materia.model');
const Previa = require('../models/previa.model');

// Función auxiliar para obtener el userId del token
const getUserIdFromToken = (req) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) return null;
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        return decoded.userId;
    } catch (error) {
        return null;
    }
};

// Inscribir a una materia
exports.inscribirMateria = async (req, res) => {
    try {
        const userId = getUserIdFromToken(req);
        if (!userId) return res.status(401).json({ message: 'Token inválido o no proporcionado' });

        const materiaId = req.params.id;

        const materia = await Materia.findById(materiaId);
        if (!materia) return res.status(404).json({ message: 'Materia no encontrada' });

        const user = await User.findById(userId).populate('materias.materia');
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

        // Verificar si ya está inscrito
        const yaInscripto = user.materias.some(m => m.materia._id.toString() === materiaId);
        if (yaInscripto) return res.status(400).json({ message: 'Ya está inscrito en esta materia' });

        // Verificar previas
        let causas = [];
        for (const previaId of materia.previas) {
            const previa = await Previa.findById(previaId).populate('previa');
            if (!previa) continue;
            // Buscar si el usuario tiene la previa aprobada
            const previaAprobada = user.materias.find(m =>
                m.materia._id.toString() === previa.previa._id.toString() && m.estado === 'Aprobado'
            );
            if (!previaAprobada) {
                causas.push(`Debes aprobar la materia "${previa.previa.nombre}"`);
            }
        }

        if (causas.length > 0) {
            return res.status(400).json({ message: 'No elegible para inscribirse', causas });
        }

        user.materias.push({ materia: materiaId, estado: 'En Curso' });
        await user.save();

        res.json({ message: 'Inscripción exitosa' });
    } catch (err) {
        console.error('Error al inscribirse:', err);
        res.status(500).json({ message: 'Error al inscribirse', error: err.message });
    }
};

// Historial de materias inscritas
exports.historialMaterias = async (req, res) => {
    try {
        const userId = getUserIdFromToken(req);
        if (!userId) return res.status(401).json({ message: 'Token inválido o no proporcionado' });

        const user = await User.findById(userId).populate('materias.materia');
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

        res.json(user.materias);
    } catch (err) {
        console.error('Error al obtener historial:', err);
        res.status(500).json({ message: 'Error al obtener historial', error: err.message });
    }
};

// Obtener créditos aprobados
exports.getCreditosAprobados = async (req, res) => {
    try {
        const userId = getUserIdFromToken(req);
        if (!userId) return res.status(401).json({ creditos: 0, message: 'Token inválido o no proporcionado' });

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
        console.error('Error al obtener créditos:', err);
        res.status(500).json({ creditos: 0 });
    }
};

exports.aprobarMateria = async (req, res) => {
    try {
        const { userId: studentId } = req.body; 
        const materiaId = req.params.id;

        const currentUserId = getUserIdFromToken(req);
        if (!currentUserId) return res.status(401).json({ message: 'Token inválido o no proporcionado' });

        const currentUser = await User.findById(currentUserId);
        if (!currentUser) return res.status(404).json({ message: 'Usuario no encontrado' });

        if (!['Administrador', 'administrador', 'admin'].includes(currentUser.rol)) {
            return res.status(403).json({ message: 'Solo administradores pueden aprobar materias' });
        }

        if (!studentId) return res.status(400).json({ message: 'Falta el ID del estudiante' });

        const user = await User.findById(studentId);
        if (!user) return res.status(404).json({ message: 'Estudiante no encontrado' });

        const materiaObj = user.materias.find(m => 
            m.materia && m.materia.toString() === materiaId
        );

        if (!materiaObj) return res.status(404).json({ message: 'El estudiante no está inscrito en esta materia' });

        // Actualizar estado
        materiaObj.estado = 'Aprobado';

        // Obtener créditos de la materia
        const materia = await Materia.findById(materiaId);
        if (materia && materia.creditos) {
            // Si usas un campo en el usuario, lo sumas
            user.creditosAprobados = (user.creditosAprobados || 0) + materia.creditos;
        }

        await user.save();

        res.json({ message: 'Materia aprobada y créditos actualizados correctamente' });
    } catch (err) {
        console.error('Error al aprobar materia:', err);
        res.status(500).json({ message: 'Error al aprobar materia', error: err.message });
    }
};


exports.getCalendario = async (req, res) => {
    const userId = req.user.userId;

    try {
        const user = await User.findById(userId).populate('materias.materia');
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

        // Solo materias activas con horarios
        const calendario = user.materias
            .filter(m => m.materia && m.materia.horarios.length > 0 && m.estado === "En Curso")
            .map(m => ({
                nombre: m.materia.nombre,
                horarios: m.materia.horarios
            }));

        res.json(calendario);
    } catch (err) {
        res.status(500).json({ message: 'Error al obtener calendario', error: err.message });
    }
};

exports.cambiarEstadoMateria = async (req, res) => {
    try {
        const currentUserId = getUserIdFromToken(req);
        if (!currentUserId) return res.status(401).json({ message: 'Token inválido o no proporcionado' });

        const currentUser = await User.findById(currentUserId);
        if (!currentUser) return res.status(404).json({ message: 'Usuario no encontrado' });

        const materiaId = req.params.id;
        const { userId, estado } = req.body;

        // Validar estado permitido
        const estadosPermitidos = ['Pendiente', 'Cursado', 'En Curso', 'Aprobado'];
        if (!estadosPermitidos.includes(estado)) {
            return res.status(400).json({ message: 'Estado no permitido' });
        }

        // Si es admin, puede cambiar el estado de cualquier usuario
        // Si es estudiante, solo puede cambiar el estado de sí mismo
        let targetUserId;
        if (['Administrador', 'administrador', 'admin'].includes(currentUser.rol)) {
            targetUserId = userId || currentUserId;
        } else {
            // Solo puede cambiar su propio estado
            if (userId && userId !== currentUserId) {
                return res.status(403).json({ message: 'No tienes permiso para cambiar el estado de otro usuario' });
            }
            targetUserId = currentUserId;
        }

        const user = await User.findById(targetUserId);
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

        const materiaObj = user.materias.find(m => m.materia.toString() === materiaId);
        if (!materiaObj) {
            return res.status(404).json({ message: 'No inscrito en esta materia' });
        }

        materiaObj.estado = estado;
        await user.save();

        res.json({ message: `Estado actualizado a ${estado}` });
    } catch (err) {
        console.error('Error al cambiar estado:', err);
        res.status(500).json({ message: 'Error al cambiar estado', error: err.message });
    }
};

exports.getEstudiantesPorMateria = async (req, res) => {
    try {
        const materiaId = req.params.id;

        // Buscar usuarios que tengan esta materia
        const estudiantes = await User.find({ "materias.materia": materiaId })
            .select('nombre email materias')
            .lean();

        // Mapear solo el estado de la materia específica
        const resultado = estudiantes.map(est => {
            const mat = est.materias.find(m => m.materia.toString() === materiaId);
            return {
                id: est._id,
                nombre: est.nombre,
                email: est.email,
                estado: mat.estado
            };
        });

        res.json({ estudiantes: resultado });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error al obtener estudiantes', error: err.message });
    }
};

exports.importarAprobadas = async (req, res) => {
    try {
        const userId = getUserIdFromToken(req);
        if (!userId) return res.status(401).json({ message: 'Token inválido o no proporcionado' });
        const { materias } = req.body;
        if (!Array.isArray(materias) || materias.length === 0) {
            return res.status(400).json({ message: 'No se enviaron materias' });
        }
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

        let count = 0;
        for (const materiaId of materias) {
            // Si ya está, actualiza a 'Aprobado'
            let matObj = user.materias.find(m => m.materia.toString() === materiaId);
            if (matObj) {
                matObj.estado = 'Aprobado';
            } else {
                user.materias.push({ materia: materiaId, estado: 'Aprobado' });
            }
            count++;
        }
        await user.save();
        res.json({ message: `${count} materias importadas como aprobadas` });
    } catch (err) {
        res.status(500).json({ message: 'Error al importar', error: err.message });
    }
};
