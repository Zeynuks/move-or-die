const socket = io();
document.addEventListener('DOMContentLoaded', () => {
    let playersImages = {
        blue: '../images/skinBlue.png',
        yellow: '../images/skinYellow.png',
        green: '../images/skinGreen.png',
        purple: '../images/skinRed.png'
    };


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
    let colorBtn = document.getElementById('colorBtn');
    const copyLinkBtn = document.getElementById('copyLinkBtn');
    const copyNotification = document.getElementById('copyNotification');
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
            const name = document.createElement('h2');
            const image = document.createElement('img');
            const isReady = document.createElement('p');
            readyBtn = document.createElement('button');
            colorBtn = document.createElement('button');
            name.innerText = `${user.user_name}`;

            li.appendChild(name);
            li.appendChild(image);
            image.src = playersImages[user.user_color];
            image.id = 'colorImg' + user.user_name;
            if (userName === user.user_name && getUserIpByName(users, userName) === user.user_ip) {
                const test = document.createElement('p');
                readyBtn.classList.add('button');
                readyBtn.id = 'readyBtn';
                readyBtn.innerText = 'Готов';
                colorBtn.classList.add('button');
                colorBtn.id = 'colorBtn';
                colorBtn.innerText = 'Сменить цвет';
                li.appendChild(test);
                li.appendChild(readyBtn);
                li.appendChild(colorBtn);
                colorBtn.addEventListener('click', () => {
                    getUserColor(user, users);
                });
                readyBtn.addEventListener('click', () => {
                    socket.emit('playerReady', roomName, userName);
                    readyBtn.disabled = true;
                    showNotification('You are ready!', readyNotification);
                });

            } else {
                isReady.innerText = `${playersReadyStates[user.user_name] ? 'Ready' : 'Not Ready'}`;
                li.appendChild(isReady);
            }
            playersList.appendChild(li);
        });
    });

    socket.on('fullRoom', () => {
        window.location.href = `/?name=${userName}`;
    });

    socket.on('gameStarted', () => {
        window.location.href = `/game?room=${roomName}&name=${userName}`;
    });

    socket.on('loadGame', (roomName, users) => {
        socket.emit('gameStart', roomName, users);
    });

    socket.on('error', () => {
        window.location.href = `/join?room=${roomName}`;
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

    function getUserIpByName(users, userName) {
        const user = users.find(user => user.user_name === userName);
        return user ? user.user_ip : null;
    }

    function getRandomUniqueColor(objects) {
        const colorArray = ['blue', 'green', 'yellow', 'purple'];
        const usedColors = objects.map(obj => obj.user_color);
        const availableColors = colorArray.filter(color => !usedColors.includes(color));
        const randomIndex = Math.floor(Math.random() * availableColors.length);
        return availableColors[randomIndex];
    }

    function getUserColor(user, users) {
        if (user.user_name === userName) {
            user.user_color = getRandomUniqueColor(users)
            let colorImg = document.getElementById('colorImg' + user.user_name);
            colorImg.src = playersImages[user.user_color];
            let userData = {skin: 'default', color: user.user_color}
            socket.emit('applySettings', roomName, userData);
        }
    }
});
