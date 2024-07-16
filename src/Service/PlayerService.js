const Player = require("../Entity/Player");

const JUMP_FORCE = -13;
let colorArray = ['blue', 'green', 'yellow', 'purple'];

/**
 * Сервис для управления игроками.
 * @class PlayerService
 */
class PlayerService {
    constructor() {
        this.players = {};
        this.playerMovement = {};
        this.leftPlayers = {};
    }

    /**
     * Сбрасывает данные всех игроков.
     * @async
     */
    async resetPlayersData() {
        try {
            Object.values(this.players).forEach(player => {
                player.x = 200;
                player.y = 200;
                player.collision = true;
                player.visible = true;
                player.statement = true;
                player.movement = { x: 0, y: 0 };
                player.onGround = true;
                player.vy = 0;
                player.health = 100;
                player.statement = true;
            });
        } catch (error) {
            console.error('Ошибка сброса данных игроков: ' + error.message);
        }
    }

    /**
     * Создает нового игрока.
     * @param {string} clientIp - IP клиента.
     * @param {string} userName - Имя игрока.
     * @param {number} x - Начальная координата X.
     * @param {number} y - Начальная координата Y.
     * @param {number} size - Размер игрока.
     * @param {string} color - Цвет игрока.
     * @returns {Player} Новый объект игрока.
     */
    newPlayer(clientIp, userName, x, y, size, color) {
        return new Player(clientIp, userName, x, y, size, color, true, true);
    }

    /**
     * Добавляет игрока в игру.
     * @param {string} roomName - Имя комнаты.
     * @param {string} userName - Имя игрока.
     * @param {string} clientIp - IP клиента.
     * @async
     */
    async addPlayerToGame(roomName, userName, clientIp) {
        try {
            if (this.leftPlayers[clientIp] === undefined) {
                this.players[clientIp] = this.newPlayer(clientIp, userName, 200, 200, 50, this.randomColor());
            } else {
                this.players[clientIp] = this.leftPlayers[clientIp];
                delete this.leftPlayers[clientIp];
            }
        } catch (error) {
            console.error('Ошибка добавления игрока в игру: ' + error.message);
        }
    }

    /**
     * Обрабатывает движение игрока.
     * @param {string} clientIp - IP клиента.
     * @param {Object} movementData - Данные о движении игрока.
     * @param {number} movementData.x - Скорость по оси X.
     * @param {boolean} movementData.jump - Флаг прыжка.
     * @async
     */
    async handleMovePlayer(clientIp, movementData) {
        try {
            this.players[clientIp].vx = movementData.x;
            if (movementData.jump && this.players[clientIp].onGround) {
                this.players[clientIp].vy = JUMP_FORCE;
                this.players[clientIp].onGround = false;
            }
        } catch (error) {
            console.error('Ошибка обработки движения игрока: ' + error.message);
        }
    }

    /**
     * Обновляет здоровье всех игроков.
     * @async
     */
    async updateHealth() {
        try {
            Object.values(this.players).forEach(player => {
                if (player.statement) {
                    player.statement = player.health <= 0 ? false : player.statement;
                    if (player.x !== this.playerMovement[player.ip] && player.health < 100 && player.onGround) {
                        player.health += 0.6;
                    } else if (player.health > 0) {
                        player.health -= 0.4;
                    }
                }
            });
        } catch (error) {
            console.error('Ошибка обновления здоровья игроков: ' + error.message);
        }
    }

    /**
     * Обновляет позиции всех игроков.
     * @async
     */
    async updatePlayersPosition() {
        try {
            Object.values(this.players).forEach(player => {
                this.playerMovement[player.ip] = player.x;
                player.applyPhysics();
            });
        } catch (error) {
            console.error('Ошибка обновления позиций игроков: ' + error.message);
        }
    }

    /**
     * Устанавливает точки спавна для всех игроков.
     * @param {Array<{x: number, y: number}>} spawnPoints - Массив точек спавна.
     */
    async setPlayersSpawnPoints(spawnPoints) {
        Object.values(this.players).forEach(player => {
            const spawnPoint = spawnPoints.pop();
            player.x = spawnPoint.x;
            player.y = spawnPoint.y;
        });
    }

    /**
     * Возвращает случайный цвет из массива цветов.
     * @returns {string} Случайный цвет.
     */
    randomColor() {
        let colorInd = Math.floor(Math.random() * colorArray.length);
        let color = colorArray[colorInd];
        colorArray.splice(colorInd, 1);

        if (colorArray.length === 0) {
            colorArray = ['blue', 'green', 'yellow', 'purple'];
        }

        return color;
    }

    /**
     * Проверяет, все ли игроки погибли.
     * @returns {boolean} Все ли игроки погибли.
     * @async
     */
    async isAllDie() {
        try {
            return Object.values(this.players).every(player => player.statement === false);
        } catch (error) {
            console.error('Ошибка проверки игроков: ' + error.message);
        }
    }

    /**
     * Отключает игрока от игры.
     * @param {string} clientIp - IP клиента.
     * @async
     */
    async disconnect(clientIp) {
        try {
            this.leftPlayers[clientIp] = this.players[clientIp];
            delete this.players[clientIp];
        } catch (error) {
            console.error('Ошибка отключения: ' + error.message);
        }
    }
}

module.exports = PlayerService;
