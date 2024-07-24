function drawMap(context, blocks, blocksImages) {
    // Проходимся по каждому игровому объекту и рисуем его
    for (let obj of blocks) {
        context.drawImage(blocksImages[obj.color], obj.x, obj.y, obj.size, obj.size);
    }
}

let bloodSpots = [];
const bloodLifetime = 5000; // Время жизни пятна крови в миллисекундах

// Функция для отрисовки пятна крови
function drawBloodSpot(context, spot) {
    context.drawImage(playersImages[spot.color][4], spot.x, spot.y, spot.size, spot.size);
}

// Функция для отрисовки всех пятен крови
function drawBloodSpots(context) {
    const now = Date.now();
    for (let i = bloodSpots.length - 1; i >= 0; i--) {
        const spot = bloodSpots[i];
        // Проверяем, устарело ли пятно крови
        if (now - spot.createdAt >= bloodLifetime) {
            bloodSpots.splice(i, 1); // Удаляем устаревшее пятно
        } else {
            drawBloodSpot(context, spot); // Рисуем пятно крови
        }
    }
}

// Функция для отрисовки игрока
function drawPlayer(context, player, position, playersImages) {
    context.save();
    const now = Date.now();
    const sy = 0;
    const sw = 50;
    const sh = 50;

    // Отрисовка состояния игрока
    if (!player.statement) {
        context.globalAlpha = 0.3; // Прозрачность для мертвого игрока

        if (!bloodSpots.length)// Создаем новое пятно крови, если игрок умер
        bloodSpots.push({
            x: position.x,
            y: position.y,
            createdAt: now,
            color: player.color, // Сохраняем цвет игрока для отображения пятна
            size: player.size // Сохраняем размер для отображения пятна
        });
    }

    if (player.vx > 0) {
        context.drawImage(playersImages[player.color][1], Math.floor(now / 250) % 7 * 50, sy, sw, sh, position.x, position.y, player.size, player.size);
    } else if (player.vx < 0) {
        context.drawImage(playersImages[player.color][2], Math.floor(now / 250) % 7 * 50, sy, sw, sh, position.x, position.y, player.size, player.size);
    } else if (player.vy < 0) {
        context.drawImage(playersImages[player.color][3], Math.floor(now / 250) % 2 * 50, sy, sw, sh, position.x, position.y, player.size, player.size);
    } else {
        context.drawImage(playersImages[player.color][0], Math.floor(now / 250) % 4 * 50, sy, sw, sh, position.x, position.y, player.size, player.size);
    }
    context.restore();
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

function drawHealth(context, player, playerIndex) {
    const width = 190;
    const height = 30;
    const x = playerIndex * (width + 7) + 10;
    const y = 15;
    const borderWidth = 2;
    const radius = 20;

    context.save();
    drawRoundedRect(context, x, y, width, height, radius);
    context.clip();
    context.fillStyle = player.statement ? 'grey' : 'red';
    context.fillRect(x, y, width, height);
    context.fillStyle = COLORS[player.color];
    context.fillRect(x, y, width * player.health / 100, height);
    context.restore();

    context.lineWidth = borderWidth;
    context.strokeStyle = 'black';
    drawRoundedRect(context, x, y, width, height, radius);
    context.stroke();
}

function drawScore(context, levelScores, COLORS) {
    let allPoints = levelScores.blue + levelScores.yellow + levelScores.purple + levelScores.green;
    let x = 600;
    let y = 100;

    context.fillStyle = COLORS['blue'];
    context.fillRect(x, y, (levelScores.blue / allPoints) * 200, 30);

    context.fillStyle = COLORS['yellow'];
    x += (levelScores.blue / allPoints) * 200;
    context.fillRect(x, y, (levelScores.yellow / allPoints) * 200, 30);

    context.fillStyle = COLORS['purple'];
    x += (levelScores.yellow / allPoints) * 200;
    context.fillRect(x, y, (levelScores.purple / allPoints) * 200, 30);

    context.fillStyle = COLORS['green'];
    x += (levelScores.purple / allPoints) * 200;
    context.fillRect(x, y, (levelScores.green / allPoints) * 200, 30);
}

function drawTimer(context, totalTime, currentTime) {
    const x = 100;
    const y = 100;
    const radius = 50;
    const startAngle = 1.5 * Math.PI; // Начало у верхней части круга
    const endAngle = (1.5 - 2 * (currentTime / totalTime)) * Math.PI;

    context.beginPath();
    context.arc(x, y, radius, startAngle, endAngle, false)
    context.lineTo(x, y);
    context.fillStyle = 'rgba(200, 200, 200, 0.5)';
    context.fill();

    context.beginPath();
    context.arc(x, y, radius, endAngle, startAngle, false);
    context.lineTo(x, y);
    context.fillStyle = 'rgba(0, 150, 136, 0.5)'; // Light gray for the remaining time
    context.fill();
}

function renderWinnerList(winnerList) {
    let x = 300;
    let y = 550;
    const MAX_SCORE = 45;
    for (const [color, score] of Object.entries(winnerList)) {
        contextInfo.fillStyle = COLORS[color];
        contextInfo.fillRect(x, y - score * 300 / MAX_SCORE, 150, 300 / MAX_SCORE * score);

        const found = Object.values(players).some(player => player.color === color);
        if (found) {
            contextInfo.drawImage(playersImages[color][0], x + 20, y - score * 300 / MAX_SCORE - 120, 100, 100);
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

let particles = [];

function explode(x, y, color) {
    for (let i = 0; i < 50; i++) { // Создаем 50 частиц
        particles.push(new Particle(x, y, color));
    }
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

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.life--;
    }

    draw(context) {
        context.fillStyle = COLORS[this.color];
        context.beginPath();
        context.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        context.fill();
    }
}

function handleParticles(context, state) {
    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        particles[i].draw(context);

        if (particles[i].life <= 0) { // Если время жизни частицы истекло, удаляем ее
            particles.splice(i, 1);
        }

        if (!state) {
            particles = [];
            break;
        }
    }
}

function drawBomb(context, bomb_image, player) {
    if (!player.active) return;
    context.drawImage(bomb_image, player.x - 2.5, player.y + 15, 55, 25);
}

export {
    drawMap,
    drawBloodSpots,
    drawPlayer,
    drawHealth,
    drawTimer,
    drawScore,
    drawBomb,
    explode,
    handleParticles,
    renderWinnerList,
    drawSpecialObjects
};