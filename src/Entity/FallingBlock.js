const Block = require("./Block");

class FallingBlock extends Block {
    constructor() {
        super();
        this._vx = 0;
        this._vy = 0;
    }

    get vx() {
        return this._vx;
    }

    get vy() {
        return this._vy;
    }

    set vx(value) {
        this._vx = value;
    }

    set vy(value) {
        this._vy = value;
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

module.exports = FallingBlock;
