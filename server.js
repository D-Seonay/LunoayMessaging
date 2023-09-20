const http = require('http');
const socketIo = require('socket.io');
const axios = require('axios');
const { readFileSync } = require('fs');
const bcrypt = require('bcrypt');
const querystring = require('querystring');
const db = require('./db');
function serveStaticFile(path, contentType, res) {

    const data = readFileSync(path, 'utf-8');
    res.writeHead(200, { 'Content-Type': contentType });
    res.write(data);
    res.end();
}


const server = http.createServer(async(req, res) => {
    if (req.url === '/') {

        serveStaticFile('./public/index.html', 'text/html', res);

    } else if (req.url === '/css/styles.css') {

        serveStaticFile('./public/src/css/styles.css', 'text/css', res);

    } else if (req.url === '/js/app.js') {

        serveStaticFile('./public/src/js/app.js', 'text/javascript', res);

    } else if (req.method === 'POST' && req.url === '/register') {
        let data = '';

        req.on('data', (chunk) => {
            data += chunk;
        });

        req.on('end', async () => {
            const { username, password } = querystring.parse(data);
            const hashedPassword = await bcrypt.hash(password, 10);

            // Insérez l'utilisateur dans la base de données
            db.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], (error, results) => {
                if (error) {
                    console.error('Erreur lors de l\'inscription :', error);
                    res.writeHead(500);
                    res.write('Erreur lors de la connexion.');
                    res.end();
                } else {
                    res.writeHead(200);
                    res.write('Inscription réussie.');
                    res.end();
                }
            })
        });
    }

    else if (req.method === 'POST' && req.url === '/login') {
        try {
            const { username, password } = req.body;

            // Recherchez l'utilisateur dans la base de données
            db.query('SELECT * FROM users WHERE username = ?', [username], async (error, results) => {
                if (error) {
                    console.error('Erreur lors de la connexion :', error);
                    res.writeHead(500)
                    res.write('Erreur lors de la connexion.');
                    res.end();
                } else if (results.length === 0) {
                    res.writeHead(404);
                    res.write('Page not found!');
                    res.end();
                } else {
                    const user = results[0];
                    const isPasswordValid = await bcrypt.compare(password, user.password);
                    if (isPasswordValid) {
                        res.writeHead(200);
                        res.write('Connexion réussie.');
                        res.end();
                    } else {
                        res.writeHead(401);
                        res.write('Mot de passe incorrect.');
                        res.end();
                    }
                }
            });
        } catch (error) {
            console.error('Erreur lors de la connexion :', error);
            res.writeHead(500)
            res.write('Erreur lors de la connexion.');
            res.end();
        }
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
