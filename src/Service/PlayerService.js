const Player = require("../Entity/Player");

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

    setMove(player, direction, moving) {
        if (direction === 'left') { // Если направление - влево
            player.moveLeft = moving;
        } else if (direction === 'right') { // Если направление - вправо
            player.moveRight = moving;
        } else if (direction === 'jump' && player.isGrounded && moving) { // Если направление - прыжок, и игрок на земле
            player.velocityY = -10; // Устанавливаем вертикальную скорость для прыжка
            player.isGrounded = false; // Игрок в прыжке
        }
        player.lastActive = Date.now(); // Обновление времени последней активности
    }

    applyPhysics(player) {
        const gravity = 0.4; // Гравитация
        const friction = 0.8; // Трение
        const acceleration = 0.5; // Ускорение
        const maxSpeed = 5; // Максимальная скорость

        // Применение гравитации
        player.velocityY += gravity;
        player.y += player.velocityY;

        // Применение ускорения/замедления при движении
        if (player.moveLeft) {
            player.velocityX -= acceleration;
        }
        if (player.moveRight) {
            player.velocityX += acceleration;
        }

        // Применение трения, если игрок не движется
        if (!player.moveLeft && !player.moveRight) {
            player.velocityX *= friction;
        }

        // Ограничение максимальной скорости
        if (player.velocityX > maxSpeed) {
            player.velocityX = maxSpeed;
        }
        if (player.velocityX < -maxSpeed) {
            player.velocityX = -maxSpeed;
        }

        player.x += player.velocityX; // Обновление координаты X

        if (player.x < 0) { // Левый край
            player.x = 0;
            player.velocityX = 0;
        }
        if (player.x + player.size > 1400) { // Правый край
            player.x = 1400 - player.size;
            player.velocityX = 0;
        }
        if (player.y < 0) { // Верхний край
            player.y = 0;
            player.velocityY = 0;
        }
        if (player.y + player.size > 800) { // Нижний край
            player.y = 800 - player.size;
            player.velocityY = 0;
            player.isGrounded = true; // Игрок на земле
        }

        player.lastActive = Date.now(); // Обновление времени последней активности
    }

}

module.exports = PlayerService;
