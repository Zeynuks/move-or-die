class PlayerController {
    constructor(io, roomName, services) {
        this.io = io;
        this.roomName = roomName;
        this.roomService = services.roomService;
        this.gameService = services.gameService;
        this.playerService = services.playerService;
    }

    async addPlayerToGame(socket, userName) {
        this.playerService.addPlayerToGame(this.roomName, userName, socket.handshake.address);
    }

    handleMovePlayer(moveData, socket) {
        this.playerService.handleMovePlayer(moveData, socket.handshake.address);
    }

}

module.exports = PlayerController;
