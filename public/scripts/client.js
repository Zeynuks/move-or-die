const socket = io();

document.addEventListener('DOMContentLoaded', () => {
    const nameInput = document.getElementById('username');
    const createRoomBtn = document.getElementById('createRoomBtn');

    const showNotification = (message) => {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.innerText = message;
        document.body.appendChild(notification);
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 500);
        }, 3000);
    };

    createRoomBtn.addEventListener('click', () => {
        const username = nameInput.value;
        if (username) {
            const newRoomName = Math.random().toString(36).substring(7); // Генерация случайного имени комнаты
            socket.emit('createRoom', newRoomName, username);
            socket.on('roomCreated', (roomName) => {
                window.location.href = `/room?room=${roomName}&name=${username}`;
            });
        } else {
            showNotification('Please enter your name');
        }
    });

    socket.on('error', (message) => {
        showNotification(message);
    });

});
