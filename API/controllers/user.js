
const db = require('../conecction/mysql');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const url = require('url');
const util = require('util');
const query = util.promisify(db.query).bind(db);
const { bodyParser } = require('../lib/bodyParse');
const { validateUser } = require('../models/users');

const SECRET = require('../config');
const jwt = require('jsonwebtoken');
//para token
const secretKey = SECRET.SECRETKEY;

//para encriptado
const claveSecret = SECRET.CLAVE_ENCRIPTADO;

const authenticateUser = async (req, res) => {
    try {
        await bodyParser(req);
        const plainTextPassword = req.body.password;
        const username = req.body.user;

        if (!username || !plainTextPassword) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Invalid input' }));
            return;
        }

        const sql = 'SELECT id, name, role, password FROM users WHERE user = ? LIMIT 1';
        const user = (await query(sql, [username]))[0];

        if (user) {
            // Compara la contraseña proporcionada con la contraseña almacenada en la base de datos
            const passwordMatch = await bcrypt.compare(plainTextPassword, user.password);

            if (passwordMatch) {
                const token = jwt.sign({ id: user.id, name: user.name, role: user.role }, secretKey, { expiresIn: '1h' });
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ token: token }));
            } else {
                res.writeHead(401, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Authentication failed' }));
            }
        } else {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'User not found' }));
        }
    } catch (err) {
        throw err;
    }
};



const getUsers = async (req, res) => {

    try {
        const sql = 'SELECT * FROM users';
        const results = await query(sql);

        const resultsWithDecryptedEmail = results.map(user => {
            const encryptedEmail = user.email;
            const decryptedEmail = decryptData(encryptedEmail, claveSecret);
            return { ...user, email: decryptedEmail };
        });


        const jsonData = JSON.stringify(resultsWithDecryptedEmail);
        sendResponse(res, 200, 'application/json', jsonData);
    } catch (err) {
        handleServerError(res, err);
    }
};

const deleteUser = async (req, res) => {
    try {
        const urlObj = url.parse(req.url, true);
        const userId = urlObj.query.id;

        const checkUserExistenceSQL = 'SELECT * FROM users WHERE id = ?';
        const existingUser = await query(checkUserExistenceSQL, [userId]);

        if (existingUser.length === 0) {
            sendResponse(res, 404, 'application/json', 'El usuario no existe');
        } else {
            const deleteUserSQL = `DELETE FROM users WHERE id = ?`;
            await query(deleteUserSQL, [userId]);
            sendResponse(res, 200, 'application/json', 'El usuario ha sido eliminado exitosamente');
        }
    } catch (err) {
        handleServerError(res, err);
    }
};

const changeUserRole = async (req, res) => {
    try {
        const parts = req.url.split('/');
        const userId = parts[3];

        await bodyParser(req);
        if (Object.keys(req.body).length !== 1 || !req.body.hasOwnProperty('role')) {
            sendResponse(res, 400, 'application/json', 'La solicitud debe contener solo la propiedad "role"');
            return;
        }

        const newRole = req.body.role;

        const checkUserExistenceSQL = `SELECT * FROM users WHERE id = ?`;
        const existingUser = await query(checkUserExistenceSQL, [userId]);

        if (existingUser.length === 0) {
            sendResponse(res, 404, 'application/json', 'El usuario no existe');
        } else {
            const updateRoleSQL = `UPDATE users SET role = ? WHERE id = ?`;
            await query(updateRoleSQL, [newRole, userId]);

            sendResponse(res, 200, 'application/json', 'El rol del usuario ha sido cambiado exitosamente');
        }
    } catch (err) {
        handleServerError(res, err);
    }
};

const getUserId = async (req, res) => {
    try {
        const urlObj = url.parse(req.url, true);
        const userId = urlObj.query.id;


        const sql = 'SELECT * FROM users WHERE id = ? ';
        const result = await query(sql, [userId]);

        if (result.length > 0) {
            const encryptedEmail = result[0].email;
            const decryptedEmail = decryptData(encryptedEmail, claveSecret);
            const userDataWithDecryptedEmail = { ...result[0], email: decryptedEmail };
            sendResponse(res, 200, 'application/json', JSON.stringify(userDataWithDecryptedEmail));
        } else {
            sendResponse(res, 404, 'application/json', 'Usuario no encontrado');
        }
    } catch (err) {
        handleServerError(res, err);
    }
};

//validacion de usuario existente para crear uno nuevo
const getUsersExiting = async (req, res) => {

    try {
        const sql = 'SELECT * FROM users';
        const results = await query(sql);
        return results;
    } catch (err) {
        handleServerError(res, err);
    }
};


const createUser = async (req, res) => {
    try {
        await bodyParser(req);
        const newUser = req.body;


        const existingUsers = await getUsersExiting(req, res);
        const validationResult = validateUser(newUser, existingUsers);

        if (!validationResult.isValid) {
            sendResponse(res, 400, 'application/json', JSON.stringify({ error: validationResult.error }));
            return;
        }


        const encryptedEmail = encryptData(newUser.email, claveSecret);
        const encryptedPhone = encryptData(newUser.phone_number, claveSecret);
        
        if (!newUser.password) {
            sendResponse(res, 400, 'application/json', JSON.stringify({ error: 'Password is required' }));
            return;
        }
        const hashedPassword = await bcrypt.hash(newUser.password, 12);
        const query = 'INSERT INTO users (name, user, password, email, phone_number, role) VALUES (?, ?, ?, ?, ?, ?)';

        if (!newUser.role || (newUser.role !== 'admin' && newUser.role !== 'user' && newUser.role !== 'superadmin')) {
            newUser.role = 'user';
        }


        const values = [
            newUser.name,
            newUser.user,
            hashedPassword,
            encryptedEmail,
            encryptedPhone,
            newUser.role
        ];

        db.query(query, values, (err, result) => {
            if (err) {
                handleServerError(res, err);
            } else {
                sendResponse(res, 200, 'application/json', 'Usuario creado exitosamente');
            }
        });

    } catch (err) {
        handleServerError(req, err);
    }
};

const sendResponse = (res, status, contentType, body) => {
    res.writeHead(status, { 'Content-Type': contentType });
    res.end(body);
}

function encryptData(data, secretKey) {
    // Generar un IV aleatorio
    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipheriv('aes-256-cbc', secretKey, iv);

    let encryptedData = cipher.update(data, 'utf8', 'hex');
    encryptedData += cipher.final('hex');

    const result = iv.toString('hex') + encryptedData;

    return result;
}

function decryptData(encryptedData, secretKey) {
    // Extraer el IV del texto cifrado
    const ivLength = 32;
    const iv = Buffer.from(encryptedData.slice(0, ivLength), 'hex');
    const encryptedText = encryptedData.slice(ivLength);

    const decipher = crypto.createDecipheriv('aes-256-cbc', secretKey, iv);

    let decryptedData = decipher.update(encryptedText, 'hex', 'utf8');
    decryptedData += decipher.final('utf8');

    return decryptedData;
}



const handleServerError = (res, error) => {
    console.error(error);
    sendResponse(res, 500, 'application/json', 'Error interno del servidor');
}

module.exports = { getUsers, getUserId, createUser, changeUserRole, authenticateUser, deleteUser };
