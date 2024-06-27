// src/Controller/GameObjectController.js

const gameObjectService = require('../Service/GameObjectService');



exports.getGameObjects = () => {
    return gameObjectService.getGameObjects();
};

exports.getGameObjectsGrid = () => {
    return gameObjectService.getGameObjectsGrid(Number(gridSize));
};

exports.updateGameObjects = () => {
    gameObjectService.updateGameObjects();
};
