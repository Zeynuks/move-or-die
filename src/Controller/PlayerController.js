const BaseController = require("./BaseController");

class PlayerController extends BaseController {
    constructor(io, roomName, services) {
        super(io, roomName);
        this.io = io;
        this.roomName = roomName;
        this.playerService = services.playerService;
    }

    async addPlayerToGame(socket, userName) {
        try {
            socket.join(this.roomName);
            await this.playerService.addPlayerToGame(this.roomName, userName, socket.handshake.address);
        } catch (err) {
            socket.emit('error', 'Ошибка подключения');
        }
    }

    async handleMovePlayer(socket, moveData) {
        try {
            await this.playerService.handleMovePlayer(socket.handshake.address, moveData);
        } catch (err) {
            socket.emit('error', 'Ошибка движения');
        }
    }

    async disconnect(socket) {
        try {
            await this.playerService.disconnect(socket.handshake.address);
        } catch (err) {
            socket.emit('error', 'Ошибка отключения');
        }
    }

}

module.exports = PlayerController;
