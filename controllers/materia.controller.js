const Materia = require('../models/materia.model');
const Previa = require('../models/previa.model');

// Listar todas las materias con sus previas
async function getAllMaterias(req, res) {
    try {
        const materias = await Materia.find().populate('previas');
        res.json(materias);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener materias' });
    }
}

// Crear una materia
async function createMateria(req, res) {
    const { codigo, nombre, creditos, semestre, horarios, previas } = req.body;

    try {
        const materia = new Materia({ codigo, nombre, creditos, semestre, horarios, previas });
        await materia.save();
        res.status(201).json({ message: 'Materia creada', materia });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al crear materia' });
    }
}

// Editar / actualizar una materia
async function updateMateria(req, res) {
    const { id } = req.params;
    const updateData = req.body;

    try {
        const materia = await Materia.findByIdAndUpdate(id, updateData, { new: true });
        if (!materia) return res.status(404).json({ message: 'Materia no encontrada' });
        res.json({ message: 'Materia actualizada', materia });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al actualizar materia' });
    }
}

// Eliminar una materia
async function deleteMateria(req, res) {
    const { id } = req.params;

    try {
        const materia = await Materia.findByIdAndDelete(id);
        if (!materia) return res.status(404).json({ message: 'Materia no encontrada' });
        res.json({ message: 'Materia eliminada' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al eliminar materia' });
    }
}

module.exports = {
    getAllMaterias,
    createMateria,
    updateMateria,
    deleteMateria
};
