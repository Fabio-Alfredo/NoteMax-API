const http = require('http');

const route = require('./routes/users');

async function editUser(req, res){
    const {url} = req;

    console.log(url);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.write(JSON.stringify({ message: "HELLO WORlD" }));
    res.end();
}

const server = http.createServer((req, res) => {
    const { url, method } = req;

    switch (method) {
        case "GET":
            if (url === "/") {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.write(JSON.stringify({ message: "HELLO WORlD" }));
                res.end();
            }
            else if (url === "/users") {
                route.usersRoute(req, res);
            }
            else if (url.startsWith('/user')) {
                route.usersIdRoute(req, res);
            }
            else {
                res.writeHead(404, { "Content-Type": "text/plain" });
                res.write("404 Not Found");
                res.end();
            }
            break;
        case 'POST':
            if (url === '/user') {
                route.createUserRoute(req, res);
            }else {
                res.writeHead(404, { "Content-Type": "text/plain" });
                res.write("404 Not Found");
                res.end();
            }
            break;
        case 'PUT':
            if(url.startsWith('/user')){
                editUser(req, res);
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
