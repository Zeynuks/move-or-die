class PlayerController {
    constructor(io, roomRepository, services) {
        this.io = io;
        this.roomService = services.roomService;
        this.gameService = services.gameService;
        this.playerService = services.playerService;
    }

    isReady(socket, roomName) {
        console.log(socket.ip, ' is ready')
        this.gameService.setPlayerReady(roomName, socket.ip, (err, allReady) => {
            if (err) {
                console.error('Error setting player ready:', err);
                socket.emit('error', 'Error setting player ready');
                return;
            }
            this.playerService.getUsersInRoom(roomName, (err, users) => {
                if (err) {
                    console.error('Error getting users in room:', err);
                    socket.emit('error', 'Error getting users in room');
                    return;
                }

                this.roomService.findRoomByName(roomName, (err, room) => {
                    if (err) {
                        console.error('Error finding room:', err);
                        socket.emit('error', 'Error finding room');
                        return;
                    }

                    this.io.of('/room').to(roomName).emit('updateRoom', users, room.creator_ip);
                    if (allReady) {
                        this.io.of('/room').to(roomName).emit('gameStarted');
                    }
                });
            });
        });
    }

}

module.exports = PlayerController;
