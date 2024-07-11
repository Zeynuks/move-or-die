const Player = require("../Entity/Player");
const GRAVITY = 0.5;
const JUMP_FORCE = -13;
let colorArray = ['blue', 'green', 'orange', 'purple'];

class PlayerService {
    constructor() {
        this.players = {};
        this.playerMovement = {};
    }

    async resetPlayersData() {
        try {
            Object.values(this.players).forEach(player => {
                player.x = 200;
                player.y = 200;
                player.collision = true;
                player.visible = true;
                player.statement = true;
                player.movement = { x: 0, y: 0};
                player.onGround = true;
                player.vy = 0;
                player.health = 100;
                player.statement = true;
            });
        } catch (error) {
            console.error('Ошибка сброса данных игроков: ' + error.message);
        }
    }

    newPlayer(clientIp, userName, x, y, size, color) {
        return new Player(clientIp, userName, x, y, size, color, true, true);
    }

    async addPlayerToGame(roomName, userName, clientIp) {
        try {
            this.players[clientIp] = this.newPlayer(clientIp, userName, 200, 200, 50, this.randomColor());
        } catch (error) {
            console.error('Ошибка добавления игрока в игру: ' + error.message);
        }
    }

    async handleMovePlayer(clientIp, movementData) {
        try {
            this.players[clientIp].vx = movementData.x;
            if (movementData.jump && this.players[clientIp].onGround) {
                this.players[clientIp].vy = JUMP_FORCE;
                this.players[clientIp].onGround = false;
            }
        } catch (error) {
            console.error('Ошибка обработки движения игрока: ' + error.message);
        }
    }

    async updateHealth() {
        try {
            Object.values(this.players).forEach(player => {
                if (player.statement) {
                    player.statement = player.health <= 0 ? false : player.statement;
                    if (player.x !== this.playerMovement[player.ip] && player.health < 100 && player.onGround) {
                        player.health += 0.6;
                    } else if (player.health > 0) {
                        player.health -= 0.4;
                    }
                }
            });
        } catch (error) {
            console.error('Ошибка обновления здоровья игроков: ' + error.message);
        }
    }

    async updatePlayersPosition() {
        try {
            Object.values(this.players).forEach(player => {
                this.playerMovement[player.ip] = player.x;
                this.applyPhysics(player);
            });
        } catch (error) {
            console.error('Ошибка обновления позиций игроков: ' + error.message);
        }
    }

    applyPhysics(player) {
        player.x += player.vx;
        player.vy += GRAVITY;
        player.y += player.vy;
    }

    randomColor() {
        let colorInd = Math.floor(Math.random() * colorArray.length);
        let color = colorArray[colorInd];
        colorArray.splice(colorInd, 1);

        if (colorArray.length === 0) {
            colorArray = ['blue', 'green', 'orange', 'purple'];
        }

        return color;
    }

    async isAllDie() {
        try {
            return Object.values(this.players).every(player => player.statement === false);
        } catch (error) {
            console.error('Ошибка проверки игроков: ' + error.message);
        }
    }

    async disconnect(clientIp) {
        try {
            delete this.players[clientIp];
        } catch (error) {
            console.error('Ошибка отключения: ' + error.message);
        }
    }
}

module.exports = PlayerService;
