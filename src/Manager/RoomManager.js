const RoomController = require('../Controller/RoomController');
const PlayerController = require('../Controller/PlayerController');
const GameController = require('../Controller/GameController');
const GameService = require("../Service/GameService");
const RoomService = require("../Service/RoomService");
const PlayerService = require("../Service/PlayerService");
const LevelController = require("../Controller/LevelController");

class RoomManager {
    constructor(io, roomRepository) {
        this.io = io;
        this.roomRepository = roomRepository;
        this.rooms = {};
    }

    createRoom(socket, roomName, userName) {
        if (!this.rooms[roomName]) {
            const services = {
                gameService: new GameService(this.roomRepository),
                roomService: new RoomService(this.roomRepository),
                playerService: new PlayerService(this.roomRepository)
            }
            this.rooms[roomName] = {
                roomController: new RoomController(this.io, roomName, services),
                playerController: new PlayerController(this.io, roomName, services),
                gameController: new GameController(this.io, roomName, services),
                levelController: new LevelController(this.io, roomName, services)
            };
        }
        this.rooms[roomName].roomController.createRoom(socket, roomName, userName);
    }

    joinRoom(socket, roomName, userName) {
        if (this.rooms[roomName]) {
            this.rooms[roomName].roomController.joinRoom(socket, roomName, userName);
        } else {
            socket.emit('error', 'Room does not exist');
        }
    }

    playerReady(socket, roomName) {
        if (this.rooms[roomName]) {
            this.rooms[roomName].playerController.isReady(socket, roomName);
        } else {
            socket.emit('error', 'Room does not exist');
        }
    }

    gameEvent(socket, roomName, eventData, callback) {
        if (this.rooms[roomName]) {
            this.rooms[roomName].gameController.update(roomName, eventData);
            if (callback) callback();
        } else {
            socket.emit('error', 'Room does not exist');
        }
    }

    disconnect(socket) {
        for (let roomName in this.rooms) {
            this.rooms[roomName].playerController.disconnect(socket);
        }
    }

    closeAllRooms() {
        for (let roomName in this.rooms) {
            this.rooms[roomName].roomController.closeAllRooms();
        }
    }

    preloadLevel(roomName) {
        if (this.rooms[roomName]) {
            this.rooms[roomName].levelController.getLevel(this.rooms[roomName].levelController.changeLevel());
            this.rooms[roomName].levelController.sendLevelMap(roomName);
        }
    }
}

module.exports = RoomManager;
