const MapRepository = require("../Repository/MapRepository");
const Block = require("../Entity/Block");

/**
 * Сервис для работы с уровнями игры.
 */
class LevelService {
    constructor(io) {
        this.io = io;
        this.mapRepository = new MapRepository();
        this.size = 50;
        this.levelMap = [];
        this.levelSpawnPoints = [];
        this.levelObjects = [];
        this.specialObjects = [];
    }

    /**
     * Загружает карту уровня из репозитория.
     * @param {string} levelName - Название уровня для загрузки.
     */
    async downloadLevelMap(levelName) {
        try {
            console.log(levelName);
            const map = await this.mapRepository.findMapByLevelName(levelName);
            this.setMap(map);
        } catch (error) {
            console.error('Ошибка:', error);
        }
    }

    /**
     * Устанавливает карту уровня из массива данных.
     * @param {Array<Array<string>>} map - Карта уровня в виде двумерного массива строк.
     */
    setMap(map) {
        try {
            this.levelMap = [];
            for (let i = 0; i < map.length; i++) {
                let col = map[i];
                for (let j = 0; j < col.length; j++) {
                    if (map[i][j] === 'X') {
                        this.levelMap.push(new Block(j * this.size, i * this.size, this.size));
                    } else if (map[i][j] === 'S') {
                        this.levelSpawnPoints.push({x: j * this.size, y: i * this.size});
                    }
                }
            }
        } catch (error) {
            throw new Error('Ошибка загрузки блоков в карту');
        }
    }

    /**
     * Генерирует сетку объектов уровня на основе заданного размера ячейки сетки.
     * @param {number} gridSize - Размер ячейки сетки.
     */
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

    /**
     * Генерирует сетку объектов на основе заданных объектов.
     * @param {Array<Object>} objects - Массив объектов для генерации сетки.
     * @returns {Array<Array<Array<Object>>>} - Сетка объектов.
     */
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

    /**
     * Сбрасывает данные уровня до начального состояния.
     * @param {string} levelName - Название уровня для сброса данных.
     */
    async setLevelData(levelName) {
        await this.downloadLevelMap(levelName);
        await this.getMapGrid(this.size);
    }

    /**
     * Проверяет коллизию игрока с заданными ячейками сетки и объектами.
     * @param {Object} player - Объект игрока.
     * @param {Array<Array<number>>} cellsToCheck - Ячейки сетки для проверки коллизии.
     * @param {Array<Array<Array<Object>>>} objects - Сетка объектов для проверки коллизии.
     */
    checkCellsCollision(player, cellsToCheck, objects) {
        for (let [y, x] of cellsToCheck) {
            if (objects[y] && objects[y][x]) {
                for (let obj of objects[y][x]) {
                    let collision = this.checkCollision(player, obj);
                    if (collision) {
                        this.resolveCollision(player, obj, collision);
                    }
                }
            }
        }
    }

    /**
     * Проверяет коллизию между игроком и объектом.
     * @param {Object} player - Объект игрока.
     * @param {Object} obj - Объект для проверки коллизии с игроком.
     * @returns {Object|null} - Объект, представляющий тип коллизии, или null, если коллизии нет.
     */
    checkCollision(player, obj) {
        let collision = {
            left: false,
            right: false,
            top: false,
            bottom: false
        };

        if (player.x < obj.x + obj.size && player.x + player.size > obj.x &&
            player.y < obj.y + obj.size && player.y + player.size > obj.y) {
            collision.left = player.x + player.size > obj.x && player.x < obj.x;
            collision.right = player.x < obj.x + obj.size && player.x + player.size > obj.x + obj.size;
            collision.top = player.y + player.size > obj.y && player.y < obj.y;
            collision.bottom = player.y < obj.y + obj.size && player.y + player.size > obj.y + obj.size;
            return collision;
        }
        return null;
    }

    /**
     * Разрешает коллизию между игроком и объектом.
     * @param {Object} player - Объект игрока.
     * @param {Object} obj - Объект, с которым произошла коллизия.
     * @param {Object} collision - Типы коллизии.
     */
    resolveCollision(player, obj, collision) {
        if (collision.top && player.vy > 0) {
            player.y = obj.y - player.size;
            player.vy = 0;
            player.onGround = true;
        } else if (collision.bottom && player.vy < 0) {
            player.y = obj.y + obj.size;
            player.vy = 0;
        } else if (collision.left && player.vx > 0) {
            player.x = obj.x - player.size;
            player.vx = 0;
        } else if (collision.right && player.vx < 0) {
            player.x = obj.x + player.size;
            player.vx = 0;
        }
    }

    checkProximity(player, object) {
        const proximityDistance = 1;
        return (
            player.x < object.x + object.size + proximityDistance &&
            player.x + player.size > object.x - proximityDistance &&
            player.y < object.y + object.size + proximityDistance &&
            player.y + player.size > object.y - proximityDistance
        );
    }

    /**
     * Обновляет уровень (не реализовано).
     * @param {Array<Object>} players - Массив игроков.
     */
    updateLevelData(players) {
    }

    /**
     * Обновляет счет (не реализовано).
     */
    updateScore() {
    }

    /**
     * Получает статистику (не реализовано).
     * @returns {Object} - Статистика уровня.
     */
    getStat() {
        return {};
    }

}

module.exports = LevelService;
