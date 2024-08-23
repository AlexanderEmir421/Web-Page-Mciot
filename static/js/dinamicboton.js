document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const device = urlParams.get('device');
    let fecha = null;

    const fechaParam = urlParams.get('fecha');
    if (fechaParam !== null) {
        const selectedDay = fechaParam.toLowerCase();
        const currentDate = new Date();
        const currentDay = currentDate.getDay();

        const daysOfWeek = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
        const selectedDayIndex = daysOfWeek.indexOf(selectedDay);

        if (selectedDayIndex !== -1) {
            const dayDifference = selectedDayIndex - currentDay;
            currentDate.setDate(currentDate.getDate() + dayDifference);
            fecha = currentDate.toISOString().split('T')[0];
        }
    }

    fetch('http://192.168.100.60:5000/Historiador', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('access_token')
        },
        body: JSON.stringify({
            device: device,
            fecha: fecha
        })
    })
    .then(response => response.json())
    .then(data => {
        createDynamicElements(data);
    })
    .catch(error => console.error('Error:', error));
});

function createDynamicElements(data) {
    const variableInputs = document.getElementById('variable-inputs');
    data.forEach(item => {
        let element;
        if (item.Boton === 'Switch') {
            element = createSwitchButton(item.Nombre.replace(' on-off', ''));
        } else if (item.Boton === 'Input flotante') {
            element = createFloatInput(item.Nombre);
        } else if (item.Boton === 'Grafic') {
            drawDataChart(item);
        } else if (item.Boton === 'En vivo') {
            element = createLiveDataDisplay(item);
        } else if (item.Boton === 'Estado del motor') {
            element = createMotorStatus(item);
        } else if (item.Boton === 'Setpoint') {
            element = createSetpointInput(item);
        }
        if (element) {
            variableInputs.appendChild(element);
        }
    });
}

function createSwitchButton(name) {
    const container = document.createElement('div');
    container.className = 'switch-container';
    container.innerHTML = `
        <p class="component-title">${name}</p>
        <input type="checkbox" class="checkbox" id="checkbox-${name}">
        <label class="switch" for="checkbox-${name}">
            <span class="slider"></span>
        </label>
    `;
    return container;
}

function createFloatInput(name) {
    const container = document.createElement('div');
    container.className = 'float-input-container';
    const label = document.createElement('label');
    label.textContent = name;
    const input = document.createElement('input');
    input.type = 'number';
    input.step = 'any';
    input.className = 'float-input';
    container.appendChild(label);
    container.appendChild(input);
    return container;
}
function createMotorStatus(item) {
    const container = document.createElement('div');
    container.innerHTML = `
        <p>${item.Nombre}: <span id="motor-status">${item.Estado}</span></p>
    `;
    return container;
}

function createSetpointInput(item) {
    const container = document.createElement('div');
    container.innerHTML = `
        <label for="setpoint">${item.Nombre}:</label>
        <input type="number" id="setpoint" value="${item.Setpoint}" />
        <button onclick="updateSetpoint()">Actualizar Setpoint</button>
    `;
    return container;
}

function drawDataChart(data) {
    const ctx = document.getElementById('data-chart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.Dato.map(d => d.fechayhora),
            datasets: [{
                label: data.Nombre,
                data: data.Dato.map(d => d.dato),
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
                fill: false
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'hour'
                    }
                },
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function createLiveDataDisplay(item) {
    const container = document.createElement('div');
    container.className = 'live-data-container';
    container.innerHTML = `
        <p class="component-title">${item.Nombre}</p>
        <div class="live-data">${item.Dato}</div>
    `;
    return container;
}

function resetDevice() {
    alert('Dispositivo reseteado de fábrica.');
}

function supportDevice() {
    alert('Soporte técnico contactado.');
}

function updateSetpoint() {
    const setpoint = document.getElementById('setpoint').value;
    fetch('/updateSetpoint', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('access_token')
        },
        body: JSON.stringify({ setpoint: setpoint })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Setpoint actualizado');
        } else {
            alert('Error al actualizar el setpoint');
        }
    })
    .catch(error => console.error('Error:', error));
}