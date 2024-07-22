const LevelService = require("../LevelService");
const FallingBlock = require("../../Entity/FallingBlock");
const GRAVITY = 0.08;

class FallingBlocksService extends LevelService {
    constructor(io) {
        super(io);
        this.levelName = 'FallingBlocks';
        this.complexity = 26;
        this.size = 50;
        this.setFallingBlocks();
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

    updateLevelData(players) {
        Object.values(players).forEach(player => {
            if (player.statement) {
                this.playerDeath(player, player.getGrid(), this.getObjectsGrid(this.specialObjects));
            }
            this.checkCellsCollision(player, player.getGrid(), this.levelObjects);
        });
        this.fallingBlocksMovement();
    }

    setFallingBlocks() {
        let x = -this.size;
        for (let i = 0; i < this.complexity; i++) {
            x += this.size;
            let y = Math.floor(Math.random() * -1500);
            this.specialObjects.push(new FallingBlock(x + this.size, y - this.size, this.size));
        }
    }

    fallingBlocksMovement() {
        for (let i = 0; i < this.specialObjects.length; i++) {
            if (this.specialObjects[i].y <= this.size) {
                this.specialObjects[i].vy = 5;
            } else {
                this.specialObjects[i].vy += GRAVITY;
            }
            this.specialObjects[i].y += this.specialObjects[i].vy;
            if (this.specialObjects[i].y >= 800) {
                this.specialObjects[i].y = -this.size + Math.floor(Math.random() * -1500);
            }
        }
    }

    updateScore(players) {
        Object.values(players).forEach(player => {
            if (player.statement) {
                this.levelScore[player.color] += 1;
            }
        });
    }
}

module.exports = FallingBlocksService;