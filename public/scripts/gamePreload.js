const socket = io('/game');

const urlParams = new URLSearchParams(window.location.search);
const roomName = urlParams.get('room');
const userName = urlParams.get('name');

if (!roomName) {
    window.location.href = '/';
}

document.getElementById('roomName').innerText = `Room: ${roomName}`;

// Здесь можно добавить логику для инициализации canvas игры
const canvas = document.getElementById('gameCanvas');
const context = canvas.getContext('2d');
canvas.width = 1400;
canvas.height = 800;

const canvasHealth = document.getElementById('healthCanvas');
const contextHealth = canvasHealth.getContext('2d');
canvasHealth.width = 1400;
canvasHealth.height = 100;

let blue_block = new Image();
let yellow_block = new Image();
let green_block = new Image();
let purple_block = new Image();

let blue_player = new Image();
let yellow_player = new Image();
let green_player = new Image();
let purple_player = new Image();

//спрайты при движении персонажа
const sy = 0;
const sw = 50;
const sh = 50;

let spriteRunRightImageYellow = new Image();
let spriteRunRightImageBlue = new Image();
let spriteRunRightImageGreen = new Image();
let spriteRunRightImageRed = new Image();

let spriteRunLeftImageYellow = new Image();
let spriteRunLeftImageBlue = new Image();
let spriteRunLeftImageGreen = new Image();
let spriteRunLeftImageRed = new Image();

let spriteJumpImageYellow = new Image();
let spriteJumpImageBlue = new Image();
let spriteJumpImageGreen = new Image();
let spriteJumpImageRed = new Image();

let killing_block = new Image();

let bomb_image = new Image();

let blue_score = document.getElementById('blue-score');
let yellow_score = document.getElementById('yellow-score');
let green_score = document.getElementById('green-score');
let purple_score = document.getElementById('purple-score');

let grey_block = new Image();

let state = false
let players = {};
let blocks = [];
let specialObjects = [];
let previousPlayers = {};
let lastUpdateTime = Date.now();
let lastServerUpdateTime = Date.now();

function preload() {
    blue_block.src = '../images/blue-block.png';
    yellow_block.src = '../images/yellow-block.png';
    green_block.src = '../images/green-block.png';
    purple_block.src = '../images/purple-block.png';
    grey_block.src = '../images/grey-block.png';

    //персонаж статичен
    blue_player.src = '../images/character_blue.png';
    yellow_player.src = '../images/character_yellow.png';
    green_player.src = '../images/character_green.png';
    purple_player.src = '../images/character_red.png';

    //персонаж движется вправо
    spriteRunRightImageYellow.src = '../images/spriteRunRightYellow.png';
    spriteRunRightImageBlue.src = '../images/spriteRunRightBlue.png';
    spriteRunRightImageGreen.src = '../images/spriteRunRightGreen.png';
    spriteRunRightImageRed.src = '../images/spriteRunRightRed.png';

    //персонаж движется влево
    spriteRunLeftImageYellow.src = '../images/spriteRunLeftYellow.png';
    spriteRunLeftImageBlue.src = '../images/spriteRunLeftBlue.png';
    spriteRunLeftImageGreen.src = '../images/spriteRunLeftGreen.png';
    spriteRunLeftImageRed.src = '../images/spriteRunLeftRed.png';

    //персонаж движется вверх
    spriteJumpImageYellow.src = '../images/spriteJumpYellow.png';
    spriteJumpImageBlue.src = '../images/spriteJumpBlue.png';
    spriteJumpImageGreen.src = '../images/spriteJumpGreen.png';
    spriteJumpImageRed.src = '../images/spriteJumpRed.png';

    killing_block.src = '../images/DeathSheet.png';

    bomb_image.src = '../images/bomb.png';
}

const info_box = document.getElementById('page__info-box');
info_box.classList.add('hidden');