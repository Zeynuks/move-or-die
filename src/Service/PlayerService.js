const Player = require("../Entity/Player");
const CANVAS_WIDTH = 1400;
const CANVAS_HEIGHT = 800;
const GRAVITY = 0.5; // Сила гравитации, чтобы игроки падали вниз
const JUMP_FORCE = -10; // Сила прыжка, отрицательное значение для движения вверх
const GROUND_LEVEL = CANVAS_HEIGHT - 50; // Уровень земли, чтобы игроки не уходили ниже этой линии


class PlayerService {
    constructor(roomRepository) {
        this.roomRepository = roomRepository;
    }

    newPlayer(clientIp, userName, x, y, size, color) {
        return new Player(clientIp, userName, x, y, size, color);
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

    setMove(player, movementData) {
        player.movement = movementData;
        if (movementData.jump && player.onGround) {
            player.vy = JUMP_FORCE; // Применение силы прыжка
            player.onGround = false; // Игрок в воздухе
        }

        player.lastActive = Date.now(); // Обновление времени последней активности
    }

    applyPhysics(player) {
        // Обновление позиции по горизонтали
        player.x += player.movement.x;

        // Применение гравитации
        player.vy += GRAVITY;
        player.y += player.vy;

        // Обработка столкновений с землей
        if (player.y >= GROUND_LEVEL) {
            player.y = GROUND_LEVEL;
            player.vy = 0;
            player.onGround = true;
        }

        // Ограничение по краям экрана
        if (player.x < 0) player.x = 0;
        if (player.x > CANVAS_WIDTH - player.size) player.x = CANVAS_WIDTH - player.size; // Ширина canvas - ширина игрока (50px)

        player.lastActive = Date.now(); // Обновление времени последней активности
    }

}

module.exports = PlayerService;
