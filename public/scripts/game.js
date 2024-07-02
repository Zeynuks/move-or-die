// development.yaml-game/public/scripts/game.js
const socket = io();

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const roomName = urlParams.get('room');

    if (roomName) {
        document.getElementById('roomName').innerText = `Room: ${roomName}`;

        // Здесь можно добавить логику для инициализации canvas игры
        const canvas = document.getElementById('gameCanvas');
        const context = canvas.getContext('2d');
        canvas.width = 1400;
        canvas.height = 800;

        context.fillStyle = 'blue';
        context.fillRect(100, 100, 100, 100);

        let players = [];

        // Функция для рисования всех игроков
        function drawPlayers() {
            // Очищаем весь canvas
            context.clearRect(0, 0, canvas.width, canvas.height);
            // Рисуем игровые объекты
            // drawGameObjects();
            // Проходимся по каждому игроку и рисуем его
            for (let player of players) {
                context.fillStyle = player._color; // Устанавливаем цвет для игрока {В дальнейшем будет открисовываться скин игрока}
                context.fillRect(player._x, player._y, player._size, player._size); // Рисуем игрока как квадрат
            }
        }

        // Обработчик события 'keydown' для отправки событий движения на сервер
        document.addEventListener('keyup', (event) => {
            const keyCode = event.keyCode; // Получаем код нажатой клавиши
            if (keyCode === 87) { // Код клавиши 'W'
                socket.emit('playerMove', roomName, { direction: 'jump', moving: false }); // Сообщаем о прекращении прыжка
            } else if (keyCode === 65) { // Код клавиши 'A'
                socket.emit('playerMove', roomName, { direction: 'left', moving: false }); // Сообщаем о прекращении движения влево
            } else if (keyCode === 68) { // Код клавиши 'D'
                socket.emit('playerMove', roomName, { direction: 'right', moving: false }); // Сообщаем о прекращении движения вправо
            }
        });

        // Обработчик события 'keyup' для отправки событий остановки движения на сервер
        document.addEventListener('keydown', (event) => {
            const keyCode = event.keyCode; // Получаем код нажатой клавиши
            if (keyCode === 87) { // Код клавиши 'W'
                socket.emit('playerMove', roomName, { direction: 'jump', moving: true }); // Сообщаем о прыжке
            } else if (keyCode === 65) { // Код клавиши 'A'
                socket.emit('playerMove', roomName, { direction: 'left', moving: true }); // Сообщаем о движении влево
            } else if (keyCode === 68) { // Код клавиши 'D'
                socket.emit('playerMove', roomName, { direction: 'right', moving: true }); // Сообщаем о движении вправо
            }
        });

        socket.on('gameStateUpdate', (data) => {
            players = data;
        })

        function gameLoop() {
            drawPlayers(); // Рисуем всех игроков
            requestAnimationFrame(gameLoop); // Планируем следующий кадр игрового цикла
        }

        gameLoop();

        // Добавь логику для синхронизации игры через Socket.io
    } else {
        window.location.href = '/';
    }
});
