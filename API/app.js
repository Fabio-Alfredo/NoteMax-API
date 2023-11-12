const http = require('http');

const routeUser = require('./routes/users');
const routeNotes = require('./routes/notes')


const server = http.createServer((req, res) => {

    const { url, method } = req;

    switch (method) {
        case 'GET':
            if (url === "/") {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.write(JSON.stringify({ message: "HELLO WORlD" }));
                res.end();
            }
            else if (url === '/api/users') {
                routeUser.usersRoute(req, res);
            }
            else if (url.startsWith('/api/users?')) {
                routeUser.usersIdRoute(req, res);
            }
            else if (url.startsWith('/api/notess?')) {
                routeNotes.getNotesUserRoute(req, res);
            }
            else if (url === '/api/notes') {
                routeNotes.getNotesRoute(req, res);
            }
            else if (url.startsWith('/api/notes?')) {
                routeNotes.getNotesTypeRoute(req, res);
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
                routeNotes.createNoteRoute(req, res);
            }
            else {
                res.writeHead(404, { "Content-Type": "text/plain" });
                res.write("404 Not Found");
                res.end();
            }
            break;
        case 'DELETE':
            if (url.startsWith('/api/notes')) {
                routeNotes.getDeleteNoteRoute(req, res);
            }
            else {
                res.writeHead(404, { "Content-Type": "text/plain" });
                res.write("404 Not Found");
                res.end();
            }
            break
        case 'PATCH':
            if (url.startsWith('/api/users')) {
                routeUser.editUserRout(req, res);
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

const port = 4000;

server.listen(port, () => {
    console.log(`El servidor esta corriendo en el puerto ${port}`)
});
