const LevelService = require("../LevelService");
class LevelColorService extends LevelService {
    constructor(io) {
        super(io);
        this.levelName = 'ColorLevel';
        this.coloredblocks = {};
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
        let blue =  this.levelObjects.filter(block => block.color === 'blue').length;
        let green = this.levelObjects.filter(block => block.color === 'green').length;
        let yellow = this.levelObjects.filter(block => block.color === 'yellow').length;
        let purple = this.levelObjects.filter(block => block.color === 'purple').length;
        this.coloredblocks = {blue: blue, green: green, yellow: yellow, purple: purple}
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