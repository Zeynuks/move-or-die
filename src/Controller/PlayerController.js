const BaseController = require("./BaseController");

/**
 * Контроллер для управления действиями игроков.
 * @extends BaseController
 */
class PlayerController extends BaseController {
    /**
     * Создает экземпляр PlayerController.
     * @param {Object} io - Экземпляр Socket.io.
     * @param {string} roomName - Название комнаты.
     * @param {Object} services - Сервисы, необходимые для PlayerController.
     * @param {Object} services.playerService - Экземпляр сервиса игроков.
     */
    constructor(io, roomName, services) {
        super(io, roomName);
        this.playerService = services.playerService;
        this.users = {};
    }

    /**
     * Обрабатывает подключение игрока.
     * @param {Object} socket - Экземпляр Socket.
     */
    async connect(socket) {
        try {
            if (this.users[socket.handshake.address] !== undefined) {
                await this.playerService.addPlayerToGame(this.roomName, socket.handshake.address);
            } else {
                throw new Error('Пользователь не в игре');
            }
            socket.join(this.roomName);
        } catch (err) {
            socket.emit('error', 'Ошибка подключения');
        }
    }

    /**
     * Устанавливает данные игроков.
     * @param {Array<Object>} users - Массив объектов с данными игроков.
     * @param {string} users[].user_ip - IP-адрес пользователя.
     */
    async setPlayersData(users) {
        try {
            await this.playerService.playersLoad(users);
            users.forEach((user) => {
                this.users[user.user_ip] = user;
            });
        } catch (err) {
            this.io.emit('error', 'Ошибка добавления игроков');
        }
    }

    /**
     * Обрабатывает перемещение игрока.
     * @param {Object} socket - Экземпляр Socket.
     * @param {Object} moveData - Данные о перемещении.
     */
    async handleMovePlayer(socket, moveData) {
        try {
            await this.playerService.handleMovePlayer(socket.handshake.address, moveData);
        } catch (err) {
            socket.emit('error', 'Ошибка движения');
        }
    }

    /**
     * Обрабатывает отключение игрока.
     * @param {Object} socket - Экземпляр Socket.
     */
    async disconnect(socket) {
        try {
            await this.playerService.removePlayerFromGame(socket.handshake.address);
        } catch (err) {
            socket.emit('error', 'Ошибка отключения');
        }
    }
}

module.exports = PlayerController;
