document.addEventListener('DOMContentLoaded', function () {
    const checkConnectionInterval = setInterval(checkConnection, 5000);

    function checkConnection() {
        fetch('http://192.168.4.1/', { mode: 'no-cors' })
            .then(response => {
                if (response.type === 'opaque' || response.ok) {
                    clearInterval(checkConnectionInterval);
                    window.location.href = 'http://192.168.4.1/'; // Redirigir a la página del Arduino
                }
            })
            .catch(error => {
                console.log('No conectado a la red ItnovatePro aún.');
                console.error('Error:', error);
            });
    }
});


function goBack() {
    window.history.back();
}
