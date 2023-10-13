const usersController = require('../controllers/user');

function handleMethodNotAllowed(req, res) {
    res.writeHead(405, { 'Content-Type': 'text/plain' });
    res.end('Method Not Allowed');
}

const usersRoute = (req, res) => {
    if (req.method === "GET") {
        usersController.getUsers(req, res);
    } else {
        handleMethodNotAllowed(req, res);
    }
};

const usersIdRoute = (req, res) => {
    if (req.method === "GET") {
        usersController.getUserId(req, res);
    } else {
        handleMethodNotAllowed(req, res);
    }
};

const createUserRoute = (req, res) => {
    if (req.method === 'POST') {
        usersController.createUser(req, res);
    } else {
        handleMethodNotAllowed(req, res);
    }
}


module.exports = { usersRoute, usersIdRoute, createUserRoute };