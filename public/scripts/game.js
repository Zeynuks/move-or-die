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


        function drawMap() {
            // Проходимся по каждому игровому объекту и рисуем его
            for (let obj of blocks) {
                switch (obj.color) {
                    case 'blue':
                        context.drawImage(blue_block, obj.x, obj.y, obj.size, obj.size);
                        break;
                    case 'yellow':
                        context.drawImage(yellow_block, obj.x, obj.y, obj.size, obj.size);
                        break;
                    case 'green':
                        context.drawImage(green_block, obj.x, obj.y, obj.size, obj.size);
                        break;
                    case 'purple':
                        context.drawImage(purple_block, obj.x, obj.y, obj.size, obj.size);
                        break;
                    case 'grey':
                        context.drawImage(grey_block, obj.x, obj.y, obj.size, obj.size);
                        break;
                }
            }
        }

        function drawRoundedRect(context, x, y, width, height, radius) {
            context.beginPath();
            context.moveTo(x + radius, y);
            context.lineTo(x + width - radius, y);
            context.quadraticCurveTo(x + width, y, x + width, y + radius);
            context.lineTo(x + width, y + height - radius);
            context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
            context.lineTo(x + radius, y + height);
            context.quadraticCurveTo(x, y + height, x, y + height - radius);
            context.lineTo(x, y + radius);
            context.quadraticCurveTo(x, y, x + radius, y);
            context.closePath();
        }

        function drawHealth(player, playerIndex) {
            const width = 190;
            const height = 30;
            const x = playerIndex * (width + 7) + 10;
            const y = 15;
            const borderWidth = 2;
            const radius = 20;

            contextHealth.save();

            drawRoundedRect(contextHealth, x, y, width, height, radius);
            contextHealth.clip();
            contextHealth.fillStyle = player.statement ? 'grey' : 'red';
            contextHealth.fillRect(x, y, width, height);

            contextHealth.fillStyle = player.color;
            contextHealth.fillRect(x, y, width * player.health / 100, height);

            contextHealth.restore();

            contextHealth.lineWidth = borderWidth;
            contextHealth.strokeStyle = 'black';
            drawRoundedRect(contextHealth, x, y, width, height, radius);
            contextHealth.stroke();
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
                this.color = color; // Цвет
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
            contextHealth.clearRect(0, 0, canvas.width, canvas.height);

            handleParticles(context);

            Object.entries(players).forEach(([ip, player], playerIndex) => {
                const previous = previousPlayers[ip];
                const current = player;
                if (state) {
                    if (previous && current) {
                        let position;
                        if (t < 1) {
                            position = interpolatePlayer(previous, current, t);
                        } else {
                            position = extrapolatePlayer(current, t - 1);
                        }
                        context.save();
                        if (!player.statement) {
                            context.globalAlpha = 0.3;
                        }
                        switch (player.color) {
                            case 'blue':
                                context.drawImage(blue_player, position.x, position.y, player.size, player.size);
                                break;
                            case 'yellow':
                                context.drawImage(yellow_player, position.x, position.y, player.size, player.size);
                                break;
                            case 'green':
                                context.drawImage(green_player, position.x, position.y, player.size, player.size);
                                break;
                            case 'purple':
                                context.drawImage(purple_player, position.x, position.y, player.size, player.size);
                                break;
                        }
                        context.restore();

                        drawHealth(player, playerIndex);

                        if (player.active) {
                            // context.fillStyle = 'red';
                            // context.fillRect(player.x, player.y, 15, 15);
                            context.drawImage(bomb_image, player.x - 2.5, player.y + 15, 55, 25);
                        }
                    }

                    drawMap();
                    drawSpecialObjects();
                }
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

        function transformKeys(obj) {
            return Object.keys(obj).reduce((acc, key) => {
                const newKey = key.startsWith('_') ? key.slice(1) : key;
                acc[newKey] = (typeof obj[key] === 'object' && obj[key] !== null) ? transformKeys(obj[key]) : obj[key];
                return acc;
            }, Array.isArray(obj) ? [] : {});
        }

        // Добавь логику для синхронизации игры через Socket.io
    }
);
