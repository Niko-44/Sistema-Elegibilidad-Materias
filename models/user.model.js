const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  rol: { type: String, enum: ["Estudiante", "Administrador"], default: "Estudiante" },
  materias: [
    {
      materia: { type: mongoose.Schema.Types.ObjectId, ref: "Materia", required: true },
      estado: { type: String, enum: ["Pendiente", "Cursado", "En Curso", "Aprobado"], required: true, default: "Pendiente" }
    }
  ]
});

module.exports = mongoose.model("User", userSchema);
