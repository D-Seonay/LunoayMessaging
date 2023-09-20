const http = require('http');
const socketIo = require('socket.io');
const axios = require('axios');
const { readFileSync } = require('fs');
function serveStaticFile(path, contentType, res) {

    const data = readFileSync(path, 'utf-8');
    res.writeHead(200, { 'Content-Type': contentType });
    res.write(data);
    res.end();
}


const server = http.createServer((req, res) => {
    if (req.url === '/') {

        serveStaticFile('./public/index.html', 'text/html', res);

    } else if (req.url === '/css/styles.css') {

        serveStaticFile('./public/src/css/styles.css', 'text/css', res);

    } else if (req.url === '/js/app.js') {

        serveStaticFile('./public/src/js/app.js', 'text/javascript', res);

    }
    else {

        res.writeHead(404);
        res.write('Page not found!');
        res.end();

    }


})

const io = socketIo(server);

io.on('connection', (socket) => {
    console.log('Nouvelle connexion :', socket.id);

    socket.on('message', (data) => {
        // Diffusez le message à tous les clients connectés
        io.emit('message', data);
    });

    socket.on('disconnect', () => {
        console.log('Déconnexion :', socket.id);
    });
});

const PORT = process.env.PORT || 4888;
server.listen(PORT, () => {
    console.log(`Serveur en écoute sur le port ${PORT}`);
});
