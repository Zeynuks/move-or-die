const playerService = require('./PlayerService');
const MapService = require('./MapService');
let coordArray = [[6, 4], [23, 4], [4, 15], [25, 15]]

class FallingBlocksService {
    constructor() {
        this.levelMap = [];
        this.levelName = 'FallingBlocks';
        this.mapService = MapService;
    }

    async downloadLevelMap() {
        try {
            this.levelMap = await this.mapService.downloadMap(this.levelName);
            console.log('Загрузил');
        }
        catch (error) {
            console.error('Ошибка:', error);
        }
    }

    getLevelMap(map) {
        return this.levelMap;
    }
}

module.exports = new FallingBlocksService();