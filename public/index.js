// Подключаемся к серверу через Socket.IO
const socket = io();

// Получаем элемент для отображения ошибок
const errorDiv = document.getElementById('error');

// Получаем элемент canvas, на котором будет происходить рисование игры
const canvas = document.getElementById('gameCanvas');

// Получаем контекст рисования 2D для canvas
const context = canvas.getContext('2d');

// Объявляем объект для хранения игроков
let players = {};

// Объявляем массив для хранения игровых объектов
let gameObjects = [];

// Функция для рисования всех игроков
function drawPlayers() {
    // Очищаем весь canvas
    context.clearRect(0, 0, canvas.width, canvas.height);
    // Рисуем игровые объекты
    drawGameObjects();
    // Проходимся по каждому игроку и рисуем его
    for (let id in players) {
        context.fillStyle = players[id].color; // Устанавливаем цвет для игрока {В дальнейшем будет открисовываться скин игрока}
        context.fillRect(players[id].x, players[id].y, players[id].size, players[id].size); // Рисуем игрока как квадрат
    }
}

// Функция для рисования игровых объектов
function drawGameObjects() {
    // Проходимся по каждому игровому объекту и рисуем его
    for (let obj of gameObjects) {
        context.fillStyle = obj.color; // Устанавливаем цвет для объекта
        //context.fillStyle = 'black';
        context.fillRect(obj.x, obj.y, obj.size, obj.size); // Рисуем объект как квадрат
    }
}

// Обработчик события 'initialize' для инициализации данных игры
socket.on('initialize', (data) => {
    players = data.players; // Сохраняем полученных игроков
    gameObjects = data.gameObjects; // Сохраняем полученные игровые объекты
});

// Обработчик события 'newPlayer' для добавления нового игрока
socket.on('newPlayer', (player) => {
    players[player.id] = { x: player.x, y: player.y}; // Добавляем нового игрока
});

// Обработчик события 'move' для обновления положения игрока
socket.on('move', (data) => {
    if (players[data.id]) {
        players[data.id].x = data.x; // Обновляем координату x игрока
        players[data.id].y = data.y; // Обновляем координату y игрока
    }
});

// Обработчик события 'removePlayer' для удаления игрока
socket.on('removePlayer', (id) => {
    delete players[id]; // Удаляем игрока по его ID
});

// Обработчик события 'roomFull' для отображения сообщения об ошибке при переполнении комнаты
socket.on('roomFull', () => {
    errorDiv.textContent = 'Комната заполнена. Пожалуйста, попробуйте позже.'; // Отображаем сообщение об ошибке
});

// Обработчик события 'update' для обновления состояния игроков
socket.on('update', (data) => {
    players = data.players; // Обновляем данные игроков
    gameObjects = data.gameObjects; // *** ADD Обновляем данные объектов
});

// Обработчик события 'keydown' для отправки событий движения на сервер
document.addEventListener('keyup', (event) => {
    const keyCode = event.keyCode; // Получаем код нажатой клавиши
    if (keyCode === 87) { // Код клавиши 'W'
        socket.emit('move', { direction: 'jump', moving: false }); // Сообщаем о прекращении прыжка
    } else if (keyCode === 65) { // Код клавиши 'A'
        socket.emit('move', { direction: 'left', moving: false }); // Сообщаем о прекращении движения влево
    } else if (keyCode === 68) { // Код клавиши 'D'
        socket.emit('move', { direction: 'right', moving: false }); // Сообщаем о прекращении движения вправо
    }
});

// Обработчик события 'keyup' для отправки событий остановки движения на сервер
document.addEventListener('keydown', (event) => {
    const keyCode = event.keyCode; // Получаем код нажатой клавиши
    if (keyCode === 87) { // Код клавиши 'W'
        socket.emit('move', { direction: 'jump', moving: true }); // Сообщаем о прыжке
    } else if (keyCode === 65) { // Код клавиши 'A'
        socket.emit('move', { direction: 'left', moving: true }); // Сообщаем о движении влево
    } else if (keyCode === 68) { // Код клавиши 'D'
        socket.emit('move', { direction: 'right', moving: true }); // Сообщаем о движении вправо
    }
});

// Главный игровой цикл
function gameLoop() {
    drawPlayers(); // Рисуем всех игроков
    requestAnimationFrame(gameLoop); // Планируем следующий кадр игрового цикла
}

// Запускаем игровой цикл
gameLoop();
