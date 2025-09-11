const mongoose = require('mongoose');
const Materia = require('../models/materia.model');

const hoy = new Date();
const horaInicio = hoy.toISOString().slice(11, 16); // HH:MM
const horaFin = hoy.toISOString().slice(11, 16); // HH:MM

const materias = [
  { codigo: "INF_MDL1", nombre: "Matemática Discreta y Lógica 1", creditos: 12, semestre: 1 },
  { codigo: "INF_MAT", nombre: "Matemáticas", creditos: 0, semestre: 1 },
  { codigo: "INF_ACO1", nombre: "Actividad complementaria 1: Inglés Técnico 1", creditos: 8, semestre: 1 },
  { codigo: "INF_EDA", nombre: "Estructura de Datos y Algoritmos", creditos: 16, semestre: 2 },
  { codigo: "INF_MDL2", nombre: "Matemática Discreta y Lógica 2", creditos: 6, semestre: 2 },
  { codigo: "INF_SOP", nombre: "Sistemas Operativos", creditos: 12, semestre: 2 },
  { codigo: "INF_BDA1", nombre: "Base de Datos 1", creditos: 12, semestre: 2 },
  { codigo: "INF_ACO2", nombre: "Actividad Complementaria 2: Inglés Técnico 2 (Inglés Conversacional)", creditos: 4, semestre: 2 },
  { codigo: "INF_PAV", nombre: "Programación Avanzada", creditos: 12, semestre: 3 },
  { codigo: "INF_RCO", nombre: "Redes de Computadoras", creditos: 12, semestre: 3 },
  { codigo: "INF_ACO3", nombre: "Actividad Complementaria 3: Comunicación Oral y Escrita", creditos: 4, semestre: 3 },
  { codigo: "INF_ACO4", nombre: "Actividad Complementaria 4: Contabilidad", creditos: 8, semestre: 3 },
  { codigo: "INF_BDA2", nombre: "Base de Datos 2", creditos: 12, semestre: 3 },
  { codigo: "INF_PAP", nombre: "Programación de Aplicaciones", creditos: 16, semestre: 4 },
  { codigo: "INF_AIN", nombre: "Administración de Infraestructuras", creditos: 8, semestre: 4 },
  { codigo: "INF_ISO", nombre: "Ingeniería de Software", creditos: 12, semestre: 4 },
  { codigo: "INF_ACR", nombre: "Actividad Complementaria 5: Relaciones Personales y Laborales", creditos: 4, semestre: 4 },
  { codigo: "INF_PES", nombre: "Probabilidad y Estadística", creditos: 8, semestre: 4 }
];

async function seedMaterias() {
  await mongoose.connect('mongodb+srv://nk:pruebadb@cluster0.nsf3ww2.mongodb.net/sistemaMaterias?retryWrites=true&w=majority&appName=Cluster0'); // Cambia la URI si es necesario
  await Materia.deleteMany({});
  for (const mat of materias) {
    await Materia.create({
      codigo: mat.codigo,
      nombre: mat.nombre,
      creditos: mat.creditos,
      semestre: mat.semestre,
      horarios: [{ dia: hoy.toISOString().slice(0, 10), horaInicio, horaFin }],
      previas: []
    });
  }
  console.log('Materias importadas correctamente');
  mongoose.disconnect();
}

seedMaterias();