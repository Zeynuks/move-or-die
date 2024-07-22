const LevelService = require("../LevelService");
class LevelColorService extends LevelService {
    constructor(io) {
        super(io);
        this.levelName = 'ColorLevel';
    }

    paintBlock(player, cellsToCheck, objects) {
        for (let [y, x] of cellsToCheck) {
            if (objects[y] && objects[y][x]) {
                for (let obj of objects[y][x]) {
                    let proximity = this.checkProximity(player, obj);
                    if (proximity) {
                        obj.color = player.color;
                    }
                }
            }
        }
    }

    updateLevelData(players) {
        Object.values(players).forEach(player => {
            if (player.statement) {
                this.paintBlock(player, player.getGrid(), this.levelObjects);
            }
            this.checkCellsCollision(player, player.getGrid(), this.levelObjects);
        });
    }

    updateScore(players) {
        Object.values(players).forEach(player => {
            if (player.statement) {
                this.levelScore[player.color] = this.levelObjects.filter(block => (block.color === player.color)).length;
            }
        });
    }

    getStat(players) {
        const sortedColoredBlocks = Object.entries(this.coloredblocks)
            .sort((a, b) => b[1] - a[1])
            .reduce((result, [key, value]) => ({ ...result, [key]: value }), {});

        let count = 0;
        let bonus = [5, 2, 1, 0]
        const updatedSortedColoredBlocks = {};
        for (const color in sortedColoredBlocks) {
            if (sortedColoredBlocks[color] !== 0) {
                updatedSortedColoredBlocks[color] = bonus[count];
                count++;
            }
        }
        return updatedSortedColoredBlocks;
    }

    getLevelScore() {
        return this.coloredblocks
    }
}

module.exports = LevelColorService;