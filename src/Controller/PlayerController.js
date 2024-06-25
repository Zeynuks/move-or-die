const Player = require('../Model/Player');
const gameObjectController = require('./GameObjectController');
const MAX_PLAYERS = 3;
let players = {};
let ipAddresses = {};

exports.initialize = (io) => {
    io.on('connection', (socket) => {
        const playerIp = socket.handshake.address;

        if (Object.keys(ipAddresses).length >= MAX_PLAYERS && !ipAddresses[playerIp]) {
            socket.emit('roomFull');
            socket.disconnect();
            return;
        }

        console.log('Новый пользователь подключился:', socket.id, 'с IP:', playerIp);

        if (!ipAddresses[playerIp]) {
            players[socket.id] = new Player(socket.id);
            ipAddresses[playerIp] = socket.id;

            socket.emit('initialize', { players, gameObjects: gameObjectController.getGameObjects() });
            socket.broadcast.emit('newPlayer', { id: socket.id, x: players[socket.id].x, y: players[socket.id].y, size: players[socket.id].size });
        } else {
            const oldSocketId = ipAddresses[playerIp];
            players[socket.id] = players[oldSocketId];
            delete players[oldSocketId];
            io.emit('removePlayer', oldSocketId);

            ipAddresses[playerIp] = socket.id;
            socket.emit('initialize', { players, gameObjects: gameObjectController.getGameObjects() });
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
                if (players[socket.id] && Date.now() - players[socket.id].lastActive > 10000) {
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
    const gameObjects = gameObjectController.getGameObjects();    
    for (let id in players) {
        players[id].applyPhysics(gameObjects, Object.values(players)); // *** ADD arg Object.values(players)
    }
};

exports.getPlayers = () => {
    return players;
};
