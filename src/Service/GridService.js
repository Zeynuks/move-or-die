// src/Service/GridService.js

const Grid = require('../Entity/Grid');

class GridService {
    constructor() {
        this.grid = new Grid(500, 500, 20);
        this.gridSize = this.grid.getSize();
        this.playersGrid = [];
        this.objectsGrid = [];
    }

    clear() {
        this.grid.clear();
    }

    // addObject(obj) {
    //     const gridX = Math.floor(obj.x / this.grid.getSize());
    //     const gridY = Math.floor(obj.y / this.grid.getSize());
    //
    //     if (!this.objectsGrid[gridY]) this.objectsGrid[gridY] = [];
    //     if (!this.objectsGrid[gridY][gridX]) this.objectsGrid[gridY][gridX] = [];
    //     this.objectsGrid[gridY][gridX].push(obj);
    // }

    addObject(obj) {

    }

    updatePlayerGrid(player) {
        const gridX = Math.floor(player.x / this.grid.getSize());
        const gridY = Math.floor(player.y / this.grid.getSize());

        if (!this.grid.playersGrid[gridY]) this.grid.playersGrid[gridY] = [];
        if (!this.grid.playersGrid[gridY][gridX]) this.grid.playersGrid[gridY][gridX] = [];

        this.grid.setPlayersGrid(player, gridY, gridX);
    }

    getGrid() {
        return {playersGrid: this.grid.getPlayersGrid(), objectsGrid: this.grid.getObjectsGrid()};
    }

}

module.exports = new GridService();
