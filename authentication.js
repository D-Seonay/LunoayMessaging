const querystring = require('querystring');
const bcrypt = require('bcrypt');

const { serveStaticFile, errorMessage } = require('./utils'); // Assurez-vous d'importer les fonctions nécessaires

async function registerUser(req, res, db) {
    let data = '';

    req.on('data', (chunk) => {
        data += chunk;
    });

    req.on('end', async () => {
        const { username, email, password } = querystring.parse(data);
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insérez l'utilisateur dans la base de données
        db.query('INSERT INTO users (username, email ,password) VALUES (?, ?, ?)', [username, email, hashedPassword], (error, results) => {
            if (error) {
                errorMessage(500, 'Erreur lors de l\'inscription :', res);
                console.error('Erreur lors de l\'inscription :', error);
            } else {
                errorMessage(200, 'Inscription réussie. =)', res);
            }
        });
    });
}

async function loginUser(req, res, db) {
    let data = '';

    req.on('data', (chunk) => {
        data += chunk;
    });

    return new Promise((resolve, reject) => {
        req.on('end', async () => {
            const { loginUsername, loginPassword } = querystring.parse(data);
            console.log("Login username : " + loginUsername + "   Login password : " + loginPassword);

            // Déclarez userLog ici pour le garder dans la portée
            let userLog;

            // Recherchez l'utilisateur dans la base de données par le nom d'utilisateur
            db.query("SELECT * FROM users WHERE username = ?", [loginUsername], async (error, users) => {
                if (error) {
                    errorMessage(500, 'Erreur lors de la connexion.', res);
                    console.error('Erreur lors de la connexion :', error);
                    reject(error);
                } else if (users.length === 0) {
                    errorMessage(404, 'Utilisateur non trouvé.', res);
                    resolve(null); // Résolvez avec null si l'utilisateur n'est pas trouvé
                } else {
                    const user = users[0];
                    const isPasswordValid = await bcrypt.compare(loginPassword, user.password);
                    if (isPasswordValid) {
                        db.query("SELECT id FROM users WHERE username = ?", [loginUsername], (error, user) => {
                            if (error) {
                                errorMessage(500, 'Erreur lors de la connexion.', res);
                                console.error('Erreur lors de la connexion :', error);
                                reject(error);
                            } else if (user.length === 0) {
                                errorMessage(404, 'Utilisateur non trouvé.', res);
                                resolve(null); // Résolvez avec null si l'utilisateur n'est pas trouvé
                            } else {
                                userLog = user[0].id;
                                module.exports = userLog;
                                console.log("Userlog coter authentication : " + userLog);
                                serveStaticFile('./public/src/html/test.html', 'text/html', res);
                                resolve(userLog); // Résolvez avec userLog lorsque disponible
                            }
                        });
                    } else {
                        errorMessage(401, 'Mot de passe incorrect.', res);
                        resolve(null); // Résolvez avec null si le mot de passe est incorrect
                    }
                }
            });
        });
    });
}



module.exports = {registerUser, loginUser };

