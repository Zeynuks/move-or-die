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
        const state = this.playerService.isStart(socket.handshake.address);
        if (state) {
            await this.levelService.downloadLevelMap('ColorLevel');
            // const spawnpoints = await this.levelService.getPlayersSpawnpoints();
            // await this.playerService.setSpawnpoints();
            await this.levelService.getMapGrid(this.levelService.size);
            this.startGame()
            console.log('START:  ', state);
        }
    }

    startGame() {
        this.gameState = true
        this.resetGameData();
        this.io.emit('startRound', this.players, this.level);
        this.updateCycle(this.levelObjects);
        setTimeout(async () => {
            this.endGame();
        }, 10000);
    }

    endGame() {
        this.gameState = false
        this.stopUpdateCycle()
        const playersScope = this.levelService.countColoredBlocks();
        this.io.emit('endRound', playersScope);
        setTimeout(async () => {
            this.startGame();
        }, 1000);
    }

    updateCycle(gameObjects) {
        if (this.gameState) {
            this.cycleTimer = setInterval(() => {
                this.playerService.updatePlayersPosition(this.roomName, gameObjects);
                this.levelService.updateLevel();
                this.players = this.playerService.players;
                this.levelObjects = this.levelService.levelObjects;
                this.io.emit('gameUpdate', this.players, this.levelObjects);
            }, 1000 / 60);
        }
    }

    stopUpdateCycle() {
        if (this.cycleTimer) {
            clearInterval(this.cycleTimer);
            this.cycleTimer = null; // Сброс идентификатора интервала
        }
    }

    resetGameData() {
        this.playerService.resetPlayersData();
        this.levelService.resetLevelData();
        this.players = this.playerService.players;
        this.levelObjects = this.levelService.levelObjects;
        this.level = this.levelService.levelMap;
    }
}

module.exports = GameController;
