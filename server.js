const http = require('http');
const socketIo = require('socket.io');
const axios = require('axios');

const server = http.createServer((req, res) => {
    // Vous pouvez gérer ici les requêtes HTTP qui ne sont pas liées à WebSocket si nécessaire.
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Serveur WebSocket en cours d'exécution.\n');
});

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

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Serveur en écoute sur le port ${PORT}`);
});
