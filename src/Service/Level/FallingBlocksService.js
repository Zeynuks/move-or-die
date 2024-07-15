const LevelService = require("../LevelService");
const FallingBlock = require("../../Entity/FallingBlock");
const GRAVITY = 0.08;

class FallingBlocksService extends LevelService {
    constructor() {
        super();
        this.levelName = 'FallingBlocks';
        this.fallingBlocks = [];
        this.complexity = 26;
        this.size = 50;
        this.setFallingBlocks();
        this.levelScore = {
            blue: 0,
            green: 0,
            yellow: 0,
            purple: 0,
        }
    }

    playerDeath(player, cellsToCheck, objects) {
        for (let [y, x] of cellsToCheck) {
            if (objects[y] && objects[y][x]) {
                for (let obj of objects[y][x]) {
                    let proximity = this.checkProximity(player, obj);
                    if (proximity) {
                        player.health = 0;
                    }
                }
            }
        }
    }

    checkProximity(player, obj) {
        const proximityDistance = 1; // Расстояние до объекта для изменения цвета
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
                this.playerDeath(player, player.getGrid(), this.getObjectsGrid(this.fallingBlocks));
            }
            this.checkCellsCollision(player, player.getGrid(), objects);
        });
        this.fallingBlocksMovement();
    }

    setFallingBlocks() {
        let x = -this.size;
        for (let i = 0; i < this.complexity; i++){
            x += this.size;
            let y = Math.floor(Math.random() * -1500);
            this.fallingBlocks.push(new FallingBlock(x + this.size, y -this.size, this.size));
        }
    }

    fallingBlocksMovement() {
        for (let i = 0; i < this.fallingBlocks.length; i++){
            if (this.fallingBlocks[i].y <= this.size) {
                this.fallingBlocks[i].vy = 5;
            } else {
                this.fallingBlocks[i].vy += GRAVITY;
            }
            this.fallingBlocks[i].y += this.fallingBlocks[i].vy;
            if (this.fallingBlocks[i].y >= 800)  {
                this.fallingBlocks[i].y = -this.size + Math.floor(Math.random() * -1500);
            }
        }
    }

    getSpecialObjects() {
        return this.fallingBlocks;
    }

    updateScore(objects) {
        //
    }

    getStat(players) {
        Object.values(players).forEach(player => {
            if (player.statement) {
                this.levelScore[player.color] = 5;
            }
        });
        return this.levelScore;
    }

    getLevelScore() {
        return {blue: 0, green: 0, yellow: 0, purple: 0}
    }
}

module.exports = FallingBlocksService;