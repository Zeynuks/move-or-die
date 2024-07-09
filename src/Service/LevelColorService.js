// src/Service/LevelColorService.js
const Block = require('../Entity/Block');
const MapRepository = require("../Repository/MapRepository");
const LevelService = require("./LevelService");
let coordArray = [[6, 4], [23, 4], [4, 15], [25, 15]]

class LevelColorService extends LevelService {
    constructor() {
        super();
        this.levelName = 'ColorLevel';
        this.coloredblocks = {};
    }

    countColoredBlocks() {
        let red = this.levelMap.filter(block => block._color === 'red').length;
        let blue = this.levelMap.filter(block => block._color === 'blue').length;
        let green = this.levelMap.filter(block => block._color === 'green').length;
        let orange = this.levelMap.filter(block => block._color === 'orange').length;
        let purple = this.levelMap.filter(block => block._color === 'purple').length;
        //console.log('red:', red, 'blue:', blue, 'green:', green, 'orange:', orange, 'purple:', purple);
        this.coloredblocks = {red: red, blue: blue, green: green, orange: orange, purple: purple}
    }

    getColoredBlocks() {
        return this.coloredblocks;
    }

    updateLevel() {
        this.countColoredBlocks();
    }
}

module.exports = LevelColorService;