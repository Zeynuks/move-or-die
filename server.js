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
    res.send({ ip: localIp, port: PORT });
});

// Функция для получения IP-адреса клиента
const getClientIp = (socket) => {
    const ip = socket.handshake.headers['x-forwarded-for'] || socket.handshake.address;
    if (ip.substr(0, 7) == "::ffff:") {
        return ip.substr(7);
    }
    return ip;
};

const defaultNamespace = io.of('/');
const roomNamespace = io.of('/room');
const gameNamespace = io.of('/game');

defaultNamespace.on('connection', (socket) => {
    // Получение и сохранение IP-адреса клиента
    socket.ip = getClientIp(socket);

    // Обработка события создания комнаты
    socket.on('createRoom', (roomName, userName) => {
        if (!userName) {
            console.error('Error: userName is null or undefined.');
            socket.emit('error', 'User name cannot be null or undefined');
            return;
        }
        roomManager.createRoom(socket, roomName, userName);
    });
});
roomNamespace.on('connection', (socket) => {
    // Получение и сохранение IP-адреса клиента
    socket.ip = getClientIp(socket);

    // Обработка события присоединения к комнате
    socket.on('joinRoom', (roomName, userName) => {
        if (!userName) {
            console.error('Error: userName is null or undefined.');
            socket.emit('error', 'User name cannot be null or undefined');
            return;
        }
        roomManager.joinRoom(socket, roomName, userName);
    });

    // Обработка события готовности игрока
    socket.on('playerReady', (roomName) => {
        roomManager.playerReady(socket, roomName);
    });

    // Обработка события отключения игрока
    socket.on('disconnect', () => {
        roomManager.disconnect(socket);
    });
});

gameNamespace.on('connection', (socket) => {

    // Получение и сохранение IP-адреса клиента
    socket.ip = getClientIp(socket);

    // Обработка события присоединения к комнате
    socket.on('joinRoom', (roomName, userName) => {
        console.log('join')
        if (!userName) {
            console.error('Error: userName is null or undefined.');
            socket.emit('error', 'User name cannot be null or undefined');
            return;
        }
        roomManager.joinRoom(socket, roomName, userName);
    });

    // Обработка игровых событий
    socket.on('gameEvent', (roomName, eventData, callback) => {
        roomManager.gameEvent(socket, roomName, eventData);
        // Подтверждение получения данных
        if (callback) callback();
    });

    // Обработка события отключения игрока
    socket.on('disconnect', () => {
        console.log('disconnect')
        roomManager.disconnect(socket);
    });

});
// Запуск сервера
server.listen(PORT, () => console.log(`Server running on ${PORT}`));

// Обработка сигнала завершения процесса для закрытия всех комнат
process.on('SIGINT', () => {
    roomManager.closeAllRooms();
});