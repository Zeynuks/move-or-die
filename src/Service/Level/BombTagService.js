const LevelService = require("../LevelService");

class BombTagService extends LevelService {
    constructor() {
        super();
        this.levelName = 'BombTag';
        this.bombState = false;
        this.bombPlayer = null;
        this.bombTimer = null;
        this.io = null;
        this.isEnd = false;
        this.levelScore = {
            blue: 0,
            green: 0,
            yellow: 0,
            purple: 0,
        }
    }

    checkProximity(player, obj) {
        const proximityDistance = 2; // Расстояние до объекта для изменения цвета
        return (
            player.x < obj.x + obj.size + proximityDistance &&
            player.x + player.size > obj.x - proximityDistance &&
            player.y < obj.y + obj.size + proximityDistance &&
            player.y + player.size > obj.y - proximityDistance
        );
    }

    // Раскраска блоков при приближении
    bombTransfer(player, player2) {
        if (!player2.statement) return;
        if (this.checkProximity(player, player2)) {
            this.bombPlayer.active = false;
            player2.active = true;
            setTimeout(() => {
                this.bombPlayer = player2;
                this.setBombTimer();
            }, 1000)
        }
    }

    setBombTimer() {
        clearTimeout(this.bombTimer);
        this.bombTimer = setTimeout(() => {
            if (!this.bombPlayer || !this.bombPlayer.statement || !this.isEnd) return;
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

    updateLevel(players, objects, io) {
        if (!this.io) this.io = io;
        this.setBombPlayer(players);
        Object.values(players).forEach(player => {
            if (!player.statement) player.active = false;
            if (this.bombPlayer && this.bombPlayer !== player && this.bombPlayer.active) {
                this.bombTransfer(this.bombPlayer, player)
            }
            this.checkCellsCollision(player, player.getGrid(), objects);
        });
    }

    updateScore(objects, players) {
        Object.values(players).forEach(player => {
            if (player.statement) {
                this.levelScore[player.color] += 0.1;
            }
        });
    }

    getStat() {
        const sortedScore = Object.entries(this.levelScore)
            .sort((a, b) => b[1] - a[1])
            .reduce((result, [key, value]) => ({ ...result, [key]: value }), {});

        let count = 0;
        let bonus =  [5, 2, 1, 0]
        const updatedSortedScore = {};
        for (const color in sortedScore) {
            if (sortedScore[color] !== 0) {
                updatedSortedScore[color] = bonus[count];
                count++;
            }
        }

        return updatedSortedScore;
    }

    getLevelScore() {
        return {
            blue: Math.round(this.levelScore.blue),
            green: Math.round(this.levelScore.green),
            yellow: Math.round(this.levelScore.yellow),
            purple: Math.round(this.levelScore.purple)
        }
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