const socket = io('/game');

const urlParams = new URLSearchParams(window.location.search);
const roomName = urlParams.get('room');
const userName = urlParams.get('name');

if (!roomName) {
    window.location.href = '/';
}

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
    blue: [new Image(), new Image(), new Image(), new Image(), new Image()],
    yellow: [new Image(), new Image(), new Image(), new Image(), new Image()],
    green: [new Image(), new Image(), new Image(), new Image(), new Image()],
    purple: [new Image(), new Image(), new Image(), new Image(), new Image()],
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

    /**
     * Массив изображений игроков.
     *
     * @type {Array}
     * @property {HTMLImageElement} playersImage[0] - статичная картинка
     * @property {HTMLImageElement} playersImage[1] - бег вправо
     * @property {HTMLImageElement} playersImage[2] - бег влево
     * @property {HTMLImageElement} playersImage[3] - прыжок
     *@property {HTMLImageElement} playersImage[4] - смерть
     */

    playersImages.blue[0].src = '../images/character_blue.png';
    playersImages.blue[1].src = '../images/spriteRunRightBlue.png';
    playersImages.blue[2].src = '../images/spriteRunLeftBlue.png';
    playersImages.blue[3].src = '../images/spriteJumpBlue.png';
    playersImages.blue[4].src = '../images/bloodBlue.png';

    playersImages.yellow[0].src = '../images/character_yellow.png';
    playersImages.yellow[1].src = '../images/spriteRunRightYellow.png';
    playersImages.yellow[2].src = '../images/spriteRunLeftYellow.png';
    playersImages.yellow[3].src = '../images/spriteJumpYellow.png';
    playersImages.yellow[4].src = '../images/bloodYellow.png';


    playersImages.green[0].src = '../images/character_green.png';
    playersImages.green[1].src = '../images/spriteRunRightGreen.png';
    playersImages.green[2].src = '../images/spriteRunLeftGreen.png';
    playersImages.green[3].src = '../images/spriteJumpGreen.png';
    playersImages.green[4].src = '../images/bloodGreen.png';


    playersImages.purple[0].src = '../images/character_red.png';
    playersImages.purple[1].src = '../images/spriteRunRightRed.png';
    playersImages.purple[2].src = '../images/spriteRunLeftRed.png';
    playersImages.purple[3].src = '../images/spriteJumpRed.png';
    playersImages.purple[4].src = '../images/bloodRed.png';


    killing_block.src = '../images/DeathSheet.png';

    bomb_image.src = '../images/bomb.png';
}

const info_box = document.getElementById('page__info-box');
info_box.classList.add('hidden');

let winnerList = {}