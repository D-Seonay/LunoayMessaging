const http = require('http');
const querystring = require('querystring');
const { serveStaticFile, errorMessage } = require('./utils');
const { loginUser, registerUser} = require('./authentication')
const db = require('./database/authDatabase');

function idToUsername(userLog, callback) {
    console.log("UserLog function idToUsername : " + userLog)
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
module.exports.idToUsername = idToUsername;


let userLog;

const server = http.createServer(async (req, res) => {
    if (req.method === 'GET') {
        if (req.url === '/') {
            serveStaticFile('./public/index.html', 'text/html', res);
        } else if (req.url === '/css/styles.css') {
            serveStaticFile('./public/src/css/styles.css', 'text/css', res);
        } else if (req.url === '/js/app.js') {
            serveStaticFile('./public/src/js/app.js', 'text/javascript', res);
        } else {
            errorMessage(404, 'Page not found', res)

        }
    }
    else if (req.method === 'POST') {
        if (req.url === '/register') {
            registerUser(req, res, db);
        }
        else if (req.url === '/login') {
            loginUser(req, res, db)
                .then((userLog) => {
                    // Utilisez userLog ici ou passez-le à d'autres fonctions ou fichiers si nécessaire
                    console.log("userLog récupéré dans le fichier principal : " + userLog);
                    module.exports = userLog;
                })
                .catch((error) => {
                    // Gérez les erreurs ici si nécessaire
                    console.error('Erreur lors de la connexion :', error);
                });
        }
        else if (req.url === '/send') {

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

                        errorMessage(500, 'Erreur lors de la connexion.', res)

                    } else {
                        errorMessage(200, 'Message envoyé avec succès.', res)

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
                    errorMessage(500, { error: 'Erreur lors de la récupération des messages' }, res)

                } else {
                    errorMessage(200, results, res)

                }
            })
        }
                else {
            errorMessage(404,'Page not found!', res)

        }
    }
})

const configureSocketIo = require('./sockets/socketIo');
configureSocketIo(server);
/*
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
*/

const PORT = process.env.PORT;
server.listen(PORT, () => {
    console.log(`Serveur en écoute sur le port ${PORT}`);
});


