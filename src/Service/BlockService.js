// src/Controller/PlayerController.js

const blockService = require('../Service/BlockService');

exports.initialize = (io) => {
   
};

exports.update = () => {
    blockService.update(socket);
};

exports.getPlayers = () => {
    return blockService.getPlayers();
};
