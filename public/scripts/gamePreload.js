const socket = io('/game');

const urlParams = new URLSearchParams(window.location.search);
const roomName = urlParams.get('room');
const userName = urlParams.get('name');

if (!roomName) {
    window.location.href = '/';
}

//document.getElementById('roomName').innerText = `Room: ${roomName}`;

// Здесь можно добавить логику для инициализации canvas игры
const canvas = document.getElementById('gameCanvas');
const context = canvas.getContext('2d');
canvas.width = 1400;
canvas.height = 800;

const canvasHealth = document.getElementById('healthCanvas');
const contextHealth = canvasHealth.getContext('2d');

const canvasInfo = document.getElementById('infoCanvas');
const contextInfo = canvasInfo.getContext('2d');
canvasInfo.width = 1400;
canvasInfo.height = 600;

let blue_block = new Image();
let yellow_block = new Image();
let green_block = new Image();
let purple_block = new Image();

let blue_player = new Image();
let yellow_player = new Image();
let green_player = new Image();
let purple_player = new Image();

let killing_block = new Image();

let bomb_image = new Image();

let blue_score = 0;
let yellow_score = 0;
let green_score = 0;
let purple_score = 0;

let grey_block = new Image();

let state = false
let players = {};
let blocks = [];
let specialObjects = [];
let previousPlayers = {};
let lastUpdateTime = Date.now();
let lastServerUpdateTime = Date.now();

const COLORS = {
    blue: '#46d7f4',
    yellow: '#e2c233',
    purple: '#f591f4',
    green: '#51e255'
}

const PLAYERS = {
    blue: blue_player,
    yellow: yellow_player,
    purple: purple_player,
    green: green_player
}

const BLOCKS = {
    blue: blue_block,
    yellow: yellow_block,
    purple: purple_block,
    green: green_block,
    grey: grey_block
}

function preload() {
    blue_block.src = '../images/blue-block.png';
    yellow_block.src = '../images/yellow-block.png';
    green_block.src = '../images/green-block.png';
    purple_block.src = '../images/purple-block.png';
    grey_block.src = '../images/grey-block.png';

    blue_player.src = '../images/character_blue.png';
    yellow_player.src = '../images/character_yellow.png';
    green_player.src = '../images/character_green.png';
    purple_player.src = '../images/character_red.png';

    killing_block.src = '../images/DeathSheet.png';

    bomb_image.src = '../images/bomb.png';
}

const info_box = document.getElementById('page__info-box');
info_box.classList.add('hidden');

let winnerList = {}