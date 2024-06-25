const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const ip = require('ip');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

let players = {}; // Список игроков и их состояний
let ipAddresses = {}; // Список IP-адресов игроков

io.on('connection', (socket) => {
    const playerIp = socket.handshake.address;

    // Проверка, если игрок с этим IP уже подключен или комната заполнена
    if (Object.keys(players).length >= 2 && !ipAddresses[playerIp]) {
        socket.emit('roomFull');
        socket.disconnect();
        return;
    }

    console.log('Новый пользователь подключился:', socket.id, 'с IP:', playerIp);

    // Если новый игрок, создаем запись
    if (!ipAddresses[playerIp]) {
        players[socket.id] = {
            x: Math.floor(Math.random() * 480),
            y: Math.floor(Math.random() * 480),
            size: 20,
            lastActive: Date.now()
        };
        ipAddresses[playerIp] = socket.id;

        // Отправляем текущие состояния всех игроков новому пользователю
        socket.emit('initialize', players);

        // Сообщаем всем клиентам о новом игроке
        socket.broadcast.emit('newPlayer', { id: socket.id, x: players[socket.id].x, y: players[socket.id].y, size: 20 });
    } else {
        // Если игрок переподключается, обновляем его состояние
        const oldSocketId = ipAddresses[playerIp];
        players[socket.id] = players[oldSocketId];
        delete players[oldSocketId];
        ipAddresses[playerIp] = socket.id;

        // Отправляем текущие состояния всех игроков новому пользователю
        socket.emit('initialize', players);

        // Сообщаем всем клиентам о новом игроке
        socket.broadcast.emit('newPlayer', { id: socket.id, x: players[socket.id].x, y: players[socket.id].y, size: 20 });
    }

    socket.on('move', (direction) => {
        console.log('Движение:', direction);
        if (players[socket.id]) {
            if (direction === 'up') {
                players[socket.id].y -= 5;
            } else if (direction === 'left') {
                players[socket.id].x -= 5;
            } else if (direction === 'down') {
                players[socket.id].y += 5;
            } else if (direction === 'right') {
                players[socket.id].x += 5;
            }
            players[socket.id].lastActive = Date.now();
            io.emit('move', { id: socket.id, x: players[socket.id].x, y: players[socket.id].y });
        }
    });

    socket.on('disconnect', () => {
        console.log('Пользователь отключился:', socket.id);
        setTimeout(() => {
            if (Date.now() - players[socket.id]?.lastActive > 10000) { // 10 секунд
                const playerIp = socket.handshake.address;
                delete players[socket.id];
                delete ipAddresses[playerIp];
                io.emit('removePlayer', socket.id);
            }
        }, 10000);
    });
});

server.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});
