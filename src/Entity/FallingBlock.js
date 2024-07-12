const KillingBlock = require("./KillingBlock");

class FallingBlock extends KillingBlock {
    constructor() {
        super();
        this._skin = 'killing-block.png'
    }
}

module.exports = FallingBlock;
