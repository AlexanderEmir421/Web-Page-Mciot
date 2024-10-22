let chart; 
let currentRange = '1day';
let currentPage = 1;
let pageSize = 10;
let totalRecords = 0;
let filteredData = [];
let allData = [];
let topicNames = [];
let isManualMode = true;
let groupedData = {};
let isFetching = false;
let realTimeInterval = null;

document.addEventListener('DOMContentLoaded', function() {
    fetchHistoriadorData();
    setupEventListeners();
});


function setupEventListeners() {
    const dateFilter = document.getElementById('dateFilter');
    if (dateFilter) {
        dateFilter.addEventListener('change', filterByDate);
    }

    const pageSizeSelect = document.getElementById('pageSizeSelect');
    if (pageSizeSelect) {
        pageSizeSelect.addEventListener('change', updatePageSize);
    }
}



function fetchHistoriadorData() {
    if (isFetching) return;
    isFetching = true; 

    const device = getDeviceIdFromURL();
    const requestData = {
        device: device,
        fecha: currentRange
    };

    fetchData('https://sjrc.com.ar/Historiador2', requestData)
        .then(data => {
            if (data && data.resultados) {
                processData(data);
            }
        })
        .catch(error => console.error('Error:', error))
        .finally(() => {
            isFetching = false; 
        });
}


function fetchData(url, body) {
    return fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('access_token')
        },
        body: JSON.stringify(body)
    }).then(response => response.json());
}

function processData(data) {
    document.getElementById('nombre_dispositivo').textContent = `${data.dispositivo}`;

    const switchRequerido = buscarSwitchRequerido(data.resultados);
    
    groupDataBySuffix(data.resultados);
    createDynamicControls(data.resultados);

    const hasTemperatureData = data.resultados.some(item => item.Nombre.includes('Temperatura'));
    const hasGraphicButton = data.resultados.some(item => item.Boton === "Gráfico");

    if (hasTemperatureData) {
        createDataTable(data.tabla);
    }

    if (hasGraphicButton) {
        startRealTimeUpdates();
    }

    if (switchRequerido) {
        isManualMode = switchRequerido.Dato === '1';
        updateSwitchesVisibility(isManualMode);
    } else {
        enableAllSwitches();
    }

    const temperatureData = data.resultados.find(item => item.Nombre === "Gráfico de Temperatura");
    if (temperatureData && hasGraphicButton) {
        drawDataChart(temperatureData);
        updateTemperatureDisplay(temperatureData);
        createChartContainer();
    } else {
        const chartContainer = document.getElementById('chartdiv');
        if (chartContainer) {
            chartContainer.style.display = 'none';
        }
    }

    const conexionStatus = data.resultados.find(item => item.Nombre === 'conexion');
    if (conexionStatus) {
        updateWifiStatus(conexionStatus.Dato === '1');
    }

    topicNames = [...new Set(Object.keys(groupedData))];
}

function groupDataBySuffix(data) {
    groupedData = {};
    data.forEach(item => {
        if (!item.Nombre || typeof item.Nombre !== 'string') {
            return; // Ignorar nombres vacíos o no válidos
        }

        const nameParts = item.Nombre.trim().split(/\s+/); // Eliminar espacios extra
        const suffix = nameParts[nameParts.length - 1];
        
        if (!groupedData[suffix]) {
            groupedData[suffix] = [];
        }
        groupedData[suffix].push(item);
    });

    // Eliminar grupos con un solo elemento
    Object.keys(groupedData).forEach(key => {
        if (groupedData[key].length === 1) {
            const item = groupedData[key][0];
            delete groupedData[key];
            groupedData[item.Nombre] = [item];
        }
    });
}


function buscarSwitchRequerido(data) {
    return data.find(item => item.Boton === "Switch Requerido");
}

function createDynamicControls(apiData) {
    const deviceStatus = document.querySelector('.device-status');
    deviceStatus.innerHTML = '';

    const container = document.createElement('div');
    container.className = 'container';

    const header = document.createElement('div');
    header.className = 'header';
    container.appendChild(header);

    const controlPanel = document.createElement('div');
    controlPanel.className = 'control-panel';
    container.appendChild(controlPanel);

    const switchRequerido = apiData.find(item => item.Boton === "Switch Requerido");
    if (switchRequerido) {
        createSwitchRequerido(switchRequerido, header);
    }

    
    Object.entries(groupedData).forEach(([groupName, items]) => {
        if (items.length > 1) {
            const groupContainer = document.createElement('div');
            groupContainer.className = 'group-container';
            groupContainer.innerHTML = `<h4>${groupName}</h4>`;

            const groupSummary = document.createElement('div');
            groupSummary.className = 'group-summary';

            let imageContainer;
            if (groupName.toLowerCase().includes('cancha')) {
                imageContainer = createCanchaImage(false);
                groupContainer.appendChild(imageContainer);
            }

            items.forEach(item => {
                const summaryItem = document.createElement('div');
                let displayName = item.Nombre;
                if (displayName.toLowerCase().startsWith('luz')) {
                    displayName = 'Luz';
                    item.Nombre = 'Luz';
                    if (imageContainer) {
                        updateCanchaImage(imageContainer, item.Dato === '1');
                    }
                    createSwitch(item, groupContainer, imageContainer);
                } else if (displayName.includes('Encendido')) {
                    displayName = 'Hora de Encendido';
                } else if (displayName.includes('Apagado')) {
                    displayName = 'Hora de Apagado';
                } else if (displayName.includes('fecha')) {
                    displayName = 'Dias';
                }

                if (item.Boton !== 'Switch') {
                    summaryItem.textContent = `${displayName}: ${formatValue(item)}`;
                    groupSummary.appendChild(summaryItem);
                }
            });

            groupContainer.insertBefore(groupSummary, imageContainer);

            const updateButton = document.createElement('button');
            updateButton.textContent = 'Actualizar';
            updateButton.className = 'send-button group-update-button';
            updateButton.onclick = () => showGroupUpdateModal(groupName, items);
            groupContainer.appendChild(updateButton);

            controlPanel.appendChild(groupContainer);
        } else {
            createControl(items[0], controlPanel);
        }
    });

    const graphContainer = document.createElement('div');
    graphContainer.id = 'chartdiv';
    graphContainer.className = 'graph-container';
    container.appendChild(graphContainer);

    const hasTemperatureData = apiData.some(item => item.Nombre.includes('Temperatura'));
    if (hasTemperatureData) {
        const tableContainer = document.createElement('div');
        tableContainer.className = 'table-container';
        const table = document.createElement('table');
        table.className = 'data-table';
        table.innerHTML = `
            <thead>
                <tr id="table-header"></tr>
            </thead>
            <tbody id="dataTableBody"></tbody>
        `;
        tableContainer.appendChild(table);
        container.appendChild(tableContainer);

        const pagination = document.createElement('div');
        pagination.id = 

 'pagination';
        pagination.className = 'pagination';
        container.appendChild(pagination);
    }

    deviceStatus.appendChild(container);
}


function showGroupUpdateModal(groupName, items) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h2>Actualizar ${groupName}</h2>
            <div id="group-update-controls"></div>
            <div class="modal-buttons">
                <button class="confirm">Actualizar</button>
                <button class="cancel">Cancelar</button>
            </div>
        </div>
    `;

    const controlsContainer = modal.querySelector('#group-update-controls');
    items.forEach(item => {
        // No crear switches en el modal
        if (item.Boton !== 'Switch') {
            createControl(item, controlsContainer);
        }
    });

    document.body.appendChild(modal);

    const confirmButton = modal.querySelector('.confirm');
    const cancelButton = modal.querySelector('.cancel');

    confirmButton.onclick = () => {
        updateGroup(groupName, items);
        document.body.removeChild(modal);
    };

    cancelButton.onclick = () => {
        document.body.removeChild(modal);
    };
}

function createControl(item, container) {
    switch (item.Boton) {
        case 'Fecha':
            createDateControl(item, container);
            break;
        case 'Hora':
            createTimeControl(item, container);
            break;
        case 'Switch':
            createSwitch(item, container);
            break;
        case 'Input flotante':
            createFloatingInput(item, container);
            break;
        case 'Setpoint Con Diferenciales':
            createSetpointInput(item, container);
            break;
        case 'Descongelacion':
            createDescongelar(item, container);
            break;
        // Añadir mas casos segun sea necesario
    }
}
function createDescongelar(item, container) {
    const inputContainer = document.createElement('div');
    inputContainer.className = 'status-item floating-input-container';

    const label = document.createElement('div');
    label.textContent = "Descongelar";
label.className = 'strong-label';  // Agregamos la clase aquí

    const createDisplayValue = (id, labelText, value) => {
        const wrapper = document.createElement('div');
        wrapper.className = 'display-value-wrapper';
        const displayLabel = document.createElement('span');
        displayLabel.textContent = `${labelText}: `;
        const displayValue = document.createElement('span');
        displayValue.id = `${id}-display-${item.IdTopico}`;
        displayValue.textContent = value !== undefined && value !== null ? value : 'No disponible';
        wrapper.appendChild(displayLabel);
        wrapper.appendChild(displayValue);
        return wrapper;
    };
    const dato = JSON.parse(item.Dato);

    const tiempoDisplay = createDisplayValue('tiempo', 'Tiempo de Descongelación', dato.tiempo);
    const periodoDisplay = createDisplayValue('periodo', 'Periodo de Descongelación', dato.periodo);
    const ventiladorDisplay = createDisplayValue('ventilador', 'Ventilador', dato.ventilador ? 'Encendido' : 'Apagado');

    const button = document.createElement('button');
    button.textContent = 'Actualizar';
    button.className = 'update-button';
    button.onclick = () => showDescongelarUpdateModal(item.IdTopico, item.Nombre, item.Dato);

    inputContainer.appendChild(label);
    inputContainer.appendChild(tiempoDisplay);
    inputContainer.appendChild(periodoDisplay);
    inputContainer.appendChild(ventiladorDisplay);
    inputContainer.appendChild(button);

    container.appendChild(inputContainer);
}

function showDescongelarUpdateModal(idTopico, nombre, currentValues) {
    const modal = document.createElement('div');
    modal.className = 'modal';

    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';

    const title = document.createElement('h2');
    title.textContent = `Actualizar ${nombre}`;

    // Etiqueta y input para el tiempo de descongelación
    const tiempoLabel = document.createElement('label');
    tiempoLabel.textContent = 'Tiempo de Descongelación (en minutos)';
    const tiempoInput = document.createElement('input');
    tiempoInput.type = 'number';
    tiempoInput.value = currentValues.tiempo || 0;
    tiempoInput.placeholder = 'Ingrese tiempo en minutos';

    // Etiqueta y input para el periodo de descongelación
    const periodoLabel = document.createElement('label');
    periodoLabel.textContent = 'Periodo de Descongelación (HH:mm)';
    const periodoInput = document.createElement('input');
    periodoInput.type = 'time';
    periodoInput.value = currentValues.periodo || '00:00';
    periodoInput.placeholder = 'Ingrese horas y minutos';

    // Checkbox para el ventilador
    const ventiladorCheckbox = document.createElement('input');
    ventiladorCheckbox.type = 'checkbox';
    ventiladorCheckbox.checked = currentValues.ventilador || false;

    const ventiladorLabel = document.createElement('label');
    ventiladorLabel.textContent = 'Prender ventilador';
    ventiladorLabel.style.display = 'flex';
    ventiladorLabel.style.alignItems = 'center';
    ventiladorLabel.style.gap = '10px';
    ventiladorLabel.appendChild(ventiladorCheckbox);

    // Botón de actualización
    const updateButton = document.createElement('button');
    updateButton.textContent = 'Actualizar';
    updateButton.className = 'update-button';
    updateButton.onclick = () => {
        const newValues = {
            tiempo: parseInt(tiempoInput.value, 10),
            periodo: periodoInput.value,
            ventilador: ventiladorCheckbox.checked
        };
        updateDescongelar(idTopico, newValues);
        document.body.removeChild(modal);
    };

    // Botón de cancelar
    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'Cancelar';
    cancelButton.className = 'cancel-button';
    cancelButton.onclick = () => document.body.removeChild(modal);

    // Agregar elementos al modal
    modalContent.appendChild(title);
    modalContent.appendChild(tiempoLabel);
    modalContent.appendChild(tiempoInput);
    modalContent.appendChild(periodoLabel);
    modalContent.appendChild(periodoInput);
    modalContent.appendChild(ventiladorLabel);
    modalContent.appendChild(updateButton);
    modalContent.appendChild(cancelButton);

    modal.appendChild(modalContent);
    document.body.appendChild(modal);
}

function updateDescongelar(idTopico, values) {
    const message = JSON.stringify(values);
    accionarTarea(idTopico, message);

    // Update displayed values
    document.getElementById(`tiempo-display-${idTopico}`).textContent = values.tiempo;
    document.getElementById(`periodo-display-${idTopico}`).textContent = values.periodo;
    document.getElementById(`ventilador-display-${idTopico}`).textContent = values.ventilador ? 'Encendido' : 'Apagado';
}
function createSetpointInput(item, container) {
    const inputContainer = document.createElement('div');
    inputContainer.className = 'status-item floating-input-container';

    const label = document.createElement('div');
    label.className = 'status-label';
    label.textContent = item.Nombre;

    const createDisplayValue = (id, labelText, value) => {
        const wrapper = document.createElement('div');
        wrapper.className = 'display-value-wrapper';
        const displayLabel = document.createElement('span');
        displayLabel.textContent = `${labelText}: `;
        const displayValue = document.createElement('span');
        displayValue.id = `${id}-display-${item.IdTopico}`;
        displayValue.textContent = value !== undefined && value !== null ? value : 'No disponible';
        wrapper.appendChild(displayLabel);
        wrapper.appendChild(displayValue);
        return wrapper;
    };

    // Parseamos el JSON string para convertirlo en un objeto
    const dato = JSON.parse(item.Dato);
    
    const diferencialMinDisplay = createDisplayValue('diferencialMin', 'Diferencial Mínimo', dato.difMin);
    const setpointDisplay = createDisplayValue('setpoint', 'Setpoint', dato.setpoint);
    const diferencialMaxDisplay = createDisplayValue('diferencialMax', 'Diferencial Máximo', dato.difMax);

    const button = document.createElement('button');
    button.textContent = 'Actualizar';
    button.className = 'update-button';
    button.onclick = () => showSetpointUpdateModal(item.IdTopico, item.Nombre, item.Dato);

    inputContainer.appendChild(label);
    inputContainer.appendChild(diferencialMinDisplay);
    inputContainer.appendChild(setpointDisplay);
    inputContainer.appendChild(diferencialMaxDisplay);
    inputContainer.appendChild(button);

    container.appendChild(inputContainer);
}


function showSetpointUpdateModal(idTopico, nombre, currentValues) {
    const modal = document.createElement('div');
    modal.className = 'modal';

    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';

    const title = document.createElement('h2');
    title.textContent = `Actualizar ${nombre}`;

    const diferencialIzqInput = document.createElement('input');
    diferencialIzqInput.type = 'number';
    diferencialIzqInput.step = '0.1';
    diferencialIzqInput.value = currentValues.difMin;
    diferencialIzqInput.placeholder = 'Diferencial minimo';

    const setpointInput = document.createElement('input');
    setpointInput.type = 'number';
    setpointInput.step = '0.1';
    setpointInput.value = currentValues.setpoint;
    setpointInput.placeholder = 'Setpoint';

    const diferencialDerInput = document.createElement('input');
    diferencialDerInput.type = 'number';
    diferencialDerInput.step = '0.1';
    diferencialDerInput.value = currentValues.difMax;
    diferencialDerInput.placeholder = 'Diferencial maximo';

    const updateButton = document.createElement('button');
    updateButton.textContent = 'Actualizar';
    updateButton.onclick = () => {
        const newValues = {
            difMin: diferencialIzqInput.value,
            setpoint: setpointInput.value,
            difMax: diferencialDerInput.value
        };
        updateFloatingDiferencialInput(idTopico, newValues);
        document.body.removeChild(modal);
    };

    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'Cancelar';
    cancelButton.onclick = () => document.body.removeChild(modal);

    modalContent.appendChild(title);
    modalContent.appendChild(diferencialIzqInput);
    modalContent.appendChild(setpointInput);
    modalContent.appendChild(diferencialDerInput);
    modalContent.appendChild(updateButton);
    modalContent.appendChild(cancelButton);

    modal.appendChild(modalContent);
    document.body.appendChild(modal);
}

function updateFloatingDiferencialInput(idTopico, values) {
    const message = JSON.stringify(values);
    accionarTarea(idTopico, message);

    // Update displayed values
    document.getElementById(`diferencialIzq-display-${idTopico}`).textContent = values.difMin;
    document.getElementById(`setpoint-display-${idTopico}`).textContent = values.setpoint;
    document.getElementById(`diferencialDer-display-${idTopico}`).textContent = values.difMax;
}



function createCanchaImage(isLightOn) {
    const imageContainer = document.createElement('div');
    imageContainer.className = 'cancha-image-container';
    const img = document.createElement('img');
    updateCanchaImage(imageContainer, isLightOn);
    return imageContainer;
}


function updateCanchaImage(container, isLightOn) {
    const img = container.querySelector('img') || document.createElement('img');
    img.src = isLightOn ? '/static/img/cancha_encendida.jpg' : '/static/img/cancha_apagada.jpg';
    img.alt = `Estado de la cancha: ${isLightOn ? 'Encendida' : 'Apagada'}`;
    img.className = 'cancha-image';
    if (!container.contains(img)) {
        container.appendChild(img);
    }
}




function createDateControl(item, container) {
    const dateContainer = document.createElement('div');
    dateContainer.className = 'status-item date-container';

    const label = document.createElement('div');
    label.className = 'status-label';
    label.textContent = 'Dias';

    const daySelector = createDaySelector(item.IdTopico);

    dateContainer.appendChild(label);
    dateContainer.appendChild(daySelector);

    container.appendChild(dateContainer);
}



function createDaySelector(idTopico) {
    const daySelector = document.createElement('div');
    daySelector.className = 'day-selector';
    const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    days.forEach((day, index) => {
        const dayButton = document.createElement('button');
        dayButton.textContent = day;
        dayButton.className = 'day-button';
        dayButton.onclick = () => toggleDaySelection(dayButton, idTopico, index);
        daySelector.appendChild(dayButton);
    });
    return daySelector;
}


function toggleDaySelection(button, idTopico, dayIndex) {
    button.classList.toggle('selected');
    const selectedDays = getSelectedDays(idTopico);
    if (button.classList.contains('selected')) {
        selectedDays.add(dayIndex);
    } else {
        selectedDays.delete(dayIndex);
    }
    updateSelectedDays(idTopico, selectedDays);
}

function getSelectedDays(idTopico) {
    if (!groupedData[idTopico]) {
        groupedData[idTopico] = { selectedDays: new Set() };
    }
    return groupedData[idTopico].selectedDays;
}


function updateSelectedDays(idTopico, selectedDays) {
    groupedData[idTopico].selectedDays = selectedDays;
}

function createTimeControl(item, container) {
    const timeContainer = document.createElement('div');
    timeContainer.className = 'status-item time-container';

    const label = document.createElement('div');
    label.className = 'status-label';
    label.textContent = item.Nombre;

    const timeInput = document.createElement('input');
    timeInput.type = 'time';
    timeInput.id = `time-${item.IdTopico}`;
    timeInput.value = formatTime(item.Dato);
    timeInput.className = 'time-input';
    timeInput.onchange = () => accionarTarea(item.IdTopico, timeInput.value);

    timeContainer.appendChild(label);
    timeContainer.appendChild(timeInput);

    container.appendChild(timeContainer);
}

function createSwitch(item, container, imageContainer) {
    const switchContainer = document.createElement('div');
    switchContainer.className = 'status-item switch-container';
    switchContainer.id = `switch-container-${item.IdTopico}`;

    const label = document.createElement('div');
    label.className = 'status-label';
    label.textContent = item.Nombre;

    const switchLabel = document.createElement('label');
    switchLabel.className = 'switch';

    const input = document.createElement('input');
    input.type = 'checkbox';
    input.id = `switch-${item.IdTopico}`;
    input.checked = item.Dato === '1';
    input.setAttribute('data-idtopico', item.IdTopico);
    input.onchange = () => {
        showConfirmation(item.IdTopico, item.Nombre, input.checked);
        if (imageContainer) {
            updateCanchaImage(imageContainer, input.checked);
        }
    };

    const slider = document.createElement('span');
    slider.className = 'slider';

    switchLabel.appendChild(input);
    switchLabel.appendChild(slider);

    switchContainer.appendChild(label);
    switchContainer.appendChild(switchLabel);

    container.appendChild(switchContainer);

    // Update the image initially
    if (imageContainer) {
        updateCanchaImage(imageContainer, input.checked);
    }
}

function createSwitchRequerido(item, container) {
    const switchContainer = document.createElement('div');
    switchContainer.className = 'status-item switch-container switch-requerido';

    const label = document.createElement('div');
    label.className = 'status-label';
    label.textContent = item.Nombre;

    const switchLabel = document.createElement('label');
    switchLabel.className = 'switch';

    const input = document.createElement('input');
    input.type = 'checkbox';
    input.id = `switch-${item.IdTopico}`;
    input.checked = item.Dato === '1';
    input.setAttribute('data-idtopico', item.IdTopico);
    input.onchange = () => showConfirmation(item.IdTopico, item.Nombre, input.checked, true);

    const slider = document.createElement('span');
    slider.className = 'slider';

    switchLabel.appendChild(input);
    switchLabel.appendChild(slider);

    switchContainer.appendChild(label);
    switchContainer.appendChild(switchLabel);

    container.appendChild(switchContainer);
}

function showConfirmation(idTopico, nombre, isChecked, isRequerido = false) {
    const message = isChecked ? 
        `¿Deseas prender ${nombre}?` : 
        `¿Deseas apagar ${nombre}?`;

    showModal(message, () => {
        if (isRequerido) {
            toggleSwitchRequerido(idTopico);
        } else {
            toggleSwitch(idTopico);
        }
    }, () => {
        const switchElement = document.getElementById(`switch-${idTopico}`);
        switchElement.checked = !isChecked;
    });
}

function showModal(message, onConfirm, onCancel) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <p>${message}</p>
            <div class="modal-buttons">
                <button class="confirm">Si</button>
                <button class="cancel">No</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    const confirmButton = modal.querySelector('.confirm');
    const cancelButton = modal.querySelector('.cancel');

    confirmButton.onclick = () => {
        onConfirm();
        document.body.removeChild(modal);
    };

    cancelButton.onclick = () => {
        onCancel();
        document.body.removeChild(modal);
    };

    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            onCancel();
            document.body.removeChild(modal);
        }
    });

    cancelButton.focus();
}

function toggleSwitch(idTopico) {
    if (isManualMode) {
        const switchElement = document.getElementById(`switch-${idTopico}`);
        const isChecked = switchElement.checked;
        accionarTarea(idTopico, isChecked ? 'True' : 'False');
        
        const switchName = switchElement.closest('.switch-container').querySelector('.status-label').textContent;
        updateFieldImage(switchName, isChecked);

        // Update the image if this switch is for a "cancha"
        const groupContainer = switchElement.closest('.group-container');
        if (groupContainer && groupContainer.querySelector('h4').textContent.toLowerCase().includes('cancha')) {
            const imageContainer = groupContainer.querySelector('.cancha-image-container');
            if (imageContainer) {
                updateCanchaImage(imageContainer, isChecked);
            }
        }
    } else {
        alert('No se pueden modificar los switches en modo automÃ¡tico');
    }
}

function updateFieldImage(switchName, isOn) {
    const fieldMap = {
        'Luz1': 'Cancha1',
        'Luz2': 'Cancha2'
    };

    const fieldName = fieldMap[switchName];
    if (fieldName) {
        const fieldImages = document.querySelectorAll('.control-item .cancha-image-container img');
        for (let img of fieldImages) {
            const parentHeader = img.closest('.control-item').querySelector('h3');
            if (parentHeader && parentHeader.textContent.includes(fieldName)) {
                img.src = isOn ? '/static/img/cancha_encendida.jpg' : '/static/img/cancha_apagada.jpg';
                img.alt = `Estado de ${fieldName}: ${isOn ? 'Encendida' : 'Apagada'}`;
                break;
            }
        }
    }
}

function toggleSwitchRequerido(idTopico) {
    const switchElement = document.getElementById(`switch-${idTopico}`);
    isManualMode = switchElement.checked;
    accionarTarea(idTopico, isManualMode ? 'True' : 'False');
    updateSwitchesVisibility(isManualMode);
}

function formatDecimalToTime(decimalTime) {
    console.log("Valor recibido para formatear:", decimalTime);
    if (isNaN(decimalTime)) {
        return "00:00";
    }

    const hours = Math.floor(decimalTime);
    const minutes = Math.round((decimalTime - hours) * 60);

    const formattedHours = String(hours).padStart(2, '0');
    const formattedMinutes = String(minutes).padStart(2, '0');

    return `${formattedHours}:${formattedMinutes}`;
}

function formatTime(floatValue) {
    if (isNaN(floatValue)) {
        return "00:00";
    }

    const hours = Math.floor(floatValue);
    const minutes = Math.round((floatValue - hours) * 60);

    const formattedHours = String(hours).padStart(2, '0');
    const formattedMinutes = String(minutes).padStart(2, '0');

    return `${formattedHours}:${formattedMinutes}`;
}

function accionarTarea(idTopico, accion) {
    const payload = { 
        idtopico: idTopico, 
        idDispo: getDeviceIdFromURL(), 
        accion: accion 
    };

    fetchData('https://sjrc.com.ar/Accionar', payload)
        .then(data => {
            console.log('Respuesta del servidor:', data);

            if (data && data.message) {
                const switchElement = document.getElementById(`switch-${idTopico}`);
                if (switchElement && switchElement.type === 'checkbox') {
                    switchElement.checked = accion === 'True';
                }

                const timeElement = document.getElementById(`time-${idTopico}`);
                if (timeElement && timeElement.type === 'time') {
                    if (data.startTime) {
                        timeElement.value = data.startTime;
                        console.log(`Hora de inicio ajustada a: ${data.startTime}`);
                    }
                    if (data.endTime) {
                        console.log(`Hora de fin ajustada a: ${data.endTime}`);
                    }
                }
            } else {
                console.error("La respuesta no contiene un mensaje vÃ¡lido.");
            }
        })
        .catch(error => {
            console.error('Error al enviar la acciÃ³n:', error);
            const switchElement = document.getElementById(`switch-${idTopico}`);
            if (switchElement && switchElement.type === 'checkbox') {
                switchElement.checked = !switchElement.checked;
            }
            const timeElement = document.getElementById(`time-${idTopico}`);
            if (timeElement && timeElement.type === 'time') {
                timeElement.value = timeElement.defaultValue;
            }
        });
}

function updateSwitchesVisibility(isManual) {
    const switchContainers = document.querySelectorAll('.switch-container:not(.switch-requerido)');
    switchContainers.forEach(container => {
        if (isManual) {
            container.style.display = '';
            container.querySelector('input[type="checkbox"]').disabled = false;
        } else {
            container.style.display = 'none';
        }
    });
}

function enableAllSwitches() {
    const switchContainers = document.querySelectorAll('.switch-container');
    switchContainers.forEach(container => {
        container.style.display = '';
        container.querySelector('input[type="checkbox"]').disabled = false;
    });
}

function startRealTimeUpdates() {
    if (realTimeInterval) return; // Prevent multiple intervals

    if (currentRange === '1day') {
        realTimeInterval = setInterval(() => {
            fetchHistoriadorData();
        }, 40000);
    }
}

function createChartContainer() {
    const existingChart = document.querySelector('#chartdiv');
    if (existingChart) {
        // Crear el contenedor de la barra de herramientas para el selector de fecha
        const toolbar = document.createElement('div');
        toolbar.className = 'toolbar';
        toolbar.innerHTML = `
            <label for="date-picker">Selecciona una fecha:</label>
            <input type="date" id="date-picker">
        `;
        
        existingChart.parentNode.insertBefore(toolbar, existingChart.nextSibling);
        
        setupDateControl();
    }
}


function setupDateControl() {
    const datePicker = document.querySelector('#date-picker');
    
    // Escuchar el cambio en la selección de fecha
    datePicker.addEventListener('change', function(e) {
        const selectedDate = e.target.value;  // Fecha seleccionada en formato 'YYYY-MM-DD'
        updateChartRange(selectedDate);
    });
}


function drawDataChart(item) {
    const chartDiv = document.querySelector("#chartdiv");
    chartDiv.innerHTML = "";  

    const temperatureMessage = document.getElementById('temperature-message');
    if (temperatureMessage) {
        temperatureMessage.textContent = item.mensaje || '';
    }
     // Filtrar y mapear los datos válidos
    const dataPoints = item.Dato.map(entry => {
        const date = new Date(entry.fechayhora);
        const value = parseFloat(entry.dato);
        if (isNaN(date.getTime()) || isNaN(value)) {
            console.error("Datos inválidos:", entry);
            return null; // Ignorar puntos inválidos
        }
        return { x: date.getTime(), y: value };
    }).filter(Boolean).sort((a, b) => a.x - b.x);

    // Si no hay datos válidos después de filtrar
    if (dataPoints.length === 0) {
        const alertMessage = document.createElement("div");
        alertMessage.classList.add("alert", "alert-warning");
        alertMessage.innerText = "No hay datos válidos para el gráfico.";
        chartDiv.appendChild(alertMessage);
        return;
    }


    // Comprobar si el contenedor tiene un tamaño válido
    const chartDivWidth = chartDiv.offsetWidth;
    const chartDivHeight = chartDiv.offsetHeight;
    if (chartDivWidth === 0 || chartDivHeight === 0) {
        console.error('El contenedor del gráfico tiene dimensiones inválidas:', chartDivWidth, chartDivHeight);
        return;
    }

    const minDate = dataPoints[0].x;
    const maxDate = dataPoints[dataPoints.length - 1].x;

    const options = {
        series: [{
            name: 'Temperatura',
            data: dataPoints
        }],
        chart: {
            id: 'area-datetime',
            type: 'area',
            height: 350,
            zoom: {
                autoScaleYaxis: true
            }
        },
        dataLabels: {
            enabled: false
        },
        xaxis: {
            type: 'datetime',
            min: minDate,
            max: maxDate,
            labels: {
                datetimeUTC: false,
                format: 'HH:mm'
            }
        },
        tooltip: {
            x: {
                format: 'dd MMM yyyy HH:mm'
            }
        },
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.7,
                opacityTo: 0.9,
                stops: [0, 100]
            }
        },
        stroke: {
            curve: 'smooth',
            width: 2
        },
        yaxis: {
            title: {
                text: 'Temperatura (°C)'
            },
            labels: {
                formatter: function(value) {
                    return value.toFixed(1) + '°C';
                }
            }
        }
    };

    if (chart) {
        chart.destroy();
    } 
    chart = new ApexCharts(chartDiv, options);
    chart.render();
}

function updateTemperatureDisplay(temperatureData) {
    const temperatureElement = document.getElementById('temperature-value');
    if (temperatureElement && temperatureData.mensaje) {
        temperatureElement.textContent = temperatureData.mensaje;
    }
}

function createDataTable(tableData) {
    allData = tableData;
    filteredData = tableData;
    loadTable();
}

function loadTable() {
    const tableHeader = document.getElementById('table-header');
    const tableBody = document.getElementById('dataTableBody');
    tableHeader.innerHTML = '';
    tableBody.innerHTML = '';

    if (filteredData.length === 0) {
        const noDataMessage = document.createElement('tr');
        const td = document.createElement('td');
        td.colSpan = 5;
        td.textContent = 'No hay datos disponibles';
        noDataMessage.appendChild(td);
        tableBody.appendChild(noDataMessage);
        return;
    }

    const columns = Object.keys(filteredData[0]);
    columns.forEach(column => {
        const th = document.createElement('th');
        th.textContent = column;
        tableHeader.appendChild(th);
    });

    let start = (currentPage - 1) * pageSize;
    let end = start + pageSize;
    let paginatedData = filteredData.slice(start, end);

    paginatedData.forEach(row => {
        const tr = document.createElement('tr');
        columns.forEach(column => {
            const td = document.createElement('td');

            if (column === 'dato') {
                if (row[column] == '0') {
                    td.textContent = 'Desconectado';
                } else if (row[column] == '1') {
                    td.textContent = 'Conectado';
                } else {
                    td.textContent = row[column];
                }
            } else {
                td.textContent = row[column];
            }

            tr.appendChild(td);
        });
        tableBody.appendChild(tr);
    });

    updatePagination();
    updateCurrentPageLabel();
}

function updatePageSize() {
    pageSize = parseInt(document.getElementById("pageSizeSelect").value);
    currentPage = 1;
    loadTable();
}

function updatePagination() {
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';

    totalRecords = filteredData.length;
    const totalPages = Math.ceil(totalRecords / pageSize);

    const prevButton = createPaginationButton('&laquo;', () => prevPage(), currentPage === 1);
    pagination.appendChild(prevButton);

    for (let i = 1; i <= totalPages; i++) {
        const pageButton = createPaginationButton(i, () => goToPage(i), currentPage === i);
        pagination.appendChild(pageButton);
    }

    const nextButton = createPaginationButton('&raquo;', () => nextPage(), currentPage === totalPages);
    pagination.appendChild(nextButton);
}

function createPaginationButton(text, onClick, isDisabled) {
    const li = document.createElement('li');
    li.className = `page-item ${isDisabled ? 'disabled' : ''}`;
    
    const a = document.createElement('a');
    a.className = 'page-link';
    a.href = '#';
    a.innerHTML = text;
    a.onclick = (e) => {
        e.preventDefault();
        if (!isDisabled) onClick();
    };

    li.appendChild(a);
    return li;
}

function updateCurrentPageLabel() {
    const currentPageLabel = document.getElementById('currentPageLabel');
    if (currentPageLabel) {
        currentPageLabel.innerText = `Pagina ${currentPage}`;
    }
}

function nextPage() {
    const totalPages = Math.ceil(totalRecords / pageSize);
    if (currentPage < totalPages) {
        currentPage++;
        loadTable();
    }
}

function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        loadTable();
    }
}

function goToPage(page) {
    currentPage = page;
    loadTable();
}

function filterByDate() {
    const selectedDate = document.getElementById("dateFilter").value;
    filteredData = allData.filter(row => row.fechayhora.startsWith(selectedDate));
    applyFilters();
}

function getDeviceIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('device');
}

function updateWifiStatus(isConnected) {
    const wifiStatusText = document.getElementById('wifi-status');
    const wifiIcon = document.getElementById('wifi-icon');

    if (wifiStatusText && wifiIcon) {
        if (isConnected) {
            wifiStatusText.textContent = '1';
            wifiIcon.style.color = 'var(--connected-color)';
        } else {
            wifiStatusText.textContent = '0';
            wifiIcon.style.color = 'var(--disconnected-color)';
        }
    }
}


function updateChartRange(selectedDate) {
    currentRange = selectedDate;
    fetchHistoriadorData();  // Función para obtener y actualizar los datos del gráfico
}

function resetCssClasses(e) {
    const buttons = document.querySelectorAll('.toolbar button');
    buttons.forEach(button => button.classList.remove('active'));
    e.target.classList.add('active');
}


function applyFilters() {
    const selectedTopic = document.getElementById('topic-filter').value;

    filteredData = allData.filter(item => {
        const itemPrefix = item.nombre.split(' ').slice(0, -3).join(' ');
        return (!selectedTopic || itemPrefix === selectedTopic);
    });

    currentPage = 1;
    loadTable();
}

function createFloatingInput(item, container) {
    const inputContainer = document.createElement('div');
    inputContainer.className = 'status-item floating-input-container';

    const label = document.createElement('div');
    label.className = 'status-label';
    label.textContent = item.Nombre;

    const input = document.createElement('input');
    input.type = 'number';
    input.step = '0.1';
    input.value = item.Dato;
    input.id = `input-${item.IdTopico}`;
    input.className = 'floating-input';

    const button = document.createElement('button');
    button.textContent = 'Enviar';
    button.className = 'send-button';
    button.onclick = () => showSetpointConfirmation(item.IdTopico, item.Nombre, input.value);

    inputContainer.appendChild(label);
    inputContainer.appendChild(input);
    inputContainer.appendChild(button);

    container.appendChild(inputContainer);
}

function showSetpointConfirmation(idTopico, nombre, newValue) {
    const message = `¿Deseas cambiar ${nombre}?<br>Setpoint Actual: ${document.getElementById(`input-${idTopico}`).defaultValue}<br>’ Nuevo Setpoint: ${newValue}`;

    showModal(message, () => {
        updateFloatingInput(idTopico, newValue);
    }, () => {
        document.getElementById(`input-${idTopico}`).value = document.getElementById(`input-${idTopico}`).defaultValue;
    });
}

function updateFloatingInput(idTopico, value) {
    accionarTarea(idTopico, value);
}


function updateGroup(groupName, items) {
    const updatedItems = [];
    items.forEach(item => {
        let element;
        let newValue;
        switch (item.Boton) {
            case 'Fecha':
                const selectedDays = getSelectedDays(item.IdTopico);
                newValue = JSON.stringify(Array.from(selectedDays).sort());
                break;
            case 'Switch':
                // Obtener el estado del switch desde el contenedor del grupo no del modal
                element = document.querySelector(`#switch-container-${item.IdTopico} input[type="checkbox"]`);
                newValue = element ? (element.checked ? 'True' : 'False') : item.Dato;
                break;
            default:
                element = document.getElementById(`time-${item.IdTopico}`) || document.getElementById(`input-${item.IdTopico}`);
                newValue = element ? element.value : item.Dato;
        }
        if (newValue !== item.Dato) {
            accionarTarea(item.IdTopico, newValue);
            updatedItems.push({ nombre: item.Nombre, valor: newValue });
        }
    });

    if (updatedItems.length > 0) {
        const message = `Se actualizaron los siguientes elementos:\n${updatedItems.map(item => `- ${item.nombre}: ${item.valor}`).join('\n')}`;
        alert(message);
    } else {
        alert('No se realizaron cambios.');
    }

    // Update the group summary after actions are performed
    updateGroupSummary(groupName, items);
}



function updateGroupSummary(groupName, items) {
    const groupContainers = document.querySelectorAll('.group-container');
    let targetContainer;

    for (let container of groupContainers) {
        if (container.querySelector('h4').textContent === groupName) {
            targetContainer = container;
            break;
        }
    }

    if (targetContainer) {
        const groupSummary = targetContainer.querySelector('.group-summary');
        groupSummary.innerHTML = '';
        items.forEach(item => {
            const summaryItem = document.createElement('div');
            let displayName = item.Nombre;
            if (displayName.toLowerCase().startsWith('luz')) {
                displayName = 'Luz';
            } else if (displayName.includes('Encendido') || displayName.includes('Apagado')) {
                // Keep the original name for "Hora de Encendido" and "Hora de Apagado"
            } else if (displayName === 'Fecha') {
                displayName = 'Dias';
            }
            summaryItem.textContent = `${displayName}: ${formatValue(item)}`;
            groupSummary.appendChild(summaryItem);
        });
    }

    // Update cancha image if applicable
    if (groupName.toLowerCase().includes('cancha')) {
        const luzItem = items.find(item => item.Nombre.toLowerCase().startsWith('luz'));
        if (luzItem) {
            const imageContainer = targetContainer.querySelector('.cancha-image-container');
            if (imageContainer) {
                const img = imageContainer.querySelector('img');
                const isLightOn = getUpdatedValue(luzItem) === 'Encendido';
                img.src = isLightOn ? '/static/img/cancha_encendida.jpg' : '/static/img/cancha_apagada.jpg';
                img.alt = `Estado de la cancha: ${isLightOn ? 'Encendida' : 'Apagada'}`;
            }
        }
    }
}




function getUpdatedValue(item) {
    let element;
    switch (item.Boton) {
        case 'Fecha':
            const selectedDays = getSelectedDays(item.IdTopico);
            return JSON.stringify(Array.from(selectedDays).sort());
        case 'Switch':
            element = document.getElementById(`switch-${item.IdTopico}`);
            return element ? (element.checked ? 'Encendido' : 'Apagado') : item.Dato;
        default:
            element = document.getElementById(`time-${item.IdTopico}`) || document.getElementById(`input-${item.IdTopico}`);
            return element ? element.value : item.Dato;
    }
}


function formatValue(item) {
    if (item.Boton === 'Fecha') {
        try {
            const selectedDays = JSON.parse(item.Dato);
            const daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
            return selectedDays.map(day => daysOfWeek[day]).join(', ');
        } catch (e) {
            console.error("Invalid JSON format in item.Dato:", item.Dato);
            return item.Dato; // Fallback to returning the raw data if it's not valid JSON
        }
    }
    return item.Dato;
}



function initializeSwitchImages() {
    const switches = document.querySelectorAll('.switch-container input[type="checkbox"]');
    switches.forEach(switchElement => {
        const switchName = switchElement.closest('.switch-container').querySelector('.status-label').textContent;
        updateFieldImage(switchName, switchElement.checked);
    });
}