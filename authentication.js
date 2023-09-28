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
    return new Promise((resolve, reject) => {
        let data = '';


        req.on('data', (chunk) => {
            data += chunk;
        });

        req.on('end', async () => {
            const { loginUsername, loginPassword } = querystring.parse(data);
            console.log("Login username : " + loginUsername + "   Login password : " + loginPassword);

            db.query("SELECT * FROM users WHERE username = ?", [loginUsername], async (error, users) => {
                if (error) {
                    errorMessage(500, 'Erreur lors de la connexion.', res);
                    console.error('Erreur lors de la connexion :', error);
                    reject(error);
                }
                else if (users.length === 0) {
                    errorMessage(404, 'Utilisateur non trouvé.', res);
                    resolve(null);
                }
                else {
                    const user = users[0];
                    const isPasswordValid = await bcrypt.compare(loginPassword, user.password);
                    if (isPasswordValid) {
                        db.query("SELECT id FROM users WHERE username = ?", [loginUsername], (error, userResult) => {
                            if (error) {
                                errorMessage(500, 'Erreur lors de la connexion.', res);
                                console.error('Erreur lors de la connexion :', error);
                                reject(error);
                            }
                            else if (userResult.length === 0) {
                                errorMessage(404, 'Utilisateur non trouvé.', res);
                                resolve(null); // Résolvez avec null si l'utilisateur n'est pas trouvé
                            }
                            else {
                                const userLog = userResult[0].id;
                                module.exports.userLog = userLog;
                                console.log("Userlog côté authentication : " + userLog);
                                serveStaticFile('./public/src/html/test.html', 'text/html', res);
                            }
                        });
                    }
                    else {
                        errorMessage(401, 'Mot de passe incorrect.', res);
                        resolve(null);
                    }
                }
            });
        });
    });
}
module.exports = {registerUser, loginUser };


