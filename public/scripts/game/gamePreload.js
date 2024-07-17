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
canvasHealth.width = 1400;
canvasHealth.height = 100;

const canvasInfo = document.getElementById('infoCanvas');
const contextInfo = canvasInfo.getContext('2d');
canvasInfo.width = 1400;
canvasInfo.height = 600;

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

const levelScores = {
    blue: 0,
    yellow: 0,
    green: 0,
    purple: 0,
}

let state = false
let players = {};
let blocks = [];
let specialObjects = [];
let previousPlayers = {};
let lastUpdateTime = Date.now();
let lastServerUpdateTime = Date.now();
let roundTimer = null
let currentTime = null;
let totalTime = null;

const COLORS = {
    blue: '#46d7f4',
    yellow: '#e2c233',
    purple: '#f591f4',
    green: '#51e255'
}

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

let winnerList = {}