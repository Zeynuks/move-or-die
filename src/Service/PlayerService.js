const Player = require("../Entity/Player");
const CANVAS_WIDTH = 1400;
const CANVAS_HEIGHT = 800;
const GRAVITY = 0.5; // Сила гравитации, чтобы игроки падали вниз
const JUMP_FORCE = -13; // Сила прыжка, отрицательное значение для движения вверх
const GROUND_LEVEL = CANVAS_HEIGHT - 50; // Уровень земли, чтобы игроки не уходили ниже этой линии
const GRID_SIZE = 50;


class PlayerService {
    constructor(roomRepository) {
        this.roomRepository = roomRepository;
    }

    newPlayer(clientIp, userName, x, y, size, color) {
        return new Player(clientIp, userName, x, y, size, color);
    }

    setMove(player, movementData) {
        player.movement = movementData;
        if (movementData.jump && player.onGround) {
            player.vy = JUMP_FORCE; // Применение силы прыжка
            player.onGround = false; // Игрок в воздухе
        }

        player.lastActive = Date.now(); // Обновление времени последней активности
    }

    applyPhysics(player, gameObjectsGrid) {
        // Обновление позиции по горизонтали
        player.x += player.movement.x;

        // Применение гравитации
        player.vy += GRAVITY;
        player.y += player.vy;

        this.collidWithObjects(player, gameObjectsGrid);

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

    collidWithObjects(player, gameObjectsGrid) {
        const gridX = Math.floor(player.x / GRID_SIZE);
        const gridY = Math.floor(player.y / GRID_SIZE);

        const cellsToCheck = [
            [gridY, gridX],
            [gridY - 1, gridX],
            [gridY + 1, gridX],
            [gridY, gridX - 1],
            [gridY, gridX + 1],
            [gridY - 1, gridX - 1],
            [gridY - 1, gridX + 1],
            [gridY + 1, gridX - 1],
            [gridY + 1, gridX + 1]
        ];

        // Раскраска блоков
        for (let [y, x] of cellsToCheck) {
            if (gameObjectsGrid[y] && gameObjectsGrid[y][x]) {
                for (let obj of gameObjectsGrid[y][x]) {
                    let collision = this.checkCollision(player, obj); // Проверка коллизии с объектом
                    if (collision) {
                        obj.color = player.color; // Разрешение коллизии
                    }
                }
            }
        }

        // Проверка коллизий с объектами в указанных ячейках
        for (let [y, x] of cellsToCheck) {
            if (gameObjectsGrid[y] && gameObjectsGrid[y][x]) {
                for (let obj of gameObjectsGrid[y][x]) {
                    let collision = this.checkCollision(player, obj); // Проверка коллизии с объектом
                    if (collision) {
                        this.resolveCollision(player, obj, collision); // Разрешение коллизии
                    }
                }
            }
        }
    }

    checkCollision(player, obj) {
        let collision = {
            left: false,
            right: false,
            top: false,
            bottom: false
        };

        // Проверка пересечения прямоугольников
        if (player.x < obj.x + obj.size && player.x + player.size > obj.x && player.y < obj.y + obj.size && player.y + player.size > obj.y) {
            collision.left = player.x + player.size > obj.x && player.x < obj.x; // Коллизия слева
            collision.right = player.x < obj.x + obj.size && player.x + player.size > obj.x + obj.size; // Коллизия справа
            collision.top = player.y + player.size > obj.y && player.y < obj.y; // Коллизия сверху
            collision.bottom = player.y < obj.y + obj.size && player.y + player.size > obj.y + obj.size; // Коллизия снизу
            return collision;
        }
        return null;
    }

    resolveCollision(player, obj, collision) {
        if (collision.top && player.vy > 0) { // Коллизия сверху
            player.y = obj.y - player.size;
            player.vy = 0;
            player.onGround = true;
        } else if (collision.bottom && player.vy < 0) { // Коллизия снизу
            player.y = obj.y + obj.size;
            player.vy = 0;
        } else if (collision.left && player.movement.x > 0) { // Коллизия слева
            player.x = obj.x - player.size;
            player.movement.x = 0;
        } else if (collision.right && player.movement.x < 0) { // Коллизия справа
            player.x = obj.x + player.size;
            player.movement.x = 0;
        }
        obj.color = player.color;
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
