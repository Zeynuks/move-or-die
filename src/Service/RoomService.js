class RoomService {
    constructor(roomRepository) {
        this.roomRepository = roomRepository;
        this.roomTimers = {};
    }

    disconnect(callback) {
        this.roomRepository.disconnect(callback);
    }

    createRoom(roomName, userName, clientIp, callback) {
        const room = { name: roomName, creator_ip: clientIp };
        this.roomRepository.createRoom(room, callback);
    }

    deleteRoom(roomName, callback) {
        this.roomRepository.deleteRoomByName(roomName, callback);
    }

    findRoomByName(roomName, callback) {
        this.roomRepository.findRoomByName(roomName, (err, results) => {
            if (err || results.length === 0) return callback(err || new Error('Room not found'));
            callback(null, results[0]);
        });
    }

    updateRoomCreator(roomName, newCreatorIp, callback) {
        this.roomRepository.updateRoomCreator(roomName, newCreatorIp, callback);
    }

    handleRoomEmpty(roomName) {
        this.roomTimers[roomName] = setTimeout(() => {
            this.roomRepository.deleteRoomByName(roomName, (err) => {
                if (err) console.error('Error deleting room:', err);
                console.log(`Room ${roomName} deleted after being empty for 5 minutes`);
                delete this.roomTimers[roomName];
            });
        }, 300000); // 5 minutes
    }
}

module.exports = RoomService;
