document.addEventListener('DOMContentLoaded', function() {
    fetch('http://192.168.100.60:5000/perfil', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('access_token') // Asumiendo que el token JWT está almacenado en localStorage
        }
    })
    
    .then(response => response.json())
    .then(data=>{
        console.log(data);
        if (data.telefono === null) {
            document.getElementById('user-phone').textContent = "No posee numero de telefono registrado";
        }else{
            document.getElementById('user-phone').textContent = data.telefono;
        }
        document.getElementById('username').textContent= data.nombre
        document.getElementById('user-email').textContent = data.email;
        document.getElementById('user-name').textContent = data.nombre;
        
})

    // Mostrar chats abiertos
    const chatList = document.getElementById('chat-list');
    userData.chats.forEach(chat => {
        const li = document.createElement('li');
        li.textContent = chat;
        li.classList.add('chat-item');
        chatList.appendChild(li);
    });
});

function goToProfile() {
    window.location.href = 'perfil.html';
}

function changePassword() {
    alert('Función de cambio de contraseña no implementada.');
}

function goBack() {
    window.history.back();
}
