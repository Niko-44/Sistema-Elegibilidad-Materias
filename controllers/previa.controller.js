const Previa = require('../models/previa.model');

// Listar todas las previas
async function getAllPrevias(req, res) {
    try {
        const previas = await Previa.find().populate('materia');
        res.json(previas);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener previas' });
    }
}

// Crear una previa
async function createPrevia(req, res) {
    const { materia, tipo } = req.body;

    try {
        const previa = new Previa({ materia, tipo });
        await previa.save();
        res.status(201).json({ message: 'Previa creada', previa });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al crear previa' });
    }
}

// Editar / actualizar una previa
async function updatePrevia(req, res) {
    const { id } = req.params;
    const updateData = req.body;

    try {
        const previa = await Previa.findByIdAndUpdate(id, updateData, { new: true });
        if (!previa) return res.status(404).json({ message: 'Previa no encontrada' });
        res.json({ message: 'Previa actualizada', previa });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al actualizar previa' });
    }
}

// Eliminar una previa
async function deletePrevia(req, res) {
    const { id } = req.params;

    try {
        const previa = await Previa.findByIdAndDelete(id);
        if (!previa) return res.status(404).json({ message: 'Previa no encontrada' });
        res.json({ message: 'Previa eliminada' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al eliminar previa' });
    }
}

module.exports = {
    getAllPrevias,
    createPrevia,
    updatePrevia,
    deletePrevia
};
