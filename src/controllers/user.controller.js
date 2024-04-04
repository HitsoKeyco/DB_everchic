const catchError = require('../utils/catchError');
const User = require('../models/User');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const Rol = require('../models/Rol');
const { sendEmail } = require('../utils/sendEmail');
const generateVerificationToken = require('../utils/verifyToken');
const saveVerificationToken = require('../utils/saveVerificationToken');
const { findUserByVerificationToken } = require('../utils/findUserByVerificationToken');
const createAssessment = require('../utils/createAssessment');



const getAll = catchError(async(req, res) => {
    const results = await User.findAll();
    return res.json(results);
});

const create = catchError(async(req, res) => {
    const { firstName, lastName, email, password } = req.body;
    const hashPassword = await bcrypt.hash(password, 10);
    
    // Crear el usuario en la base de datos
    const newUser = await User.create({ firstName, lastName, email, password: hashPassword });

    // Generar un token de verificación único (puedes utilizar una librería como 'uuid' para esto)
    const verificationToken = generateVerificationToken(); // Esta función debe ser implementada para generar un token único

    // Guardar el token de verificación en la base de datos, asociado al usuario
    await saveVerificationToken(newUser.id, verificationToken); // Esta función debe ser implementada

    // Construir el enlace de verificación
    const verificationLink = `http://localhost:3000/verify/${verificationToken}`; // 

    // Configurar el correo electrónico
    const mailOptions = {
        to: email,
        subject: 'Verificación de Correo Electrónico Everchic',
        html: `Por favor, haz clic en el siguiente enlace para verificar tu correo electrónico: <a href="${verificationLink}">${verificationLink}</a>`
    };

    // Enviar el correo electrónico de verificación
    sendEmail(mailOptions);

    return res.status(201).json(newUser);
});


// Controlador para manejar la solicitud de verificación de correo electrónico
const verifyEmail = catchError(async (req, res) => {
    const { id } = req.params;    
    const user = await findUserByVerificationToken(id);
    if (user) {
        await markUserAsVerified(user.id);
        res.sendStatus(200);
    } else {
        res.status(400).send('No se encontró un usuario con este token de verificación.');
    }
});

const markUserAsVerified = async (userId) => {
    try {
        // Actualiza el campo isVerify a true y elimina el token de verificación de la base de datos
        await User.update({ isVerify: true, verificationToken: null }, { where: { id: userId } });
    } catch (error) {
        console.error('Error al marcar al usuario como verificado:', error);
        throw new Error('Error al marcar al usuario como verificado');
    }
};


const remove = catchError(async(req, res) => {
    const { id } = req.params;
    const result = await User.destroy({ where: {id} });
    if(!result) return res.sendStatus(404);
    return res.sendStatus(204);
});

const update = catchError(async(req, res) => {
    const { id } = req.params;
    //evita la actualizacion del email y el password
    delete req.body.email
    delete req.body.password

    const result = await User.update(
        req.body,
        { where: { id }, returning: true }
    );
    if(result[0] === 0) return res.sendStatus(404);
    return res.json(result[1][0]);

    
});



// Endpoint de Login
const login = catchError(async (req, res) => {
    const { email, password, recaptchaToken } = req.body;
   
    // Comprobamos si existe el usuario
    const user = await User.findOne({ where: { email } });
    if (!user) return res.sendStatus(401);

    // Comprobamos si la contraseña es válida
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.sendStatus(401);

    // Anexamos hash para validar al usuario o caducar la sesión
    const token = jwt.sign(
        { user },
        process.env.TOKEN_SECRET,
        { expiresIn: "1d" }
    );

    // Enviamos la puntuación y el token para crear una evaluación
    const recaptchaScore = await createAssessment({
        token: recaptchaToken, // Token de reCAPTCHA pasado desde el cliente
        // Aquí podrías pasar más opciones si es necesario, como el ID del proyecto o la clave reCAPTCHA
    });

    // Luego puedes hacer lo que quieras con la puntuación, por ejemplo, registrarlo en tu base de datos
    // O simplemente devolverlo en la respuesta JSON
    return res.json({ user, token, recaptchaScore });
});



module.exports = {
    getAll,
    create,
    remove,
    update,
    login,
    verifyEmail,
    
}