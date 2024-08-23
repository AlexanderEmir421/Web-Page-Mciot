document.addEventListener('DOMContentLoaded', function() {
    const chatBox = document.getElementById('chat-box');
    const chatInput = document.getElementById('chat-input');
    const sendButton = document.getElementById('send-button');
    const chatContainer = document.getElementById('chat-container');
    const supportLink = document.getElementById('support-link');
    const minimizeChatButton = document.getElementById('minimize-chat');
    const closeChatButton = document.getElementById('close-chat');

    function addMessageToChatBox(message, sender) {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${sender}`;
        messageElement.textContent = message;
        chatBox.appendChild(messageElement);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    function sendMessage() {
        const message = chatInput.value.trim();
        if (message) {
            addMessageToChatBox(message, 'user');
            chatInput.value = '';
            // Simula una respuesta del bot
            setTimeout(() => {
                const botMessage = 'Esta es una respuesta automática del bot.';
                addMessageToChatBox(botMessage, 'bot');
            }, 1000);
        }
    }

    sendButton.addEventListener('click', sendMessage);
    chatInput.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            sendMessage();
        }
    });

    supportLink.addEventListener('click', function(event) {
        event.preventDefault();
        chatContainer.classList.toggle('visible');
    });

    minimizeChatButton.addEventListener('click', function() {
        chatContainer.classList.remove('visible');
    });

    closeChatButton.addEventListener('click', function() {
        chatContainer.classList.add('hidden');
    });
});
