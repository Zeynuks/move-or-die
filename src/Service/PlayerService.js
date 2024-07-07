const Player = require("../Entity/Player");
const CANVAS_WIDTH = 1400;
const CANVAS_HEIGHT = 800;
const GRAVITY = 0.5; // Сила гравитации, чтобы игроки падали вниз
const JUMP_FORCE = -13; // Сила прыжка, отрицательное значение для движения вверх
const GROUND_LEVEL = CANVAS_HEIGHT - 50; // Уровень земли, чтобы игроки не уходили ниже этой линии
const GRID_SIZE = 50;
let colorArray = ['blue', 'green', 'orange', 'purple'];

class PlayerService {
    constructor() {
        this.players = {};
    }

    newPlayer(clientIp, userName, x, y, size, color) {
        return new Player(clientIp, userName, x, y, size, color);
    }

    addPlayerToGame(roomName, userName, clientIp) { //*** REMOVE socketId
        this.players[clientIp] = this.newPlayer(clientIp, userName, 200, 200, 50, this.randomColor());
    }

    handleMovePlayer(moveData, clientIp) {
        Object.values(this.players).forEach(player => {
            if (player.ip === clientIp) {
                this.setMove(player, moveData);
            }
        });
        return this.players;
    }

    setMove(player, movementData) {
        player.movement = movementData;
        if (movementData.jump && player.onGround) {
            player.vy = JUMP_FORCE;
            player.onGround = false;
        }
    }

    updatePlayersPosition(roomName, gameObjectsGrid) {
        Object.values(this.players).forEach(player => {
            this.applyPhysics(player);
            this.checkProximityWithObjects(player, gameObjectsGrid);
        });
    }

    applyPhysics(player) {
        player.x += player.movement.x;
        player.vy += GRAVITY;
        player.y += player.vy;

        // Ограничение по краям экрана
        if (player.x < 0) player.x = 0;
        if (player.x > CANVAS_WIDTH - player.size) player.x = CANVAS_WIDTH - player.size; // Ширина canvas - ширина игрока (50px)
    }

    checkProximityWithObjects(player, gameObjectsGrid) {
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
        this.paintBlock(player, cellsToCheck, gameObjectsGrid);
        this.checkCellsCollision(player, cellsToCheck, gameObjectsGrid);
    }

    // Раскраска блоков при приближении
    paintBlock(player, cellsToCheck, gameObjectsGrid) {
        for (let [y, x] of cellsToCheck) {
            if (gameObjectsGrid[y] && gameObjectsGrid[y][x]) {
                for (let obj of gameObjectsGrid[y][x]) {
                    let proximity = this.checkProximity(player, obj); // Проверка приближения к объекту
                    if (proximity) {
                        obj.color = player.color; // Изменение цвета объекта
                    }
                }
            }
        }
    }

    checkCellsCollision(player, cellsToCheck, gameObjectsGrid) {
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

    checkProximity(player, obj) {
        const proximityDistance = 2; // Расстояние до объекта для изменения цвета
        return (
            player.x < obj.x + obj.size + proximityDistance &&
            player.x + player.size > obj.x - proximityDistance &&
            player.y < obj.y + obj.size + proximityDistance &&
            player.y + player.size > obj.y - proximityDistance
        );
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

    getPlayersData() {
        return this.players;
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
