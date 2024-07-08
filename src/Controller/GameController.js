const GameService = require("../Service/GameService");

class GameController {
    constructor(io, roomRepository, services) {
        this.io = io;
        this.gameTime = 10000;
        this.timer = null;
        this.gameState = 'inactive';
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


    startGame() {
        const startTimer = () => {
            this.gameState = 'active';
            this.timer = setTimeout(endTimer, this.gameTime);
            console.log(this.gameState);
        };

        const endTimer = () => {
            this.gameState = 'inactive';
            console.log('Game over!');
            console.log(this.gameState);
        };

        startTimer();
    }
    updateState(roomName, gameObjectsGrid) {
        if (this.gameState === 'active') {
            this.playerService.updatePlayersPosition(roomName, gameObjectsGrid);
            const playersData = this.playerService.getPlayersData();

            this.io.to(roomName).emit('gameStateUpdate', playersData);
            // this.io.of('/game').emit('gameStateUpdate', players);
        }
    }
}

module.exports = GameController;
