// development.yaml-game/public/scripts/game.js
document.addEventListener('DOMContentLoaded', () => {
    socket.emit('playerStart', roomName, userName);

    socket.on('gameLoad', (gamePlayers, levelBlocks) => {
        players = transformKeys(gamePlayers);
        blocks = levelBlocks;
        state = true
        drawMap();
        preload();
        gameLoop();
    });

    socket.on('startRound', (gamePlayers, levelBlocks) => {
        info_box.classList.add('hidden');
        players = transformKeys(gamePlayers);

        blocks = levelBlocks;
        console.log(players, blocks)
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
        //console.log(data.blue, data.orange, data.green, data.purple)
        blue_score.textContent = data.blue;
        orange_score.textContent = data.yellow;
        green_score.textContent = data.green;
        purple_score.textContent = data.purple;
    });


    function drawMap() {
        // Проходимся по каждому игровому объекту и рисуем его
        for (let obj of blocks) {
            switch (obj._color) {
                case 'blue':
                    context.drawImage(blue_block, obj._x, obj._y, obj._size, obj._size);
                    break;
                case 'orange':
                    context.drawImage(orange_block, obj._x, obj._y, obj._size, obj._size);
                    break;
                case 'green':
                    context.drawImage(green_block, obj._x, obj._y, obj._size, obj._size);
                    break;
                case 'purple':
                    context.drawImage(purple_block, obj._x, obj._y, obj._size, obj._size);
                    break;
                case 'grey':
                    context.drawImage(grey_block, obj._x, obj._y, obj._size, obj._size);
                    break;
                }
            }
        }

        function drawHealth(player, playerIndex) {
            if (player.statement) {
                contextHealth.fillStyle = 'grey';
            } else {
                contextHealth.fillStyle = 'red';
            }
            contextHealth.fillRect(playerIndex * 55 + 10, 30, 50, 80);
            contextHealth.fillStyle = player.color;
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

        // Функция для рисования всех игроков
        function drawPlayers() {
            const now = Date.now();
            const t = (now - lastServerUpdateTime) / (1000 / 60);
            // Очищаем весь canvas
            context.clearRect(0, 0, canvas.width, canvas.height);
            contextHealth.clearRect(0, 0, canvas.width, canvas.height);
            // Рисуем игровые объекты
            // Проходимся по каждому игроку и рисуем его
            Object.entries(players).forEach(([ip, player], playerIndex) => {
                const previous = previousPlayers[ip];
                const current = player;
                if (state) {
                    if (previous && current) {
                        let position;
                        // Используем интерполяцию, если прошло мало времени с последнего обновления
                        if (t < 1) {
                            position = interpolatePlayer(previous, current, t);
                        } else {
                            // Используем экстраполяцию, если прошло много времени
                            position = extrapolatePlayer(current, t - 1);
                        }
                        // context.fillStyle = player.color; // Устанавливаем цвет для игрока {В дальнейшем будет открисовываться скин игрока}
                        context.save();
                        if (!player.statement) {
                            context.globalAlpha = 0.3;
                        }
                        switch (player.color) {
                            case 'blue':
                                context.drawImage(blue_player, position.x, position.y, player.size, player.size);
                                break;
                            case 'orange':
                                context.drawImage(orange_player, position.x, position.y, player.size, player.size);
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
                    }

                    drawMap();
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

        // Отправка данных о движении на сервер
        function sendMovement() {
            const movementData = {x: 0, jump: false};
            if (keys['ArrowUp']) movementData.jump = true;
            if (keys['ArrowLeft']) movementData.x -= 5;
            if (keys['ArrowRight']) movementData.x += 5;
            socket.emit('playerMovement', roomName, movementData);
        }

    socket.on('gameUpdate', (playersData, objectsData) => {
        previousPlayers = players;
        players = playersData;
        blocks = objectsData
        Object.entries(playersData).forEach(([ip, playerData]) => {
            players[ip] = {};
            for (let key in playerData) {
                players[ip][key.slice(1)] = playerData[key];
            }
        });
        lastServerUpdateTime = Date.now();
    })

    let isDrawing = true; //флаг для разрешения рисования

    socket.on('gameState', (state) => { //если состояние игры "неактивно", то рисование запрещено
        if (state === 'inactive') {
            isDrawing = false;
        }
    });

    function renderWinnerList(winnerlist) {
        const list = document.getElementById('page__colored-blocks-list');
        list.innerHTML = ''; // Очищаем список
        for (const [color, count] of Object.entries(winnerlist)) {
            const listItem = document.createElement('li');
            listItem.textContent = `${color}: ${count}`;
            list.appendChild(listItem);
        }
    }

    function gameLoop() {
        if (isDrawing) {
            if (Object.keys(players).length !== 0) {
                drawPlayers(); // Рисуем всех игроков
            }

            if (state) {
                requestAnimationFrame(gameLoop); // Планируем следующий кадр игрового цикла
            }
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
)

