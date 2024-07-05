const GameService = require("../Service/GameService");

class GameController {
    constructor(io, roomRepository, services) {
        this.io = io;
        this.roomService = services.roomService;
        this.gameService = services.gameService;
        this.playerService = services.playerService;
    }

    // update(roomName, eventData) {
    //     const room = this.gameService.handleGameEvent(roomName, socket.ip, eventData);
    //     if (room) {
    //         this.io.to(roomName).emit('gameStateUpdate', room);
    //     }
    // }

    updateState(roomName, gameObjectsGrid) {
        this.playerService.updatePlayersPosition(roomName, gameObjectsGrid);
        const playersData = this.playerService.getPlayersData(roomName);
        this.io.of('/game').to(roomName).emit('gameStateUpdate', playersData);
        // this.io.of('/game').emit('gameStateUpdate', players);
    }
}

module.exports = GameController;
