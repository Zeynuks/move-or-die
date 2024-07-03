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

    disconnect(socket) {
        this.playerService.findRoomByUserIp(socket.ip, (err, results) => {
            if (err) {
                console.error('Error finding room by user IP:', err);
                return;
            }

            if (results.length > 0) {
                const roomName = results[0].room_name;
                const userIp = results[0].user_ip;

                this.playerService.removePlayerFromRoom(socket.ip, (err) => {
                    if (err) {
                        console.error('Error removing player from room:', err);
                        return;
                    }

                    this.playerService.countUsersInRoom(roomName, (err, userCountResult) => {
                        if (err) {
                            console.error('Error counting users in room:', err);
                            return;
                        }

                        const userCount = userCountResult[0].userCount;

                        if (userCount === 0) {
                            this.roomService.handleRoomEmpty(roomName);
                        } else {
                            this.playerService.getUsersInRoom(roomName, (err, users) => {
                                if (err) {
                                    console.error('Error getting users in room:', err);
                                    return;
                                }

                                this.roomService.findRoomByName(roomName, (err, room) => {
                                    if (err) {
                                        console.error('Error finding room:', err);
                                        return;
                                    }

                                    if (room.creator_ip === userIp) {
                                        const newCreator = users[0].user_ip;
                                        this.roomService.updateRoomCreator(roomName, newCreator, (err) => {
                                            if (err) {
                                                console.error('Error updating room creator:', err);
                                                return;
                                            }

                                            this.io.to(roomName).emit('updateRoom', users, newCreator);
                                        });
                                    } else {
                                        this.io.to(roomName).emit('updateRoom', users, room.creator_ip);
                                    }
                                });
                            });
                        }
                    });
                });
            }
        });
    }
}

module.exports = PlayerController;