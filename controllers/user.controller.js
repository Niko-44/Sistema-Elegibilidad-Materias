const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model"); // Asegúrate de la ruta correcta

// Función para registrar un usuario
async function registerUser(req, res) {
    const { nombre, email, password, rol } = req.body;

    try {
        // Comprobar si el usuario ya existe
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).send("El usuario ya existe");
        }

        // Cifrar la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Crear un nuevo usuario
        const user = new User({ nombre, email, password: hashedPassword, rol });

        await user.save();
        res.status(201).send("Usuario creado exitosamente");
    } catch (error) {
        console.error("Error al crear el usuario:", error);
        res.status(500).send("Error al crear el usuario");
    }
}

// Función para autenticar un usuario (login)
async function loginUser(req, res) {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "Credenciales incorrectas" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Credenciales incorrectas" });
        }

        // Crear token JWT
        const token = jwt.sign({ userId: user._id, rol: user.rol }, process.env.JWT_SECRET, {
            expiresIn: "1h",
        });

        // Enviar token en cookie además de JSON
        res
            .cookie('token', token, {
                httpOnly: true,
                maxAge: 3600000,
                sameSite: 'lax'
            })
            .json({
                message: "¡Inicio de sesión exitoso!",
                token: token  
            });

    } catch (error) {
        console.error("Error al intentar iniciar sesión:", error);
        res.status(500).json({ message: "Error al intentar iniciar sesión" });
    }
}

// Función para cerrar sesión
function logoutUser(req, res) {
    res
        .clearCookie('token', { httpOnly: true, sameSite: 'lax' })
        .json({ message: 'Sesión cerrada exitosamente' });
}


module.exports = {
    registerUser,
    loginUser,
    logoutUser
};
