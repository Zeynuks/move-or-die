const LevelService = require("../LevelService");

class BombTagService extends LevelService {
    constructor(io) {
        super(io);
        this.levelName = 'BombTag';
        this.bombState = false;
        this.bombPlayer = null;
        this.bombTimer = null;
        this.lastBombTime = null;
        this.isEnd = false;
    }

    // Раскраска блоков при приближении
    bombTransfer(player, currentTime) {
        if (!player.statement) return;
        if (this.checkProximity(this.bombPlayer, player) && currentTime - this.lastBombTime > 1000) {
            this.bombPlayer.active = false;
            player.active = true;
            this.bombPlayer = player;
            this.setBombTimer();
        }
    }

    setBombTimer() {
        clearTimeout(this.bombTimer);
        this.lastBombTime = Date.now();
        this.bombTimer = setTimeout(() => {
            if (!this.bombPlayer || !this.bombPlayer.statement || this.isEnd) return;
            this.io.emit('explode', {x: this.bombPlayer.x, y: this.bombPlayer.y, color: this.bombPlayer.color});
            this.bombPlayer.active = false;
            this.bombPlayer.health = 0;
            this.bombPlayer.statement = false;
        }, 5000)
    }

    setBombPlayer(players) {
        if (!this.bombState || (this.bombPlayer && !this.bombPlayer.statement)) {
            this.bombState = true;
            this.bombPlayer = this.getRandomAlivePlayer(players);
            if (this.bombPlayer) {
                this.bombPlayer.active = true;
                this.setBombTimer();
            }
        }
    }

    updateLevelData(players) {
        let currentTime = Date.now()
        this.setBombPlayer(players);
        Object.values(players).forEach(player => {
            if (!player.statement) player.active = false;
            if (this.bombPlayer && this.bombPlayer !== player && this.bombPlayer.active) {
                this.bombTransfer(player, currentTime)
            }
            this.checkCellsCollision(player, player.getGrid(), this.levelObjects);
        });
    }

    updateScore(players) {
        Object.values(players).forEach(player => {
            if (player.statement) {
                this.levelScore[player.color] += 1;
            }
        });
    }

    getRandomAlivePlayer = (players) => {
        const keys = Object.keys(players);
        const filteredKeys = keys.filter(key => players[key].statement);
        if (!filteredKeys) return;
        const randomIndex = Math.floor(Math.random() * filteredKeys.length);
        return players[filteredKeys[randomIndex]];
    };
}

module.exports = BombTagService;