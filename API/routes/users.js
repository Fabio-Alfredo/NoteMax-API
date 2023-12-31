const usersController = require('../controllers/user');

function handleMethodNotAllowed(req, res) {
    res.writeHead(405, { 'Content-Type': 'application/json' });
    res.end('Method Not Allowed');
}

const usersRoute = (req, res) => {
    if (req.method === "GET") {
        usersController.getUsers(req, res);
    } else {
        handleMethodNotAllowed(req, res);
    }
};

const deleteUserRoute=(req, res)=>{
    if(req.method === "DELETE"){
        usersController.deleteUser(req, res);
    }else{
        handleMethodNotAllowed(req, res);
    }
}

const editUserRout = (req, res) => {
    if (req.method === "PATCH") {
        usersController.changeUserRole(req, res);
    } else {
        handleMethodNotAllowed(req, res);
    }
};

const loginRoute = (req, res) => {
    if (req.method === "POST") {
        usersController.authenticateUser(req, res);
    } else {
        handleMethodNotAllowed(req, res);
    }
}

const usersIdRoute = (req, res) => {
    if (req.method === "GET") {
        usersController.getUserId(req, res);
    } else {
        handleMethodNotAllowed(req, res);
    }
};

const createUserRoute = (req, res) => {
    if (req.method === "POST") {
        usersController.createUser(req, res);
    } else {
        handleMethodNotAllowed(req, res);
    }
}


module.exports = { usersRoute, usersIdRoute, createUserRoute, editUserRout, loginRoute, deleteUserRoute};