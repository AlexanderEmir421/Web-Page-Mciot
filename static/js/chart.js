// Función para dibujar el gráfico de datos
function drawDataChart(device) {
    const ctx = document.getElementById('data-chart').getContext('2d');
    const data = device.Dato.map(d => d.dato);
    const labels = device.Dato.map(d => d.fechayhora);

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Datos',
                data: data,
                borderColor: 'rgb(39, 30, 162)',
                backgroundColor: 'rgb(39, 85, 162)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    title: {
                        display: true,
                    }
                },
                y: {
                    title: {
                        display: true,
                    }
                }
            }
        }
    });
}

// Función para dibujar el gráfico de estados críticos
function drawCriticalStatesChart(device) {
    const ctx = document.getElementById('critical-states-chart').getContext('2d');
    const data = device.Dato.map(d => d.dato);
    const labels = device.Dato.map(d => d.fechayhora);

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                data: data.map((value, index) => ({ x: index, y: value })),
                backgroundColor: data.map(value => value > 26 ? 'rgba(255, 0, 0, 0.6)' : 'rgba(0, 128, 0, 1)'),
                borderColor: 'rgba(255, 0, 0, 0.2)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    title: {
                        display: true,
                    }
                },
                y: {
                    title: {
                        display: true,
                    },
                    suggestedMin: Math.min(...data) - 10,
                    suggestedMax: Math.max(...data) + 10
                }
            }
        }
    });
}
