const RoomController = require('../Controller/RoomController');
const PlayerController = require('../Controller/PlayerController');
const GameController = require('../Controller/GameController');
const RoomService = require("../Service/RoomService");
const PlayerService = require("../Service/PlayerService");
const LevelController = require("../Controller/LevelController");

class ServerManager {
    /**
     * Создает экземпляр ServerManager.
     * @param {Object} io - Экземпляр Socket.io.
     * @param {Object} roomRepository - Репозиторий для управления данными комнат.
     */
    constructor(io, roomRepository) {
        this.io = io;
        this.roomRepository = roomRepository;
        this.rooms = {};
    }

    /**
     * Создает новую комнату и инициализирует контроллеры.
     * @param {Object} socket - Сокет соединение.
     * @param {string} roomName - Название комнаты.
     * @param {string} userName - Имя пользователя.
     * @returns {Promise<void>}
     */
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

    /**
     * Присоединяет пользователя к существующей комнате.
     * @param {Object} socket - Сокет соединение.
     * @param {string} roomName - Название комнаты.
     * @param {string} userName - Имя пользователя.
     * @returns {Promise<void>}
     */
    async joinRoom(socket, roomName, userName) {
        if (this.rooms[roomName]) {
            await this.rooms[roomName].roomController.joinRoom(socket, userName);
        }
    }

    /**
     * Применяет настройки пользователя в комнате.
     * @param {Object} socket - Сокет соединение.
     * @param {string} roomName - Название комнаты.
     * @param {Object} userData - Данные пользователя.
     * @returns {Promise<void>}
     */
    async applySettings(socket, roomName, userData) {
        if (this.rooms[roomName]) {
            await this.rooms[roomName].roomController.changeUserData(socket, userData);
        }
    }

    /**
     * Отмечает пользователя как готового к игре.
     * @param {Object} socket - Сокет соединение.
     * @param {string} roomName - Название комнаты.
     * @param {string} userName - Имя пользователя.
     * @returns {Promise<void>}
     */
    async playerReady(socket, roomName, userName) {
        if (this.rooms[roomName]) {
            await this.rooms[roomName].roomController.playerReady(socket, userName);
        }
    }

    /**
     * Обрабатывает отключение пользователя.
     * @param {Object} socket - Сокет соединение.
     * @returns {Promise<void>}
     */
    async disconnect(socket) {
        for (let roomName in this.rooms) {
            await this.rooms[roomName].roomController.disconnect(socket);
        }
    }

    /**
     * Обрабатывает отключение пользователя от игровой части.
     * @param {Object} socket - Сокет соединение.
     * @returns {Promise<void>}
     */
    async gameDisconnect(socket) {
        for (let roomName in this.rooms) {
            await this.rooms[roomName].playerController.disconnect(socket);
        }
    }

    /**
     * Закрывает все комнаты.
     * @returns {Promise<void>}
     */
    async closeAllRooms() {
        for (let roomName in this.rooms) {
            await this.rooms[roomName].roomController.closeAllRooms();
        }
    }

    /**
     * Начинает игру в указанной комнате.
     * @param {string} roomName - Название комнаты.
     * @param {Array<Object>} users - Массив пользователей.
     * @returns {Promise<void>}
     */
    async gameStart(roomName, users) {
        if (this.rooms[roomName]) {
            this.rooms[roomName].gameController.levelList = this.rooms[roomName].levelController.getLevelList(10);
            await this.rooms[roomName].playerController.setPlayersData(users);
            await this.rooms[roomName].gameController.startGame();
        }
    }

    /**
     * Обрабатывает ход игрока.
     * @param {Object} socket - Сокет соединение.
     * @param {string} roomName - Название комнаты.
     * @param {Object} moveData - Данные о ходе игрока.
     * @returns {Promise<void>}
     */
    async handleMove(socket, roomName, moveData) {
        if (this.rooms[roomName]) {
            await this.rooms[roomName].playerController.handleMovePlayer(socket, moveData);
        }
    }

    /**
     * Присоединяет игрока к игре.
     * @param {Object} socket - Сокет соединение.
     * @param {string} roomName - Название комнаты.
     * @returns {Promise<void>}
     */
    async playerJoin(socket, roomName) {
        if (this.rooms[roomName]) {
            await this.rooms[roomName].playerController.connect(socket);
            await this.rooms[roomName].gameController.gameDataLoad(socket);
        }
    }

    /**
     * Удаляет комнату.
     * @param {string} roomName - Название комнаты.
     * @returns {Promise<void>}
     */
    async removeRoom(roomName) {
        if (this.rooms[roomName]) {
            delete this.rooms[roomName];
        }
    }
}

module.exports = ServerManager;
