const GameService = require("../Service/GameService");

class GameController {
    constructor(io, roomRepository, services) {
        this.io = io;
        this.gameTime = 60000;
        this.gameState = {};
        this.roomService = services.roomService;
        this.gameService = services.gameService;
        this.playerService = services.playerService;
    }

    // update(roomName, eventData) {
    //     const room = this.gameService.handleGameEvent(roomName, socket.ip, eventData);
    //     if (room) {
    //         this.io.to(roomName).emit('gameStateU
    //         pdate', room);
    //     }
    // }

    startTimer(roomName) {
        const startGame = () => {
            this.gameState = 'active';
            this.timer = setTimeout(endGame.bind(this), this.gameTime);
        };

        const endGame = function() {
            clearTimeout(this.timer);
            this.gameState = 'inactive';
            console.log('Game over!');
        };

        startGame();
    }

        updateState(roomName, gameObjectsGrid) {
        this.playerService.updatePlayersPosition(roomName, gameObjectsGrid);
        const playersData = this.playerService.getPlayersData();
        this.io.to(roomName).emit('gameStateUpdate', playersData);
        // this.io.of('/game').emit('gameStateUpdate', players);
    }
}

module.exports = GameController;
