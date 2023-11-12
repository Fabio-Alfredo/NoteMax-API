const url = require('url');
const db = require('../conecction/mysql');
const util = require('util');
const query = util.promisify(db.query).bind(db);
const { bodyParser } = require('../lib/bodyParse');
const { validateNotes } = require('../models/notes')


const deleteNote = async (req, res) => {
    try {
        const parts = req.url.split('/');
        const id = parts[3];

        const checkNoteExistenceSQL = `SELECT * FROM notes WHERE id = ?`;
        const existingNote = await query(checkNoteExistenceSQL, [id]);

        if (existingNote.length === 0) {
            sendResponse(res, 404, 'text/plain', 'La nota no existe');
        } else {
            const deleteNoteSQL = `DELETE FROM notes WHERE id = ?`;
            await query(deleteNoteSQL, [id]);
            sendResponse(res, 200, 'text/plain', 'La nota ha sido eliminada exitosamente');
        }
    } catch (err) {
        handleServerError(res, err);
    }
};


const getNotes = async (req, res) => {
    try {

        const sql = `SELECT * FROM notes`;
        const result = await query(sql);

        if (result.length > 0) {
            sendResponse(res, 200, 'application/json', JSON.stringify(result));
        } else {
            sendResponse(res, 404, 'text/plain', 'Sin notas creadas');
        }
    } catch (err) {
        handleServerError(res, err);
    }
};



const getNotesUser = async (req, res) => {
    try {
        const urlObj = url.parse(req.url, true);
        const userId = urlObj.query.user_id;

        const userExists = await userExistsWithId(userId);

        if (!userExists) {
            sendResponse(res, 404, 'text/plain', 'El usuario  no existe');
            return;
        }

        const sql = `SELECT * FROM notes WHERE user_id = ?`;
        const value = [userId]
        const result = await query(sql, value);

        if (result.length > 0) {
            sendResponse(res, 200, 'application/json', JSON.stringify(result));
        } else {
            sendResponse(res, 404, 'text/plain', 'Sin notas creadas');
        }
    } catch (err) {
        handleServerError(res, err);
    }
};

const getNotesType = async (req, res) => {
    try {
        const urlObj = url.parse(req.url, true);
        const userId = urlObj.query.user_id;
        const category = urlObj.query.category;

        const validCategories = ['draft', 'math', 'social', 'friends'];

        if (!validCategories.includes(category)) {
            sendResponse(res, 400, 'text/plain', 'Categoría no válida');
            return;
        }

        const userExists = await userExistsWithId(userId);

        if (!userExists) {
            sendResponse(res, 404, 'text/plain', 'El usuario  no existe');
            return;
        }

        console.log("userId:", userId);
        console.log("category:", category);


        const sql = 'SELECT * FROM notes WHERE user_id = ? AND categories = ?';
        const values = [userId, category];
        const result = await query(sql, values);

        if (result.length > 0) {
            sendResponse(res, 200, 'application/json', JSON.stringify(result));
        } else {
            sendResponse(res, 404, 'text/plain', 'Categoria vacia');
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


const createNote = async (req, res) => {

    try {
        await bodyParser(req);
        const newNote = req.body;

        const userExists = await userExistsWithId(newNote.user_id);

        if (!userExists) {
            sendResponse(res, 404, 'text/plain', 'El usuario con user_id no existe');
            return;
        }

        const existingNotes = await getNotesExiting(req, res);
        const validationResult = validateNotes(newNote, existingNotes);
        if (!validationResult.isValid) {
            sendResponse(res, 400, 'application/json', JSON.stringify({ error: validationResult.error }));
            return;
        }

        const query = 'INSERT INTO notes (id, user_id, tittle, content, categories) VALUES (?, ?, ?, ?, ?)';

        const values = [
            newNote.id,
            newNote.user_id,
            newNote.tittle,
            newNote.content,
            newNote.categories
        ];

        db.query(query, values, (err, result) => {
            if (err) {
                handleServerError(res, err);
            } else {
                sendResponse(res, 200, 'text/plain', 'Nota creado exitosamente');
            }
        });

    } catch (err) {
        handleServerError(res, err);
    }
};

const sendResponse = (res, status, contentType, body) => {
    res.writeHead(status, { 'Content-Type': contentType });
    res.end(body);
};

const handleServerError = (res, error) => {
    console.error(error);
    sendResponse(res, 500, 'text/plain', 'Error interno del servidor');
};

module.exports = { getNotesUser, createNote, getNotesType, getNotes, deleteNote };


