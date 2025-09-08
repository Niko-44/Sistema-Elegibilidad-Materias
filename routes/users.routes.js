const express = require("express");
const router = express.Router();

// Importar el controlador de usuario
const userController = require("../controllers/user.controller"); // Asegúrate de la ruta correcta

// Ruta para registrar un nuevo usuario (registro)
router.post("/register", userController.registerUser);

// Ruta de logout
router.post("/logout", userController.logoutUser);

// Ruta de login (autenticación)
router.post("/login", userController.loginUser);

router.get('/inscritos/:materiaId', userController.getEstudiantesInscritos);

module.exports = router;
