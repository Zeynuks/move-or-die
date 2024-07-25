const BaseController = require("./BaseController");
const ErrorHandler = require("../Utils/ErrorHandler");

const ROUND_TIME = 1000 * 30;
const WAIT_TIME = 1000 * 2;
const CYCLE_TIME = 1000 / 60;
const INFO_TIME = 1000 * 8;
/**
 * Контроллер игры.
 * @extends BaseController
 */
class GameController extends BaseController {
    /**
     * Создает экземпляр GameController.
     * @param {Object} io - Объект Socket.IO.
     * @param {string} roomName - Имя комнаты.
     * @param {Object} services - Сервисы, необходимые для игры.
     */
    constructor(io, roomName, services) {
        super(io, roomName);
        this.playerService = services.playerService;
        this.levelService = {};
        this.levelList = [];
        this.roundTimer = null;
        this.cycleTimer = null;
        this.playersScore = {
            blue: 0,
            green: 0,
            yellow: 0,
            purple: 0,
        }
    }

    /**
     * Устанавливает уровень игры из списка доступных уровней.
     * @throws {Error} Если нет доступных уровней.
     */
    async setLevelService() {
        if (this.levelList.length === 0) {
            throw new Error('Нет доступных уровней');
        }
        this.levelService = this.levelList.pop();
    }

    /**
     * Запускает игру.
     * @returns {Promise<void>}
     */
    async startGame() {
        try {
            await this.sleep(INFO_TIME);
            await this.startRound();
        } catch (error) {
            ErrorHandler(this.io, this.roomName, 'Ошибка старта игры', error.message);
        }
    }

    /**
     * Загружает данные игры для клиента.
     * @param {Object} socket - Объект сокета клиента.
     * @returns {Promise<void>}
     */
    async gameDataLoad(socket) {
        if (this.roundTimer !== null) {
            socket.emit('gameLoad', this.playerService.players, this.levelService.levelMap);
        }
    }

    /**
     * Запускает раунд игры.
     * @returns {Promise<void>}
     */
    async startRound() {
        try {
            await this.sleep(WAIT_TIME);
            await this.setGameData();
            this.io.emit('startRound', this.playerService.players, this.levelService.levelMap, ROUND_TIME);
            await this.updateCycle(this.levelObjects);
            this.roundTimer = setTimeout(async () => {
                await this.endRound();
            }, ROUND_TIME);
        } catch (error) {
            ErrorHandler(this.io, this.roomName, 'Ошибка старта раунда', error.message);
        }
    }

    /**
     * Устанавливает данные игры, включая уровень и игроков.
     * @returns {Promise<void>}
     * @throws {Error} Если произошла ошибка при установке данных.
     */
    async setGameData() {
        try {
            await this.setLevelService();
            await this.levelService.setLevelData(this.levelService.levelName);
            await this.playerService.setPlayersData(this.levelService.levelSpawnPoints);
        } catch (error) {
            throw new Error(`Ошибка установки данных игры: ${error.message}`);
        }
    }

    /**
     * Завершает текущий раунд игры.
     * @returns {Promise<void>}
     */
    async endRound() {
        try {
            this.stopUpdateCycle()
            this.updatePlayersScore();
            this.levelService.isEnd = true;
            this.io.emit('endRound', this.playersScore);
            await this.isGameEnd();
        } catch (error) {
            ErrorHandler(this.io, this.roomName, 'Ошибка конца раунда', error.message);
        }
    }

    /**
     * Обновляет игровой цикл.
     * @returns {Promise<void>}
     * @throws {Error} Если произошла ошибка в игровом цикле.
     */
    async updateCycle() {
        try {
            this.cycleTimer = setInterval(async () => {
                await this.playerService.updatePlayersData();
                await this.levelService.updateLevelData(this.playerService.players);
                await this.levelService.updateScore(this.playerService.players);
                await this.isRoundEnd();
                this.io.emit('gameUpdate', this.playerService.players, this.levelService.levelMap, this.levelService.specialObjects);
                this.io.emit('levelScore', this.levelService.levelScore);
            }, CYCLE_TIME);
        } catch (error) {
            throw new Error(`Ошибка игрового цикла: ${error.message}`);
        }
    }

    /**
     * Обновляет счет игроков на основе данных уровня.
     */
    updatePlayersScore() {
        const score = this.levelService.getStat(this.playerService.players);
        const total = {};
        for (const color in this.playersScore) {
            total[color] = (this.playersScore[color] || 0) + (score[color] || 0);
        }
        this.playersScore = total;
        this.sortPlayersScore();
    }

    /**
     * Сортирует счет игроков по убыванию.
     */
    sortPlayersScore() {
        this.playersScore = Object.entries(this.playersScore)
            .sort((a, b) => b[1] - a[1])
            .reduce((result, [key, value]) => ({...result, [key]: value}), {});
    }

    /**
     * Проверяет, закончился ли раунд.
     * @returns {Promise<void>}
     */
    async isRoundEnd() {
        if (this.playerService.isAllDie() || this.playerService.players.length === 0) {
            this.stopGameCycle()
            await this.endRound();
        }
    }

    /**
     * Проверяет, закончилась ли игра.
     * @returns {Promise<void>}
     */
    async isGameEnd() {
        if (this.levelList.length === 0) {
            let maxKey = null;
            let maxValue = -Infinity;
            for (const [key, value] of Object.entries(this.playersScore)) {
                if (value > maxValue) {
                    maxValue = value;
                    maxKey = key;
                }
            }
            const winner = Object.values(this.playerService.players).find(player => player.color === maxKey)
            this.io.emit('endGame', winner);
        } else {
            await this.sleep(WAIT_TIME);
            await this.startRound();
        }
    }

    /**
     * Возвращает промис, который завершается через указанное количество миллисекунд.
     * @param {number} ms - Количество миллисекунд.
     * @returns {Promise<void>}
     */
    async sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Останавливает цикл обновления игры.
     * @throws {Error} Если таймер не существует.
     */
    stopUpdateCycle() {
        if (this.cycleTimer) {
            clearInterval(this.cycleTimer);
            this.cycleTimer = null;
        } else {
            throw new Error('Таймер не существует');
        }
    }

    /**
     * Останавливает таймер раунда.
     * @throws {Error} Если таймер не существует.
     */
    stopGameCycle() {
        if (this.roundTimer) {
            clearTimeout(this.roundTimer)
            this.roundTimer = null;
        } else {
            throw new Error('Таймер не существует');
        }
    }
}

module.exports = GameController;
