const LevelService = require("../LevelService");
class LevelColorService extends LevelService {
    constructor() {
        super();
        this.levelName = 'ColorLevel';
        this.coloredblocks = {};
    }

    getStat() {
        let red = this.levelMap.filter(block => block._color === 'red').length;
        let blue = this.levelMap.filter(block => block._color === 'blue').length;
        let green = this.levelMap.filter(block => block._color === 'green').length;
        let orange = this.levelMap.filter(block => block._color === 'orange').length;
        let purple = this.levelMap.filter(block => block._color === 'purple').length;
        this.coloredblocks = {red: red, blue: blue, green: green, orange: orange, purple: purple}
    }

    getColoredBlocks() {
        return this.coloredblocks;
    }

    // Раскраска блоков при приближении
    paintBlock(player, cellsToCheck, objects) {
        for (let [y, x] of cellsToCheck) {
            if (objects[y] && objects[y][x]) {
                for (let obj of objects[y][x]) {
                    let proximity = this.checkProximity(player, obj);
                    if (proximity) {
                        obj.color = player.color;
                        console.log(obj.color)
                    }
                }
            }
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

    updateLevel(players, objects) {
        this.getStat();
        Object.values(players).forEach(player => {
            this.paintBlock(player, player.getGrid(), objects);
            this.checkCellsCollision(player, player.getGrid(), objects);
        });
    }
}

module.exports = LevelColorService;