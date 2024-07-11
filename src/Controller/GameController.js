class GameController {
    constructor(io, roomName, services) {
        this.io = io;
        this.roomName = roomName;
        this.gameService = services.gameService;
        this.playerService = services.playerService;
        this.levelService = services.levelService;
        this.players = {};
        this.levelObjects = [];
        this.level = [];
        this.cycleTimer = null;
        this.gameState = false
    }

    async isStart(socket) {
        try {
            if (!this.gameState) {
                // await this.levelService.downloadLevelMap('ColorLevel');
                // await this.levelService.getMapGrid(this.levelService.size);
                await this.startGame()
                setTimeout(await this.startGame(), 500);
            } else {
                this.gameLoad(socket)
            }
        } catch (err) {
            socket.emit('error', 'Ошибка подготовки к игре');
        }
    }

    gameLoad(socket) {
        socket.emit('gameLoad', this.players, this.level);
    }

    async startGame() {
        try {
            this.gameState = true
            await this.resetGameData();
            await this.levelService.downloadLevelMap('ColorLevel');
            await this.levelService.getMapGrid(this.levelService.size);
            this.io.emit('startRound', this.players, this.level);
            await this.updateCycle(this.levelObjects);
            setTimeout(async () => {
                this.endGame();
            }, 10000);
        } catch (err) {
            socket.emit('error', 'Ошибка запуска игры');
        }
    }

    endGame() {
        try {
            this.stopUpdateCycle()
            //const playersScope = this.levelService.getStat();
            this.io.emit('endRound');
            setTimeout(async () => {
                await this.startGame();
            }, 1000);
        } catch (err) {
            socket.emit('error', 'Ошибка запуска игры');
        }
    }

    async updateCycle(gameObjects) {
        try {
            if (this.gameState) {
                this.cycleTimer = setInterval(async () => {
                    await this.playerService.updatePlayersPosition(this.roomName, gameObjects);
                    await this.levelService.updateLevel(this.players, this.levelObjects);
                    await this.playerService.updateHealth(this.players);
                    await this.levelService.updateScore(this.level);
                    this.io.emit('gameUpdate', this.players, this.level);
                    this.io.emit('levelScore', this.levelService.getLevelScore());
                }, 1000 / 60);
            }
        } catch (err) {
            socket.emit('error', 'Ошибка игрового цикла');
        }
    }

    stopUpdateCycle() {
        if (this.cycleTimer) {
            clearInterval(this.cycleTimer);
            this.cycleTimer = null;
        }
    }

    async resetGameData() {
        this.playerService.resetPlayersData();
        await this.levelService.resetLevelData();
        this.players = this.playerService.players;
        this.levelObjects = this.levelService.levelObjects;
        this.level = this.levelService.levelMap;
    }
}

module.exports = GameController;
