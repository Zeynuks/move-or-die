const playerService = require('./PlayerService');
const MapService = require('./MapService');
const Block = require("../Entity/Block");
const MapRepository = require("../Repository/MapRepository");
let coordArray = [[6, 4], [23, 4], [4, 15], [25, 15]]

class FallingBlocksService {
    constructor() {
        this.levelMap = [];
        this.levelName = 'FallingBlocks';
        this.mapRepository = new MapRepository();
        this.size = 50;
    }

    async downloadLevelMap() {
        try {
            const map = await this.mapRepository.findMapByLevelName(this.levelName);
            this._setMap(map);
            console.log('Map downloaded');
            return this.levelMap;
        } catch (error) {
            console.error('Ошибка:', error);
        }
    }

    _setMap(map) {
        this.levelMap = [];
        for(let i = 0; i < map.length; i++){
            let col = map[i];
            for(let j = 0; j < col.length; j++) {
                if (map[i][j] === 'X') {
                    this.levelMap.push(new Block(j * this.size, i * this.size, this.size));
                }
            }
        }
    }

    getLevelMap(map) {
        return this.levelMap;
    }
}

module.exports = FallingBlocksService;