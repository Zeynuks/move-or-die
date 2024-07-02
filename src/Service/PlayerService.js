const Player = require("../Entity/Player");
let colorArray = ['red', 'blue', 'green', 'orange', 'purple'];

class PlayerService {
    constructor(roomRepository) {
        this.roomRepository = roomRepository;
    }

    newPlayer(clientIp, userName, x, y, size) {
        return new Player(clientIp, userName, x, y, size);
    }

    addPlayerToRoom(roomName, userName, userIp, callback) {
        const roomUser = {
            room_name: roomName,
            user_name: userName,
            user_ip: userIp,
        };
        this.roomRepository.addUserToRoom(roomUser, callback);
    }

    removePlayerFromRoom(userIp, callback) {
        this.roomRepository.removeUserFromRoom(userIp, callback);
    }

    countUsersInRoom(roomName, callback) {
        this.roomRepository.countUsersInRoom(roomName, callback);
    }

    getUsersInRoom(roomName, callback) {
        this.roomRepository.getUsersInRoom(roomName, callback);
    }

    findRoomByUserIp(userIp, callback) {
        this.roomRepository.findRoomByUserIp(userIp, callback);
    }

    isUserInRoom(roomName, userIp, callback) {
        this.roomRepository.isUserInRoom(roomName, userIp, callback);
    }

    randomColor() {
        if (colorArray.length != 0) {
            let colorInd = Math.floor(Math.random() * colorArray.length);
            let color = colorArray[colorInd]; 
            colorArray.splice(colorInd, 1);
            return color;
        } else {
            return 'grey';
        }
        
    }

}

module.exports = PlayerService;
