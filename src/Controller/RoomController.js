const BaseController = require("./BaseController");
/**
 * Контроллер для управления комнатами.
 * @class BaseController
 */
class RoomController extends BaseController {
    /**
     * Создает экземпляр RoomController.
     * @param {Object} io - Экземпляр Socket.io.
     * @param {string} roomName - Название комнаты.
     * @param {Object} services - Сервисы, необходимые для RoomController.
     * @param {Object} services.roomService - Экземпляр сервиса комнаты.
     */
    constructor(io, roomName, services) {
        super(io, roomName);
        this.roomHost = null;
        this.roomService = services.roomService;
    }

    /**
     * Создает новую комнату.
     * @param {Object} socket - Экземпляр Socket.
     * @param {string} userName - Имя пользователя, создающего комнату.
     */
    async createRoom(socket, userName) {
        try {
            this.roomHost = socket.handshake.address;
            await this.roomService.createRoom(this.roomName, userName, this.roomHost);
            socket.emit('roomCreated', this.roomName);
        } catch (err) {
            socket.emit('error', 'Ошибка создания комнаты');
        }
    }

    /**
     * Присоединяет пользователя к комнате.
     * @param {Object} socket - Экземпляр Socket.
     * @param {string} userName - Имя пользователя, присоединяющегося к комнате.
     */
    async joinRoom(socket, userName) {
        try {
            await this.checkRoomCapacity(socket, userName);
            await this.roomService.joinRoom(this.roomName, userName, socket.handshake.address);
            const users = await this.roomService.getUsersInRoom(this.roomName);
            socket.join(this.roomName);
            socket.emit('joinedRoom', this.roomName);
            this.io.emit('updateRoom', users, this.roomHost, {});
        } catch (err) {
            socket.emit('error', 'Ошибка присоединения к комнате');
        }
    }

    /**
     * Проверяет вместимость комнаты.
     * @param {Object} socket - Экземпляр Socket.
     * @param {string} userName - Имя пользователя.
     * @throws Выбрасывает ошибку, если комната полная.
     */
    async checkRoomCapacity(socket, userName) {
        const users = await this.roomService.getUsersInRoom(this.roomName);
        if (await this.roomService.checkRoomCapacity(users)) {
            socket.emit('fullRoom', userName);
            throw new Error('Комната заполнена');
        }
    }

    /**
     * Изменяет данные пользователя.
     * @param {Object} socket - Экземпляр Socket.
     * @param {Object} userData - Объект с данными пользователя.
     * @param {string} userData.skin - Скин пользователя.
     * @param {string} userData.color - Цвет пользователя.
     */
    async changeUserData(socket, userData) {
        try {
            await this.roomService.changeUserData(userData.skin, userData.color, socket.handshake.address);
        } catch (err) {
            socket.emit('error', 'Ошибка смены данных игрока');
        }
    }

    /**
     * Устанавливает статус пользователя как готового.
     * @param {Object} socket - Экземпляр Socket.
     * @param {string} userName - Имя пользователя.
     */
    async playerReady(socket, userName) {
        try {
            const playersReadyStates = await this.roomService.playerReady(userName);
            const users = await this.roomService.getUsersInRoom(this.roomName);
            this.io.emit('updateRoom', users, this.roomHost, playersReadyStates);
            await this.isAllReady(socket, users);
        } catch (err) {
            socket.emit('error', 'Ошибка смены статуса');
        }
    }

    /**
     * Проверяет, все ли пользователи готовы, и начинает игру, если да.
     * @param {Object} socket - Экземпляр Socket.
     * @param {Array<Object>} users - Массив с данными игроков.
     * @throws Выбрасывает ошибку, если не удалось проверить статус всех пользователей.
     */
    async isAllReady(socket, users) {
        if (await this.roomService.isAllReady()) {
            socket.emit('loadGame', this.roomName, users);
            this.io.emit('gameStarted');
        } else {
            throw new Error('Не удалось проверить статус игроков');
        }
    }

    /**
     * Обрабатывает отключение пользователя.
     * @param {Object} socket - Экземпляр Socket.
     */
    async disconnect(socket) {
        try {
            await this.roomService.userDisconnect(this.roomName, socket.handshake.address);
            this.roomHost = await this.roomService.getRoomHost(this.roomName, this.roomHost, socket.handshake.address);
            this.io.emit('userDisconnected', socket.handshake.address);
        } catch (err) {
            socket.emit('error', 'Ошибка отключения');
        }
    }

    /**
     * Закрывает все комнаты и завершает процесс.
     */
    async closeAllRooms() {
        try {
            await this.roomService.closeAllRooms();
            process.exit(0);
        } catch (err) {
            console.error('Ошибка отключения базы данных:', err);
        }
    }

}

module.exports = RoomController;
