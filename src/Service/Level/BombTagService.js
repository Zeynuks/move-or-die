const LevelService = require("../LevelService");
class BombTagService extends LevelService {
    constructor() {
        super();
        this.levelName = 'BombTag';
        this.coloredblocks = {};
    }

    // Раскраска блоков при приближении
    paintBlock(player, cellsToCheck, objects) {
        for (let [y, x] of cellsToCheck) {
            if (objects[y] && objects[y][x]) {
                for (let obj of objects[y][x]) {
                    let proximity = this.checkProximity(player, obj);
                    if (proximity) {
                        console.log('touching')
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
        Object.values(players).forEach(player => {
            if (player.statement) {
                this.paintBlock(player, player.getGrid(), objects);
            }
            this.checkCellsCollision(player, player.getGrid(), objects);
        });
    }

    updateScore(objects) {

    }

    getStat() {

    }

    getLevelScore() {

    }
}

module.exports = BombTagService;