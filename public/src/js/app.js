const axios = require('axios');

function afficherMessages() {
    const messagerie = document.getElementById('messagerie');

    // Effectuez une requête AJAX pour récupérer les messages depuis le serveur
    axios.get('/messages')
        .then((response) => {
            const messages = response.data;

            // Créez des éléments HTML pour chaque message et ajoutez-les à la section "messagerie"
            messages.forEach((message) => {
                const messageElement = document.createElement('div');
                messageElement.textContent = `${message.expediteur}: ${message.contenu}`;
                messagerie.appendChild(messageElement);
            });
        })
        .catch((error) => {
            console.error('Erreur lors de la récupération des messages :', error);
        });
}

// Appelez la fonction pour afficher les messages lorsque la page est chargée
window.addEventListener('load', afficherMessages);
