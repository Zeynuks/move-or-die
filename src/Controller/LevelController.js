// src/Controller/LevelController.js
const levelColorService = require('../Service/LevelColorService');
const fallingBlocksService = require('../Service/FallingBlocksService');
const LEVEL_ARRAY = ['ColorLevel']

class LevelController {
    constructor(io, roomName, services) {
        this.io = io;
        this.roomService = services.roomService;
        this.gameService = services.gameService;
        this.playerService = services.playerService;
        this.levelService = services.levelService;
        this.levelId = 0;
        this.levelMap = [];
        this.levelQueue = [];
    }

    changeLevel() {
        this.levelId = Math.floor(Math.random() * LEVEL_ARRAY.length);
        console.log('LEVEL:     ', LEVEL_ARRAY[this.levelId])
        return this.levelId;
    }

    getCurrentLevel() {
        return levelColorService;
    }


    async getLevel(levelId) {
        switch (levelId) {
            case 0:
                this.levelMap = [];
                await levelColorService.downloadLevelMap();
                this.levelMap = levelColorService.getLevelMap();
                break;
            case 1:
                this.levelMap = [];
                await fallingBlocksService.downloadLevelMap();
                this.levelMap = fallingBlocksService.getLevelMap();
                break;
            default:
                break;
        }
    }

    sendLevelMap() {
        this.io.emit('levelMap', this.levelMap)
    }

    updateLevel() {
        switch (this.levelId) {
            case 0:
                levelColorService.countColoredBlocks();
                this.io.emit('levelScore', levelColorService.getColoredBlocks())
                break;
            default:
                break;
        }
    }
}

module.exports = LevelController;