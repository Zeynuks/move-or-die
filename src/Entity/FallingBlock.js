const KillingBlock = require("./KillingBlock");

class FallingBlock extends KillingBlock {
    constructor(x, y, size) {
        super(x, y, size);
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
}

module.exports = FallingBlock;
