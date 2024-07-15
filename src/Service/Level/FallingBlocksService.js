const LevelService = require("../LevelService");
const FallingBlock = require("../../Entity/FallingBlock");
const GRAVITY = 0.08;

class FallingBlocksService extends LevelService {
    constructor() {
        super();
        this.levelName = 'FallingBlocks';
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
                this.playerDeath(player, player.getGrid(), this.getObjectsGrid(this.specialObjects));
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
            this.specialObjects.push(new FallingBlock(x + this.size, y -this.size, this.size));
        }
    }

    fallingBlocksMovement() {
        for (let i = 0; i < this.specialObjects.length; i++){
            if (this.specialObjects[i].y <= this.size) {
                this.specialObjects[i].vy = 5;
            } else {
                this.specialObjects[i].vy += GRAVITY;
            }
            this.specialObjects[i].y += this.specialObjects[i].vy;
            if (this.specialObjects[i].y >= 800)  {
                this.specialObjects[i].y = -this.size + Math.floor(Math.random() * -1500);
            }
        }
    }

    getSpecialObjects() {
        return this.specialObjects;
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