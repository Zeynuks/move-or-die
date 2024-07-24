const socket = io();
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const roomName = urlParams.get('room');
    const userName = urlParams.get('name');

    if (!userName) {
        window.location.href = `/join?room=${roomName}`;
        return;
    }

    const roomLink = document.getElementById('roomLink');
    const roomNameElement = document.getElementById('roomName');
    const playersList = document.getElementById('playersList');
    let readyBtn = document.getElementById('readyBtn');
    const copyLinkBtn = document.getElementById('copyLinkBtn');
    const copyNotification = document.getElementById('copyNotification');
    const creatorElement = document.getElementById('creator');
    const readyNotification = document.getElementById('readyNotification');

    const showNotification = (message, notificationElement) => {
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

    roomNameElement.innerText = roomName;

    fetch('/get-info')
        .then(response => response.json())
        .then(data => {
            const serverIP = data.ip;
            const serverPORT = data.port;
            roomLink.href = `http://${serverIP}:${serverPORT}/join?room=${roomName}`;
            roomLink.innerText = `http://${serverIP}:${serverPORT}/join?room=${roomName}`;
        })
        .catch(error => {
            console.error('Error fetching IP:', error);
        });

    socket.emit('joinRoom', roomName, userName);

    socket.on('roomNotFound', () => {
        showNotification('Room not found', copyNotification);
        setTimeout(() => {
            window.location.href = '/';
        }, 3000);
    });

    socket.on('updateRoom', (users, creatorIp, playersReadyStates) => {
        playersList.innerHTML = '';
        users.forEach(user => {
            const li = document.createElement('li');
            li.innerText = `${user.user_name} - ${playersReadyStates[user.user_name] ? 'Ready' : 'Not Ready'}`;
            console.log(user.user_ip, creatorIp)
            if (user.user_ip === creatorIp) {
                li.innerText += ' (Host)';
            }
            playersList.appendChild(li);
        });
    });

    socket.on('fullRoom', () => {
        window.location.href = `/?name=${userName}`;
    });

    readyBtn.addEventListener('click', () => {
        socket.emit('playerReady', roomName, userName);
        readyBtn.disabled = true;
        showNotification('You are ready!', readyNotification);
    });

    socket.on('gameStarted', () => {
        window.location.href = `/game?room=${roomName}&name=${userName}`;
    });

    copyLinkBtn.addEventListener('click', () => {
        const link = roomLink.href;
        console.log('Copy button clicked, link:', link);

        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(link).then(() => {
                console.log('Link copied to clipboard');
                showNotification('Link copied to clipboard', copyNotification);
            }).catch(err => {
                console.error('Failed to copy link:', err);
                showNotification('Failed to copy link', copyNotification);
            });
        } else {
            const textarea = document.createElement('textarea');
            textarea.value = link;
            document.body.appendChild(textarea);
            textarea.select();
            try {
                document.execCommand('copy');
                console.log('Link copied to clipboard (fallback)');
                showNotification('Link copied to clipboard', copyNotification);
            } catch (err) {
                console.error('Failed to copy link (fallback):', err);
                showNotification('Failed to copy link', copyNotification);
            }
            document.body.removeChild(textarea);
        }
    });
});
