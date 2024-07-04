// development.yaml-game/public/scripts/game.js
const socket = io('/game');
let players = {};
let blocks = [];
let previousPlayers = {};
let lastUpdateTime = Date.now();
let lastServerUpdateTime = Date.now();

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const roomName = urlParams.get('room');
    const userName = urlParams.get('name');
    if (roomName) {
        document.getElementById('roomName').innerText = `Room: ${roomName}`;

        // Здесь можно добавить логику для инициализации canvas игры
        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 1400;
        canvas.height = 800;

        socket.emit('joinRoom', roomName, userName);

        socket.on('levelMap', (data) => {
            blocks = data;
            console.log('hi')
            drawMap();
        });

        function preload(roomName) {
            socket.emit('preload', roomName)
        }

        // Функция для рисования игровых объектов
        function drawMap() {
            console.log(blocks);
            // Проходимся по каждому игровому объекту и рисуем его
            for (let obj of blocks) {
                //console.log(obj);
                ctx.fillStyle = obj._color; // Устанавливаем цвет для объекта
                ctx.fillRect(obj._x, obj._y, obj._size, obj._size); // Рисуем объект как квадрат
            }
        }

        function gameLoop() {
            // Рисуем всех игроков
            requestAnimationFrame(gameLoop); // Планируем следующий кадр игрового цикла
        }

        preload(roomName);
        gameLoop();
        // Добавь логику для синхронизации игры через Socket.io

    } else {
        window.location.href = '/';
    }
});
