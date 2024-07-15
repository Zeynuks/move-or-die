const MapRepository = require("../Repository/MapRepository");
const Block = require("../Entity/Block");

class LevelService {
    constructor() {
        this.mapRepository = new MapRepository();
        this.levelMap = [];
        this.size = 50;
        this.levelObjects = [];
    }
    async downloadLevelMap(levelName) {
        try {
            const map = await this.mapRepository.findMapByLevelName(levelName);
            this.setMap(map);
        } catch (error) {
            console.error('Ошибка:', error);
        }
    }
    setMap(map) {
        try {
            this.levelMap = [];
            for (let i = 0; i < map.length; i++) {
                let col = map[i];
                for (let j = 0; j < col.length; j++) {
                    if (map[i][j] === 'X') {
                        this.levelMap.push(new Block(j * this.size, i * this.size, this.size));
                    }
                }
            }
        } catch (error) {
            throw new Error('Ошибка загрузки блоков в карту')
        }
    }
    async getMapGrid(gridSize) {
        this.levelObjects = [];
        this.levelMap.forEach(obj => {
            const gridX = Math.floor(obj.x / gridSize);
            const gridY = Math.floor(obj.y / gridSize);
            if (!this.levelObjects[gridY]) this.levelObjects[gridY] = [];
            if (!this.levelObjects[gridY][gridX]) this.levelObjects[gridY][gridX] = [];
            this.levelObjects[gridY][gridX].push(obj);
        });
    }

    getObjectsGrid(objects) {
        const grid = [];
        objects.forEach(obj => {
            const gridX = Math.floor(obj.x / this.size);
            const gridY = Math.floor(obj.y / this.size);
            if (!grid[gridY]) grid[gridY] = [];
            if (!grid[gridY][gridX]) grid[gridY][gridX] = [];
            grid[gridY][gridX].push(obj);
        });
        return grid;
    }

    async resetLevelData(levelName) {
        await this.downloadLevelMap(levelName);
        await this.getMapGrid(this.size);
    }
    checkCellsCollision(player, cellsToCheck, objects) {
        for (let [y, x] of cellsToCheck) {
            if (objects[y] && objects[y][x]) {
                for (let obj of objects[y][x]) {
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
        } else if (collision.left && player.vx > 0) { // Коллизия слева
            player.x = obj.x - player.size;
            player.vx = 0;
        } else if (collision.right && player.vx < 0) { // Коллизия справа
            player.x = obj.x + player.size;
            player.vx = 0;
        }
    }

    getSpecialObjects() {}
    updateLevel(players, objects) {}
    updateScore() {}
    getStat() {}

}

module.exports = LevelService;