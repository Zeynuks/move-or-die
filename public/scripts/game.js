const element = document.getElementById('colorLevelInfo');

setTimeout(function() {
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
        drawMap();
        preload();
        gameLoop();
    });

    socket.on('startRound', (gamePlayers, levelBlocks) => {
        info_box.classList.add('hidden');
        players = transformKeys(gamePlayers);
        blocks = transformKeys(levelBlocks);
        state = true
        drawMap();
        preload();
        gameLoop();
    });

    socket.on('endRound', (data) => {
        state = false;
        renderWinnerList(data)
        winnerList = data;
        if (info_box.classList.contains('hidden')) {
            info_box.classList.remove('hidden');
        }
    });

    socket.on('levelScore', (data) => {
        blue_score = data.blue;
        yellow_score = data.yellow;
        green_score = data.green;
        purple_score = data.purple;
    });

    function drawScore() {
        let allPoints = blue_score + yellow_score + purple_score + green_score;
        let x = 600;
        let y = 100;

        context.fillStyle = COLORS['blue'];
        context.fillRect(x, y, (blue_score / allPoints) * 200, 30);

        context.fillStyle = COLORS['yellow'];
        x += (blue_score / allPoints) * 200;
        context.fillRect(x, y, (yellow_score / allPoints) * 200, 30);

        context.fillStyle = COLORS['purple'];
        x += (yellow_score / allPoints) * 200;
        context.fillRect(x, y, (purple_score / allPoints) * 200, 30);

        context.fillStyle = COLORS['green'];
        x += (purple_score / allPoints) * 200;
        context.fillRect(x, y, (green_score / allPoints) * 200, 30);
    }

    socket.on('endGame', () => {
        window.location.href = `/`;
    });

    function drawMap() {
        for (let obj of blocks) {
            context.drawImage(BLOCKS[obj.color], obj.x, obj.y, obj.size, obj.size);
        }
    }

        function drawHealth(player, playerIndex) {
            if (player.statement) {
                contextHealth.fillStyle = 'grey';
            } else {
                contextHealth.fillStyle = 'red';
            }
            contextHealth.fillRect(playerIndex * 55 + 10, 30, 50, 80);
            contextHealth.fillStyle = COLORS[player.color];
            contextHealth.fillRect(playerIndex * 55 + 10, 30, 50 * player.health / 100, 80);
        }

        function interpolatePlayer(previous, current, t) {
            return {
                x: previous.x + (current.x - previous.x) * t, y: previous.y + (current.y - previous.y) * t
            };
        }

        // Функция экстраполяции для предсказания будущего состояния
        function extrapolatePlayer(current, t) {
            return {
                x: current.x + current.vx * t, y: current.y + current.vy * t
            };
        }

        class Particle {
            constructor(x, y, color) {
                this.x = x;
                this.y = y;
                this.size = Math.random() * 5 + 1; // Размер частицы
                this.speedX = Math.random() * 6 - 3; // Скорость по X
                this.speedY = Math.random() * 6 - 3; // Скорость по Y
                this.color = COLORS[color]; // Цвет
                this.life = 50; // Время жизни частицы
            }

            // Обновление позиции частицы
            update() {
                this.x += this.speedX;
                this.y += this.speedY;
                this.life--;
            }

            // Отрисовка частицы
            draw(ctx) {
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        let particles = [];

        // Функция для создания взрыва
        function explode(x, y, color) {
            for (let i = 0; i < 50; i++) { // Создаем 50 частиц
                particles.push(new Particle(x, y, color));
            }
        }

        socket.on('explode', (data) => {
            explode(data.x, data.y, data.color);
        });

        // Функция обновления и отрисовки частиц
        function handleParticles(ctx) {
            for (let i = particles.length - 1; i >= 0; i--) {
                particles[i].update();
                particles[i].draw(ctx);

                if (particles[i].life <= 0) { // Если время жизни частицы истекло, удаляем ее
                    particles.splice(i, 1);
                }

                if (!state) {
                    particles = [];
                    break;
                }
            }
        }


        // Функция для рисования всех игроков
        function drawPlayers() {
            const now = Date.now();
            const t = (now - lastServerUpdateTime) / (1000 / 60);
            context.clearRect(0, 0, canvas.width, canvas.height);
            contextInfo.clearRect(0, 0, canvas.width, canvas.height);
            contextHealth.clearRect(0, 0, canvas.width, canvas.height);

            handleParticles(context);

            Object.entries(players).forEach(([ip, player], playerIndex) => {
                const previous = previousPlayers[ip];
                const current = player;
                //if (state) {
                    if (previous && current) {
                        let position;
                        if (t < 1) {
                            position = interpolatePlayer(previous, current, t);
                        } else if (state) {
                            position = extrapolatePlayer(current, t - 1);
                        } else {
                            position = interpolatePlayer(previous, current, t);
                        }
                        context.save();
                        if (!player.statement) {
                            context.globalAlpha = 0.3;
                        }
                        context.drawImage(PLAYERS[player.color], position.x, position.y, player.size, player.size);
                        context.restore();
                        if (state) {
                            drawHealth(player, playerIndex);
                        }

                        if (player.active) {
                            context.drawImage(bomb_image, player.x-2.5, player.y+15, 55, 25);
                        }
                    }

                    drawMap();
                    drawSpecialObjects();
                    drawScore();

                    if (!state) {
                        renderWinnerList(winnerList);
                    }
                //}
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
            const movementData = { x: 0, y: 0, jump: false };

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
        if (Object.keys(players).length !== 0 ) {
            drawPlayers(); // Рисуем всех игроков
        }

        //if (state) {
            requestAnimationFrame(gameLoop); // Планируем следующий кадр игрового цикла
        //}
    }

    function renderWinnerList(winnerlist) {
        let x = 300;
        let y = 550;
        const MAX_SCORE = 45;
        for (const [color, score] of Object.entries(winnerlist)) {
            contextInfo.fillStyle = COLORS[color];
            contextInfo.fillRect(x, y - score * 300 / MAX_SCORE, 150, 300 / MAX_SCORE * score);

            const found = Object.values(players).some(player => player.color === color);
            if (found) {
                contextInfo.drawImage(PLAYERS[color], x + 20, y - score * 300 / MAX_SCORE - 120, 100, 100);
            }

            if (score >= MAX_SCORE * 0.3) {
                contextInfo.fillStyle = 'white';
                contextInfo.font = '30px Arial';
                contextInfo.fillText(`${score}`, x + 55, y - score * 300 / MAX_SCORE + (300 / MAX_SCORE * score / 2));
            }


            x += 200;
        }
    }

    function drawSpecialObjects() {
        for (let obj of specialObjects) {
            context.drawImage(killing_block, obj.x, obj.y, obj.size, obj.size);
        }
    }

    function transformKeys(obj) {
        return Object.keys(obj).reduce((acc, key) => {
            const newKey = key.startsWith('_') ? key.slice(1) : key;
            acc[newKey] = (typeof obj[key] === 'object' && obj[key] !== null) ? transformKeys(obj[key]) : obj[key];
            return acc;}, Array.isArray(obj) ? [] : {});
        }
        // Добавь логику для синхронизации игры через Socket.io
    }
);
