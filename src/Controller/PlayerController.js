class PlayerController {
    constructor(io, roomRepository, services) {
        this.io = io;
        this.roomService = services.roomService;
        this.gameService = services.gameService;
        this.playerService = services.playerService;
    }

    handleMovePlayer(roomName, clientIp, moveData) {
        this.playerService.handleMovePlayer(roomName, clientIp, moveData);
    }

}

module.exports = PlayerController;
