const Player = require("../Entity/Player");

const JUMP_FORCE = -13;

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
     * @param {Array<{x: number, y: number}>} spawnPoints - Массив с точками спавна всех игроков.
     * @async
     */
    async setPlayersData(spawnPoints) {
        try {
            Object.values(this.players).forEach((player, index) => {
                const spawnPoint = spawnPoints[index];
                player.x = spawnPoint.x;
                player.y = spawnPoint.y;
                player.collision = true;
                player.visible = true;
                player.statement = true;
                player.movement = { x: 0, y: 0 };
                player.onGround = true;
                player.vy = 0;
                player.health = 100;
                player.statement = true;
                player.active = false;
            });
        } catch (error) {
            console.error('Ошибка сброса данных игроков: ' + error.message);
        }
    }

    /**
     * Загружает игроков в систему.
     * @param {Object} users - Объект пользователей.
     * @async
     */
    async playersLoad(users) {
        Object.values(users).forEach(user => {
            this.leftPlayers[user.user_ip] = this.newPlayer(user.user_ip, user.user_name, user.user_color);
        });
    }

    /**
     * Создает нового игрока.
     * @param {string} clientIp - IP клиента.
     * @param {string} userName - Имя игрока.
     * @param {string} color - Цвет игрока.
     * @returns {Player} Новый объект игрока.
     */
    newPlayer(clientIp, userName, color) {
        return new Player(clientIp, userName, 0, 0, 50, color, true, true);
    }

    /**
     * Добавляет игрока в игру.
     * @param {string} roomName - Имя комнаты.
     * @param {string} playerIp - Ip игрока
     * @async
     */
    async addPlayerToGame(roomName, playerIp) {
        try {
            this.players[playerIp] = this.leftPlayers[playerIp];
            delete this.leftPlayers[playerIp];
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
            if (this.players[clientIp].active && movementData.x) {
                movementData.x = movementData.x  > 0 ? movementData.x  + 2 : movementData.x  - 2;
            }
            this.players[clientIp].vx = movementData.x;
            if (movementData.jump && this.players[clientIp].onGround) {
                this.players[clientIp].vy = JUMP_FORCE;
                this.players[clientIp].onGround = false;
            }
        } catch (error) {
            console.error('Ошибка обработки движения игрока: ' + error.message);
        }
    }

    async updatePlayersData() {
        await this.updatePlayersPosition();
        await this.updateHealth()
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
     * Проверяет, все ли игроки погибли.
     * @returns {boolean} Все ли игроки погибли.
     * @async
     */
    isAllDie() {
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
    async removePlayerFromGame(clientIp) {
        try {
            this.leftPlayers[clientIp] = this.players[clientIp];
            delete this.players[clientIp];
        } catch (error) {
            console.error('Ошибка отключения: ' + error.message);
        }
    }
}

module.exports = PlayerService;
