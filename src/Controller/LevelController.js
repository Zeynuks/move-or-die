// src/Controller/LevelController.js

const levelColorService = require('../Service/LevelColorService');
const fallingBlocksService = require('../Service/FallingBlocksService');
const LEVEL_ARRAY = ['ColorLevel']

class LevelController {
    constructor(io, roomRepository, services) {
        this.io = io;
        this.roomService = services.roomService;
        this.gameService = services.gameService;
        this.playerService = services.playerService;
        this.levelId = 0;
        this.levelMap = [];
    }

    changeLevel() {
        this.levelId = Math.floor(Math.random() * LEVEL_ARRAY.length);
        console.log('LEVEL:     ', LEVEL_ARRAY[this.levelId])
        return this.levelId;
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

    sendLevelMap(roomName) {
        this.io.of('/game').emit('levelMap', this.levelMap)
    }

    getMapGrid(gridSize) {
        const grid = [];
        this.levelMap.forEach(obj => {
            const gridX = Math.floor(obj.x / gridSize);
            const gridY = Math.floor(obj.y / gridSize);
            if (!grid[gridY]) grid[gridY] = [];
            if (!grid[gridY][gridX]) grid[gridY][gridX] = [];
            grid[gridY][gridX].push(obj);
        });
        return grid;
    }

    updateLevel() {
        switch (0) {
            case 0:
                levelColorService.countColoredBlocks();
                levelColorService.getColoredBlocks();
                break;
            default:
                break;
        }
    }
}

module.exports = LevelController;