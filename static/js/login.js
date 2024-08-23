document.getElementById('login-form').addEventListener('submit', async function(event) {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('http://192.168.100.60:5000/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: email, password: password })
        });

        const data = await response.json();
        if (response.ok) {
            console.log('Access Token:', data.access_token);
            console.log('Usuario:', data.usuario);
            localStorage.setItem('access_token', data.access_token);
            localStorage.setItem('usuario', data.usuario);
            window.location.href = '/templates/usuario.html';
        } else {
            alert(data.message || 'Error al iniciar sesión');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al iniciar sesión');
    }
});
