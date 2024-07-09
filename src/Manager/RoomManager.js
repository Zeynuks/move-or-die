const RoomController = require('../Controller/RoomController');
const PlayerController = require('../Controller/PlayerController');
const GameController = require('../Controller/GameController');
const RoomService = require("../Service/RoomService");
const PlayerService = require("../Service/PlayerService");
const LevelColorService = require("../Service/LevelColorService");
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
                roomService: new RoomService(this.roomRepository),
                playerService: new PlayerService(this.roomRepository),
                levelService: new LevelColorService(this.roomRepository)
            }
            this.rooms[roomName] = {
                roomController: new RoomController(this.io.to(roomName), roomName, services),
                playerController: new PlayerController(this.io.of('/game').to(roomName), roomName, services),
                gameController: new GameController(this.io.of('/game').to(roomName), roomName, services),
                levelController: new LevelController(this.io.of('/game').to(roomName), roomName, services)
            };
        }
        this.rooms[roomName].roomController.createRoom(socket, userName);
    }

    joinRoom(socket, roomName, userName) {
        if (this.rooms[roomName]) {
            this.rooms[roomName].roomController.joinRoom(socket, userName);
        } else {
            socket.emit('error', 'Room does not exist');
        }
    }

    playerReady(socket, roomName, userName) {
        if (this.rooms[roomName]) {
            this.rooms[roomName].roomController.playerReady(socket, userName);
        } else {
            socket.emit('error', 'Room does not exist');
        }
    }

    disconnect(socket) {
        for (let roomName in this.rooms) {
            this.rooms[roomName].roomController.disconnect(socket);
        }
    }

    closeAllRooms() {
        for (let roomName in this.rooms) {
            this.rooms[roomName].roomController.closeAllRooms();
        }
    }

    handleMove(socket, roomName, moveData) {
        if (this.rooms[roomName]) {
            this.rooms[roomName].playerController.handleMovePlayer(socket, moveData);
        }
    }

    playerStart(socket, roomName, userName) {
        if (this.rooms[roomName]) {
            console.log('isStart')
            this.rooms[roomName].playerController.addPlayerToGame(socket, userName);
            this.rooms[roomName].gameController.isStart(socket);
        }
    }

    updateState(roomName) {
        // const gameObjectsGrid = this.rooms[roomName].levelController.getMapGrid(50);
        this.rooms[roomName].levelController.sendLevelMap(roomName);
        if (gameObjectsGrid.length === 0) return;
        this.rooms[roomName].gameController.updateState(roomName, gameObjectsGrid);
        if (this.rooms[roomName].gameController.gameState === 'active') {
            this.rooms[roomName].levelController.updateLevel(roomName);
        }
    }

}

module.exports = RoomManager;
