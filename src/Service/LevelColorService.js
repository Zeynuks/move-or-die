// src/Service/LevelColorService.js

const Block = require('../Entity/Block');
const MapRepository = require("../Repository/MapRepository");
let coordArray = [[6, 4], [23, 4], [4, 15], [25, 15]]

class LevelColorService {
    constructor() {
        this.levelMap = [];
        this.levelName = 'ColorLevel';
        this.mapRepository = new MapRepository();
        this.size = 50;
        this.coloredblocks = {};
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

    countColoredBlocks() {
        let red = this.levelMap.filter(block => block._color === 'red').length;
        let blue= this.levelMap.filter(block => block._color === 'blue').length;
        let green = this.levelMap.filter(block => block._color === 'green').length;
        let orange = this.levelMap.filter(block => block._color === 'orange').length;
        let purple= this.levelMap.filter(block => block._color === 'purple').length;
        //console.log('red:', red, 'blue:', blue, 'green:', green, 'orange:', orange, 'purple:', purple)
        this.coloredblocks = {red: red, blue: blue, green: green, orange: orange, purple: purple}
    }

    getColoredBlocks() {
        return this.coloredblocks;
    }
}

module.exports = new LevelColorService();
