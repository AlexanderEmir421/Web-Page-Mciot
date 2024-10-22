document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.querySelector('.menu-toggle');
    const navUl = document.querySelector('nav ul');

    menuToggle.addEventListener('click', () => {
        navUl.classList.toggle('show');
    });

    const loginForm = document.getElementById('login-form');
    
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch('https://sjrc.com.ar/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();
            if (response.ok) {
                console.log('Access Token:', data.access_token);
                console.log('Usuario:', data.usuario);
                localStorage.setItem('access_token', data.access_token);
                localStorage.setItem('usuario', data.usuario);
                window.location.href = 'usuario.html';
            } else {
                showNotification(data.message || 'Error al iniciar sesión', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showNotification('Error al iniciar sesión', 'error');
        }
    });

    // Verificar si el usuario ya está conectado
    const loggedIn = localStorage.getItem('access_token');
    if (loggedIn) {
        window.location.href = 'usuario.html';
    }
});

function showNotification(message, type) {
    const errorMessage = document.getElementById('error-message');
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';

    setTimeout(() => {
        errorMessage.style.display = 'none';
    }, 3000);
}

function logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('usuario');
    
    // Redirigir al formulario de inicio de sesión
    window.location.href = 'index.html';
}