const MapRepository = require("../Repository/MapRepository");
const Block = require("../Entity/Block");

class LevelService {
    constructor() {
        this.mapRepository = new MapRepository();
        this.levelMap = [];
        this.size = 50;
        this.levelObjects = [];
    }

    async downloadLevelMap(levelName) {
        try {
            const map = await this.mapRepository.findMapByLevelName(levelName);
            this.setMap(map);
            console.log('Map downloaded');
        } catch (error) {
            console.error('Ошибка:', error);
        }
    }

    setMap(map) {
        try {
            this.levelMap = [];
            for (let i = 0; i < map.length; i++) {
                let col = map[i];
                for (let j = 0; j < col.length; j++) {
                    if (map[i][j] === 'X') {
                        this.levelMap.push(new Block(j * this.size, i * this.size, this.size));
                    }
                }
            }
        } catch (error) {
            throw new Error('Ошибка загрузки блоков в карту')
        }
    }


    async getMapGrid(gridSize) {
        this.levelObjects = [];
        this.levelMap.forEach(obj => {
            const gridX = Math.floor(obj.x / gridSize);
            const gridY = Math.floor(obj.y / gridSize);
            if (!this.levelObjects[gridY]) this.levelObjects[gridY] = [];
            if (!this.levelObjects[gridY][gridX]) this.levelObjects[gridY][gridX] = [];
            this.levelObjects[gridY][gridX].push(obj);
        });
    }

    resetLevelData() {
        this.downloadLevelMap('ColorLevel');
    }
}

module.exports = LevelService;