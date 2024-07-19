const BaseController = require("./BaseController");

class PlayerController extends BaseController {
    constructor(io, roomName, services) {
        super(io, roomName);
        this.playerService = services.playerService;
        this.users = {}
    }

    async connect(socket) {
        try {
            socket.join(this.roomName);
            if (this.users[socket.handshake.address] !== undefined) {
                await this.playerService.addPlayerToGame(this.roomName, socket.handshake.address);
            } else {
                throw new Error('Пользоватeля нет в игре');
            }
        } catch (err) {
            socket.emit('error', 'Ошибка подключения');
        }
    }

    async setPlayersData(users) {
        try {
            await this.playerService.playersLoad(users)
            users.forEach((user) => {
                this.users[user.user_ip] = user;
            });
        } catch (err) {
            this.io.emit('error', 'Ошибка добавления игроков');
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
            await this.playerService.removePlayerFromGame(socket.handshake.address);
        } catch (err) {
            socket.emit('error', 'Ошибка отключения');
        }
    }

}

module.exports = PlayerController;
