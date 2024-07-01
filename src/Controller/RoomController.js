const GameService = require("../Service/GameService");
const RoomService = require("../Service/RoomService");
const PlayerService = require("../Service/PlayerService");

class RoomController {
    constructor(io, roomRepository) {
        this.io = io;
        this.roomService = new RoomService(roomRepository);
        this.gameService = new GameService();
        this.playerService = new PlayerService(roomRepository);
    }

    createRoom(socket, roomName, userName) {
        this.roomService.createRoom(roomName, userName, socket.ip, (err) => {
            if (err) {
                console.error('Error creating room:', err);
                socket.emit('error', 'Error creating room');
                return;
            }
            this.playerService.addPlayerToRoom(roomName, userName, socket.ip,(err) => {
                if (err) {
                    console.error('Error adding player to room:', err);
                    socket.emit('error', 'Error adding player to room');
                    return;
                }
                this.gameService.addPlayerToGame(roomName, userName, socket.ip); // Initialize game state
                socket.join(roomName);
                socket.emit('roomCreated', roomName);
                this.playerService.getUsersInRoom(roomName, (err, users) => {
                    if (err) {
                        console.error('Error getting users in room:', err);
                        return;
                    }
                    this.io.to(roomName).emit('updateRoom', users, socket.ip);
                });
            });
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

                    this.playerService.addPlayerToRoom(roomName, userName, socket.ip, (err) => {
                        if (err) {
                            console.error('Error adding player to room:', err);
                            socket.emit('error', 'Error adding player to room');
                            return;
                        }
                        this.gameService.addPlayerToGame(roomName, userName, socket.ip); // Initialize game state
                        socket.join(roomName);
                        socket.emit('joinedRoom', roomName);
                        this.playerService.getUsersInRoom(roomName, (err, users) => {
                            if (err) {
                                console.error('Error getting users in room:', err);
                                return;
                            }
                            console.log(users)
                            this.io.to(roomName).emit('updateRoom', users, room.creator_ip);
                        });
                    });
                });
            });
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
