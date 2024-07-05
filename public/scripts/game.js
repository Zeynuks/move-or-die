// development.yaml-game/public/scripts/game.js
const socket = io('/game');

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const roomName = urlParams.get('room');
    const userName = urlParams.get('name');

    if (roomName) {
        document.getElementById('roomName').innerText = `Room: ${roomName}`;

        // Здесь можно добавить логику для инициализации canvas игры
        const canvas = document.getElementById('gameCanvas');
        const context = canvas.getContext('2d');
        canvas.width = 1400;
        canvas.height = 800;

        let players = {};
        let blocks = [];
        let previousPlayers = {};
        let lastUpdateTime = Date.now();
        let lastServerUpdateTime = Date.now();

        socket.emit('joinRoom', roomName, userName);

        socket.on('levelMap', (data) => {
            blocks = data;
            drawMap();
        });

        function preload(roomName) {
            socket.emit('preload', roomName)
        }

        // Функция для рисования игровых объектов
        function drawMap() {
            // Проходимся по каждому игровому объекту и рисуем его
            for (let obj of blocks) {
                //console.log(obj);
                context.fillStyle = obj._color; // Устанавливаем цвет для объекта
                context.fillRect(obj._x, obj._y, obj._size, obj._size); // Рисуем объект как квадрат
            }
        }

        // Функция интерполяции для плавного перехода между состояниями
        function interpolatePlayer(previous, current, t) {
            return {
                x: previous.x + (current.x - previous.x) * t,
                y: previous.y + (current.y - previous.y) * t
            };
        }

        // Функция экстраполяции для предсказания будущего состояния
        function extrapolatePlayer(current, t) {
            return {
                x: current.x + current.movement.x * t,
                y: current.y + current.vy * t
            };
        }

        // Функция для рисования всех игроков
        function drawPlayers() {
            const now = Date.now();
            const t = (now - lastServerUpdateTime) / (1000 / 60);
            // Очищаем весь canvas
            context.clearRect(0, 0, canvas.width, canvas.height);
            // Рисуем игровые объекты
            drawMap();
            // Проходимся по каждому игроку и рисуем его
            for (let id in players) {
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

                    context.fillStyle = players[id].color; // Устанавливаем цвет для игрока {В дальнейшем будет открисовываться скин игрока}
                    context.fillRect(position.x, position.y, players[id].size, players[id].size); // Рисуем игрока как квадрат
                }
            }
        }

        const keys = {};

        // Обработка нажатий клавиш для управления движением
        window.addEventListener('keydown', (event) => {
            keys[event.key] = true;
            sendMovement();
        });

        window.addEventListener('keyup', (event) => {
            delete keys[event.key];
            sendMovement();
        });

        // Отправка данных о движении на сервер
        function sendMovement() {
            const movementData = { x: 0, y: 0, jump: false };
            if (keys['ArrowUp']) movementData.jump = true;
            if (keys['ArrowDown']) movementData.y += 5;
            if (keys['ArrowLeft']) movementData.x -= 5;
            if (keys['ArrowRight']) movementData.x += 5;

            socket.emit('playerMovement', roomName, movementData);
        }

        socket.on('gameStateUpdate', (playersData) => {
            previousPlayers = players;
            players = playersData;
            lastServerUpdateTime = Date.now();
        })

        function gameLoop() {
            if (Object.keys(players).length !== 0) {
                drawPlayers(); // Рисуем всех игроков
            }

            requestAnimationFrame(gameLoop); // Планируем следующий кадр игрового цикла
        }
        preload(roomName);
        gameLoop();

        // Добавь логику для синхронизации игры через Socket.io
    } else {
        window.location.href = '/';
    }
});
