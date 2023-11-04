const fs = require('fs').promises;
const { bodyParser } = require('../lib/bodyParse');
const { validateUser } = require('../models/users');

const getUsers = async (req, res) => {
    try {
        const data = await fs.readFile('data.json', 'utf8');
        sendResponse(res, 200, 'application/json', data);
    } catch (err) {
        handleServerError(res, err);
    }
}

const getUserId = async (req, res) => {
    try {
        const parts = req.url.split('/');
        const userId = parts[2];

        const data = await fs.readFile('data.json', 'utf8');
        const users = JSON.parse(data);

        const user = users.find(user => user.id == userId);

        if (user) {
            sendResponse(res, 200, 'application/json', JSON.stringify(user));
        } else {
            sendResponse(res, 404, 'text/plain', 'Usuario no encontrado');
        }
    } catch (err) {
        handleServerError(res, err);
    }
};

const createUser = async (req, res) => {
    try {
        await bodyParser(req);
        const newUser = req.body;

        const data = await fs.readFile('data.json', 'utf8');
        const users = JSON.parse(data);

        const validationResult = await validateUser(newUser, users);
        if (!validationResult.isValid) {
            sendResponse(res, 400, 'application/json', JSON.stringify({ error: validationResult.error }));
            return;
        }

        users.push(newUser);
        await fs.writeFile('data.json', JSON.stringify(users, null, 2), 'utf8');

        sendResponse(res, 200, 'text/plain', 'Recibido');
    } catch (err) {
        handleServerError(req, err);
    }
}

const sendResponse = (res, status, contentType, body) => {
    res.writeHead(status, { 'Content-Type': contentType });
    res.end(body);
}

const handleServerError = (res, error) => {
    console.error(error);
    sendResponse(res, 500, 'text/plain', 'Error interno del servidor');
}

module.exports = { getUsers, getUserId, createUser };
