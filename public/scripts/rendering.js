function drawMap(context, blocks, blocksImages) {
    // Проходимся по каждому игровому объекту и рисуем его
    for (let obj of blocks) {
        context.drawImage(blocksImages[obj.color], obj.x, obj.y, obj.size, obj.size);
    }
}

function drawPlayer(context, player, position, playersImages) {
    context.save();
    if (!player.statement) {
        context.globalAlpha = 0.3;
    }
    context.drawImage(playersImages[player.color], position.x, position.y, player.size, player.size);
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

let particles = [];

// Функция для создания взрыва
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

    // Обновление позиции частицы
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.life--;
    }

    // Отрисовка частицы
    draw(context) {
        context.fillStyle = this.color;
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

export { drawMap, drawPlayer, drawHealth, drawBomb, explode, handleParticles};