class PlayerController {
    constructor(io, roomName, services) {
        this.io = io;
        this.roomName = roomName;
        this.playerService = services.playerService;
    }

    async addPlayerToGame(socket, userName) {
        socket.join(this.roomName);
        this.playerService.addPlayerToGame(this.roomName, userName, socket.handshake.address);
    }

    handleMovePlayer(socket, moveData) {
        this.playerService.handleMovePlayer(socket.handshake.address, moveData);
    }

}

module.exports = PlayerController;
