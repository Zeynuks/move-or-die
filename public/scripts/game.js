import { calculatePosition, transformKeys } from './utils.js';
import { drawMap, drawPlayer, drawHealth, drawBomb, explode, handleParticles } from "./rendering.js";

const element = document.getElementById('colorLevelInfo');

setTimeout(function () {
    // Добавляем свойство "hidden" к элементу
    element.setAttribute('hidden', '');
}, 3000);

document.addEventListener('DOMContentLoaded', () => {
        socket.emit('playerStart', roomName, userName);

        socket.on('error', (error) => {
            console.log(error);
        });

        socket.on('gameLoad', (gamePlayers, levelBlocks) => {
            players = transformKeys(gamePlayers);
            blocks = transformKeys(levelBlocks);
            state = true
            drawMap(context, blocks, blocksImages);
            preload();
            gameLoop();
        });

        socket.on('startRound', (gamePlayers, levelBlocks) => {
            info_box.classList.add('hidden');
            players = transformKeys(gamePlayers);
            blocks = transformKeys(levelBlocks);
            state = true
            drawMap(context, blocks, blocksImages);
            preload();
            gameLoop();
        });

        socket.on('endRound', (data) => {
            state = false;
            if (info_box.classList.contains('hidden')) {
                info_box.classList.remove('hidden');
            }
            renderWinnerList(data)
        });

        socket.on('levelScore', (data) => {
            blue_score.textContent = data.blue;
            yellow_score.textContent = data.yellow;
            green_score.textContent = data.green;
            purple_score.textContent = data.purple;
        });

        socket.on('endGame', () => {
            window.location.href = `/`;
        });

        socket.on('explode', (data) => {
            explode(data.x, data.y, data.color);
        });

        // Функция для рисования всех игроков
        function drawPlayers() {
            const now = Date.now();
            const t = (now - lastServerUpdateTime) / (1000 / 60);
            context.clearRect(0, 0, canvas.width, canvas.height);
            contextHealth.clearRect(0, 0, canvas.width, canvas.height);

            handleParticles(context, state);
            drawMap(context, blocks, blocksImages);
            drawSpecialObjects();

            Object.entries(players).forEach(([ip, player], playerIndex) => {
                const previous = previousPlayers[ip];
                const current = player;
                if (!state || !previous || !current) return;

                let position = calculatePosition(previous, current, t);

                drawPlayer(context, player, position, playersImages);
                drawBomb(context, bomb_image, player);
                drawHealth(contextHealth, player, playerIndex);
            });
        }

        const keys = {};

        // Обработка нажатий клавиш для управления движением
        window.addEventListener('keydown', (event) => {
            if (event.key === 'ArrowUp' || event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
                keys[event.key] = true;
                sendMovement();
            }
        });

        window.addEventListener('keyup', (event) => {
            if (event.key === 'ArrowUp' || event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
                delete keys[event.key];
                sendMovement();
            }
        });

        //подгружаем звуки для движения
        const upMoveSound = new Audio('../sound/up.mp3');
        const leftMoveSound = new Audio('../sound/move.mp3');
        const rightMoveSound = new Audio('../sound/move.mp3');

        let sound = null;

        // Отправка данных о движении на сервер
        function sendMovement() {
            const movementData = {x: 0, y: 0, jump: false};

            // Проверяем нажатие клавиш
            if (keys['ArrowUp']) {
                movementData.jump = true;
                sound = upMoveSound;
                playSound(sound); // Вызываем функцию для воспроизведения звука
            }
            if (keys['ArrowDown']) {
                movementData.y += 5;
            }
            if (keys['ArrowLeft']) {
                movementData.x -= 5;
                sound = leftMoveSound;
                playSound(sound);
            }
            if (keys['ArrowRight']) {
                movementData.x += 5;
                sound = rightMoveSound;
                playSound(sound);
            }

            socket.emit('playerMovement', roomName, movementData);
        }

        socket.on('gameUpdate', (playersData, objectsData, specialObjectsData) => {
            previousPlayers = players;
            // players = playersData;
            blocks = transformKeys(objectsData);
            specialObjects = transformKeys(specialObjectsData);
            Object.entries(playersData).forEach(([ip, playerData]) => {
                players[ip] = {};
                for (let key in playerData) {
                    players[ip][key.slice(1)] = playerData[key];
                }
            });
            lastServerUpdateTime = Date.now();
        })

        function playSound(sound) {
            // Проверяем, что звук не воспроизводится в данный момент
            if (!sound.currentTime) {
                sound.play();
            } else {
                // Если звук уже воспроизводится, то перезапускаем его
                sound.currentTime = 0;
                sound.play();
            }
        }

        socket.on('gameStateUpdate', (playersData) => {
            previousPlayers = players;
            players = playersData;
            Object.entries(playersData).forEach(([ip, playerData]) => {
                players[ip] = {};
                for (let key in playerData) {
                    players[ip][key.slice(1)] = playerData[key];
                }
            });
            lastServerUpdateTime = Date.now();
        })

        function gameLoop() {
            if (Object.keys(players).length !== 0) {
                drawPlayers(); // Рисуем всех игроков
            }

            if (state) {
                requestAnimationFrame(gameLoop); // Планируем следующий кадр игрового цикла
            }
        }

        function renderWinnerList(winnerlist) {
            const list = document.getElementById('page__colored-blocks-list');
            list.innerHTML = ''; // Очищаем список
            for (const [color, count] of Object.entries(winnerlist)) {
                const listItem = document.createElement('li');
                listItem.textContent = `${color}: ${count}`;
                list.appendChild(listItem);
            }
        }

        function drawSpecialObjects() {
            for (let obj of specialObjects) {
                context.drawImage(killing_block, obj.x, obj.y, obj.size, obj.size);
            }
        }
    }
);
