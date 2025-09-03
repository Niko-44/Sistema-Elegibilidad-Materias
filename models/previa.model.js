const mongoose = require('mongoose');

const previaSchema = new mongoose.Schema({
    materia: { type: mongoose.Schema.Types.ObjectId, ref: 'Materia', required: true },
    tipo: { type: String, enum: ['Examen', 'Curso'], required: true } 
});

module.exports = mongoose.model('Previa', previaSchema);
