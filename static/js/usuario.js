document.addEventListener('DOMContentLoaded', () => {
    const username = localStorage.getItem('usuario');
    const deviceList = document.getElementById('device-list');
    const supportLink = document.getElementById('support-link');

    // Set username
    document.getElementById('username').innerText = username ? `Hola, ${username}` : 'Usuario';

    // Fetch and display devices
    fetchDevices();

    function fetchDevices() {
        fetch('https://sjrc.com.ar/ListarDispo', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('access_token')
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.msg) {
                console.error(data.msg);
                deviceList.innerHTML = '<li>No se pudieron cargar los dispositivos.</li>';
            } else {
                deviceList.innerHTML = '';
                data.forEach(device => {
                    const deviceElement = createDeviceElement(device);
                    deviceList.appendChild(deviceElement);
                });
            }
        })
        .catch(error => {
            console.error('Error:', error);
            deviceList.innerHTML = '<li>Error al cargar los dispositivos.</li>';
        });
    }

    function createDeviceElement(device) {
        const li = document.createElement('li');
        li.classList.add('device-item');
        li.dataset.id = device.idDis;

        const deviceInfo = document.createElement('div');
        deviceInfo.classList.add('device-info');

        const statusIndicator = document.createElement('span');
        statusIndicator.classList.add('status-indicator');
        statusIndicator.classList.add(device.UltimoDato === "1" ? 'connected' : 'disconnected');
        statusIndicator.textContent = device.UltimoDato === "1" ? 'Conectado' : 'Desconectado';

        deviceInfo.appendChild(statusIndicator);
        deviceInfo.appendChild(document.createTextNode(device.Nombre));

        const buttonContainer = document.createElement('div');
        buttonContainer.classList.add('button-container');

        const renameButton = createButton('rename-button', '/static/img/escribir.png', 'Cambiar nombre', () => renameDevice(device.idDis));
        const deleteButton = createButton('delete-button', '/static/img/tacho.png', 'Eliminar dispositivo', () => deleteDevice(device.idDis));

        buttonContainer.appendChild(renameButton);
        buttonContainer.appendChild(deleteButton);

        li.appendChild(deviceInfo);
        li.appendChild(buttonContainer);

        li.addEventListener('click', (event) => {
            if (!event.target.closest('.button-container')) {
                window.location.href = `/device.html?device=${device.idDis}`;
            }
        });

        return li;
    }

    function createButton(className, imgSrc, altText, onClick) {
        const button = document.createElement('button');
        button.classList.add(className);
        const img = document.createElement('img');
        img.src = imgSrc;
        img.alt = altText;
        button.appendChild(img);
        button.addEventListener('click', onClick);
        return button;
    }

    function renameDevice(deviceId) {
        const newName = prompt('Ingrese el nuevo nombre del dispositivo:');
        if (newName) {
            fetch('https://sjrc.com.ar/modificarDispositivo', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + localStorage.getItem('access_token')
                },
                body: JSON.stringify({ idDis: deviceId, nuevo_nombre: newName })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Nombre del dispositivo actualizado correctamente.');
                    fetchDevices(); // Refresh the device list
                } else {
                    alert('Error al actualizar el nombre del dispositivo: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Error al actualizar el nombre del dispositivo.');
            });
        }
    }

    function deleteDevice(deviceId) {
        if (confirm('¿Está seguro de que desea eliminar este dispositivo?')) {
            fetch('https://sjrc.com.ar/eliminarDispositivo', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + localStorage.getItem('access_token')
                },
                body: JSON.stringify({ idDis: deviceId })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Dispositivo eliminado correctamente.');
                    fetchDevices(); // Refresh the device list
                } else {
                    alert('Error al eliminar el dispositivo: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Error al eliminar el dispositivo.');
            });
        }
    }
});

function logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('usuario');
    window.location.href = 'login.html';
}