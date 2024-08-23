document.addEventListener('DOMContentLoaded', function() {
    const advancedSettingsSection = document.getElementById('advanced-settings');
    const notificationsSection = document.getElementById('notifications');
    const otherSettingsSection = document.getElementById('other-settings');

    function loadSettings() {
        const advancedSettings = [
            'Configuración de red',
            'Actualizaciones de firmware',
            'Restablecimiento de fábrica'
        ];
        const notifications = [
            'Notificaciones por correo electrónico',
            'Notificaciones push',
            'Alertas de sistema'
        ];
        const otherSettings = [
            'Gestión de usuarios',
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
