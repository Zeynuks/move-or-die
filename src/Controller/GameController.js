const Player = require('../Model/Player');
const GameObject = require('../Model/GameObject');

let players = {};
let ipAddresses = {};
let gameObjects = [
    new GameObject(100, 500, 200, 20), // Пример объекта
    new GameObject(400, 400, 200, 20),  // Другой объект
    new GameObject(300, 300, 50, 50)    // Ещё один объект
];

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
            socket.emit('initialize', { players, gameObjects });

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
            socket.emit('initialize', { players, gameObjects });

            // Сообщаем всем клиентам о новом игроке
            socket.broadcast.emit('newPlayer', { id: socket.id, x: players[socket.id].x, y: players[socket.id].y, size: players[socket.id].size });
        }

        socket.on('move', (data) => {
            console.log('Движение:', data);
            if (players[socket.id]) {
                players[socket.id].setMove(data.direction, data.moving);
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

exports.update = () => {
    for (let id in players) {
        players[id].applyPhysics();
    }
};

exports.getState = () => {
    return { players, gameObjects };
};
