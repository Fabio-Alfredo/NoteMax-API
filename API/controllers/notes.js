const url = require('url');
const db = require('../conecction/mysql');
const crypto = require('crypto');
const util = require('util');
const query = util.promisify(db.query).bind(db);
const { bodyParser } = require('../lib/bodyParse');
const { validateNotes } = require('../models/notes');

//clave de encriptacion
const SECRET = require('../config');
const claveSecret = SECRET.CLAVE_ENCRIPTADO;

const createNote = async (req, res) => {
    try {
        await bodyParser(req);
        const newNote = req.body;
        const userId = req.user.id;

        const userExists = await userExistsWithId(userId);

        if (!userExists) {
            sendResponse(res, 404, 'application/json', 'El usuario con user_id no existe');
            return;
        }

        const existingNotes = await getNotesExiting(req, res);
        const validationResult = validateNotes(newNote, existingNotes);
        if (!validationResult.isValid) {
            sendResponse(res, 400, 'application/json', JSON.stringify({ error: validationResult.error }));
            return;
        }


        // Encripta el título y el contenido
        const encryptedTitle = encryptData(newNote.tittle, claveSecret);
        const encryptedContent = encryptData(newNote.content, claveSecret);

        const query = 'INSERT INTO notes (user_id, tittle, content, categories) VALUES ( ?, ?, ?, ?)';

        const values = [
            userId,
            encryptedTitle,
            encryptedContent,
            newNote.categories
        ];

        db.query(query, values, (err, result) => {
            if (err) {
                handleServerError(res, err);
            } else {
                sendResponse(res, 200, 'application/json', JSON.stringify('Nota creada exitosamente'));
            }
        });
    } catch (err) {
        handleServerError(res, err);
    }
};


const deleteNote = async (req, res) => {
    try {
        const parts = req.url.split('/');
        const id = parts[3];

        const checkNoteExistenceSQL = `SELECT * FROM notes WHERE id = ?`;
        const existingNote = await query(checkNoteExistenceSQL, [id]);

        if (existingNote.length === 0) {
            sendResponse(res, 404, 'application/json', 'La nota no existe');
        } else {
            const deleteNoteSQL = `DELETE FROM notes WHERE id = ?`;
            await query(deleteNoteSQL, [id]);
            sendResponse(res, 200, 'application/json', 'La nota ha sido eliminada exitosamente');
        }
    } catch (err) {
        handleServerError(res, err);
    }
};


const getNotes = async (req, res) => {
    try {
        const sql = `SELECT id, tittle, content, categories, created_at FROM notes`;
        const result = await query(sql);


        // Desencripta el título y el contenido en cada resultado
        const resultsWithDecryptedData = result.map(note => {
            const encryptedTitle = note.tittle;
            const encryptedContent = note.content;
            const decryptedTitle = decryptData(encryptedTitle, claveSecret);
            const decryptedContent = decryptData(encryptedContent, claveSecret);
            return { ...note, tittle: decryptedTitle, content: decryptedContent };
        });

        if (resultsWithDecryptedData.length > 0) {
            sendResponse(res, 200, 'application/json', JSON.stringify(resultsWithDecryptedData));
        } else {
            sendResponse(res, 404, 'application/json', 'Sin notas creadas');
        }
    } catch (err) {
        handleServerError(res, err);
    }
};


const getNotesUser = async (req, res) => {
    try {
        const userId = req.user.id;

        const userExists = await userExistsWithId(userId);

        if (!userExists) {
            sendResponse(res, 404, 'application/json', 'El usuario no existe');
            return;
        }

        const sql = `SELECT id, tittle, content, categories, created_at FROM notes WHERE user_id = ?`;
        const value = [userId];
        const result = await query(sql, value);


        // Desencripta el título y el contenido en cada resultado
        const resultsWithDecryptedData = result.map(note => {
            const encryptedTitle = note.tittle;
            const encryptedContent = note.content;
            const decryptedTitle = decryptData(encryptedTitle, claveSecret);
            const decryptedContent = decryptData(encryptedContent, claveSecret);
            return { ...note, tittle: decryptedTitle, content: decryptedContent };
        });

        if (resultsWithDecryptedData.length > 0) {
            sendResponse(res, 200, 'application/json', JSON.stringify(resultsWithDecryptedData));
        } else {
            sendResponse(res, 200, 'application/json', JSON.stringify([]));
        }
    } catch (err) {
        handleServerError(res, err);
    }
};

const getNotesType = async (req, res) => {
    try {
        const userId = req.user.id;
        const parsedUrl = url.parse(req.url, true);
        const category = parsedUrl.query.category;

        const validCategories = ['draft', 'math', 'social', 'friends'];

        if (!validCategories.includes(category)) {
            sendResponse(res, 400, 'application/json', 'Categoría no válida');
            return;
        }

        const userExists = await userExistsWithId(userId);

        if (!userExists) {
            sendResponse(res, 404, 'application/json', 'El usuario no existe');
            return;
        }

        const sql = 'SELECT * FROM notes WHERE user_id = ? AND categories = ?';
        const values = [userId, category];
        const result = await query(sql, values);

        // Desencripta el título y el contenido en cada resultado
        const resultsWithDecryptedData = result.map(note => {
            const encryptedTitle = note.tittle;
            const encryptedContent = note.content;
            const decryptedTitle = decryptData(encryptedTitle, claveSecret);
            const decryptedContent = decryptData(encryptedContent, claveSecret);
            return { ...note, tittle: decryptedTitle, content: decryptedContent };
        });

        if (resultsWithDecryptedData.length > 0) {
            sendResponse(res, 200, 'application/json', JSON.stringify(resultsWithDecryptedData));
        } else {
            sendResponse(res, 404, 'application/json', Json.stringify('Categoría vacía'));
        }
    } catch (err) {
        handleServerError(req, err);
    }
};

//validacion de usuari si existe
async function userExistsWithId(userId) {
    const sql = `SELECT id FROM users WHERE id = ${userId}`;
    const result = await query(sql);
    return result.length > 0;
};

//verificar que no se repita el id
const getNotesExiting = async (req, res) => {
    try {
        const sql = 'SELECT * FROM notes';
        const results = await query(sql);
        return results;
    } catch (err) {
        handleServerError(res, err);
    }
};


function encryptData(data, claveSecret) {
    const iv = crypto.randomBytes(16); // Genera un vector de inicialización aleatorio
    const cipher = crypto.createCipheriv('aes-256-cbc', claveSecret, iv);
    let encryptedData = cipher.update(data, 'utf8', 'hex');
    encryptedData += cipher.final('hex');
    const result = iv.toString('hex') + encryptedData
    return result;
}

function decryptData(encryptedData, claveSecret) {
    const ivLength = 32;
    const iv = Buffer.from(encryptedData.slice(0, ivLength), 'hex');
    const encryptedText = encryptedData.slice(ivLength);

    const decipher = crypto.createDecipheriv('aes-256-cbc', claveSecret, iv);

    let decryptedData = decipher.update(encryptedText, 'hex', 'utf8');
    decryptedData += decipher.final('utf8');

    return decryptedData;
}

const sendResponse = (res, status, contentType, body) => {
    res.writeHead(status, { 'Content-Type': contentType });
    res.end(body);
};

const handleServerError = (res, error) => {
    console.error(error);
    sendResponse(res, 500, 'application/json', 'Error interno del servidor');
};

module.exports = { getNotesUser, createNote, getNotesType, getNotes, deleteNote };


