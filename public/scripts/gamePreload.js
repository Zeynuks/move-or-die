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
let grey_block = new Image();

let blue_player = new Image();
let yellow_player = new Image();
let green_player = new Image();
let purple_player = new Image();

let killing_block = new Image();

let bomb_image = new Image();

const playersImages = {
    blue: new Image(),
    yellow: new Image(),
    green: new Image(),
    purple: new Image(),
};

const blocksImages = {
    blue: new Image(),
    yellow: new Image(),
    green: new Image(),
    purple: new Image(),
    grey: new Image(),
}

let blue_score = document.getElementById('blue-score');
let yellow_score = document.getElementById('yellow-score');
let green_score = document.getElementById('green-score');
let purple_score = document.getElementById('purple-score');



let state = false
let players = {};
let blocks = [];
let specialObjects = [];
let previousPlayers = {};
let lastUpdateTime = Date.now();
let lastServerUpdateTime = Date.now();

function preload() {
    blocksImages.blue.src = '../images/blue-block.png';
    blocksImages.yellow.src = '../images/yellow-block.png';
    blocksImages.green.src = '../images/green-block.png';
    blocksImages.purple.src = '../images/purple-block.png';
    blocksImages.grey.src = '../images/grey-block.png';

    playersImages.blue.src = '../images/character_blue.png';
    playersImages.yellow.src = '../images/character_yellow.png';
    playersImages.green.src = '../images/character_green.png';
    playersImages.purple.src = '../images/character_red.png';

    killing_block.src = '../images/DeathSheet.png';

    bomb_image.src = '../images/bomb.png';
}

const info_box = document.getElementById('page__info-box');
info_box.classList.add('hidden');