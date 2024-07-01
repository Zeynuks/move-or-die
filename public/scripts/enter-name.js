document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const roomName = urlParams.get('room');
    document.getElementById('roomName').value = roomName;

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

    document.getElementById('nameForm').addEventListener('submit', function(event) {
        event.preventDefault();
        const userName = document.getElementById('userName').value;
        if (!userName) {
            showNotification('Name is required');
            return;
        }
        window.location.href = `/room?room=${roomName}&name=${userName}`;
    });
});
