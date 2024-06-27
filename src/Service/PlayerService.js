// src/Service/PlayerService.js

const Player = require('../Entity/Player');

let players = {};
let ipAddresses = {};

class PlayerService {
    initializePlayer(socket) {
        const playerIp = socket.handshake.address;

        if (Object.keys(ipAddresses).length >= 3 && !ipAddresses[playerIp]) {
            socket.emit('roomFull');
            socket.disconnect();
            return false;
        }

        if (!ipAddresses[playerIp]) {
            players[socket.id] = new Player(socket.id);
            ipAddresses[playerIp] = socket.id;
            return { new: true, player: players[socket.id] };
        } else {
            const oldSocketId = ipAddresses[playerIp];
            players[socket.id] = players[oldSocketId];
            delete players[oldSocketId];
            ipAddresses[playerIp] = socket.id;
            return { new: false, player: players[socket.id], oldSocketId };
        }
    }

    handleMove(socket, data) {
        if (players[socket.id]) {
            players[socket.id].setMove(data.direction, data.moving);
        }
    }

    handleDisconnect(socket) {
        setTimeout(() => {
            if (players[socket.id] && Date.now() - players[socket.id].lastActive > 10000) {
                const playerIp = socket.handshake.address;
                delete players[socket.id];
                delete ipAddresses[playerIp];
                return socket.id;
            }
        }, 10000);
    }

    updatePlayers(gridService, gameObjectsGrid) {
        gridService.clear();

        for (let id in players) {
            gridService.updatePlayerGrid(players[id]);
        }

        for (let id in players) {
            players[id].applyPhysics(gridService, gameObjectsGrid);
        }
    }

    getPlayers() {
        return players;
    }
}

module.exports = new PlayerService();
