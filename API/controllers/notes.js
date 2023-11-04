const fs = require('fs').promises;
const { bodyParser } = require('../lib/bodyParse');


const getNotes = async (req, res) => {
    try {
        const parts = req.url.split('/');
        const userId = parts[2];

        const data = await fs.readFile('dataNote.json', 'utf8');
        const notes = JSON.parse(data);

        // Usar filter en lugar de find para obtener todas las notas del usuario
        const userNotes = notes.filter(note => note.user_id === userId);

        if (userNotes.length > 0) { 
            sendResponse(res, 200, 'application/json', JSON.stringify(userNotes));
        } else {
            sendResponse(res, 404, 'text/plain', 'Notas no encontradas');
        }
    } catch (err) {
        handleServerError(res, err);
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

module.exports = { getNotes };


