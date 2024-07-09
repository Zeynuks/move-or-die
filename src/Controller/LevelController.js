// src/Controller/LevelController.js
const levelColorService = require('../Service/Level/LevelColorService');
const fallingBlocksService = require('../Service/Level/FallingBlocksService');
const LevelService = require("../Service/LevelService");
const LEVEL_ARRAY = [levelColorService, fallingBlocksService]

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
        this.currLevel = null
    }

    changeLevel() {
        const shuffledArray = [...LEVEL_ARRAY].sort(() => 0.5 - Math.random());
        return shuffledArray.slice(0, 1); // Возвращаем первые count элементов
    }

    getCurrentLevel() {
        const [levelService] = this.changeLevel();
        this.currLevel = new levelService;
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
                console.log('this')
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