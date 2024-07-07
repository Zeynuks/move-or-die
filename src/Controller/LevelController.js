// src/Controller/LevelController.js

const levelColorService = require('../Service/LevelColorService');
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
        return this.levelId;
    }

    async getLevel(levelId) {
        switch (levelId) {
        case 0:
            await levelColorService.downloadLevelMap()
            this.levelMap = levelColorService.getLevelMap();
            //console.log(this.levelMap)
            break;
        default:
            break;
        }
    }

    sendLevelMap(roomName) {
        this.io.emit('levelMap', this.levelMap)
        //this.io.of('/game').emit('levelMap', this.levelMap)
        //this.io.emit('hello')
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

    update() {

    }
}

module.exports = LevelController;