const levelColorService = require('../Service/Level/LevelColorService');
const fallingBlocksService = require('../Service/Level/FallingBlocksService');
const bombTagService = require('../Service/Level/BombTagService');
const BaseController = require("./BaseController");
const GAME_LENGTH = 10;
class LevelController extends BaseController {
    LEVEL_ARRAY = [this.constructLevelService(levelColorService), this.constructLevelService(fallingBlocksService), this.constructLevelService(bombTagService)];

    constructor(io, roomName) {
        super(io, roomName);
    }

    constructLevelService(service) {
        return new service(this.io);
    }

    getRandomOrder(array) {
        return array.sort(() => 0.5 - Math.random());
    }

    getLevelList() {
        const shuffled = this.getRandomOrder(this.LEVEL_ARRAY);
        const result = [];
        while (result.length < GAME_LENGTH) {
            result.push(...shuffled);
        }
        return result.slice(0, GAME_LENGTH);
    }
}

module.exports = LevelController;