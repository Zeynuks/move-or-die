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
    }

    async isStart(socket) {
        try {
            const state = this.playerService.isStart(socket.handshake.address);
            if (state) {
                await this.levelService.downloadLevelMap('ColorLevel');
                // const spawnpoints = await this.levelService.getPlayersSpawnpoints();
                // await this.playerService.setSpawnpoints();
                await this.levelService.getMapGrid(this.levelService.size);
                await this.startGame()
            }
        } catch (err) {
            socket.emit('error', 'Ошибка подготовки к игре');
        }
    }

    async startGame() {
        try {
            this.gameState = true
            await this.resetGameData();
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
            this.gameState = false
            this.stopUpdateCycle()
            const playersScope = this.levelService.getStat();
            this.io.emit('endRound', playersScope);
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
                    this.io.emit('gameUpdate', this.players, this.level);
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
        this.levelService.resetLevelData();
        this.players = this.playerService.players;
        this.levelObjects = this.levelService.levelObjects;
        this.level = this.levelService.levelMap;
    }
}

module.exports = GameController;
