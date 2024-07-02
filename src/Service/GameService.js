const PlayerService = require("./PlayerService");

class GameService {
    constructor(io, roomRepository) {
        this.io = io;
        this.gameState = {}; // Хранение состояния игры для каждой комнаты
        this.playerService = new PlayerService(roomRepository);
    }

    startGame(socket, roomName, callback) {
        const game = this.gameState[roomName];
        if (game) {
            game.startTime = Date.now();
            game.timer = setTimeout(() => {
                this.endGame(roomName);
            }, game.duration);
            callback(null, roomName);
        } else {
            callback(new Error('Game not found'));
        }
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

    addPlayerToGame(roomName, socketId, userName, clientIp) {
        if (!this.gameState[roomName]) {
            this.gameState[roomName] = {
                players: [],
                startTime: null,
                duration: 60000, // Продолжительность игры в миллисекундах (например, 1 минута)
                timer: null
            };
        }
        //console.log(this.gameState)
        const game = this.gameState[roomName];
        let player = this.playerService.newPlayer(clientIp, userName, 0, 0, 50);
        player.color = this.playerService.randomColor();
        console.log(player.color)
        game.players.push(player);
    }

    setPlayerReady(roomName, socketIp, callback) {
        //console.log(roomName)
        console.log(this.gameState)
        const game = this.gameState[roomName];
        if (game) {
            const player = game.players.find(player => player.ip === socketIp);
            if (player) {
                player.ready = true;
                const allReady = game.players.every(player => player.ready);
            } else {
                callback(new Error('Player not found'));
            }
        } else {
            callback(new Error('Game not found'));
        }
    }
    
    removePlayerFromGame(roomName, socketIp, callback) {
        const game = this.gameState[roomName];
        if (game) {
            game.players = game.players.filter(player => player.id !== socketIp); // Изменено
            callback(null, game);
        } else {
            callback(new Error('Game not found'));
        }
    }

    endGame(roomName) {
        const game = this.gameState[roomName];
        if (game) {
            this.io.to(roomName).emit('gameEnded', game);
            // Дополнительная логика завершения игры, например, сохранение результатов
            clearTimeout(game.timer);
            delete this.gameState[roomName];
        }
    }
}

module.exports = GameService;
