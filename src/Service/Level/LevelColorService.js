const LevelService = require("../LevelService");
class LevelColorService extends LevelService {
    constructor() {
        super();
        this.levelName = 'ColorLevel';
        this.coloredblocks = {};
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
        let blue =  objects.filter(block => block.color === 'blue').length;
        let green = objects.filter(block => block.color === 'green').length;
        let yellow = objects.filter(block => block.color === 'orange').length;
        let purple = objects.filter(block => block.color === 'purple').length;
        this.coloredblocks = {blue: blue, green: green, yellow: yellow, purple: purple}
    }

    getStat() {
        const sortedColoredBlocks = Object.entries(this.coloredblocks)
            .sort((a, b) => b[1] - a[1])
            .reduce((result, [key, value]) => ({ ...result, [key]: value }), {});

        // Начисляем баллы
        let bonus = 5;
        const updatedSortedColoredBlocks = {};
        for (const color in sortedColoredBlocks) { // Проходим по ключам объекта
            if (sortedColoredBlocks[color] !== 0) { // Проверяем, что количество блоков не равно 0
                updatedSortedColoredBlocks[color] = bonus; // Создаем новый объект с измененными значениями
                bonus--;
            }
        }

        return updatedSortedColoredBlocks;
    }

    getLevelScore() {
        return this.coloredblocks
    }
}

module.exports = LevelColorService;