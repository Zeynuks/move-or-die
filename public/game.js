const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 }
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

let socket;
let players = {};
let errorDiv;

function preload() {
    this.load.image('player', 'https://cdn.pixabay.com/photo/2013/07/12/17/20/square-153225_960_720.png'); // Загрузите свой спрайт квадрата
}

function create() {
    socket = io();
    errorDiv = document.getElementById('error');

    socket.on('initialize', (initialPlayers) => {
        players = initialPlayers;
        for (let id in players) {
            createPlayer(this, players[id]);
        }
    });

    socket.on('newPlayer', (player) => {
        createPlayer(this, player);
    });

    socket.on('move', (data) => {
        if (players[data.id]) {
            players[data.id].x = data.x;
            players[data.id].y = data.y;
            players[data.id].sprite.setPosition(data.x, data.y);
        }
    });

    socket.on('removePlayer', (id) => {
        if (players[id]) {
            players[id].sprite.destroy();
            delete players[id];
        }
    });

    socket.on('roomFull', () => {
        errorDiv.textContent = 'Комната заполнена. Пожалуйста, попробуйте позже.';
    });

    this.input.keyboard.on('keydown_W', () => sendMove('up'));
    this.input.keyboard.on('keydown_A', () => sendMove('left'));
    this.input.keyboard.on('keydown_S', () => sendMove('down'));
    this.input.keyboard.on('keydown_D', () => sendMove('right'));
}

function update() {}

function createPlayer(scene, player) {
    player.sprite = scene.physics.add.image(player.x, player.y, 'player').setOrigin(0.5, 0.5).setDisplaySize(40, 40);
    players[player.id] = player;
}

function sendMove(direction) {
    socket.emit('move', direction);
}
