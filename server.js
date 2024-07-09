// Подключение необходимых модулей
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const dotenv = require('dotenv');
const config = require('./config/preload');

// Подключение контроллеров и репозитория комнат
const RoomRepository = require("./src/Repository/RoomRepository");
const RoomManager = require('./src/Manager/RoomManager');
// Загрузка переменных окружения из .env файла
dotenv.config();

// Создание Express приложения и HTTP сервера
const app = express();
const server = http.createServer(app);

// Настройка Socket.IO
const io = socketIo(server, {
    path: config.socket.path,
});
const gameNamespace = io.of('/game');

// Создание экземпляра репозитория комнат
const roomRepository = new RoomRepository(io);

// Создание экземпляра диспетчера комнат
const roomManager = new RoomManager(io, roomRepository);

// Определение порта и хоста сервера
const PORT = process.env.PORT || config.server.port;
const HOST = process.env.HOST || config.server.host;

// Настройка статической папки
app.use(express.static(path.join(__dirname, config.paths.public)));

// Настройка маршрутов
config.routes.forEach(route => {
    app[route.method.toLowerCase()](route.path, (req, res) => {
        res.sendFile(path.join(__dirname, config.paths.public, route.file));
    });
});

// Эндпоинт для получения информации о сервере
app.get('/get-info', (req, res) => {
    const nets = require('os').networkInterfaces();
    let localIp = '';
    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            if (net.family === 'IPv4' && !net.internal) {
                localIp = net.address;
                break;
            }
        }
    }
    res.send({ip: localIp, port: PORT});
});

io.on('connection', (socket) => {

    socket.on('createRoom', (roomName, userName) => {
        if (!userName) {
            console.error('Error: userName is null or undefined.');
            socket.emit('error', 'User name cannot be null or undefined');
            return;
        }
        roomManager.createRoom(socket, roomName, userName);
    });

    socket.on('joinRoom', (roomName, userName) => {
        if (!userName) {
            console.error('Error: userName is null or undefined.');
            socket.emit('error', 'User name cannot be null or undefined');
            return;
        }
        roomManager.joinRoom(socket, roomName, userName);
    });

    socket.on('playerReady', (roomName, userName) => {
        roomManager.playerReady(socket, roomName, userName);
    });

});
gameNamespace.on('connection', (socket) => {

    socket.on('playerStart', (roomName, userName) => {
        console.log('playerStart')
        roomManager.playerStart(socket, roomName, userName);
    });

    socket.on('playerMovement', (roomName, moveData) => {
        roomManager.handleMove(socket, roomName, moveData);
    });

    socket.on('disconnect', () => {
        roomManager.disconnect(socket);
    });

});
// Запуск сервера
server.listen(PORT, () => console.log(`Server running on ${PORT}`));




// Обработка сигнала завершения процесса для закрытия всех комнат
process.on('SIGINT', () => {
    roomManager.closeAllRooms();
});