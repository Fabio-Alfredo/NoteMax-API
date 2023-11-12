const notesController = require('../controllers/notes');


const getNotesUserRoute = (req, res) => {
    if (req.method === "GET") {
        notesController.getNotesUser(req, res);
    } else {
        handleMethodNotAllowed(req, res);
    }
};

const getNotesRoute = (req, res) => {
    if (req.method === "GET") {
        notesController.getNotes(req, res);
    } else {
        handleMethodNotAllowed(req, res);
    }
}

const getDeleteNoteRoute=(req, res)=>{
    if(req.method === "DELETE"){
        notesController.deleteNote(req, res);
    }else{
        handleMethodNotAllowed(req, res);
    }
}

const createNoteRoute = (req, res) => {
    if (req.method === "POST") {
        notesController.createNote(req, res);
    } else {
        handleMethodNotAllowed(req, res);
    }
};

const getNotesTypeRoute = (req, res) => {
    if (req.method === 'GET') {
        notesController.getNotesType(req, res);
    } else {
        handleMethodNotAllowed(req, res);
    }
}


function handleMethodNotAllowed(req, res) {
    res.writeHead(405, { 'Content-Type': 'text/plain' });
    res.end('Method Not Allowed');
};


module.exports = { getNotesUserRoute, createNoteRoute, getNotesTypeRoute, getNotesRoute, getDeleteNoteRoute };