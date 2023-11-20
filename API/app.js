const http = require('http');
const routeUser = require('./routes/users');
const routeNotes = require('./routes/notes');
const jwt = require('jsonwebtoken');

const SECRET = require('./config');
//para token
const secretKey = SECRET.SECRETKEY;

const requestTracker = {};
const rateLimit = 5;
const rateLimitWindow = 60 * 1000;


const server = http.createServer((req, res) => {

    const { url, method } = req;

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH');

    const verificarToken = (req, res, next) => {
        let token = req.headers.authorization;

        if (!token) {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Token no proporcionado' }));
        } else {
            if (token.startsWith('Bearer')) {
                token = token.slice(7);
            }

            jwt.verify(token, secretKey, (err, decoded) => {
                if (err) {
                    res.writeHead(401, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'Token inválido' }));
                } else {
                    req.user = decoded;
                    next();
                }
            });
        }
    };

    const applyRateLimit = (clientIP) => {
        if (!requestTracker[clientIP]) {
            requestTracker[clientIP] = [];
        }

        const currentTime = new Date().getTime();
        const recentRequests = requestTracker[clientIP].filter((time) => currentTime - time < rateLimitWindow);

        if (recentRequests.length >= rateLimit) {
            res.writeHead(429, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Rate limit exceeded' }));
            return false;
        }

        requestTracker[clientIP].push(currentTime);
        requestTracker[clientIP] = requestTracker[clientIP].filter((time) => currentTime - time < rateLimitWindow);

        return true;
    };


    switch (method) {
        case 'OPTIONS':
            {
                res.writeHead(200);
                res.end();
            }
            break
        case 'GET':
            if (url === "/") {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.write(JSON.stringify({ message: "HELLO WORlD" }));
                res.end();
            }
            //ruta para obtener todos los usuario
            else if (url === '/api/users') {
                verificarToken(req, res, () => {
                    if (applyRateLimit(req.socket.remoteAddress)) {
                        adminSuperadmin(req, res, routeUser.usersRoute);
                    }
                });
            }
            //ruta para traer usuario por id
            else if (url.startsWith('/api/users?')) {
                verificarToken(req, res, () => {
                    if (applyRateLimit(req.socket.remoteAddress)) {
                        adminSuperadmin(req, res, routeUser.usersIdRoute)
                    }

                });
            }
            // ruta para traer todas las notas del usuario
            else if (url === ('/api/notes')) {
                verificarToken(req, res, () => {
                    if (req.socket.remoteAddress) {
                        usersRoles(req, res, routeNotes.getNotesUserRoute)
                    }
                });
            }
            //ruta para obtener las notas por categoria
            else if (url.startsWith('/api/notes?')) {
                verificarToken(req, res, () => {
                    if (req.socket.remoteAddress) {
                        usersRoles(req, res, routeNotes.getNotesTypeRoute)
                    }
                });
            }
            else if(url.startsWith('/api/ad/notes')){
                verificarToken(req, res,()=>{
                    if(req.socket.remoteAddress){
                        adminSuperadmin(req, res, routeNotes.getNotesRoute);
                    }
                })
            }
            else {
                res.writeHead(404, { "Content-Type": "text/plain" });
                res.write("404 Not Found");
                res.end();
            }
            break;
        case 'POST':
            //ruta para creacion de usuario
            if (url.startsWith('/api/users')) {
                if (req.socket.remoteAddress) {
                    routeUser.createUserRoute(req, res);
                }
            }
            //ruta para crear notas 
            else if (url.startsWith('/api/notes')) {
                verificarToken(req, res, () => {
                    if(req.socket.remoteAddress){
                    usersRoles(req, res, routeNotes.createNoteRoute)
                }
                });
            }
            //ruta para iniciar sesion y  obtener token
            else if (url === '/api/login') {
                if(req.socket.remoteAddress){
                routeUser.loginRoute(req, res);
            }
            }
            else {
                res.writeHead(404, { "Content-Type": "text/plain" });
                res.write("404 Not Found");
                res.end();
            }
            break;
        case 'DELETE':
            // ruta para eliminar una nota
            if (url.startsWith('/api/notes')) {
                verificarToken(req, res, () => {
                    usersRoles(req, res, routeNotes.getDeleteNoteRoute)
                });
            }
            //ruta para eliminar usuario
            else if (url.startsWith('/api/users?')) {
                verificarToken(req, res, () => {
                    adminSuperadmin(req, res, routeUser.deleteUserRoute)
                });
            }
            else {
                res.writeHead(404, { "Content-Type": "text/plain" });
                res.write("404 Not Found");
                res.end();
            }
            break
        case 'PATCH':
            //ruta para cambiar el rol de un usuario
            if (url.startsWith('/api/users')) {
                verificarToken(req, res, () => {
                    adminSuperadmin(req, res, routeUser.editUserRout)
                });
            } else {
                res.writeHead(404, { "Content-Type": "text/plain" });
                res.write("404 Not Found");
                res.end();
            }
            break;
        default:
            res.writeHead(404, { "Content-Type": "text/plain" });
            res.write("404 Not Found");
            res.end();
            break;
    }
});

const adminSuperadmin = (req, res, routeFunction) => {
    if (req.user.role === "user") {
        res.writeHead(403, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Acceso prohibido para usuarios con rol "usuario"' }));
    } else {
        routeFunction(req, res);
    }
};

const Superadmin = (req, res, routeFunction) => {
    if (req.user.role != "superadmin") {
        res.writeHead(403, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Acceso prohibido para usuarios con rol "usuario"' }));
    } else {
        routeFunction(req, res);
    }
};


const usersRoles = (req, res, routeFunction) => {
    if (!req.user.role) {
        res.writeHead(403, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Acceso prohibido para usuarios con rol "usuario"' }));
    } else {
        routeFunction(req, res);
    }
}

const port = SECRET.PORT;

server.listen(port, () => {
    console.log(`El servidor esta corriendo en el puerto ${port}`)
});

