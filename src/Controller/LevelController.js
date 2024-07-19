const levelColorService = require('../Service/Level/LevelColorService');
const fallingBlocksService = require('../Service/Level/FallingBlocksService');
const bombTagService = require('../Service/Level/BombTagService');
const BaseController = require("./BaseController");
const LEVEL_ARRAY = [levelColorService, fallingBlocksService, bombTagService];

class LevelController extends BaseController {
    constructor(io, roomName) {
        super(io, roomName);
    }

    getLevelList() {
        const shuffled = LEVEL_ARRAY.sort(() => 0.5 - Math.random());
        const result = [];
        while (result.length < 10) {
            result.push(...shuffled);
        }
        return result.slice(0, 10);
    }
}

module.exports = LevelController;