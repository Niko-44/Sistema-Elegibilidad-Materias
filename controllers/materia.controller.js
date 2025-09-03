const Materia = require('../models/materia.model');
const Previa = require('../models/previa.model');

// Listar todas las materias con sus previas
async function getAllMaterias(req, res) {
    try {
        const materias = await Materia.find()
            .populate({
                path: 'previas',
                populate: { path: 'previa', select: 'nombre' } // solo traemos el nombre
            });
        res.json(materias);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener materias' });
    }
}


// Crear una materia
async function createMateria(req, res) {
    try {
        const { codigo, nombre, creditos, semestre, horarios, previas } = req.body;

        // Crear la materia
        const materia = new Materia({ codigo, nombre, creditos, semestre, horarios });
        await materia.save(); // necesitamos el _id para las previas

        // Crear objetos Previa para cada materia seleccionada
        if (previas && previas.length > 0) {
            for (const p of previas) {
                if (!p.previa) continue;

                const nuevaPrevia = new Previa({
                    materia: materia._id, // la materia que tiene la previa
                    previa: p.previa,     // la materia seleccionada como previa
                    tipo: p.tipo,
                    'Aprobada': p.Aprobada || 'NO'
                });
                await nuevaPrevia.save();
                materia.previas.push(nuevaPrevia._id);
            }
        }

        await materia.save();

        res.status(201).json({
            message: 'Materia creada correctamente',
            materia
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al crear materia', error });
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
