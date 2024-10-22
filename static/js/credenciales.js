document.addEventListener('DOMContentLoaded', function() {
    const wifiNetworksSelect = document.getElementById('wifi-networks');
    const wifiPasswordInput = document.getElementById('wifi-password');
    const connectButton = document.getElementById('connect-button');

    // Función simulada para obtener redes WiFi cercanas
    function fetchWifiNetworks() {
        return [
            'Red WiFi 1',
            'Red WiFi 2',
            'Red WiFi 3',
            'Red WiFi 4'
        ];
    }

    // Agregar redes WiFi al selector
    function populateWifiNetworks() {
        const networks = fetchWifiNetworks();
        networks.forEach(network => {
            const option = document.createElement('option');
            option.value = network;
            option.textContent = network;
            wifiNetworksSelect.appendChild(option);
        });
    }

    // Función para conectar a la red WiFi seleccionada
    function connectToWifi() {
        const selectedNetwork = wifiNetworksSelect.value;
        const password = wifiPasswordInput.value.trim();

        if (!selectedNetwork || !password) {
            alert('Por favor, selecciona una red WiFi e ingresa la contraseña.');
            return;
        }

        // Simula la conexión a la red WiFi y guarda la información localmente
        console.log(`Conectando a la red WiFi: ${selectedNetwork} con la contraseña: ${password}`);
        
        // Envía la información al servidor
        fetch('https://your-api-url.com/connect', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ ssid: selectedNetwork, password: password })
        })
        .then(response => response.json())
        .then(data => {
            console.log('Respuesta del servidor:', data);
            alert('Conexión exitosa.');
        })
        .catch(error => {
            console.error('Error al conectar:', error);
            alert('Error al conectar a la red WiFi.');
        });
    }

    populateWifiNetworks();

    connectButton.addEventListener('click', connectToWifi);
});
