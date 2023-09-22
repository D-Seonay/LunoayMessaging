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
function errorMessage(head, content, res){
    res.writeHead(head);
    res.write(content);
    res.end();
}
function idToUsername(userLog, callback) {
    console.log("UserLog : " + userLog)
    // Recherchez le nom d'utilisateur associé à l'identifiant d'expéditeur dans la base de données
    db.query("SELECT username FROM users WHERE id = ?", [userLog], (error, results) => {
        if (error) {
            console.error('Erreur lors de la conversion de l\'identifiant en nom d\'utilisateur :', error);
            callback(error, null);
        } else if (results.length === 0) {
            console.error('Aucun utilisateur trouvé pour cet identifiant.');
            callback('Utilisateur non trouvé', null);
        } else {
            const username = results[0].username;
            callback(null, username);
        }
    });
}

let userLog = '';

const server = http.createServer(async (req, res) => {
    if (req.method === 'GET') {
        if (req.url === '/') {
            serveStaticFile('./public/index.html', 'text/html', res);
        } else if (req.url === '/css/styles.css') {
            serveStaticFile('./public/src/css/styles.css', 'text/css', res);
        } else if (req.url === '/js/app.js') {
            serveStaticFile('./public/src/js/app.js', 'text/javascript', res);
        } else {
            res.writeHead(404);
            res.write('Page not found!');
            res.end();
        }
    } else if (req.method === 'POST') {
        if (req.url === '/register') {
            let data = '';

            req.on('data', (chunk) => {
                data += chunk;
            });

            req.on('end', async () => {
                const {username, email, password} = querystring.parse(data);
                const hashedPassword = await bcrypt.hash(password, 10);

                // Insérez l'utilisateur dans la base de données
                db.query('INSERT INTO users (username, email ,password) VALUES (?, ?, ?)', [ username, email, hashedPassword], (error, results) => {
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
                });
            });
        } else if (req.url === '/login') {
            let data = '';

            req.on('data', (chunk) => {
                data += chunk;
            });

            req.on('end', async () => {
                const {loginUsername, loginPassword} = querystring.parse(data);
                console.log("Login username : " + loginUsername + "   Login password : " + loginPassword);

                // Recherchez l'utilisateur dans la base de données par le nom d'utilisateur
                db.query("SELECT * FROM users WHERE username = ?", [loginUsername], async (error, users) => {
                    if (error) {
                        console.error('Erreur lors de la connexion :', error);
                        res.writeHead(500);
                        res.write('Erreur lors de la connexion.');
                        res.end();
                    } else if (users.length === 0) {
                        res.writeHead(404);
                        res.write('Utilisateur non trouvé.');
                        res.end();
                    } else {
                        const user = users[0];
                        const isPasswordValid = await bcrypt.compare(loginPassword, user.password);
                        if (isPasswordValid) {
                            db.query("SELECT id FROM users WHERE username = ?", [loginUsername], (error, user) => {
                                if (error) {
                                    console.error('Erreur lors de la connexion :', error);
                                    res.writeHead(500);
                                    res.write('Erreur lors de la connexion.');
                                    res.end();
                                } else if (user.length === 0) {
                                    res.writeHead(404);
                                    res.write('Utilisateur non trouvé.');
                                    res.end();
                                } else {
                                    userLog = user[0].id;
                                    serveStaticFile('./public/src/html/test.html' , 'text/html', res);
                                }
                            });
                        } else {
                            res.writeHead(401);
                            res.write('Mot de passe incorrect.');
                            res.end();
                        }
                    }
                });
            });
        } else if (req.url === '/send') {

            let data = '';

            req.on('data', (chunk) => {
                data += chunk;
            });

            req.on('end', async () => {
                const {contenu} = querystring.parse(data);
                const expediteur = userLog;

                // Recherchez l'utilisateur dans la base de données par le nom d'utilisateur
                db.query("INSERT INTO messages (expediteur, contenu) VALUES (?, ?)", [expediteur, contenu], async (error, send) => {
                    if (error) {
                        console.log(error)
                        console.log("Expediteur :" + expediteur)
                        console.log("Contenu :" + contenu)
                        res.writeHead(500);
                        res.write('Erreur lors de l\'envoi du message.');
                        res.end();
                    } else {
                        res.writeHead(200);
                        res.write('Message envoyé avec succès.');
                        res.end();
                    }
                });
            });
        }
        else if (req.url === '/messages') {
            let data = '';

            req.on('data', (chunk) => {
                data += chunk;
            });

            const expediteur = userLog;
            const {contenu} = querystring.parse(data);

            db.query("INSERT INTO messages (expediteur, contenu) VALUES (?, ?)", [expediteur, contenu], (error, results) => {
                console.log(expediteur)
                console.log(contenu)

                if (error) {
                    console.log('Erreur lors de la récupération des messages :', error);
                    res.writeHead(500);
                    res.write(`{ error: 'Erreur lors de la récupération des messages' }`);
                    res.end();
                } else {
                    res.writeHead(200);
                    res.write(results);
                    res.end();
                }
            })
        }
                else {
            res.writeHead(404);
            res.write('Page not found!');
            res.end();
        }
    }
})

        const io = socketIo(server);
io.on('connection', (socket) => {
    console.log('Nouvelle connexion :', socket.id);

    socket.on('login-success', (username) => {
        // Stockez le nom d'utilisateur dans une variable locale pour cet utilisateur spécifique
        socket.username = username;
        console.log(`Utilisateur connecté : ${socket.username}`);
    });

    socket.on('message', (data) => {
        const { text } = data;

        // Utilisez la fonction idToUsername pour obtenir le nom d'utilisateur de l'émetteur
        idToUsername(userLog, (error, emitter) => {
            if (error) {
                console.error(`Erreur lors de la récupération du nom d'utilisateur : ${error}`);
                emitter = 'Utilisateur Inconnu';
            }

            console.log(`Message de ${emitter} : ${text}`);

            // Diffusez le message à tous les clients connectés
            io.emit('receive-message', { emitter ,text });
            io.emit('message', { emitter, text });
        });
    });

    socket.on('disconnect', () => {
        console.log('Déconnexion :', socket.id);
    });
});


const PORT = process.env.PORT || 4888;
server.listen(PORT, () => {
    console.log(`Serveur en écoute sur le port ${PORT}`);
});


