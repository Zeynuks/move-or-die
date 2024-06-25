const Player = require('../Model/Player');

let players = {};
let ipAddresses = {};

exports.initialize = (io) => {
    io.on('connection', (socket) => {
        const playerIp = socket.handshake.address;

        // Проверка, если игрок с этим IP уже подключен или комната заполнена
        if (Object.keys(ipAddresses).length >= 2 && !ipAddresses[playerIp]) {
            socket.emit('roomFull');
            socket.disconnect();
            return;
        }

        console.log('Новый пользователь подключился:', socket.id, 'с IP:', playerIp);

        // Если новый игрок, создаем запись
        if (!ipAddresses[playerIp]) {
            players[socket.id] = new Player(socket.id);
            ipAddresses[playerIp] = socket.id;

            // Отправляем текущие состояния всех игроков новому пользователю
            socket.emit('initialize', players);

            // Сообщаем всем клиентам о новом игроке
            socket.broadcast.emit('newPlayer', { id: socket.id, x: players[socket.id].x, y: players[socket.id].y, size: players[socket.id].size });
        } else {
            // Если игрок переподключается, обновляем его состояние
            const oldSocketId = ipAddresses[playerIp];

            players[socket.id] = players[oldSocketId]; // Переносим данные старого игрока на новый сокет
            delete players[oldSocketId]; // Удаляем старого игрока
            io.emit('removePlayer', oldSocketId); // Уведомляем всех клиентов об удалении старого игрока

            ipAddresses[playerIp] = socket.id;

            // Отправляем текущие состояния всех игроков новому пользователю
            socket.emit('initialize', players);

            // Сообщаем всем клиентам о новом игроке
            socket.broadcast.emit('newPlayer', { id: socket.id, x: players[socket.id].x, y: players[socket.id].y, size: players[socket.id].size });
        }

        socket.on('move', (direction) => {
            console.log('Движение:', direction);
            if (players[socket.id]) {
                players[socket.id].move(direction);
                io.emit('move', { id: socket.id, x: players[socket.id].x, y: players[socket.id].y });
            }
        });

        socket.on('disconnect', () => {
            console.log('Пользователь отключился:', socket.id);
            setTimeout(() => {
                if (players[socket.id] && Date.now() - players[socket.id].lastActive > 10000) { // 10 секунд
                    const playerIp = socket.handshake.address;
                    delete players[socket.id];
                    delete ipAddresses[playerIp];
                    io.emit('removePlayer', socket.id);
                }
            }, 10000);
        });
    });
};
