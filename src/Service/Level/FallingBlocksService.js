const LevelService = require("../LevelService");
const FallingBlock = require("../Entity/FallingBlock");
const GRAVITY = 0.5;

class FallingBlocksService extends LevelService {
    constructor() {
        super();
        this.levelName = 'FallingBlocks';
        this.fallingBlocks = {};
        this.complexity = 20;
        this.size = 50;
        this.setFallingBlocks();
        console.log(this.fallingBlocks);
    }

    updateLevel(players, objects) {
        Object.values(players).forEach(player => {
            this.checkCellsCollision(player, player.getGrid(), objects);
        });
        this.fallingBlocksMovement();
    }

    setFallingBlocks() {
        for (let i = 0; i < this.complexity; i++){
            let x = Math.floor(Math.random() * 1300);
            let y = Math.floor(Math.random() * -300);
            this.fallingBlocks.push(new FallingBlock(x * this.size, y * this.size, this.size));
        }
    }

    fallingBlocksMovement() {
        for (let i = 0; i < this.fallingBlocks.length; i++){
            this.fallingBlocks[i].vy += GRAVITY;
            this.fallingBlocks[i].y += this.fallingBlocks[i].vy;
            if (this.fallingBlocks[i].y >= 800)  {
                this.fallingBlocks.slice(i, 1);
            }
        }
    }

    getSpecialObjects() {
        return this.fallingBlocks;
    }

    updateScore(objects) {

    }

    getStat() {
        return {blue: 0, green: 0, yellow: 0, purple: 0}
    }

    getLevelScore() {
        return {blue: 0, green: 0, yellow: 0, purple: 0}
    }
}

module.exports = FallingBlocksService;