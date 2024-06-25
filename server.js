const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const gameRoutes = require('./src/Route/GameRoute');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;

app.use(express.static('public'));
app.use('/game', gameRoutes);

// Инициализация контроллера игры
const gameController = require('./src/Controller/GameController');
gameController.initialize(io);

server.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});

// Периодическое обновление игры
setInterval(() => {
    gameController.update();
    io.emit('update', gameController.getState());
}, 1000 / 60); // 60 раз в секунду
