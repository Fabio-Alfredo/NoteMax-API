const http = require('http');

const routeUser = require('./routes/users');
const routeNotes = require('./routes/notes');

const jwt = require('jsonwebtoken');
const secretKey = 'fabioalfredo';



const server = http.createServer((req, res) => {

    const { url, method } = req;

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
    

    switch (method) {
        case 'GET':
            if (url === "/") {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.write(JSON.stringify({ message: "HELLO WORlD" }));
                res.end();
            }
            else if (url === '/api/users') {
                verificarToken(req, res, () => {
                    adminSuperadmin(req, res, routeUser.usersRoute);
                });
            }
            else if (url.startsWith('/api/users?')) {
                verificarToken(req, res, ()=>{
                    adminSuperadmin(req, res, routeUser.usersIdRoute)
                });
            }
            else if (url === ('/api/notess')) {
                verificarToken(req, res, ()=>{
                    usersRoles(req, res, routeNotes.getNotesUserRoute)
                });
            }
            else if (url === '/api/notes') {
                verificarToken(req, res, ()=>{
                    adminSuperadmin(req, res, routeNotes.getDeleteNoteRoute)
                });
            }
            else if (url.startsWith('/api/notes?')) {
                verificarToken(req, res, ()=>{
                    usersRoles(req, res, routeNotes.getNotesTypeRoute)
                });
            }
            else {
                res.writeHead(404, { "Content-Type": "text/plain" });
                res.write("404 Not Found");
                res.end();
            }
            break;
        case 'POST':
            if (url.startsWith('/api/users')) {
                routeUser.createUserRoute(req, res);
            }
            else if (url.startsWith('/api/notes')) {
                verificarToken(req, res, ()=>{
                    usersRoles(req, res, routeNotes.createNoteRoute)
                });
            }
            else if (url === '/api/login') {
                routeUser.loginRoute(req, res);
            }
            else {
                res.writeHead(404, { "Content-Type": "text/plain" });
                res.write("404 Not Found");
                res.end();
            }
            break;
        case 'DELETE':
            if (url.startsWith('/api/notes')) {
                verificarToken(req, res, ()=>{
                    usersRoles(req, res, routeNotes.getDeleteNoteRoute)
                });
            }
            else {
                res.writeHead(404, { "Content-Type": "text/plain" });
                res.write("404 Not Found");
                res.end();
            }
            break
        case 'PATCH':
            if (url.startsWith('/api/users')) {
                verificarToken(req, res, ()=>{
                    Superadmin(req, res, routeUser.editUserRout)
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

const adminSuperadmin=(req, res, routeFunction)=>{
    if(req.user.role === "user"){
        res.writeHead(403, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Acceso prohibido para usuarios con rol "usuario"' }));
    }else{
        routeFunction(req, res);
    }
};

const Superadmin=(req, res, routeFunction)=>{
    if(req.user.role === "superadmin"){
        res.writeHead(403, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Acceso prohibido para usuarios con rol "usuario"' }));
    }else{
        routeFunction(req, res);
    }
};


const usersRoles=(req, res, routeFunction)=>{
    if(req.user.role === "user"){
        res.writeHead(403, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Acceso prohibido para usuarios con rol "usuario"' }));
    }else{
        routeFunction(req, res);
    }
}

const port = 4000;

server.listen(port, () => {
    console.log(`El servidor esta corriendo en el puerto ${port}`)
});
