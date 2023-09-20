
const axios = require('axios');
document.querySelector('form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.querySelector('#username').value;
    const password = document.querySelector('#password').value;
    try {
        const response = await axios.post('/register', { username, password });
        alert(response.data);
        // Redirigez l'utilisateur vers la page de connexion ou toute autre page appropriée
    } catch (error) {
        alert('Erreur lors de l\'inscription.');
        console.error(error);
    }
});