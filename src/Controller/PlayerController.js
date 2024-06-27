// src/Controller/PlayerController.js

const playerService = require('../Service/PlayerService');
const gameObjectService = require('../Service/GameObjectService');
const gridService = require('../Service/GridService');

exports.initialize = (io) => {
    io.on('connection', (socket) => {
        const result = playerService.initializePlayer(socket);

        if (result === false) return;

        const { new: isNewPlayer, player, oldSocketId } = result;

        socket.emit('initialize', { players: playerService.getPlayers(), gameObjects: gameObjectService.getGameObjects() });

        if (isNewPlayer) {
            socket.broadcast.emit('newPlayer', { id: socket.id, x: player.x, y: player.y, size: player.size });
        } else {
            io.emit('removePlayer', oldSocketId);
            socket.broadcast.emit('newPlayer', { id: socket.id, x: player.x, y: player.y, size: player.size });
        }

        socket.on('move', (data) => {
            playerService.handleMove(socket, data);
        });

        socket.on('disconnect', () => {
            const removedPlayerId = playerService.handleDisconnect(socket);
            if (removedPlayerId) {
                io.emit('removePlayer', removedPlayerId);
            }
        });
    });
};

exports.update = () => {
    // Получаем сетку игровых объектов напрямую из сервиса
    const gameObjectsGrid = gameObjectService.getGameObjectsGrid(gridService.gridSize);
    playerService.updatePlayers(gridService, gameObjectsGrid);
};

exports.getPlayers = () => {
    return playerService.getPlayers();
};
