const playerController = require('./PlayerController');
const gameObjectController = require('./GameObjectController');

exports.initialize = (io) => {
    playerController.initialize(io);
};

exports.update = () => {
    playerController.update();
};

exports.getState = () => {
    return {
        players: playerController.getPlayers(),
        gameObjects: gameObjectController.getGameObjects()
    };
};
