const mongoose = require('mongoose');

const materiaSchema = new mongoose.Schema({
    codigo: { type: String, required: true, unique: true },
    nombre: { type: String, required: true },
    creditos: { type: Number, required: true },
    semestre: { type: Number, required: true },
    horarios: [{ dia: String, horaInicio: String, horaFin: String }],
    previas: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Previa' }]
});

module.exports = mongoose.model('Materia', materiaSchema);
