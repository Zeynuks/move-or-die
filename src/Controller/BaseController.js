/**
 * Контроллер расширяющий остальные контроллеры
 * @class BaseController
 */
class BaseController {
    /**
     * Создает экземпляр BaseController.
     * @param {Object} io - Экземпляр Socket.IO.
     * @param {string} roomName - Имя комнаты.
     */
    constructor(io, roomName) {
        this.io = io;
        this.roomName = roomName;
    }
}

module.exports = BaseController;
