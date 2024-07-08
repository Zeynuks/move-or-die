const GameService = require("../Service/GameService");

class GameController {
    constructor(io, roomRepository, services) {
        this.io = io;
        this.gameTime = 60000;
        this.timer = null;
        this.timerHealth = null;
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
            this.timerHealth = setInterval(() => {
                this.playerService.decreasePlayersHealth()
            }, 100)
        };

        const endTimer = () => {
            this.gameState = 'inactive';
            clearInterval(this.timerHealth);
            console.log('Game over!');
            console.log(this.gameState)
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
