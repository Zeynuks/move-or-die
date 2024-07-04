const PlayerService = require("./PlayerService");

class GameService {
    constructor(io, roomRepository) {
        this.io = io;
        this.gameState = {}; // Хранение состояния игры для каждой комнаты
        this.playerService = new PlayerService(roomRepository);
    }

    handleMovePlayer(roomName, clientIp, moveData) {
        const room = this.gameState[roomName];
        if (!room) return;

        room.players.forEach(player => {
            console.log('player = ', player, 'END.')
            if (player.id === clientIp) { // *** CHANGE player.ip to player.id
                // Обновление состояния игрока на основе eventData
                this.playerService.setMove(player, moveData);
            }
        });
    }

    updatePlayersPosition(roomName) {
        const room = this.gameState[roomName];
        if (!room) return;

        room.players.forEach(player => {
            this.playerService.applyPhysics(player);
        });
    }

    getPlayersData(roomName) {
        if (Object.keys(this.gameState).length !== 0 && this.gameState[roomName].players.length > 0) {
            const playersArray = this.gameState[roomName].players;
            let players = {};
            playersArray.forEach((player) => {
                players[player.id] = {
                    x: player.x,
                    y: player.y,
                    movement: player.movement,
                    vy: player.vy,
                    size: player.size,
                    color: player.color
                };
            });
            return players;
        }
    }

    handleGameEvent(roomName, clientIp, eventData) {
        const room = this.gameState[roomName];
        if (!room) return;

        // Обработка событий: обновление состояния игроков
        room.players.forEach(player => {
            if (player.id === clientIp) { //*** CHANGE player.ip to player.id
                // Обновление состояния игрока на основе eventData
                player.x = eventData.x;
                player.y = eventData.y;
                // и т.д.
            }
        });

        return room;
    }

    addPlayerToGame(roomName, userName, clientIp) { //*** REMOVE socketId
        if (!this.gameState[roomName]) {
            this.gameState[roomName] = {
                players: [],
                startTime: null,
                duration: 60000, // Продолжительность игры в миллисекундах (например, 1 минута)
                timer: null
            };
        }
        const game = this.gameState[roomName];
        if (!game.players.find(item => item.id === clientIp)) {   //*** ADD костыль от дублирования игроков при заходе на game.js или обновлении страницы
            let player = this.playerService.newPlayer(clientIp, userName, 100, 100, 50, 'blue');
            game.players.push(player);
        }
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

    removePlayerFromGame(roomName, socketIp) {
        delete this.gameState[roomName].players[socketIp];
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
