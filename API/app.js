const http = require('http');

const routeUser = require('./routes/users');
const ruteNotes = require('./routes/notes');



const server = http.createServer((req, res) => {

    const { url, method } = req;

    switch (method) {
        case 'GET':
            if (url === "/") {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.write(JSON.stringify({ message: "HELLO WORlD" }));
                res.end();
            }
            else if (url === "/users") {
                routeUser.usersRoute(req, res);
            }
            else if (url.startsWith('/user')) {
                routeUser.usersIdRoute(req, res);
            }
            else if(url.startsWith('/notes')){
                ruteNotes.NotesRoute(req, res);
            }
            else {
                res.writeHead(404, { "Content-Type": "text/plain" });
                res.write("404 Not Found");
                res.end();
            }
            break;
        case 'POST':
            if (url === '/user') {
                routeUser.createUserRoute(req, res);
            }else {
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
})

const port = 3000;

server.listen(port, () => {
    console.log(`El servidor esta corriendo en el puerto ${port}`)
})
