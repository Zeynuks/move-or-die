const Block = require("./Block");

class KillingBlock extends Block {
    constructor(x, y, size) {
        super(x, y, size, 'KillingBlock.png');
    }

    getGrid() {
        const gridX = Math.floor(this.x / 50);
        const gridY = Math.floor(this.y / 50);
        return [
            [gridY, gridX],
            [gridY - 1, gridX],
            [gridY + 1, gridX],
            [gridY, gridX - 1],
            [gridY, gridX + 1],
            [gridY - 1, gridX - 1],
            [gridY - 1, gridX + 1],
            [gridY + 1, gridX - 1],
            [gridY + 1, gridX + 1]
        ];
    }
}

module.exports = KillingBlock;
