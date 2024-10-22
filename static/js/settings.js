document.addEventListener('DOMContentLoaded', function() {
    const advancedSettingsSection = document.getElementById('advanced-settings');
    const notificationsSection = document.getElementById('notifications');
    const otherSettingsSection = document.getElementById('other-settings');

    function loadSettings() {
        const advancedSettings = [
            'Cambiar el estado',
            'Resetear Dispositivo',
            'Conexion a internet '
        ];
        const notifications = [
            'Activa las alertas de estados criticos',
            'Recibe Novedades de tu dispositivo',
        ];
        const otherSettings = [
            'Datos de la cuenta',
            'Política de privacidad',
            'Términos y condiciones'
        ];

        advancedSettings.forEach(setting => {
            const listItem = document.createElement('div');
            listItem.className = 'device-item';
            listItem.textContent = setting;
            advancedSettingsSection.appendChild(listItem);
        });

        notifications.forEach(setting => {
            const listItem = document.createElement('div');
            listItem.className = 'device-item';
            listItem.textContent = setting;
            notificationsSection.appendChild(listItem);
        });

        otherSettings.forEach(setting => {
            const listItem = document.createElement('div');
            listItem.className = 'device-item';
            listItem.textContent = setting;
            otherSettingsSection.appendChild(listItem);
        });
    }

    loadSettings();
});