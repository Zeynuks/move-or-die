class RoomController {
    constructor(io, roomRepository, services) {
        this.io = io;
        this.roomService = services.roomService;
        this.gameService = services.gameService;
        this.playerService = services.playerService;
        this.players = {}
    }

    createRoom(socket, roomName, userName) {
        this.roomService.createRoom(roomName, userName, socket.ip, (err) => {
            if (err) {
                console.error('Error creating room:', err);
                socket.emit('error', 'Error creating room');
                return;
            }
            socket.emit('roomCreated', roomName);
        });
    }

    joinRoom(socket, roomName, userName) {
        this.roomService.findRoomByName(roomName, (err, room) => {
            if (err) {
                if (err.message === 'Room not found') {
                    socket.emit('roomNotFound');
                } else {
                    console.error('Error finding room:', err);
                    socket.emit('error', 'Error finding room');
                }
                return;
            }

            this.playerService.countUsersInRoom(roomName, (err, result) => {
                if (err) {
                    console.error('Error counting users in room:', err);
                    socket.emit('error', 'Error counting users in room');
                    return;
                }

                const userCount = result[0].userCount;

                if (userCount >= 4) {
                    console.log(`User count: ${userCount}`);
                    socket.emit('roomFull');
                    return;
                }

                this.playerService.isUserInRoom(roomName, socket.ip, (err, userInRoom) => {
                    if (err) {
                        console.error('Error checking if user is in room:', err);
                        socket.emit('error', 'Error checking if user is in room');
                        return;
                    }

                    if (userInRoom) {
                        socket.emit('joinedRoom', roomName);
                        return;
                    }

                    this.players[socket.ip] = this.playerService.newPlayer(socket.ip, userName, 0, 0, 50, 'blue');
                    this.playerService.addPlayerToRoom(roomName, this.players[socket.ip], (err) => {
                        if (err) {
                            console.error('Error adding player to room:', err);
                            socket.emit('error', 'Error adding player to room');
                            return;
                        }
                        this.gameService.addPlayerToGame(roomName, this.players[socket.ip]);
                        socket.join(roomName);
                        socket.emit('joinedRoom', roomName);
                        this.playerService.getUsersInRoom(roomName, (err, users) => {
                            if (err) {
                                console.error('Error getting users in room:', err);
                                return;
                            }
                            this.io.of('/room').to(roomName).emit('updateRoom', users, room.creator_ip);
                        });
                    });
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

                this.playerService.removePlayerFromRoom(roomName, socket.ip, (err) => {
                    if (err) {
                        console.error('Error removing player from room:', err);
                        return;
                    }
                    this.gameService.removePlayerFromGame(roomName, socket.ip)
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
                                    socket.leave(roomName)
                                    if (room.creator_ip === userIp) {
                                        const newCreator = users[0].user_ip;
                                        this.roomService.updateRoomCreator(roomName, newCreator, (err) => {
                                            if (err) {
                                                console.error('Error updating room creator:', err);
                                                return;
                                            }

                                            this.io.of('/room').to(roomName).emit('updateRoom', users, newCreator);
                                        });
                                    } else {
                                        this.io.of('/room').to(roomName).emit('updateRoom', users, room.creator_ip);
                                    }
                                });
                            });
                        }
                    });
                });
            }
        });
    }

    closeAllRooms() {
        this.roomService.disconnect((err) => {
            if (err) {
                console.error('Error disconnecting from database:', err);
            }
            process.exit(0);
        });
    }

}

module.exports = RoomController;
