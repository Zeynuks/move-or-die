// src/Service/LevelColorService.js

const playerService = require('./PlayerService');
const MapService = require('./MapService');
let coordArray = [[6, 4], [23, 4], [4, 15], [25, 15]]

class LevelColorService {
    constructor() {
        this.levelMap = [];
        this.levelName = 'ColorLevel';
        this.redBlocks = 0;
        this.blueBlocks = 0;
        this.greenBlocks = 0;
        this.orangeBlocks = 0;
        this.purpleBlocks = 0;
        this.mapService = MapService;
        //this.players = playerService.getPlayers();
    }

    // setPlayersCoordinates() {
    //     let coordInd = Math.floor(Math.random() * coordArray.length);
    //     let coord = coordArray[coordInd];
    //     console.log(playerService.getPlayers());
    //     coordArray.splice(coordInd, 1);
    //     for (let player in this.players) {
    //         player.setCoordinates(coord[0] * mapService.getSize(), coord[1] * mapService.getSize());
    //         console.log(coord[0] * mapService.getSize(), coord[1] * mapService.getSize())
    //     }
    // }

    async downloadLevelMap() {
        try {
            this.levelMap = await this.mapService.downloadMap(this.levelName);
            //console.log('Map: ', this.levelMap, ')))');
        } catch (error) {
            console.error('Ошибка:', error);
        }
    }


    getLevelMap(map) {
        return this.levelMap;
    }

    countColoredBlocks() {
        this.redBlocks = 0;
        this.blueBlocks = 0;
        this.greenBlocks = 0;
        this.orangeBlocks = 0;
        this.purpleBlocks = 0;
        this.levelMap.forEach(block => {
            switch (block.getColor()) {
                case 'red':
                    this.redBlocks += 1;
                    break;
                case 'blue':
                    this.blueBlocks += 1;
                    break;
                case 'green':
                    this.greenBlocks += 1;
                    break;
                case 'orange':
                    this.orangeBlocks += 1;
                    break;
                case 'purple':
                    this.purpleBlocks += 1;
                    break;
                default:
                    break;
                }
        });
    }

    getColoredBlocks() {
        //console.log('red: ', this.redBlocks, 'blue: ', this.blueBlocks, 'green: ', this.greenBlocks, 'orange: ', this.orangeBlocks, 'purple: ', this.purpleBlocks)
        return {red: this.redBlocks, blue: this.blueBlocks, green: this.greenBlocks, orange: this.orangeBlocks, purple: this.purpleBlocks}
    }
}

module.exports = new LevelColorService();
