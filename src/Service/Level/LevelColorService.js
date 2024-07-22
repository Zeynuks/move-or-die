const LevelService = require("../LevelService");

class LevelColorService extends LevelService {
    constructor(io) {
        super(io);
        this.levelName = 'ColorLevel';
    }

    paintBlock(player, cellsToCheck) {
        for (let [y, x] of cellsToCheck) {
            if (this.levelObjects[y] && this.levelObjects[y][x]) {
                if (this.checkProximity(player, this.levelObjects[y][x][0])) {
                    this.levelObjects[y][x][0].color = player.color;
                }
            }
        }
    }

    updateLevelData(players) {
        Object.values(players).forEach(player => {
            if (player.statement) {
                this.paintBlock(player, player.getGrid());
            }
            this.checkCellsCollision(player, player.getGrid(), this.levelObjects);
        });
    }

    updateScore(players) {
        Object.values(players).forEach(player => {
            this.levelScore[player.color] = 0;
            this.levelObjects.forEach(row => {
                row.forEach(block => {
                    if (block[0].color === player.color) {
                        this.levelScore[player.color] += 1;
                    }
                });
            });
        });
    }
}

module.exports = LevelColorService;