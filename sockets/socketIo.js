const { idToUsername } = require('../index');


module.exports = (server) => {
    const socketIo = require("socket.io");
    const io = socketIo(server)
    const authentication = require('../authentication')


    io.on('connection', (socket) => {
        console.log(authentication.userLog + "ça marche ? ")
        console.log('Nouvelle connexion :', socket.id);
        console.log("Connection utilisateur : " + socket.username)


        socket.on('login-success', (userLog) => {
            // Stockez le nom d'utilisateur dans une variable locale pour cet utilisateur spécifique
            socket.username = userLog;
            console.log(`Utilisateur connecté : ${socket.username}`);
        });

        socket.on('message', (data) => {
            const { text } = data;

            // Utilisez la fonction idToUsername pour obtenir le nom d'utilisateur de l'émetteur
            idToUsername(authentication.userLog, (error, emitter) => {
                console.log(authentication.userLog)
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

}