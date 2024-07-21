const BaseController = require("./BaseController");
const ErrorHandler = require("../Utils/ErrorHandler");
const ROUND_TIME = 1000 * 60;
const WAIT_TIME = 1000 * 3;

class GameController extends BaseController {
    constructor(io, roomName, services) {
        super(io, roomName);
        this.gameService = services.gameService;
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

    async setLevelService() {
        if (this.levelList.length === 0) {
            throw new Error('Нет доступных уровней');
        }
        this.levelService = this.levelList.pop();
    }

    async startGame() {
        try {
            await this.startRound();
        } catch (error) {
            ErrorHandler(this.io, this.roomName, 'Ошибка старта игры', error.message);
        }
    }

    async gameDataLoad(socket) {
        socket.emit('gameLoad', this.playerService.players, this.levelService.levelMap);
    }

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

    async setGameData() {
        try {
            await this.setLevelService();
            await this.levelService.setLevelData(this.levelService.levelName);
            await this.playerService.setPlayersData(this.levelService.levelSpawnPoints);
        } catch (error) {
            throw new Error(`Ошибка установки данных игры: ${error.message}`);
        }
    }

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

    async updateCycle(gameObjects) {
        try {
            this.cycleTimer = setInterval(async () => {
                await this.playerService.updatePlayersData();
                await this.levelService.updateLevelData(this.playerService.players, this.io);
                await this.levelService.updateScore(this.levelService.levelObjects, this.playerService.players);
                await this.isRoundEnd();
                this.io.emit('gameUpdate', this.playerService.players, this.levelService.levelMap, this.levelService.specialObjects);
                this.io.emit('levelScore', this.levelService.getLevelScore());
            }, 1000 / 60);
        } catch (error) {
            throw new Error(`Ошибка игрового цикла: ${error.message}`);
        }
    }

    updatePlayersScore() {
        const score = this.levelService.getStat(this.playerService.players);
        const total = {};
        for (const color in this.playersScore) {
            total[color] = (this.playersScore[color] || 0) + (score[color] || 0);
        }
        this.playersScore = total;
        this.sortPlayersScore();
    }

    sortPlayersScore() {
        this.playersScore = Object.entries(this.playersScore)
            .sort((a, b) => b[1] - a[1])
            .reduce((result, [key, value]) => ({...result, [key]: value}), {});
    }

    async isRoundEnd() {
        if (this.playerService.isAllDie() || this.playerService.players.length === 0) {
            this.stopGameCycle()
            await this.endRound();
        }
    }

    async isGameEnd() {
        if (this.levelList.length === 0) {
            this.io.emit('endGame', this.roomName);
        } else {
            await this.sleep(WAIT_TIME);
            await this.startRound();
        }
    }

    async sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    stopUpdateCycle() {
        if (this.cycleTimer) {
            clearInterval(this.cycleTimer);
            this.cycleTimer = null;
        } else {
            throw new Error('Таймер не существует');
        }
    }

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
