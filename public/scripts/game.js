// development.yaml-game/public/scripts/game.js
const socket = io('/game');

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
        let previousPlayers = [];
        let lastUpdateTime = Date.now();
        let lastServerUpdateTime = Date.now();

        // Функция интерполяции для плавного перехода между состояниями
        function interpolatePlayer(previous, current, t) {
            return {
                x: previous._x + (current._x - previous._x) * t,
                y: previous._y + (current._y - previous._y) * t
            };
        }

        // Функция экстраполяции для предсказания будущего состояния
        function extrapolatePlayer(current, t) {
            return {
                x: current._x + current._velocityX * t,
                y: current._y + current._velocityY * t
            };
        }

        // Функция для рисования всех игроков
        function drawPlayers() {
            const now = Date.now();
            const t = (now - lastServerUpdateTime) / (1000 / 60);
            // Очищаем весь canvas
            context.clearRect(0, 0, canvas.width, canvas.height);
            // Рисуем игровые объекты
            // drawGameObjects();
            // Проходимся по каждому игроку и рисуем его
            for (let id = 0; id < players.length; id++) {
                const previous = previousPlayers[id];
                const current = players[id];
                if (previous && current) {
                    let position;
                    // Используем интерполяцию, если прошло мало времени с последнего обновления
                    if (t < 1) {
                        position = interpolatePlayer(previous, current, t);
                    } else {
                        // Используем экстраполяцию, если прошло много времени
                        position = extrapolatePlayer(current, t - 1);
                    }

                    context.fillStyle = players[id]._color; // Устанавливаем цвет для игрока {В дальнейшем будет открисовываться скин игрока}
                    context.fillRect(position.x, position.y, players[id]._size, players[id]._size); // Рисуем игрока как квадрат
                }

            }
        }

        // Обработчик события 'keydown' для отправки событий движения на сервер
        document.addEventListener('keyup', (event) => {
            const keyCode = event.keyCode; // Получаем код нажатой клавиши
            if (keyCode === 87) { // Код клавиши 'W'
                socket.emit('playerMove', roomName, {direction: 'jump', moving: false}); // Сообщаем о прекращении прыжка
            } else if (keyCode === 65) { // Код клавиши 'A'
                socket.emit('playerMove', roomName, {direction: 'left', moving: false}); // Сообщаем о прекращении движения влево
            } else if (keyCode === 68) { // Код клавиши 'D'
                socket.emit('playerMove', roomName, {direction: 'right', moving: false}); // Сообщаем о прекращении движения вправо
            }
        });

        // Обработчик события 'keyup' для отправки событий остановки движения на сервер
        document.addEventListener('keydown', (event) => {
            const keyCode = event.keyCode; // Получаем код нажатой клавиши
            if (keyCode === 87) { // Код клавиши 'W'
                socket.emit('playerMove', roomName, {direction: 'jump', moving: true}); // Сообщаем о прыжке
            } else if (keyCode === 65) { // Код клавиши 'A'
                socket.emit('playerMove', roomName, {direction: 'left', moving: true}); // Сообщаем о движении влево
            } else if (keyCode === 68) { // Код клавиши 'D'
                socket.emit('playerMove', roomName, {direction: 'right', moving: true}); // Сообщаем о движении вправо
            }
        });

        socket.on('gameStateUpdate', (data) => {
            console.log('game.js gameStateUpdate')
            previousPlayers = players;
            players = data;
            lastServerUpdateTime = Date.now();
        })

        function gameLoop() {
            if (players.length > 0) {

                drawPlayers(); // Рисуем всех игроков
            }
            requestAnimationFrame(gameLoop); // Планируем следующий кадр игрового цикла
        }

        gameLoop();

        // Добавь логику для синхронизации игры через Socket.io
    } else {
        window.location.href = '/';
    }
});
