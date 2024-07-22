const RoomController = require('../Controller/RoomController');
const PlayerController = require('../Controller/PlayerController');
const GameController = require('../Controller/GameController');
const RoomService = require("../Service/RoomService");
const PlayerService = require("../Service/PlayerService");
const LevelController = require("../Controller/LevelController");

class RoomManager {
    constructor(io, roomRepository) {
        this.io = io;
        this.roomRepository = roomRepository;
        this.rooms = {};
    }

    async createRoom(socket, roomName, userName) {
        if (!this.rooms[roomName]) {
            const services = {
                roomService: new RoomService(this.roomRepository),
                playerService: new PlayerService(this.roomRepository)
            }
            this.rooms[roomName] = {
                roomController: new RoomController(this.io.to(roomName), roomName, services),
                playerController: new PlayerController(this.io.of('/game').to(roomName), roomName, services),
                gameController: new GameController(this.io.of('/game').to(roomName), roomName, services),
                levelController: new LevelController(this.io.of('/game').to(roomName), roomName)
            };
            await this.rooms[roomName].roomController.createRoom(socket, userName);
        }
    }

    async joinRoom(socket, roomName, userName) {
        if (this.rooms[roomName]) {
            await this.rooms[roomName].roomController.joinRoom(socket, userName);
        }
    }

    async applySettings(socket, roomName, userData) {
        if (this.rooms[roomName]) {
            await this.rooms[roomName].roomController.changeUserData(socket, userData);
        }
    }

    async playerReady(socket, roomName, userName) {
        if (this.rooms[roomName]) {
            await this.rooms[roomName].roomController.playerReady(socket, userName);
        }
    }

    async disconnect(socket) {
        for (let roomName in this.rooms) {
            await this.rooms[roomName].roomController.disconnect(socket);
        }
    }

    async gameDisconnect(socket) {
        for (let roomName in this.rooms) {
            await this.rooms[roomName].playerController.disconnect(socket);
        }
    }

    async closeAllRooms() {
        for (let roomName in this.rooms) {
            await this.rooms[roomName].roomController.closeAllRooms();
        }
    }

    async gameStart(roomName, users) {
        if (this.rooms[roomName]) {
            this.rooms[roomName].gameController.levelList = this.rooms[roomName].levelController.getLevelList(10);
            await this.rooms[roomName].playerController.setPlayersData(users);
            await this.rooms[roomName].gameController.startGame();

        }
    }

    async handleMove(socket, roomName, moveData) {
        if (this.rooms[roomName]) {
            await this.rooms[roomName].playerController.handleMovePlayer(socket, moveData);
        }
    }

    async playerJoin(socket, roomName) {
        if (this.rooms[roomName]) {
            await this.rooms[roomName].playerController.connect(socket);
            await this.rooms[roomName].gameController.gameDataLoad(socket);
        }
    }

    async removeRoom(roomName) {
        if (this.rooms[roomName]) {
            delete this.rooms[roomName];
        }
    }

}

module.exports = RoomManager;
