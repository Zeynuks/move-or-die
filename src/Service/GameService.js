const PlayerService = require("./PlayerService");

class GameService {
    constructor(io, roomRepository) {
        this.io = io;
        this.gameState = {};
        this.playerService = new PlayerService(roomRepository);
    }

    handleGameEvent(roomName, clientIp, eventData) {
        const room = this.gameState[roomName];
        if (!room) return;

        // Обработка событий: обновление состояния игроков
        room.players.forEach(player => {
            if (player.ip === clientIp) {
                // Обновление состояния игрока на основе eventData
                player.x = eventData.x;
                player.y = eventData.y;
                // и т.д.
            }
        });

        return room;
    }

    addPlayerToGame(roomName, player) {
        if (!this.gameState[roomName]) {
            this.gameState[roomName] = {
                players: {},
                startTime: null,
                duration: 60000, // Продолжительность игры в миллисекундах (например, 1 минута)
                timer: null
            };
        }
        this.gameState[roomName].players[player.id] = {
            info: player,
            ready: false
        };
    }

    setPlayerReady(roomName, socketIp, callback) {
        let game = this.gameState[roomName];
        if (game) {
            if (game.players[socketIp]) {
                game.players[socketIp].ready = true;
                const allReady = Object.values(game.players).every(player => player.ready);
                callback(null, allReady);
            } else {
                callback(new Error('Player not found'));
            }
        } else {
            callback(new Error('Game not found'));
        }
    }
    //
    // removePlayerFromGame(roomName, socketIp, callback) {
    //     const game = this.gameState[roomName];
    //     if (game) {
    //         game.players = game.players.filter(player => player.id !== socketIp); // Изменено
    //         callback(null, game);
    //     } else {
    //         callback(new Error('Game not found'));
    //     }
    // }

    // endGame(roomName) {
    //     const game = this.gameState[roomName];
    //     if (game) {
    //         this.io.to(roomName).emit('gameEnded', game);
    //         // Дополнительная логика завершения игры, например, сохранение результатов
    //         clearTimeout(game.timer);
    //         delete this.gameState[roomName];
    //     }
    // }
}

module.exports = GameService;
