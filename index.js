const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const path = require("path");
const jwt = require("jsonwebtoken");
const cookieParser = require('cookie-parser');
const authMiddleware = require('./middlewares/auth');

require("dotenv").config(); // Cargar variables de entorno desde el archivo .env

const app = express();

// Importar rutas de usuario
const userRoutes = require("./routes/users.routes");
const materiaRoutes = require('./routes/materia.routes');
const previaRoutes = require('./routes/previa.routes');
const estudianteRoutes = require('./routes/estudiante.routes'); 

// Obtener las variables de entorno
const mongoURI = process.env.MONGO_URI;
const port = process.env.PORT || 3000; // Si no se define el puerto en .env, usa el 3000

// Conexión a la base de datos (MongoDB)
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Conexión a MongoDB exitosa"))
  .catch((err) => console.log("Error en la conexión a MongoDB:", err));

// Middleware para procesar datos del cuerpo de la solicitud
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());


app.use(express.static(path.join(__dirname, "views")));

// Redirección desde la ruta principal
app.get('/', (req, res) => {
  // Si el usuario tiene un token válido, redirige a /inicio, si no, a /login
  const token = req.cookies.token;
  if (token) {
    try {
      jwt.verify(token, process.env.JWT_SECRET);
      return res.redirect('/inicio');
    } catch (err) {
      // Token inválido
      return res.redirect('/login');
    }
  } else {
    return res.redirect('/login');
  }
});

// Usar las rutas de usuario
app.use("/users", userRoutes);
app.use('/materias', materiaRoutes);
app.use('/previas', previaRoutes);
app.use('/estudiantes', estudianteRoutes); 



// Ruta pública
app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "login.html"));
});

app.get("/register", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "register.html"));
});

// Ruta protegida (requiere autenticación)
app.get("/inicio", authMiddleware, (req, res) => {
  res.sendFile(path.join(__dirname, "views", "inicio.html"));
});

app.get("/createMateria.html", authMiddleware, (req, res) => {
  res.sendFile(path.join(__dirname, "views", "createMateria.html"));
});

app.get("/historialMateriasEstudiante.html", authMiddleware, (req, res) => {
  res.sendFile(path.join(__dirname, "views", "historialMateriasEstudiante.html"));
});

app.get('/estudiantesInscriptos.html',authMiddleware, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'estudiantesInscriptos.html'));
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
