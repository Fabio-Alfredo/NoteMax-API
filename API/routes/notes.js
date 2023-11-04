const notesController = require('../controllers/notes');

function handleMethodNotAllowed(req, res) {
    res.writeHead(405, { 'Content-Type': 'text/plain' });
    res.end('Method Not Allowed');
}

const NotesRoute = (req, res) => {
    if (req.method === "GET") {
        notesController.getNotes(req, res);
    } else {
        handleMethodNotAllowed(req, res);
    }
};

module.exports = {NotesRoute};