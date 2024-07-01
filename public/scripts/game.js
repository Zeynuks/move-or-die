// development.yaml-game/public/scripts/game.js
const socket = io();

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const roomName = urlParams.get('room');

    if (roomName) {
        document.getElementById('roomName').innerText = `Room: ${roomName}`;

        // Здесь можно добавить логику для инициализации canvas игры
        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');

        let players = {};
        let previousPlayers = {};
        let lastUpdateTime = Date.now();
        let lastServerUpdateTime = Date.now();



        // Добавь логику для синхронизации игры через Socket.io
    } else {
        window.location.href = '/';
    }
});
