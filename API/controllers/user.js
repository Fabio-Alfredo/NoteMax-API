
const db = require('../conecction/mysql');
const url = require('url');
const util = require('util');
const query = util.promisify(db.query).bind(db);
const { bodyParser } = require('../lib/bodyParse');
const { validateUser } = require('../models/users');

const jwt = require('jsonwebtoken');
const secretKey = 'fabioalfredo';

const authenticateUser = async (req, res) => {
    try {
        await bodyParser(req);
        const password = req.body.password;
        const username = req.body.name;


        const sql = 'SELECT id, name, role FROM users WHERE name = ? AND password = ? LIMIT 1';
        const user = (await query(sql, [username, password]))[0];
        console.log(user);

        if (user) {
            const token = jwt.sign({ id: user.id, name: user.name, role: user.role }, secretKey, { expiresIn: '1h' });
            console.log(user.id);
            console.log(token);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ token: token }));
        } else {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Authentication failed' }));
        }
    } catch (err) {
        throw err;
    }
};



const getUsers = async (req, res) => {

    try {
        const sql = 'SELECT * FROM users';
        const results = await query(sql);
        //console.log(results);
        const jsonData = JSON.stringify(results);
        sendResponse(res, 200, 'application/json', jsonData);
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
            sendResponse(res, 400, 'text/plain', 'La solicitud debe contener solo la propiedad "role"');
            return;
        }

        const newRole = req.body.role;

        const checkUserExistenceSQL = `SELECT * FROM users WHERE id = ?`;
        const existingUser = await query(checkUserExistenceSQL, [userId]);

        if (existingUser.length === 0) {
            sendResponse(res, 404, 'text/plain', 'El usuario no existe');
        } else {
            const updateRoleSQL = `UPDATE users SET role = ? WHERE id = ?`;
            await query(updateRoleSQL, [newRole, userId]);

            sendResponse(res, 200, 'text/plain', 'El rol del usuario ha sido cambiado exitosamente');
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
            sendResponse(res, 200, 'application/json', JSON.stringify(result));
        } else {
            sendResponse(res, 404, 'text/plain', 'Usuario no encontrado');
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

        const query = 'INSERT INTO users (id, name, password, email, role) VALUES (?, ?, ?, ?, ?)';

        const values = [
            newUser.id,
            newUser.name,
            newUser.password,
            newUser.email,
            newUser.role
        ];

        db.query(query, values, (err, result) => {
            if (err) {
                handleServerError(res, err);
            } else {
                sendResponse(res, 200, 'text/plain', 'Usuario creado exitosamente');
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


const handleServerError = (res, error) => {
    console.error(error);
    sendResponse(res, 500, 'text/plain', 'Error interno del servidor');
}

module.exports = { getUsers, getUserId, createUser, changeUserRole, authenticateUser };
