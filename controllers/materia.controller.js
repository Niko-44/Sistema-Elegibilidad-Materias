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
    const { codigo, nombre, creditos, semestre, horarios, previas } = req.body;

    try {
        // Actualizar campos básicos
        const materia = await Materia.findById(id);
        if (!materia) return res.status(404).json({ message: 'Materia no encontrada' });

        materia.codigo = codigo;
        materia.nombre = nombre;
        materia.creditos = creditos;
        materia.semestre = semestre;
        materia.horarios = horarios;

        // Eliminar previas antiguas
        await Previa.deleteMany({ materia: materia._id });

        // Crear nuevas previas y guardar sus IDs
        let nuevasPrevias = [];
        if (previas && previas.length > 0) {
            for (const p of previas) {
                const previaObj = new Previa({
                    materia: materia._id,
                    previa: p.previa,
                    tipo: p.tipo
                });
                await previaObj.save();
                nuevasPrevias.push(previaObj._id);
            }
        }
        materia.previas = nuevasPrevias;

        await materia.save();

        res.json({ message: 'Materia actualizada', materia });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al actualizar materia', error });
    }
}

async function getMateriaById(req, res){
    try {
        const materia = await Materia.findById(req.params.id)
            .populate({
                path: 'previas',
                populate: { path: 'previa', select: 'nombre codigo' }
            });
        if (!materia) return res.status(404).json({ message: 'Materia no encontrada' });
        res.json(materia);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener la materia', error });
    }
};

// Eliminar una materia
async function deleteMateria(req, res) {
    const { id } = req.params;

    try {
        // Verificar si la materia está asociada como previa en otras materias
        const previasAsociadas = await Previa.find({ previa: id });
        if (previasAsociadas.length > 0) {
            return res.status(400).json({
                message: 'No se puede eliminar la materia porque es previa de otra materia.'
            });
        }

        const materia = await Materia.findByIdAndDelete(id);
        if (!materia) return res.status(404).json({ message: 'Materia no encontrada' });

        // Eliminar previas propias
        await Previa.deleteMany({ materia: id });

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
    deleteMateria,
    getMateriaById
};
