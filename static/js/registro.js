document.getElementById('register-form').addEventListener('submit', async function(event) {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const nombre = document.getElementById('nombre').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('http://192.168.100.60:5000/RegisterUser', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: email, password: password, usuario: nombre })
        });

        if (response.ok) {
            window.location.href = '/templates/login.html';
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al registrar el usuario');
    }
});
