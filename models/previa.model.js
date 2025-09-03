const mongoose = require('mongoose');

const previaSchema = new mongoose.Schema({
    materia: { type: mongoose.Schema.Types.ObjectId, ref: 'Materia', required: true }, // Materia dueña de la previa
    previa: { type: mongoose.Schema.Types.ObjectId, ref: 'Materia', required: true }, // Materia que es la previa
    tipo: { type: String, default: 'Sin asignar' }
});

module.exports = mongoose.model('Previa', previaSchema);
