/*
    // Test
    const deviceList = document.getElementById('device-list');
    const testDevice = createDeviceElement({ Nombre: "Arduino1Prueba", idDis: 1, Estado: true });
    deviceList.appendChild(testDevice);
*/
document.addEventListener('DOMContentLoaded', () => {
    const username = localStorage.getItem('usuario');
    document.getElementById('username').innerText = username ? `Hola ${username}` : 'Usuario';

    // Hacer una solicitud GET al endpoint /ListarDispo para obtener los dispositivos
    fetch('http://192.168.100.60:5000/ListarDispo', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('access_token') // Asumiendo que el token JWT está almacenado en localStorage
        }
    })
    .then(response => response.json())
    .then(data => {
        console.log(data); // Agrega esta línea para registrar la respuesta
        const deviceList = document.getElementById('device-list');
        if (data.msg) {
            console.error(data.msg);
        } else {
            data.forEach(device => {
                const deviceElement = createDeviceElement(device);
                deviceList.appendChild(deviceElement);
            });
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
});

function createDeviceElement(device) {
    const li = document.createElement('li');
    li.classList.add('device-item');
    li.dataset.id = device.idDis;

    const deviceInfo = document.createElement('div');
    deviceInfo.classList.add('device-info');
    deviceInfo.innerText = device.Nombre;

    const switchContainer = document.createElement('div');
    switchContainer.classList.add('switch-container');
    switchContainer.addEventListener('click', (event) => {
        event.stopPropagation(); // Prevent event bubbling
    });

    const switchLabel = document.createElement('label');
    switchLabel.classList.add('switch');

    const switchInput = document.createElement('input');
    switchInput.classList.add('checkbox');
    switchInput.type = 'checkbox';
    switchInput.checked = device.Estado;
    switchInput.name = `device-switch-${device.idDis}`; // Añadiendo un atributo name único
    switchInput.id = `checkbox-${device.idDis}`; // Añadiendo un atributo id único
    switchInput.addEventListener('change', () => {
        toggleDeviceState(device.idDis, switchInput.checked);
        updateDeviceStyle(li, switchInput.checked);
    });

    const switchSpan = document.createElement('span');
    switchSpan.classList.add('slider');

    switchLabel.appendChild(switchInput);
    switchLabel.appendChild(switchSpan);
    switchContainer.appendChild(switchLabel);

    li.appendChild(deviceInfo);
    li.appendChild(switchContainer);
    li.addEventListener('click', () => {
        window.location.href = `/templates/device.html?device=${device.idDis}`;
    });

    updateDeviceStyle(li, switchInput.checked);
    return li;
}

function updateDeviceStyle(deviceElement, isOn) {
    if (isOn) {
        deviceElement.style.backgroundColor = '#221e1f';
        deviceElement.style.color = '#e2e2e1';
    } else {
        deviceElement.style.backgroundColor = '#e2e2e1';
        deviceElement.style.color = '#757575';
    }
}

function toggleDeviceState(deviceId, state) {
    // Aquí puedes hacer una solicitud POST o PUT para actualizar el estado del dispositivo en el servidor
    console.log(`Device ID: ${deviceId}, State: ${state}`);

    // Actualizar el estilo del dispositivo en la lista
    const deviceElement = document.querySelector(`li[data-id="${deviceId}"]`);
    updateDeviceStyle(deviceElement, state);
}

function goToProfile() {
    window.location.href = '/templates/perfil.html';
}

