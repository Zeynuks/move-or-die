
const GameService = require("../Service/GameService");

class GameController {
    constructor(io) {
        this.io = io;
        this.gameService = new GameService();
    }

    update(roomName, eventData) {
        const room = this.gameService.handleGameEvent(roomName, socket.ip, eventData);
        if (room) {
            this.io.to(roomName).emit('gameStateUpdate', room);
        }
    }
}

module.exports = GameController;
